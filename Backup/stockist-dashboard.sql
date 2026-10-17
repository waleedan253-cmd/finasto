-- ════════════════════════════════════════════════════════════════════════
-- STOCKIST PORTAL, STEP 5: dashboard numbers (read-only)
-- Run AFTER stockist-orders.sql and stockist-inventory.sql. Safe to re-run.
-- One transaction.
--
-- One function, my_stockist_dashboard(p_range), for everything the
-- dashboard needs that nothing else provides. It reuses the two existing
-- safe sources, so no new table and no new privacy exposure:
--   _my_stockist_order_rows()   the stockist's own orders
--   my_stockist_inventory()     bought / sold / remaining per pack
-- The recent orders list comes from my_stockist_orders() (already built).
--
-- Returns:
-- {
--   "range": "30d", "bucket": "day" | "month",
--   "active_affiliates": 4,
--   "stock_remaining":   135,
--   "low_stock": [ { "product_name", "pack_name", "remaining" } ],  -- up to 5
--   "period": { "orders": n, "units": n, "sales_usd": n },
--   "daily":  [ { "day": "2026-10-08", "orders": 3, "units": 9, "sales_usd": 120.5 } ]
-- }
-- Sales = PAID orders that are not cancelled (refunded orders are not
-- "paid"). Orders counts every order placed that day. Days are UTC days,
-- one entry per day (zeros included) so the chart has no gaps; the 12m
-- range gives one entry per month. Ranges match the affiliate dashboard:
-- 7d, 30d, 90d, last_month, 12m.
-- ════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if to_regprocedure('public._my_stockist_order_rows()') is null then
    raise exception '_my_stockist_order_rows() is missing. Run stockist-orders.sql first.';
  end if;
  if to_regprocedure('public.my_stockist_inventory()') is null then
    raise exception 'my_stockist_inventory() is missing. Run stockist-inventory.sql first.';
  end if;
end $$;


create or replace function public.my_stockist_dashboard(p_range text default '30d')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_range      text := coalesce(p_range, '30d');
  v_today      date := (now() at time zone 'utc')::date;
  v_bucket     text := 'day';
  v_step       interval := interval '1 day';
  v_start      date;
  v_series_end date := (now() at time zone 'utc')::date;  -- last bucket shown
  v_to         date := (now() at time zone 'utc')::date;  -- last day counted
  v_stockist   uuid;
  v_affiliates integer;
  v_stock      integer;
  v_low        jsonb;
  v_period     jsonb;
  v_daily      jsonb;
begin
  if not public.is_stockist() then
    raise exception 'Not authorized';
  end if;

  v_stockist := public.current_stockist_id();
  if v_stockist is null then
    raise exception 'Not authorized';
  end if;

  if v_range = '7d' then
    v_start := v_today - 6;
  elsif v_range = '30d' then
    v_start := v_today - 29;
  elsif v_range = '90d' then
    v_start := v_today - 89;
  elsif v_range = 'last_month' then
    v_start := (date_trunc('month', v_today::timestamp) - interval '1 month')::date;
    v_series_end := date_trunc('month', v_today::timestamp)::date - 1;
    v_to := v_series_end;
  elsif v_range = '12m' then
    v_bucket := 'month';
    v_step := interval '1 month';
    v_start := (date_trunc('month', v_today::timestamp) - interval '11 months')::date;
    v_series_end := date_trunc('month', v_today::timestamp)::date;
  else
    raise exception 'Invalid range';
  end if;

  -- Affiliates currently assigned to this stockist.
  select count(*)::integer into v_affiliates
  from public.affiliates a
  where a.stockist_id = v_stockist
    and a.status = 'active';

  -- Stock now (all time, not tied to the chart period).
  select coalesce(sum(greatest(i.remaining, 0)), 0)::integer into v_stock
  from public.my_stockist_inventory() i;

  select coalesce(jsonb_agg(x order by x.remaining, x.product_name, x.pack_name), '[]'::jsonb)
    into v_low
  from (
    select i.product_name, i.pack_name, greatest(i.remaining, 0) as remaining
    from public.my_stockist_inventory() i
    where i.remaining <= 5
    order by greatest(i.remaining, 0), i.product_name, i.pack_name
    limit 5
  ) x;

  -- Totals for the chosen period.
  select jsonb_build_object(
           'orders',    count(*),
           'units',     coalesce(sum(r.item_count) filter (where r.payment_status = 'paid' and r.status <> 'cancelled'), 0),
           'sales_usd', coalesce(sum(r.total_usd)  filter (where r.payment_status = 'paid' and r.status <> 'cancelled'), 0)
         )
    into v_period
  from public._my_stockist_order_rows() r
  where (r.ordered_at at time zone 'utc')::date between v_start and v_to;

  -- The chart series.
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'day',       to_char(d.day, 'YYYY-MM-DD'),
               'orders',    coalesce(a.orders, 0),
               'units',     coalesce(a.units, 0),
               'sales_usd', coalesce(a.sales_usd, 0)
             )
             order by d.day
           ),
           '[]'::jsonb
         )
    into v_daily
  from (
    select g::date as day
    from generate_series(v_start, v_series_end, v_step) as g
  ) d
  left join (
    select
      date_trunc(v_bucket, (r.ordered_at at time zone 'utc'))::date as day,
      count(*) as orders,
      coalesce(sum(r.item_count) filter (where r.payment_status = 'paid' and r.status <> 'cancelled'), 0) as units,
      coalesce(sum(r.total_usd)  filter (where r.payment_status = 'paid' and r.status <> 'cancelled'), 0) as sales_usd
    from public._my_stockist_order_rows() r
    where (r.ordered_at at time zone 'utc')::date between v_start and v_to
    group by 1
  ) a on a.day = d.day;

  return jsonb_build_object(
    'range',             v_range,
    'bucket',            v_bucket,
    'active_affiliates', v_affiliates,
    'stock_remaining',   v_stock,
    'low_stock',         v_low,
    'period',            v_period,
    'daily',             v_daily
  );
end;
$$;

revoke all on function public.my_stockist_dashboard(text) from public, anon;
grant execute on function public.my_stockist_dashboard(text) to authenticated;

commit;

-- The function needs a signed-in stockist, so it cannot be tested from the
-- SQL editor. Check it exists, then test it on /stockist once the page is built:
-- select proname, prosecdef from pg_proc where proname = 'my_stockist_dashboard';