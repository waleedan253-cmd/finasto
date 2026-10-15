-- ════════════════════════════════════════════════════════════════════════
-- STOCKIST PORTAL, STEP 2: bulk orders
-- Run AFTER stockist-portal.sql. Safe to re-run. Runs as ONE transaction.
--
-- Flow
--   1. Stockist picks packs and quantities and submits        -> requested
--      (prices are calculated by the database and saved with the order:
--       regular pack price minus the stockist's discount rate)
--   2. Admin verifies it and sends bank details               -> awaiting_payment
--        (or rejects it with a reason                         -> rejected)
--      Finasto's shop stock is reserved at this step, so a stockist never
--      pays for packs that were sold in the meantime.
--   3. Stockist pays and uploads proof of payment             -> payment_submitted
--        (a stockist can cancel only while it is still 'requested')
--   4. Admin checks the proof:
--        approve  -> approved       the packs are added to the stockist's stock
--        return   -> awaiting_payment   (proof unclear, asks for a new one)
--        cancel   -> cancelled      reserved shop stock is put back
--
-- Security model
--   * Nobody writes to these tables directly, not even an admin. Every
--     change goes through a SECURITY DEFINER function that checks who is
--     calling and that the order is in the right state.
--   * A stockist reads only through my_bulk_orders() / my_bulk_order().
--   * Payment proofs live in a PRIVATE bucket. A stockist can upload to and
--     read from their own folder only; an admin can read all.
--   * Prices, totals and the discount are saved on the order at submit time,
--     so later price or discount changes never alter an existing order.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight checks
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() is missing.';
  end if;
  if to_regprocedure('public.is_stockist()') is null then
    raise exception 'public.is_stockist() is missing.';
  end if;
  if to_regprocedure('public.current_stockist_id()') is null then
    raise exception 'public.current_stockist_id() is missing. Run stockist-portal.sql first.';
  end if;
  if to_regprocedure('public.touch_updated_at()') is null then
    raise exception 'public.touch_updated_at() is missing.';
  end if;
  if to_regclass('public.stockists') is null
     or to_regclass('public.products') is null
     or to_regclass('public.product_variants') is null then
    raise exception 'stockists, products and product_variants must exist first.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) bulk_orders — one row per request
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.bulk_orders (
  id                 uuid primary key default gen_random_uuid(),
  number             bigint generated always as identity,   -- shown as BO-000123
  stockist_id        uuid not null references public.stockists(id) on delete restrict,

  status             text not null default 'requested'
                       check (status in ('requested','awaiting_payment',
                                         'payment_submitted','approved',
                                         'rejected','cancelled')),

  -- Saved at submit time and never recalculated.
  discount_percent   numeric(5,2) not null check (discount_percent between 0 and 100),
  total_usd          numeric(14,2) not null default 0 check (total_usd >= 0),

  stockist_note      text check (stockist_note is null or char_length(stockist_note) <= 500),

  -- The admin's latest message to the stockist (rejection or "send a
  -- clearer proof"). The stockist can read it.
  admin_note         text check (admin_note is null or char_length(admin_note) <= 500),

  -- Payment instructions typed by the admin (bank, account title, number,
  -- IBAN / SWIFT, reference to use). Free text on purpose: bank formats
  -- differ by country.
  bank_details       text check (bank_details is null or char_length(bank_details) <= 2000),

  -- Proof of payment uploaded by the stockist (path in the private bucket).
  proof_path         text,
  payment_reference  text check (payment_reference is null or char_length(payment_reference) <= 100),

  -- True while the shop stock for this order is held back (between the
  -- bank-details step and approval or cancellation). Makes the stock
  -- release safe to run only once.
  stock_reserved     boolean not null default false,

  quoted_at          timestamptz,
  proof_submitted_at timestamptz,
  decided_at         timestamptz,   -- approved / rejected / cancelled
  reviewed_by        uuid references auth.users(id) on delete set null,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint bulk_orders_reject_needs_note
    check (status <> 'rejected' or char_length(btrim(coalesce(admin_note, ''))) > 0),
  constraint bulk_orders_payment_needs_bank
    check (status not in ('awaiting_payment','payment_submitted','approved')
           or char_length(btrim(coalesce(bank_details, ''))) > 0)
);

create unique index if not exists bulk_orders_number_key on public.bulk_orders (number);

create index if not exists bulk_orders_stockist_idx
  on public.bulk_orders (stockist_id, created_at desc);
create index if not exists bulk_orders_status_idx
  on public.bulk_orders (status, created_at desc);

drop trigger if exists bulk_orders_touch_updated_at on public.bulk_orders;
create trigger bulk_orders_touch_updated_at
  before update on public.bulk_orders
  for each row execute function public.touch_updated_at();


-- ────────────────────────────────────────────────────────────────────────
-- 2) bulk_order_items — the packs on an order, with prices saved as text
--    names and numbers so history stays correct if a product changes.
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.bulk_order_items (
  id              uuid primary key default gen_random_uuid(),
  bulk_order_id   uuid not null references public.bulk_orders(id) on delete cascade,
  variant_id      uuid references public.product_variants(id) on delete set null,
  product_name    text not null,
  pack_name       text not null,
  quantity        integer not null check (quantity between 1 and 100000),
  retail_usd      numeric(12,2) not null check (retail_usd >= 0),
  unit_price_usd  numeric(12,2) not null check (unit_price_usd >= 0),
  line_total_usd  numeric(14,2) not null check (line_total_usd >= 0)
);

create index if not exists bulk_order_items_order_idx
  on public.bulk_order_items (bulk_order_id);
-- A pack appears once per order.
create unique index if not exists bulk_order_items_one_variant_idx
  on public.bulk_order_items (bulk_order_id, variant_id)
  where variant_id is not null;


-- ────────────────────────────────────────────────────────────────────────
-- 3) stockist_stock_movements — the stock ledger
--    quantity is signed: + adds stock, - removes it. A stockist's stock for
--    a pack is the SUM of its movements, so bought, sold and remaining can
--    never disagree. This step only writes 'bulk_order' rows; sales and
--    refunds are added with the Inventory step.
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.stockist_stock_movements (
  id             uuid primary key default gen_random_uuid(),
  stockist_id    uuid not null references public.stockists(id) on delete restrict,
  variant_id     uuid not null references public.product_variants(id) on delete restrict,
  quantity       integer not null check (quantity <> 0),
  reason         text not null
                   check (reason in ('bulk_order','sale','refund','adjustment')),
  bulk_order_id  uuid references public.bulk_orders(id) on delete restrict,
  created_at     timestamptz not null default now()
);

create index if not exists stockist_stock_movements_idx
  on public.stockist_stock_movements (stockist_id, variant_id);

-- Approving an order twice can never add its packs twice.
create unique index if not exists stockist_stock_movements_bulk_once_idx
  on public.stockist_stock_movements (bulk_order_id, variant_id)
  where reason = 'bulk_order';


-- ────────────────────────────────────────────────────────────────────────
-- 4) Row Level Security: admin can READ everything; nobody writes directly.
--    A stockist has no direct access at all (they use the functions below).
-- ────────────────────────────────────────────────────────────────────────
alter table public.bulk_orders              enable row level security;
alter table public.bulk_order_items         enable row level security;
alter table public.stockist_stock_movements enable row level security;

drop policy if exists "admin reads bulk orders" on public.bulk_orders;
create policy "admin reads bulk orders"
  on public.bulk_orders for select using (public.is_admin());

drop policy if exists "admin reads bulk order items" on public.bulk_order_items;
create policy "admin reads bulk order items"
  on public.bulk_order_items for select using (public.is_admin());

drop policy if exists "admin reads stock movements" on public.stockist_stock_movements;
create policy "admin reads stock movements"
  on public.stockist_stock_movements for select using (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 5) Storage: private bucket for payment proofs
--    Path format: <stockist_id>/<bulk_order_id>/<file name>
--    5 MB per file; images and PDF only.
-- ────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bulk-order-proofs', 'bulk-order-proofs', false, 5242880,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "stockist uploads own bulk proofs" on storage.objects;
create policy "stockist uploads own bulk proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'bulk-order-proofs'
    and public.is_stockist()
    and (storage.foldername(name))[1] = public.current_stockist_id()::text
  );

drop policy if exists "stockist reads own bulk proofs" on storage.objects;
create policy "stockist reads own bulk proofs"
  on storage.objects for select
  using (
    bucket_id = 'bulk-order-proofs'
    and public.is_stockist()
    and (storage.foldername(name))[1] = public.current_stockist_id()::text
  );

drop policy if exists "admin reads bulk proofs" on storage.objects;
create policy "admin reads bulk proofs"
  on storage.objects for select
  using (bucket_id = 'bulk-order-proofs' and public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 6) STOCKIST functions
-- ────────────────────────────────────────────────────────────────────────

-- 6a) Submit a request. p_items looks like:
--     [{"variant_id": "<uuid>", "quantity": 20}, ...]
create or replace function public.submit_bulk_order(
  p_items jsonb,
  p_note  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stockist  uuid;
  v_discount  numeric;
  v_order     uuid;
  v_count     integer;
  v_distinct  integer;
  r           record;
  v_variant   record;
  v_unit      numeric(12,2);
  v_total     numeric(14,2) := 0;
begin
  if not public.is_stockist() then
    raise exception 'Only a stockist can submit a bulk order';
  end if;

  v_stockist := public.current_stockist_id();
  select s.default_profit_percent into v_discount
  from public.stockists s
  where s.id = v_stockist and s.status = 'active';
  if v_discount is null then
    raise exception 'Your stockist account is not active';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Add at least one pack to your order';
  end if;
  v_count := jsonb_array_length(p_items);
  if v_count < 1 or v_count > 50 then
    raise exception 'An order must have between 1 and 50 packs';
  end if;

  begin
    select count(distinct (e->>'variant_id')::uuid) into v_distinct
    from jsonb_array_elements(p_items) e;
    perform 1 from jsonb_array_elements(p_items) e
      where (e->>'quantity')::integer < 1 or (e->>'quantity')::integer > 100000;
    if found then
      raise exception 'Quantity must be between 1 and 100000';
    end if;
  exception
    when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'Invalid order items';
  end;
  if v_distinct <> v_count then
    raise exception 'Each pack can only be added once';
  end if;

  if char_length(coalesce(p_note, '')) > 500 then
    raise exception 'Note is too long (500 characters at most)';
  end if;

  -- Stop a stockist from flooding the admin with open requests.
  if (select count(*) from public.bulk_orders
      where stockist_id = v_stockist and status = 'requested') >= 10 then
    raise exception 'You already have 10 requests waiting for review';
  end if;

  insert into public.bulk_orders (stockist_id, discount_percent, stockist_note)
  values (v_stockist, v_discount, nullif(btrim(coalesce(p_note, '')), ''))
  returning id into v_order;

  for r in
    select (e->>'variant_id')::uuid as variant_id,
           (e->>'quantity')::integer as qty
    from jsonb_array_elements(p_items) e
    order by 1
  loop
    select v.id, v.name as pack_name, v.price, v.stock, p.name as product_name
      into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = r.variant_id
      and v.status = 'active'
      and p.status = 'active';

    if not found then
      raise exception 'One of the packs is no longer available';
    end if;
    if v_variant.stock < r.qty then
      raise exception '% (%) is not available in that quantity',
        v_variant.product_name, v_variant.pack_name;
    end if;

    -- Regular pack price minus the stockist's discount, rounded to cents.
    v_unit := round(v_variant.price * (100 - v_discount) / 100, 2);

    insert into public.bulk_order_items
      (bulk_order_id, variant_id, product_name, pack_name, quantity,
       retail_usd, unit_price_usd, line_total_usd)
    values
      (v_order, v_variant.id, v_variant.product_name, v_variant.pack_name,
       r.qty, v_variant.price, v_unit, v_unit * r.qty);

    v_total := v_total + v_unit * r.qty;
  end loop;

  update public.bulk_orders set total_usd = v_total where id = v_order;
  return v_order;
end;
$$;

-- 6b) Cancel my request, only before the admin has sent bank details.
create or replace function public.cancel_my_bulk_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stockist uuid;
  v_status   text;
begin
  if not public.is_stockist() then
    raise exception 'Not authorized';
  end if;
  v_stockist := public.current_stockist_id();

  select status into v_status
  from public.bulk_orders
  where id = p_order_id and stockist_id = v_stockist
  for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_status <> 'requested' then
    raise exception 'This order can no longer be cancelled. Please contact support.';
  end if;

  update public.bulk_orders
  set status = 'cancelled', decided_at = now()
  where id = p_order_id;
end;
$$;

-- 6c) Attach proof of payment. The file must already be uploaded to my own
--     folder: <stockist_id>/<order_id>/<file name>.
create or replace function public.submit_bulk_payment_proof(
  p_order_id     uuid,
  p_storage_path text,
  p_reference    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stockist uuid;
  v_status   text;
  v_prefix   text;
begin
  if not public.is_stockist() then
    raise exception 'Not authorized';
  end if;
  v_stockist := public.current_stockist_id();

  select status into v_status
  from public.bulk_orders
  where id = p_order_id and stockist_id = v_stockist
  for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_status <> 'awaiting_payment' then
    raise exception 'Payment proof cannot be added to this order right now';
  end if;

  v_prefix := v_stockist::text || '/' || p_order_id::text || '/';
  if p_storage_path is null
     or left(p_storage_path, char_length(v_prefix)) <> v_prefix
     or char_length(p_storage_path) > 300 then
    raise exception 'Invalid proof file';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'bulk-order-proofs' and name = p_storage_path
  ) then
    raise exception 'The proof file was not uploaded. Please try again.';
  end if;
  if char_length(coalesce(p_reference, '')) > 100 then
    raise exception 'Payment reference is too long (100 characters at most)';
  end if;

  update public.bulk_orders
  set status             = 'payment_submitted',
      proof_path         = p_storage_path,
      payment_reference  = nullif(btrim(coalesce(p_reference, '')), ''),
      proof_submitted_at = now(),
      admin_note         = null
  where id = p_order_id;
end;
$$;

-- 6d) My orders, newest first. total_count is the number of ALL my orders
--     (for paging); every row repeats it.
create or replace function public.my_bulk_orders(
  p_limit  integer default 20,
  p_offset integer default 0
)
returns table (
  id          uuid,
  number      bigint,
  status      text,
  total_usd   numeric,
  item_count  bigint,
  units       bigint,
  admin_note  text,
  created_at  timestamptz,
  updated_at  timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.number, o.status, o.total_usd,
         (select count(*) from public.bulk_order_items i where i.bulk_order_id = o.id),
         (select coalesce(sum(i.quantity), 0) from public.bulk_order_items i where i.bulk_order_id = o.id),
         o.admin_note, o.created_at, o.updated_at,
         count(*) over ()
  from public.bulk_orders o
  where public.is_stockist()
    and o.stockist_id = public.current_stockist_id()
  order by o.created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- 6e) One of my orders with its items. Bank details are shown only once the
--     admin has sent them.
create or replace function public.my_bulk_order(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',                o.id,
    'number',            o.number,
    'status',            o.status,
    'discount_percent',  o.discount_percent,
    'total_usd',         o.total_usd,
    'stockist_note',     o.stockist_note,
    'admin_note',        o.admin_note,
    'bank_details',      case when o.status in ('awaiting_payment','payment_submitted','approved')
                              then o.bank_details end,
    'proof_path',        o.proof_path,
    'payment_reference', o.payment_reference,
    'quoted_at',         o.quoted_at,
    'proof_submitted_at',o.proof_submitted_at,
    'decided_at',        o.decided_at,
    'created_at',        o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id',             i.id,
               'product_name',   i.product_name,
               'pack_name',      i.pack_name,
               'quantity',       i.quantity,
               'retail_usd',     i.retail_usd,
               'unit_price_usd', i.unit_price_usd,
               'line_total_usd', i.line_total_usd
             ) order by i.product_name, i.pack_name)
      from public.bulk_order_items i
      where i.bulk_order_id = o.id
    ), '[]'::jsonb)
  )
  from public.bulk_orders o
  where public.is_stockist()
    and o.id = p_order_id
    and o.stockist_id = public.current_stockist_id();
$$;


-- ────────────────────────────────────────────────────────────────────────
-- 7) ADMIN functions
-- ────────────────────────────────────────────────────────────────────────

-- 7a) Verify a request and send bank details. Reserves the shop stock.
create or replace function public.quote_bulk_order(
  p_order_id     uuid,
  p_bank_details text,
  p_note         text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  r        record;
  v_stock  integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if char_length(btrim(coalesce(p_bank_details, ''))) = 0 then
    raise exception 'Please add the bank details for the stockist';
  end if;
  if char_length(p_bank_details) > 2000 or char_length(coalesce(p_note, '')) > 500 then
    raise exception 'Bank details or note is too long';
  end if;

  select status into v_status
  from public.bulk_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_status <> 'requested' then
    raise exception 'This order was already %', v_status;
  end if;

  -- Reserve the shop stock, packs in a fixed order so two admins can never
  -- lock the same packs in opposite orders.
  for r in
    select i.variant_id, i.quantity, i.product_name, i.pack_name
    from public.bulk_order_items i
    where i.bulk_order_id = p_order_id
    order by i.variant_id nulls first
  loop
    if r.variant_id is null then
      raise exception '% (%) no longer exists. Reject this order.',
        r.product_name, r.pack_name;
    end if;

    select stock into v_stock
    from public.product_variants where id = r.variant_id for update;
    if v_stock is null or v_stock < r.quantity then
      raise exception 'Not enough stock for % (%): % left, % requested',
        r.product_name, r.pack_name, coalesce(v_stock, 0), r.quantity;
    end if;

    update public.product_variants
    set stock = stock - r.quantity
    where id = r.variant_id;
  end loop;

  update public.bulk_orders
  set status         = 'awaiting_payment',
      bank_details   = btrim(p_bank_details),
      admin_note     = nullif(btrim(coalesce(p_note, '')), ''),
      stock_reserved = true,
      quoted_at      = now(),
      reviewed_by    = auth.uid()
  where id = p_order_id;
end;
$$;

-- 7b) Reject a request (nothing was reserved yet).
create or replace function public.reject_bulk_order(
  p_order_id uuid,
  p_note     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) = 0 then
    raise exception 'Please add a short note explaining the rejection';
  end if;
  if char_length(p_note) > 500 then
    raise exception 'Note is too long (500 characters at most)';
  end if;

  select status into v_status
  from public.bulk_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_status <> 'requested' then
    raise exception 'This order was already %', v_status;
  end if;

  update public.bulk_orders
  set status      = 'rejected',
      admin_note  = btrim(p_note),
      decided_at  = now(),
      reviewed_by = auth.uid()
  where id = p_order_id;
end;
$$;

-- 7c) Proof is not good enough: send the order back to the stockist.
create or replace function public.return_bulk_payment(
  p_order_id uuid,
  p_note     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) = 0 then
    raise exception 'Please tell the stockist what is wrong with the proof';
  end if;
  if char_length(p_note) > 500 then
    raise exception 'Note is too long (500 characters at most)';
  end if;

  select status into v_status
  from public.bulk_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_status <> 'payment_submitted' then
    raise exception 'There is no payment proof to return';
  end if;

  update public.bulk_orders
  set status             = 'awaiting_payment',
      admin_note         = btrim(p_note),
      proof_path         = null,
      payment_reference  = null,
      proof_submitted_at = null,
      reviewed_by        = auth.uid()
  where id = p_order_id;
end;
$$;

-- 7d) Payment received: add the packs to the stockist's stock.
create or replace function public.approve_bulk_payment(
  p_order_id uuid,
  p_note     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.bulk_orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if char_length(coalesce(p_note, '')) > 500 then
    raise exception 'Note is too long (500 characters at most)';
  end if;

  select * into v_order
  from public.bulk_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_order.status <> 'payment_submitted' then
    raise exception 'This order is not waiting for payment approval';
  end if;

  if exists (
    select 1 from public.bulk_order_items
    where bulk_order_id = p_order_id and variant_id is null
  ) then
    raise exception 'A pack on this order no longer exists. Cancel the order instead.';
  end if;

  insert into public.stockist_stock_movements
    (stockist_id, variant_id, quantity, reason, bulk_order_id)
  select v_order.stockist_id, i.variant_id, i.quantity, 'bulk_order', p_order_id
  from public.bulk_order_items i
  where i.bulk_order_id = p_order_id;

  update public.bulk_orders
  set status         = 'approved',
      admin_note     = nullif(btrim(coalesce(p_note, '')), ''),
      stock_reserved = false,   -- the reserved shop stock is now the stockist's stock
      decided_at     = now(),
      reviewed_by    = auth.uid()
  where id = p_order_id;
end;
$$;

-- 7e) Cancel an order that is waiting for payment (for example the
--     stockist never paid). Puts the reserved shop stock back.
create or replace function public.cancel_bulk_order(
  p_order_id uuid,
  p_note     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.bulk_orders%rowtype;
  r       record;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) = 0 then
    raise exception 'Please add a short note explaining the cancellation';
  end if;
  if char_length(p_note) > 500 then
    raise exception 'Note is too long (500 characters at most)';
  end if;

  select * into v_order
  from public.bulk_orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_order.status not in ('awaiting_payment', 'payment_submitted') then
    raise exception 'Only an order waiting for payment can be cancelled';
  end if;

  if v_order.stock_reserved then
    for r in
      select i.variant_id, i.quantity
      from public.bulk_order_items i
      where i.bulk_order_id = p_order_id and i.variant_id is not null
      order by i.variant_id
    loop
      update public.product_variants
      set stock = stock + r.quantity
      where id = r.variant_id;
    end loop;
  end if;

  update public.bulk_orders
  set status         = 'cancelled',
      admin_note     = btrim(p_note),
      stock_reserved = false,
      decided_at     = now(),
      reviewed_by    = auth.uid()
  where id = p_order_id;
end;
$$;


-- ────────────────────────────────────────────────────────────────────────
-- 8) Who may call what. Every function re-checks the role itself.
-- ────────────────────────────────────────────────────────────────────────
revoke all on function public.submit_bulk_order(jsonb, text)                    from public, anon;
revoke all on function public.cancel_my_bulk_order(uuid)                        from public, anon;
revoke all on function public.submit_bulk_payment_proof(uuid, text, text)       from public, anon;
revoke all on function public.my_bulk_orders(integer, integer)                  from public, anon;
revoke all on function public.my_bulk_order(uuid)                               from public, anon;
revoke all on function public.quote_bulk_order(uuid, text, text)                from public, anon;
revoke all on function public.reject_bulk_order(uuid, text)                     from public, anon;
revoke all on function public.return_bulk_payment(uuid, text)                   from public, anon;
revoke all on function public.approve_bulk_payment(uuid, text)                  from public, anon;
revoke all on function public.cancel_bulk_order(uuid, text)                     from public, anon;

grant execute on function public.submit_bulk_order(jsonb, text)                  to authenticated;
grant execute on function public.cancel_my_bulk_order(uuid)                      to authenticated;
grant execute on function public.submit_bulk_payment_proof(uuid, text, text)     to authenticated;
grant execute on function public.my_bulk_orders(integer, integer)                to authenticated;
grant execute on function public.my_bulk_order(uuid)                             to authenticated;
grant execute on function public.quote_bulk_order(uuid, text, text)              to authenticated;
grant execute on function public.reject_bulk_order(uuid, text)                   to authenticated;
grant execute on function public.return_bulk_payment(uuid, text)                 to authenticated;
grant execute on function public.approve_bulk_payment(uuid, text)                to authenticated;
grant execute on function public.cancel_bulk_order(uuid, text)                   to authenticated;

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════════════

-- A) Tables exist and RLS is on (rowsecurity should be true for all three):
-- select tablename, rowsecurity from pg_tables
-- where schemaname = 'public'
--   and tablename in ('bulk_orders','bulk_order_items','stockist_stock_movements');

-- B) Only SELECT policies for the admin should exist on those tables:
-- select tablename, policyname, cmd from pg_policies
-- where tablename in ('bulk_orders','bulk_order_items','stockist_stock_movements')
-- order by tablename;

-- C) All ten functions exist and are SECURITY DEFINER (prosecdef = true):
-- select proname, prosecdef from pg_proc
-- where proname in ('submit_bulk_order','cancel_my_bulk_order',
--   'submit_bulk_payment_proof','my_bulk_orders','my_bulk_order',
--   'quote_bulk_order','reject_bulk_order','return_bulk_payment',
--   'approve_bulk_payment','cancel_bulk_order')
-- order by proname;

-- D) The proofs bucket is private (public should be false):
-- select id, public, file_size_limit from storage.buckets
-- where id = 'bulk-order-proofs';

-- NOTE: auth.uid() is empty in the SQL editor, so the functions cannot be
-- tested here. Test them through the app (stockist submit, admin quote,
-- stockist proof, admin approve).