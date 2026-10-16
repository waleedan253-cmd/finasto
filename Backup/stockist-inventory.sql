-- ════════════════════════════════════════════════════════════════════════
-- STOCKIST PORTAL, STEP 4: inventory (read-only)
-- Run AFTER stockist-portal.sql, stockist-bulk-orders.sql and
-- stockist-orders.sql. Safe to re-run. Runs as ONE transaction.
--
-- One row per pack the stockist has ever bought:
--   bought    = packs added by approved bulk orders (the stock ledger)
--   sold      = packs on PAID orders placed through their affiliates
--               (cancelled and refunded orders do not count)
--   remaining = bought - sold
-- Sold is counted straight from the orders, so there is nothing to keep in
-- sync and the numbers can never drift. Nothing is written by this file
-- except the one read function below.
-- ════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if to_regprocedure('public.is_stockist()') is null
     or to_regprocedure('public.current_stockist_id()') is null then
    raise exception 'is_stockist() / current_stockist_id() are missing. Run stockist-portal.sql first.';
  end if;
  if to_regclass('public.stockist_stock_movements') is null then
    raise exception 'stockist_stock_movements is missing. Run stockist-bulk-orders.sql first.';
  end if;
  if to_regclass('public.orders') is null or to_regclass('public.order_items') is null then
    raise exception 'orders and order_items must exist first.';
  end if;
end $$;


create or replace function public.my_stockist_inventory()
returns table (
  variant_id   uuid,
  product_name text,
  pack_name    text,
  bought       integer,
  sold         integer,
  remaining    integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_stockist uuid;
begin
  if not public.is_stockist() then
    raise exception 'Not authorized';
  end if;

  v_stockist := public.current_stockist_id();
  if v_stockist is null then
    raise exception 'Not authorized';
  end if;

  return query
  with bought as (
    select m.variant_id, sum(m.quantity)::integer as qty
    from public.stockist_stock_movements m
    where m.stockist_id = v_stockist
      and m.reason in ('bulk_order', 'adjustment')
    group by m.variant_id
  ),
  sold as (
    -- orders.stockist_id is the stockist's login user id (auth.uid()).
    select i.variant_id, sum(i.quantity)::integer as qty
    from public.order_items i
    join public.orders o on o.id = i.order_id
    where o.stockist_id = auth.uid()
      and o.payment_status = 'paid'
      and o.status <> 'cancelled'
      and i.variant_id is not null
    group by i.variant_id
  )
  select
    b.variant_id,
    p.name,
    v.name,
    b.qty,
    coalesce(s.qty, 0),
    b.qty - coalesce(s.qty, 0)
  from bought b
  join public.product_variants v on v.id = b.variant_id
  join public.products p on p.id = v.product_id
  left join sold s on s.variant_id = b.variant_id
  order by p.name, v.name;
end;
$$;

revoke all on function public.my_stockist_inventory() from public, anon;
grant execute on function public.my_stockist_inventory() to authenticated;

commit;

-- Check (the SQL editor has no signed-in user, so test it in the app):
-- select proname, prosecdef from pg_proc where proname = 'my_stockist_inventory';