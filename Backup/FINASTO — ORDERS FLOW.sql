-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — ORDERS & ORDER_ITEMS — COMPLETE REFERENCE SCHEMA
-- ════════════════════════════════════════════════════════════════════════
--
-- This file documents and (re-)applies the FULL current shape of
-- public.orders and public.order_items, as actually confirmed in the
-- live database — not assumed. Base columns (order_number, status,
-- source_type, total_amount, order_currency, exchange_rate_at_order,
-- total_base, country, line_total) were created elsewhere and are
-- preserved exactly. Everything below marked "ADDED" came from the
-- Orders-flow build in this conversation.
--
-- Key facts baked into this design:
--   - order_number IS the customer-facing tracking code. There is no
--     separate tracking_code column.
--   - affiliate_id / stockist_id reference profiles(id) DIRECTLY — not
--     affiliates.id / stockists.id. RLS below matches that exactly.
--   - status = fulfillment state (pending/paid/shipped/delivered/cancelled
--     — NOTE: 'paid' is a legacy value in the original status check and
--     is left in place for compatibility, but going forward fulfillment
--     progress and payment confirmation are tracked separately via the
--     new payment_status column below).
--   - payment_status = pending/paid/failed/refunded. Admin-confirmed only,
--     via confirm_order_payment() — never set directly by the app.
--   - A trigger blocks status from advancing past 'pending' until
--     payment_status = 'paid', matching "payment is confirmed by admin."
--
-- Safe to run multiple times. Nothing here drops or renames an existing
-- column, table, or constraint.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() is missing. Create it first.';
  end if;
  if to_regprocedure('public.touch_updated_at()') is null then
    raise exception 'public.touch_updated_at() is missing. Create it first.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) orders — base table (created elsewhere; recreated here only if
--    entirely absent, so a fresh environment can run this file alone)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                     uuid primary key default gen_random_uuid(),
  order_number           text not null,
  status                 text not null default 'pending',
  source_type            text not null default 'direct',
  affiliate_id           uuid references public.profiles(id) on delete set null,
  stockist_id            uuid references public.profiles(id) on delete set null,
  country                text,
  total_amount           numeric(12,2) not null,
  order_currency         text not null,
  exchange_rate_at_order numeric(18,8) not null,
  total_base             numeric(12,2),
  created_at             timestamptz not null default now()
);

-- Base constraints (match what's live; safe to re-assert)
alter table public.orders drop constraint if exists orders_order_number_key;
alter table public.orders add constraint orders_order_number_key unique (order_number);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status = any (array['pending','paid','shipped','delivered','cancelled']));

alter table public.orders drop constraint if exists orders_source_type_check;
alter table public.orders add constraint orders_source_type_check
  check (source_type = any (array['direct','affiliate','stockist']));

alter table public.orders drop constraint if exists orders_total_amount_check;
alter table public.orders add constraint orders_total_amount_check
  check (total_amount >= 0);

alter table public.orders drop constraint if exists orders_order_currency_check;
alter table public.orders add constraint orders_order_currency_check
  check (order_currency ~ '^[A-Z]{3}$');

alter table public.orders drop constraint if exists orders_exchange_rate_at_order_check;
alter table public.orders add constraint orders_exchange_rate_at_order_check
  check (exchange_rate_at_order > 0);

alter table public.orders drop constraint if exists orders_country_check;
alter table public.orders add constraint orders_country_check
  check (country is null or country ~ '^[A-Z]{2}$');

-- ── ADDED by the Orders flow ──────────────────────────────────────────
alter table public.orders
  add column if not exists customer_name                 text,
  add column if not exists customer_email                text,
  add column if not exists payment_status                text not null default 'pending',
  add column if not exists affiliate_commission_percent   numeric(5,2),
  add column if not exists stockist_profit_percent        numeric(5,2),
  add column if not exists updated_at                     timestamptz not null default now();

alter table public.orders drop constraint if exists orders_customer_email_format;
alter table public.orders add constraint orders_customer_email_format
  check (customer_email is null or customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending','paid','failed','refunded'));

alter table public.orders drop constraint if exists orders_affiliate_commission_percent_range;
alter table public.orders add constraint orders_affiliate_commission_percent_range
  check (affiliate_commission_percent is null
    or (affiliate_commission_percent >= 0 and affiliate_commission_percent <= 100));

alter table public.orders drop constraint if exists orders_stockist_profit_percent_range;
alter table public.orders add constraint orders_stockist_profit_percent_range
  check (stockist_profit_percent is null
    or (stockist_profit_percent >= 0 and stockist_profit_percent <= 100));

create index if not exists orders_customer_email_idx  on public.orders (customer_email);
create index if not exists orders_payment_status_idx  on public.orders (payment_status);
create index if not exists orders_affiliate_id_idx    on public.orders (affiliate_id);
create index if not exists orders_stockist_id_idx     on public.orders (stockist_id);
create index if not exists orders_status_idx          on public.orders (status);
create index if not exists orders_created_at_idx      on public.orders (created_at desc);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();


-- ────────────────────────────────────────────────────────────────────────
-- 2) Enforce: status can't advance past 'pending' (except to 'cancelled')
--    until payment_status = 'paid'. Business rule: admin manually
--    confirms payment; only then can fulfillment proceed.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.enforce_order_payment_before_fulfillment()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'pending'
     and new.status <> 'cancelled'
     and new.payment_status <> 'paid'
  then
    raise exception 'Order cannot move to "%" until payment is confirmed', new.status;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_enforce_payment_before_fulfillment on public.orders;
create trigger orders_enforce_payment_before_fulfillment
  before insert or update on public.orders
  for each row execute function public.enforce_order_payment_before_fulfillment();


-- ────────────────────────────────────────────────────────────────────────
-- 3) order_items — base table (created elsewhere; recreated here only
--    if entirely absent)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity     integer not null,
  line_total   numeric(12,2) not null
);

alter table public.order_items drop constraint if exists order_items_quantity_check;
alter table public.order_items add constraint order_items_quantity_check
  check (quantity > 0);

alter table public.order_items drop constraint if exists order_items_line_total_check;
alter table public.order_items add constraint order_items_line_total_check
  check (line_total >= 0);

-- ── ADDED by the Orders flow ──────────────────────────────────────────
alter table public.order_items
  add column if not exists variant_id   uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_name text,
  add column if not exists unit_price   numeric(12,2);

alter table public.order_items drop constraint if exists order_items_unit_price_check;
alter table public.order_items add constraint order_items_unit_price_check
  check (unit_price is null or unit_price >= 0);

create index if not exists order_items_order_id_idx on public.order_items (order_id);


-- ────────────────────────────────────────────────────────────────────────
-- 4) Row Level Security
--    Admin: full access. Affiliate/Stockist: read-only, own orders only
--    (compared against auth.uid() directly, matching the real FK to
--    profiles(id)). Guests: INSERT only (pending/pending), never SELECT —
--    all guest reads go through track_order() below.
-- ────────────────────────────────────────────────────────────────────────
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "admin manages orders" on public.orders;
create policy "admin manages orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "affiliate reads own orders" on public.orders;
create policy "affiliate reads own orders"
  on public.orders for select
  using (public.is_affiliate() and affiliate_id = auth.uid());

drop policy if exists "stockist reads own orders" on public.orders;
create policy "stockist reads own orders"
  on public.orders for select
  using (public.is_stockist() and stockist_id = auth.uid());

drop policy if exists "guest creates pending order" on public.orders;
create policy "guest creates pending order"
  on public.orders for insert
  with check (payment_status = 'pending' and status = 'pending');

drop policy if exists "admin manages order items" on public.order_items;
create policy "admin manages order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "affiliate reads own order items" on public.order_items;
create policy "affiliate reads own order items"
  on public.order_items for select
  using (
    public.is_affiliate()
    and exists (select 1 from public.orders o where o.id = order_id and o.affiliate_id = auth.uid())
  );

drop policy if exists "stockist reads own order items" on public.order_items;
create policy "stockist reads own order items"
  on public.order_items for select
  using (
    public.is_stockist()
    and exists (select 1 from public.orders o where o.id = order_id and o.stockist_id = auth.uid())
  );

drop policy if exists "guest creates items on pending order" on public.order_items;
create policy "guest creates items on pending order"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.payment_status = 'pending')
  );


-- ────────────────────────────────────────────────────────────────────────
-- 5) track_order() — the ONLY way a guest reads order data. Verifies
--    order_number + email match before returning anything.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.track_order(
  p_order_number text,
  p_email        text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
  result jsonb;
begin
  select * into o
  from public.orders
  where order_number = btrim(p_order_number)
    and customer_email = lower(btrim(p_email));

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'trackingCode',  o.order_number,
    'orderStatus',   o.status,
    'paymentStatus', o.payment_status,
    'customerName',  o.customer_name,
    'currency',      o.order_currency,
    'totalOriginal', o.total_amount,
    'createdAt',     o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'productName', i.product_name,
        'variantName', coalesce(i.variant_name, ''),
        'quantity',    i.quantity
      ))
      from public.order_items i
      where i.order_id = o.id
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────
-- 6) confirm_order_payment() — the ONE way payment_status becomes 'paid'.
--    Admin-only.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.confirm_order_payment(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  update public.orders
  set payment_status = 'paid'
  where id = p_order_id and payment_status = 'pending';

  if not found then
    raise exception 'Order not found or payment already processed';
  end if;
end;
$$;

revoke all on function public.confirm_order_payment(uuid) from public, anon;
grant execute on function public.confirm_order_payment(uuid) to authenticated;

commit;


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ════════════════════════════════════════════════════════════════════════
-- select column_name, data_type from information_schema.columns
-- where table_schema='public' and table_name in ('orders','order_items')
-- order by table_name, ordinal_position;
--
-- select tablename, policyname, cmd from pg_policies
-- where tablename in ('orders','order_items') order by tablename, policyname;
--
-- select proname, prosecdef from pg_proc
-- where proname in ('track_order','confirm_order_payment');




-- ## for select base
select column_name, generation_expression
from information_schema.columns
where table_name = 'orders' and column_name = 'total_base';




















-- ════════════════════════════════════════════════════════════════
-- ORDER LIFECYCLE (payout-ready)
-- Run AFTER the orders reference schema. Safe to re-run.
--
-- Lifecycle after this migration:
--   payment_status : pending -> paid  (confirm_order_payment, admin now,
--                                      payment gateway webhook later)
--                    paid -> refunded (refund_order, admin)
--   status         : pending -> shipped -> delivered   (or cancelled)
--   Shipping starts the REFUND WINDOW (24 hours by default). An order
--   becomes payable for an affiliate once: paid, shipped, the window has
--   passed, and it was not refunded or cancelled.
-- ════════════════════════════════════════════════════════════════

begin;

-- ════════════════════════════════════════════════════════════════
-- SECTION 1: lifecycle columns on orders
-- ════════════════════════════════════════════════════════════════
alter table public.orders
  add column if not exists paid_at              timestamptz,
  add column if not exists payment_method       text,
  add column if not exists shipped_at           timestamptz,
  add column if not exists refund_window_ends_at timestamptz,
  add column if not exists refunded_at          timestamptz,
  add column if not exists refund_reason        text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('manual', 'gateway'));

-- Payout queries look at paid + shipped orders per affiliate.
create index if not exists orders_payable_idx
  on public.orders (affiliate_id, refund_window_ends_at)
  where payment_status = 'paid' and shipped_at is not null;


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: refund window setting (one row, admin-editable)
-- The window length lives here, not in code, so it can be changed
-- later (for example to 72 hours for international parcels) without a
-- deploy. Each order keeps the end time it was given when it shipped.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.order_settings (
  id                  boolean primary key default true check (id),
  refund_window_hours integer not null default 24
                        check (refund_window_hours between 0 and 8760),
  updated_at          timestamptz not null default now()
);

insert into public.order_settings (id) values (true)
on conflict (id) do nothing;

drop trigger if exists order_settings_touch_updated_at on public.order_settings;
create trigger order_settings_touch_updated_at
  before update on public.order_settings
  for each row execute function public.touch_updated_at();

alter table public.order_settings enable row level security;

drop policy if exists "admin manages order settings" on public.order_settings;
create policy "admin manages order settings"
  on public.order_settings for all
  using (public.is_admin())
  with check (public.is_admin());


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: allow refunds after fulfillment
-- The old guard rejected ANY order whose payment_status was not 'paid'
-- once it had moved past 'pending', which would have blocked refunding
-- a shipped order. 'refunded' is now allowed too.
-- ════════════════════════════════════════════════════════════════
create or replace function public.enforce_order_payment_before_fulfillment()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'pending'
     and new.status <> 'cancelled'
     and new.payment_status not in ('paid', 'refunded')
  then
    raise exception 'Order cannot move to "%" until payment is confirmed', new.status;
  end if;
  return new;
end;
$$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: automatic timestamps
-- A trigger (not app code) stamps the lifecycle, so it is correct
-- however the admin changes the order, and the future payment webhook
-- gets it for free.
--   paid_at              when payment_status becomes 'paid'
--   shipped_at           when status first becomes shipped/delivered
--   refund_window_ends_at  shipped_at + refund_window_hours
--   refunded_at          when payment_status becomes 'refunded'
-- Once shipped, an order cannot go back to pending/paid, so the
-- refund window cannot be restarted or dodged.
-- ════════════════════════════════════════════════════════════════
create or replace function public.stamp_order_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hours integer;
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    new.paid_at := coalesce(new.paid_at, now());
  end if;

  if old.shipped_at is not null and new.status in ('pending', 'paid') then
    raise exception 'A shipped order cannot go back to "%"', new.status;
  end if;

  if new.status in ('shipped', 'delivered') and new.shipped_at is null then
    select refund_window_hours into v_hours
    from public.order_settings
    where id;

    new.shipped_at := now();
    new.refund_window_ends_at :=
      new.shipped_at + make_interval(hours => coalesce(v_hours, 24));
  end if;

  if new.payment_status = 'refunded' and old.payment_status is distinct from 'refunded' then
    new.refunded_at := coalesce(new.refunded_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists orders_stamp_lifecycle on public.orders;
create trigger orders_stamp_lifecycle
  before update on public.orders
  for each row execute function public.stamp_order_lifecycle();


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: backfill orders that were paid or shipped before this
-- migration. The updated_at trigger is switched off for this one
-- statement so the real "last changed" time is not overwritten.
-- ════════════════════════════════════════════════════════════════
alter table public.orders disable trigger orders_touch_updated_at;
alter table public.orders disable trigger orders_stamp_lifecycle;

update public.orders
set paid_at        = coalesce(paid_at, updated_at),
    payment_method = coalesce(payment_method, 'manual')
where payment_status in ('paid', 'refunded') and paid_at is null;

update public.orders
set shipped_at = updated_at,
    refund_window_ends_at = updated_at + interval '24 hours'
where status in ('shipped', 'delivered') and shipped_at is null;

alter table public.orders enable trigger orders_stamp_lifecycle;
alter table public.orders enable trigger orders_touch_updated_at;


-- ════════════════════════════════════════════════════════════════
-- SECTION 6: confirm_order_payment (replaces the old one-argument
-- version; calls like rpc("confirm_order_payment", { p_order_id })
-- keep working because the new arguments have defaults).
--
-- Callable by an admin now, and by the service-role key later, which
-- is what the payment gateway webhook will use. The webhook passes
-- p_method => 'gateway'. Nothing else about orders has to change.
-- ════════════════════════════════════════════════════════════════
drop function if exists public.confirm_order_payment(uuid);

create or replace function public.confirm_order_payment(
  p_order_id uuid,
  p_method   text default 'manual'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin()
     and coalesce(auth.role(), '') <> 'service_role'
  then
    raise exception 'Not authorized';
  end if;

  if p_method not in ('manual', 'gateway') then
    raise exception 'Invalid payment method';
  end if;

  update public.orders
  set payment_status = 'paid',
      payment_method = p_method
  where id = p_order_id and payment_status = 'pending';

  if not found then
    raise exception 'Order not found or payment already processed';
  end if;
end;
$$;

revoke all on function public.confirm_order_payment(uuid, text) from public, anon;
grant execute on function public.confirm_order_payment(uuid, text)
  to authenticated, service_role;


-- ════════════════════════════════════════════════════════════════
-- SECTION 7: refund_order (admin only)
-- Marks a PAID order as refunded. A refunded order is never payable
-- to an affiliate. (If the order was already included in a paid
-- payout, that is handled by the payout flow as a negative
-- adjustment, never by editing history.)
-- ════════════════════════════════════════════════════════════════
create or replace function public.refund_order(
  p_order_id uuid,
  p_reason   text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  update public.orders
  set payment_status = 'refunded',
      refund_reason  = nullif(btrim(p_reason), '')
  where id = p_order_id and payment_status = 'paid';

  if not found then
    raise exception 'Order not found or not in a refundable state';
  end if;
end;
$$;

revoke all on function public.refund_order(uuid, text) from public, anon;
grant execute on function public.refund_order(uuid, text) to authenticated;

commit;


-- ════════════════════════════════════════════════════════════════
-- VERIFICATION (run one at a time, optional)
-- ════════════════════════════════════════════════════════════════
-- select * from public.order_settings;
--
-- select order_number, status, payment_status, paid_at, shipped_at,
--        refund_window_ends_at, refunded_at
-- from public.orders order by created_at desc limit 10;





create or replace function public.get_min_payout_usd()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select min_payout_usd from public.order_settings where id;
$$;

revoke all on function public.get_min_payout_usd() from public, anon;
grant execute on function public.get_min_payout_usd() to authenticated;