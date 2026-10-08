-- ════════════════════════════════════════════════════════════════════════
-- AFFILIATE DASHBOARD STATS
-- Run AFTER affiliate-orders.sql. Safe to re-run. One transaction.
--
-- One small function for the numbers the dashboard needs that nothing
-- else provides: order counts and a daily series for the chart.
-- Earnings (pending / available / in review / paid) already come from
-- affiliate_earnings_summary(), and the recent orders from my_orders(),
-- so none of that is repeated here.
--
-- Own data only: it reads through _my_order_rows(), which returns only
-- the signed-in affiliate's orders, so it takes no affiliate id.
-- ════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if to_regprocedure('public._my_order_rows()') is null then
    raise exception 'public._my_order_rows() is missing. Run affiliate-orders.sql first.';
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════
-- my_dashboard_stats(p_days)
-- Returns:
-- {
--   "total_orders":    every order placed through the affiliate's links,
--   "paid_orders":     orders whose payment is confirmed,
--   "refunded_orders": orders that were refunded,
--   "days":            length of the chart window (7 to 90, default 30),
--   "daily": [ { "day": "2026-10-08", "orders": 3, "commission_usd": 12.5 }, ... ]
-- }
-- The series has ONE entry for EVERY day in the window (zeros included),
-- so the chart has no gaps. Days are UTC days, oldest first.
--   orders          = orders placed that day (any status)
--   commission_usd  = commission on that day's orders that are PAID and
--                     not cancelled (refunded orders are not "paid")
-- ════════════════════════════════════════════════════════════════
create or replace function public.my_dashboard_stats(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days   integer := least(greatest(coalesce(p_days, 30), 7), 90);
  v_start  date := (now() at time zone 'utc')::date - (least(greatest(coalesce(p_days, 30), 7), 90) - 1);
  v_counts jsonb;
  v_daily  jsonb;
begin
  if not public.is_affiliate() then
    raise exception 'Not authorized';
  end if;

  select jsonb_build_object(
           'total_orders',    count(*),
           'paid_orders',     count(*) filter (where r.payment_status = 'paid'),
           'refunded_orders', count(*) filter (where r.payment_status = 'refunded')
         )
    into v_counts
  from public._my_order_rows() r;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'day',            to_char(d.day, 'YYYY-MM-DD'),
               'orders',         coalesce(a.orders, 0),
               'commission_usd', coalesce(a.commission_usd, 0)
             )
             order by d.day
           ),
           '[]'::jsonb
         )
    into v_daily
  from (
    select v_start + g.n as day
    from generate_series(0, v_days - 1) as g(n)
  ) d
  left join (
    select
      (r.ordered_at at time zone 'utc')::date as day,
      count(*) as orders,
      coalesce(
        sum(r.commission_usd)
          filter (where r.payment_status = 'paid' and r.status <> 'cancelled'),
        0
      ) as commission_usd
    from public._my_order_rows() r
    where (r.ordered_at at time zone 'utc')::date >= v_start
    group by 1
  ) a on a.day = d.day;

  return v_counts || jsonb_build_object('days', v_days, 'daily', v_daily);
end;
$$;

revoke all on function public.my_dashboard_stats(integer) from public, anon;
grant execute on function public.my_dashboard_stats(integer) to authenticated;

commit;


-- ════════════════════════════════════════════════════════════════
-- VERIFICATION (optional)
-- The function needs a signed-in affiliate, so it cannot be tested from
-- the SQL editor (it would say "Not authorized"). Check it exists:
-- select proname, prosecdef from pg_proc where proname = 'my_dashboard_stats';
-- Then test it by opening /affiliate once the dashboard page is built.
-- ════════════════════════════════════════════════════════════════