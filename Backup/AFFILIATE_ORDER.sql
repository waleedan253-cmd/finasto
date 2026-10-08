-- ════════════════════════════════════════════════════════════════════════
-- AFFILIATE ORDERS (privacy-safe order history)
-- Run AFTER payouts.sql. Safe to re-run. One transaction: all or nothing.
--
-- Problem this solves
--   The policy "affiliate reads own orders" lets an affiliate read EVERY
--   column of their orders straight through the Supabase API, including
--   the customer's full email. Hiding it on the page would not stop
--   that. So this migration:
--     1. adds two functions that return ONLY safe fields (customer
--        first name, masked email like j***@gmail.com, no phone or
--        address, no last name), and
--     2. removes the affiliate's direct read access to orders and
--        order_items.
--   Admin, stockist and the guest tracking page are not affected.
--
-- The commission state is calculated here with the same rules as the
-- payout flow, so the Orders page and the Payout Requests page always
-- agree.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ════════════════════════════════════════════════════════════════
-- SECTION 0: pre-flight
-- ════════════════════════════════════════════════════════════════
do $$
begin
  if to_regclass('public.payout_requests') is null
     or to_regclass('public.payout_request_items') is null then
    raise exception 'Payout tables are missing. Run payouts.sql first.';
  end if;
  if to_regprocedure('public.is_affiliate()') is null then
    raise exception 'public.is_affiliate() is missing. Run affiliates.sql first.';
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 1: masking helpers
-- ════════════════════════════════════════════════════════════════

-- "jane.doe@gmail.com" -> "j***@gmail.com"
create or replace function public.mask_email(p_email text)
returns text
language sql
immutable
as $$
  select case
    when s.e is null or s.e = '' then null
    when position('@' in s.e) > 1
      then left(s.e, 1) || '***' || substr(s.e, position('@' in s.e))
    else '***'
  end
  from (select btrim(p_email) as e) s;
$$;

-- "Jane Marie Doe" -> "Jane" (never the surname). Empty -> "Customer".
create or replace function public.first_name_only(p_name text)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(left(split_part(btrim(coalesce(p_name, '')), ' ', 1), 40), ''),
    'Customer'
  );
$$;

revoke all on function public.mask_email(text) from public, anon;
revoke all on function public.first_name_only(text) from public, anon;
grant execute on function public.mask_email(text) to authenticated;
grant execute on function public.first_name_only(text) to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: _my_order_rows() (internal, shared by both functions)
-- The signed-in affiliate's own orders, with safe fields and the
-- commission state. Not callable from the browser: only the two public
-- functions below use it. orders.affiliate_id holds the login user id,
-- so the filter is simply auth.uid().
--
-- commission_state
--   refunded           order was refunded
--   cancelled          order was cancelled
--   paid_out           commission was paid in a payout
--   in_request         commission is in a payout request
--   none               no commission on this order (rate 0)
--   unpaid             customer payment not confirmed yet
--   awaiting_shipment  paid, but not shipped yet
--   in_window          shipped, refund window still open
--   ready              can be added to a payout request now
-- ════════════════════════════════════════════════════════════════
create or replace function public._my_order_rows()
returns table (
  order_id              uuid,
  order_number          text,
  ordered_at            timestamptz,
  customer_first_name   text,
  customer_email_masked text,
  item_count            integer,
  total_amount          numeric,
  order_currency        text,
  total_usd             numeric,
  status                text,
  payment_status        text,
  paid_at               timestamptz,
  shipped_at            timestamptz,
  refund_window_ends_at timestamptz,
  refunded_at           timestamptz,
  commission_percent    numeric,
  commission_usd        numeric,
  commission_state      text,
  payout_request_number text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.order_number,
    o.created_at,
    public.first_name_only(o.customer_name),
    public.mask_email(o.customer_email),
    coalesce((
      select sum(i.quantity)::integer
      from public.order_items i
      where i.order_id = o.id
    ), 0),
    o.total_amount,
    o.order_currency,
    o.total_base,
    o.status,
    o.payment_status,
    o.paid_at,
    o.shipped_at,
    o.refund_window_ends_at,
    o.refunded_at,
    o.affiliate_commission_percent,
    case
      when coalesce(o.affiliate_commission_percent, 0) > 0
           and coalesce(o.total_base, 0) > 0
        then round(o.total_base * o.affiliate_commission_percent / 100, 2)
      else 0
    end,
    case
      when o.payment_status = 'refunded' then 'refunded'
      when o.status = 'cancelled' then 'cancelled'
      when pr.req_status = 'paid' then 'paid_out'
      when pr.req_status in ('requested', 'approved') then 'in_request'
      when coalesce(o.affiliate_commission_percent, 0) <= 0
           or coalesce(o.total_base, 0) <= 0 then 'none'
      when o.payment_status <> 'paid' then 'unpaid'
      when o.status not in ('shipped', 'delivered')
           or o.refund_window_ends_at is null then 'awaiting_shipment'
      when o.refund_window_ends_at > now() then 'in_window'
      else 'ready'
    end,
    pr.request_number
  from public.orders o
  left join lateral (
    select r.request_number, r.status as req_status
    from public.payout_request_items pi
    join public.payout_requests r on r.id = pi.payout_request_id
    where pi.order_id = o.id and pi.is_active
    limit 1
  ) pr on true
  where public.is_affiliate()
    and o.affiliate_id = auth.uid();
$$;

revoke all on function public._my_order_rows() from public, anon, authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: my_orders(): the list, with filters and paging
-- Returns { "total": n, "rows": [ ... ] }, newest first.
-- Search matches the order number only. Filters are validated, so a
-- tampered value is rejected instead of silently ignored.
-- ════════════════════════════════════════════════════════════════
create or replace function public.my_orders(
  p_search           text    default null,
  p_status           text    default null,
  p_payment_status   text    default null,
  p_commission_state text    default null,
  p_limit            integer default 20,
  p_offset           integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
  v_limit  integer := least(greatest(coalesce(p_limit, 20), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_total  bigint;
  v_rows   jsonb;
begin
  if not public.is_affiliate() then
    raise exception 'Not authorized';
  end if;

  if p_status is not null
     and p_status not in ('pending', 'paid', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid status filter';
  end if;
  if p_payment_status is not null
     and p_payment_status not in ('pending', 'paid', 'failed', 'refunded') then
    raise exception 'Invalid payment status filter';
  end if;
  if p_commission_state is not null
     and p_commission_state not in (
       'refunded', 'cancelled', 'paid_out', 'in_request', 'none',
       'unpaid', 'awaiting_shipment', 'in_window', 'ready'
     ) then
    raise exception 'Invalid commission filter';
  end if;

  -- Escape LIKE wildcards so a search for "%" or "_" matches literally.
  if v_search is not null then
    v_search := replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_');
  end if;

  select count(*) into v_total
  from public._my_order_rows() r
  where (v_search is null or r.order_number ilike '%' || v_search || '%')
    and (p_status is null or r.status = p_status)
    and (p_payment_status is null or r.payment_status = p_payment_status)
    and (p_commission_state is null or r.commission_state = p_commission_state);

  select coalesce(
           jsonb_agg(to_jsonb(x) - 'order_id' order by x.ordered_at desc),
           '[]'::jsonb
         )
    into v_rows
  from (
    select r.*
    from public._my_order_rows() r
    where (v_search is null or r.order_number ilike '%' || v_search || '%')
      and (p_status is null or r.status = p_status)
      and (p_payment_status is null or r.payment_status = p_payment_status)
      and (p_commission_state is null or r.commission_state = p_commission_state)
    order by r.ordered_at desc
    limit v_limit offset v_offset
  ) x;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.my_orders(text, text, text, text, integer, integer)
  from public, anon;
grant execute on function public.my_orders(text, text, text, text, integer, integer)
  to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: my_order(): one order, with its items
-- Returns the same safe fields plus "items", or null when the order
-- does not exist OR belongs to someone else (the two look identical,
-- so order numbers cannot be probed).
-- Item prices are in USD, the currency they are stored in.
-- ════════════════════════════════════════════════════════════════
create or replace function public.my_order(p_order_number text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_row   record;
  v_items jsonb;
begin
  if not public.is_affiliate() then
    raise exception 'Not authorized';
  end if;

  select * into v_row
  from public._my_order_rows() r
  where r.order_number = btrim(coalesce(p_order_number, ''));

  if not found then
    return null;
  end if;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'product_name',   i.product_name,
               'variant_name',   coalesce(i.variant_name, ''),
               'quantity',       i.quantity,
               'unit_price_usd', i.unit_price,
               'line_total_usd', i.line_total
             )
             order by i.product_name
           ),
           '[]'::jsonb
         )
    into v_items
  from public.order_items i
  where i.order_id = v_row.order_id;

  return (to_jsonb(v_row) - 'order_id') || jsonb_build_object('items', v_items);
end;
$$;

revoke all on function public.my_order(text) from public, anon;
grant execute on function public.my_order(text) to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: close the direct-read loophole
-- Affiliates now see their orders ONLY through my_orders() /
-- my_order(). Admin and stockist policies and the guest tracking
-- function (track_order) are untouched.
-- ════════════════════════════════════════════════════════════════
drop policy if exists "affiliate reads own orders" on public.orders;
drop policy if exists "affiliate reads own order items" on public.order_items;

commit;


-- ════════════════════════════════════════════════════════════════
-- VERIFICATION (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════
-- The affiliate policies on orders / order_items must be GONE:
-- select tablename, policyname from pg_policies
-- where tablename in ('orders', 'order_items') order by 1, 2;
--
-- The new functions exist and run with the owner's rights:
-- select proname, prosecdef from pg_proc
-- where proname in ('my_orders', 'my_order', '_my_order_rows',
--                   'mask_email', 'first_name_only') order by 1;
--
-- Masking check:
-- select public.mask_email('jane.doe@gmail.com'),
--        public.first_name_only('Jane Marie Doe');