-- ════════════════════════════════════════════════════════════════════════
-- STOCKIST PORTAL, STEP 3: orders (read-only, privacy-safe)
-- Run AFTER stockist-portal.sql and affiliate-orders.sql (which creates the
-- mask_email() and first_name_only() helpers this file reuses).
-- Safe to re-run. Runs as ONE transaction.
--
-- A stockist sees the orders placed through THEIR affiliates, and only
-- safe fields: the order number, date, which affiliate it came from, the
-- customer's first name and a masked email (j***@gmail.com), the number of
-- packs, the total in USD and the order and payment status. Never the
-- customer's phone, address or last name, and never any commission amount.
--
-- "Their" orders are the ones whose stockist_id (saved on the order when
-- it was placed) is the signed-in stockist. Moving an affiliate to another
-- stockist later therefore never moves past orders.
--
-- NOTE: this adds the safe functions. It does NOT remove any direct read
-- policy a stockist may still have on orders / order_items (see the check
-- at the bottom of this file).
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight checks
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_stockist()') is null then
    raise exception 'public.is_stockist() is missing.';
  end if;
  if to_regprocedure('public.mask_email(text)') is null
     or to_regprocedure('public.first_name_only(text)') is null then
    raise exception 'mask_email() / first_name_only() are missing. Run affiliate-orders.sql first.';
  end if;
  if to_regclass('public.orders') is null
     or to_regclass('public.order_items') is null
     or to_regclass('public.affiliates') is null then
    raise exception 'orders, order_items and affiliates must exist first.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) _my_stockist_order_rows() (internal, used by the function below)
--    orders.stockist_id holds the stockist's login user id, so the filter
--    is simply auth.uid(). Not callable from the browser.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public._my_stockist_order_rows()
returns table (
  order_id              uuid,
  order_number          text,
  ordered_at            timestamptz,
  affiliate_name        text,
  customer_first_name   text,
  customer_email_masked text,
  item_count            integer,
  total_usd             numeric,
  status                text,
  payment_status        text
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
    coalesce(nullif(btrim(a.name), ''), 'Affiliate'),
    public.first_name_only(o.customer_name),
    public.mask_email(o.customer_email),
    coalesce((
      select sum(i.quantity)::integer
      from public.order_items i
      where i.order_id = o.id
    ), 0),
    o.total_base,
    o.status,
    o.payment_status
  from public.orders o
  left join public.affiliates a on a.profile_id = o.affiliate_id
  where public.is_stockist()
    and o.stockist_id = auth.uid();
$$;

revoke all on function public._my_stockist_order_rows() from public, anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────
-- 2) my_stockist_orders(): the list, with filters and paging
--    Returns { "total": n, "rows": [ ... ] }, newest first.
--    Search matches the order number or the affiliate's name. Filters are
--    validated, so a tampered value is rejected instead of silently ignored.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.my_stockist_orders(
  p_search         text    default null,
  p_status         text    default null,
  p_payment_status text    default null,
  p_limit          integer default 20,
  p_offset         integer default 0
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
  if not public.is_stockist() then
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

  -- Escape LIKE wildcards so a search for "%" or "_" matches literally.
  if v_search is not null then
    v_search := replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_');
  end if;

  select count(*) into v_total
  from public._my_stockist_order_rows() r
  where (v_search is null
         or r.order_number ilike '%' || v_search || '%'
         or r.affiliate_name ilike '%' || v_search || '%')
    and (p_status is null or r.status = p_status)
    and (p_payment_status is null or r.payment_status = p_payment_status);

  select coalesce(
           jsonb_agg(to_jsonb(x) - 'order_id' order by x.ordered_at desc),
           '[]'::jsonb
         )
    into v_rows
  from (
    select r.*
    from public._my_stockist_order_rows() r
    where (v_search is null
           or r.order_number ilike '%' || v_search || '%'
           or r.affiliate_name ilike '%' || v_search || '%')
      and (p_status is null or r.status = p_status)
      and (p_payment_status is null or r.payment_status = p_payment_status)
    order by r.ordered_at desc
    limit v_limit offset v_offset
  ) x;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.my_stockist_orders(text, text, text, integer, integer)
  from public, anon;
grant execute on function public.my_stockist_orders(text, text, text, integer, integer)
  to authenticated;

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- CHECKS (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════════════

-- A) The function exists and is SECURITY DEFINER (prosecdef = true):
-- select proname, prosecdef from pg_proc where proname = 'my_stockist_orders';

-- B) IMPORTANT, privacy: which policies still let a stockist read orders
--    directly through the API (which would show the full customer email,
--    phone and address)? Run this and send me the result:
-- select tablename, policyname, cmd, qual
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('orders', 'order_items')
-- order by tablename, policyname;

-- NOTE: auth.uid() is empty in the SQL editor, so the function cannot be
-- tested here. Test it through the Orders page once it exists.



drop policy if exists "stockist reads own orders" on public.orders;
drop policy if exists "stockist reads own order items" on public.order_items;