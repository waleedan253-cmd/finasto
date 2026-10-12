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

## Charst 



-- ════════════════════════════════════════════════════════════════════════
-- REPLACEMENT for my_dashboard_stats in affiliate-dashboard.sql
-- In that file, delete everything from the line
--     create or replace function public.my_dashboard_stats(p_days integer default 30)
-- down to and including the line
--     grant execute on function public.my_dashboard_stats(integer) to authenticated;
-- (keep "begin;", the _my_order_rows check above it, and "commit;" below it)
-- and paste this block in its place. Then run the whole file again.
-- ════════════════════════════════════════════════════════════════════════

-- The old version took a number of days. Remove it so only one exists.
drop function if exists public.my_dashboard_stats(integer);

-- ════════════════════════════════════════════════════════════════
-- my_dashboard_stats(p_range)
-- p_range is one of (anything else is rejected):
--   '7d' | '30d' | '90d'   the last N days, one entry per day
--   'last_month'           the previous calendar month, one entry per day
--   '12m'                  the last 12 months including this one,
--                          one entry per MONTH
-- Returns:
-- {
--   "total_orders": ..., "paid_orders": ..., "refunded_orders": ...,   (all time)
--   "range":  the range used,
--   "bucket": "day" or "month",
--   "daily": [ { "day": "2026-10-08", "orders": 3, "commission_usd": 12.5 }, ... ]
-- }
-- For monthly buckets, "day" is the first day of that month.
-- Every bucket in the period is present (zeros included), so the chart
-- has no gaps. All days and months are UTC.
--   orders          = orders placed in that bucket (any status)
--   commission_usd  = commission on those orders that are PAID and not
--                     cancelled (refunded orders are not "paid")
-- ════════════════════════════════════════════════════════════════
create or replace function public.my_dashboard_stats(p_range text default '30d')
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
  v_series_end date := (now() at time zone 'utc')::date; -- last bucket shown
  v_to         date := (now() at time zone 'utc')::date; -- last day counted
  v_counts     jsonb;
  v_daily      jsonb;
begin
  if not public.is_affiliate() then
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

  -- Counts are all time and do not change with the chart period.
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
    select g::date as day
    from generate_series(v_start, v_series_end, v_step) as g
  ) d
  left join (
    select
      date_trunc(v_bucket, (r.ordered_at at time zone 'utc'))::date as day,
      count(*) as orders,
      coalesce(
        sum(r.commission_usd)
          filter (where r.payment_status = 'paid' and r.status <> 'cancelled'),
        0
      ) as commission_usd
    from public._my_order_rows() r
    where (r.ordered_at at time zone 'utc')::date between v_start and v_to
    group by 1
  ) a on a.day = d.day;

  return v_counts || jsonb_build_object(
    'range',  v_range,
    'bucket', v_bucket,
    'daily',  v_daily
  );
end;
$$;

revoke all on function public.my_dashboard_stats(text) from public, anon;
grant execute on function public.my_dashboard_stats(text) to authenticated;



-- create or replace function public.my_dashboard_stats(p_days integer default 30)
-- returns jsonb
-- language plpgsql
-- stable
-- security definer
-- set search_path = public
-- as $$
-- declare
--   v_days   integer := least(greatest(coalesce(p_days, 30), 7), 90);
--   v_start  date := (now() at time zone 'utc')::date - (least(greatest(coalesce(p_days, 30), 7), 90) - 1);
--   v_counts jsonb;
--   v_daily  jsonb;
-- begin
--   if not public.is_affiliate() then
--     raise exception 'Not authorized';
--   end if;

--   select jsonb_build_object(
--            'total_orders',    count(*),
--            'paid_orders',     count(*) filter (where r.payment_status = 'paid'),
--            'refunded_orders', count(*) filter (where r.payment_status = 'refunded')
--          )
--     into v_counts
--   from public._my_order_rows() r;

--   select coalesce(
--            jsonb_agg(
--              jsonb_build_object(
--                'day',            to_char(d.day, 'YYYY-MM-DD'),
--                'orders',         coalesce(a.orders, 0),
--                'commission_usd', coalesce(a.commission_usd, 0)
--              )
--              order by d.day
--            ),
--            '[]'::jsonb
--          )
--     into v_daily
--   from (
--     select v_start + g.n as day
--     from generate_series(0, v_days - 1) as g(n)
--   ) d
--   left join (
--     select
--       (r.ordered_at at time zone 'utc')::date as day,
--       count(*) as orders,
--       coalesce(
--         sum(r.commission_usd)
--           filter (where r.payment_status = 'paid' and r.status <> 'cancelled'),
--         0
--       ) as commission_usd
--     from public._my_order_rows() r
--     where (r.ordered_at at time zone 'utc')::date >= v_start
--     group by 1
--   ) a on a.day = d.day;

--   return v_counts || jsonb_build_object('days', v_days, 'daily', v_daily);
-- end;
-- $$;

-- revoke all on function public.my_dashboard_stats(integer) from public, anon;
-- grant execute on function public.my_dashboard_stats(integer) to authenticated;

-- commit;


-- ════════════════════════════════════════════════════════════════
-- VERIFICATION (optional)
-- The function needs a signed-in affiliate, so it cannot be tested from
-- the SQL editor (it would say "Not authorized"). Check it exists:
-- select proname, prosecdef from pg_proc where proname = 'my_dashboard_stats';
-- Then test it by opening /affiliate once the dashboard page is built.
-- ════════════════════════════════════════════════════════════════