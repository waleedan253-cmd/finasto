-- ════════════════════════════════════════════════════════════════════════
-- ADMIN DASHBOARD (final version)
-- Run AFTER: affiliates.sql, order-lifecycle.sql, payouts.sql,
--            stockist-portal.sql, stockist-bulk-orders.sql and the
--            stockist requests SQL. Safe to re-run. One transaction.
--
-- Replaces the old admin_dashboard(from, to, prev_from, prev_to) and the
-- "Step 1 minimum tables" draft. DO NOT run that draft: it would create
-- tables that clash with the real ones (stock, commissions, payout_requests,
-- affiliate_change_requests) and nothing here needs them.
--
-- What a modern dashboard shows, and where each part comes from
--   1. Health, with a comparison: every headline number is returned for the
--      chosen period AND the equal-length period right before it, so the UI
--      can show "+12.4% vs previous".
--   2. Trend: one point per day (or per month for periods over 92 days),
--      zeros included so the chart has no gaps.
--   3. Where sales come from: channel split, top products, top affiliates,
--      top stockists, top countries.
--   4. "Needs attention": everything waiting for an admin click (payouts to
--      review / pay, affiliate requests, bulk orders, orders to ship, low
--      stock), so the dashboard is a to-do list, not only a report.
--   5. The latest orders.
--
-- Definitions (one place, so the numbers always agree)
--   revenue  = retail orders that are PAID and not cancelled, in USD
--              (orders.total_base). Refunded orders are not "paid".
--   period   = created_at >= p_from and created_at < p_to (UTC). The UI
--              sends the start of the first day and the start of the day
--              AFTER the last day, e.g. 2026-10-01 .. 2026-11-01.
--   wholesale= bulk orders approved by the admin in the period (what
--              stockists paid Finasto for packs). Kept separate from retail
--              revenue so nothing is counted twice.
--   commission earned = rate saved on the order x order total, for paid,
--              non-cancelled affiliate orders in the period.
--   low stock = an active pack with 5 or fewer left in the shop.
--
-- Not included: visitors / clicks. No tracking table exists yet; it is
-- added with the visitor tracking step.
-- ════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() is missing.';
  end if;
  if to_regclass('public.payout_requests') is null then
    raise exception 'payout_requests is missing. Run payouts.sql first.';
  end if;
  if to_regclass('public.bulk_orders') is null then
    raise exception 'bulk_orders is missing. Run stockist-bulk-orders.sql first.';
  end if;
  if to_regclass('public.stockist_requests') is null then
    raise exception 'stockist_requests is missing. Run the stockist requests SQL first.';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name in ('paid_at','shipped_at','refunded_at','affiliate_commission_percent')
    having count(*) = 4
  ) then
    raise exception 'orders is missing lifecycle columns. Run order-lifecycle.sql and the affiliate SQL first.';
  end if;
end $$;

-- The old version took four timestamps. Remove it so only one exists.
drop function if exists public.admin_dashboard(timestamptz, timestamptz, timestamptz, timestamptz);


create or replace function public.admin_dashboard(
  p_from timestamptz,
  p_to   timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_len        interval;
  v_prev_from  timestamptz;
  v_prev_to    timestamptz;
  v_days       integer;
  v_bucket     text;
  v_low        constant integer := 5;
  result       jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if p_from is null or p_to is null or p_to <= p_from
     or p_to - p_from > interval '6000000000000000000 days' then
    raise exception 'Invalid period';
  end if;

  v_len       := p_to - p_from;
  v_prev_from := p_from - v_len;
  v_prev_to   := p_from;
  v_days      := ceil(extract(epoch from v_len) / 86400)::integer;
  v_bucket    := case when v_days <= 92 then 'day' else 'month' end;

  with
  -- Paid, not cancelled retail orders over the period AND the one before.
  po as (
    select o.id, o.created_at, o.total_base, o.affiliate_id, o.stockist_id,
           o.country, o.affiliate_commission_percent,
           (o.created_at >= p_from) as cur
    from public.orders o
    where o.payment_status = 'paid'
      and o.status <> 'cancelled'
      and o.created_at >= v_prev_from
      and o.created_at <  p_to
  ),
  -- Refunds, dated by when they happened.
  rf as (
    select o.total_base,
           (coalesce(o.refunded_at, o.created_at) >= p_from) as cur
    from public.orders o
    where o.payment_status = 'refunded'
      and coalesce(o.refunded_at, o.created_at) >= v_prev_from
      and coalesce(o.refunded_at, o.created_at) <  p_to
  ),
  whl as (
    select b.total_usd, (b.decided_at >= p_from) as cur
    from public.bulk_orders b
    where b.status = 'approved'
      and b.decided_at >= v_prev_from
      and b.decided_at <  p_to
  ),
  pdp as (
    select r.total_usd, (r.paid_at >= p_from) as cur
    from public.payout_requests r
    where r.status = 'paid'
      and r.paid_at >= v_prev_from
      and r.paid_at <  p_to
  ),
  newaff as (
    select (a.created_at >= p_from) as cur
    from public.affiliates a
    where a.status <> 'deleted'
      and a.created_at >= v_prev_from
      and a.created_at <  p_to
  )
  select jsonb_build_object(

    'range', jsonb_build_object(
      'from', p_from, 'to', p_to,
      'prev_from', v_prev_from, 'prev_to', v_prev_to,
      'days', v_days, 'bucket', v_bucket
    ),

    -- 1) Headline numbers, current and previous period -------------------
    'kpis', jsonb_build_object(
      'revenue',        coalesce((select sum(total_base) from po where cur), 0),
      'revenue_prev',   coalesce((select sum(total_base) from po where not cur), 0),
      'orders',         (select count(*) from po where cur),
      'orders_prev',    (select count(*) from po where not cur),
      'aov',            coalesce((select round(avg(total_base), 2) from po where cur), 0),
      'aov_prev',       coalesce((select round(avg(total_base), 2) from po where not cur), 0),
      'refunds',        (select count(*) from rf where cur),
      'refunds_prev',   (select count(*) from rf where not cur),
      'refunds_usd',    coalesce((select sum(total_base) from rf where cur), 0),
      'wholesale_usd',      coalesce((select sum(total_usd) from whl where cur), 0),
      'wholesale_usd_prev', coalesce((select sum(total_usd) from whl where not cur), 0),
      'commission_usd', coalesce((
          select sum(round(total_base * coalesce(affiliate_commission_percent, 0) / 100, 2))
          from po where cur and affiliate_id is not null), 0),
      'payouts_paid_usd',      coalesce((select sum(total_usd) from pdp where cur), 0),
      'payouts_paid_usd_prev', coalesce((select sum(total_usd) from pdp where not cur), 0),
      'new_affiliates',        (select count(*) from newaff where cur),
      'new_affiliates_prev',   (select count(*) from newaff where not cur),
      'active_affiliates',     (select count(*) from public.affiliates where status = 'active'),
      'active_stockists',      (select count(*) from public.stockists where status = 'active')
    ),

    -- 2) Trend: one point per bucket, zeros included ---------------------
    'series', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'day',     to_char(d.day, 'YYYY-MM-DD'),
                 'orders',  coalesce(a.orders, 0),
                 'revenue', coalesce(a.revenue, 0)
               ) order by d.day)
      from (
        select g::date as day
        from generate_series(
          date_trunc(v_bucket, p_from at time zone 'utc')::date,
          date_trunc(v_bucket, (p_to - interval '1 second') at time zone 'utc')::date,
          case when v_bucket = 'day' then interval '1 day' else interval '1 month' end
        ) g
      ) d
      left join (
        select date_trunc(v_bucket, created_at at time zone 'utc')::date as day,
               count(*) as orders, sum(total_base) as revenue
        from po where cur group by 1
      ) a on a.day = d.day
    ), '[]'::jsonb),

    -- 3) Where the sales come from ---------------------------------------
    'channels', coalesce((
      select jsonb_agg(jsonb_build_object('channel', c.channel, 'orders', c.orders, 'revenue', c.revenue)
                       order by c.revenue desc)
      from (
        select case when affiliate_id is not null then 'affiliate' else 'direct' end as channel,
               count(*) as orders, sum(total_base) as revenue
        from po where cur group by 1
      ) c
    ), '[]'::jsonb),

    'top_products', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select oi.product_name as name,
               sum(oi.quantity)::integer as units,
               round(sum(oi.line_total * o.exchange_rate_at_order), 2) as revenue
        from public.order_items oi
        join po on po.id = oi.order_id and po.cur
        join public.orders o on o.id = oi.order_id
        group by oi.product_id, oi.product_name
        order by revenue desc, units desc
        limit 5
      ) t
    ), '[]'::jsonb),

    'top_affiliates', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(nullif(btrim(a.name), ''), 'Affiliate') as name,
               s.name as stockist,
               count(*) as orders, sum(po.total_base) as revenue
        from po
        join public.affiliates a on a.profile_id = po.affiliate_id
        left join public.stockists s on s.id = a.stockist_id
        where po.cur
        group by a.id, a.name, s.name
        order by revenue desc
        limit 5
      ) t
    ), '[]'::jsonb),

    'top_stockists', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select s.name,
               count(*) as orders, sum(po.total_base) as revenue
        from po
        join public.stockists s on s.profile_id = po.stockist_id
        where po.cur
        group by s.id, s.name
        order by revenue desc
        limit 5
      ) t
    ), '[]'::jsonb),

    'top_countries', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select country, count(*) as orders, sum(total_base) as revenue
        from po
        where cur and country is not null
        group by country
        order by revenue desc
        limit 5
      ) t
    ), '[]'::jsonb),

    -- 4) Needs attention: everything waiting for an admin click ----------
    'attention', jsonb_build_object(
      'payouts_to_review', jsonb_build_object(
        'count',  (select count(*) from public.payout_requests where status = 'requested'),
        'amount', coalesce((select sum(total_usd) from public.payout_requests where status = 'requested'), 0)),
      'payouts_to_pay', jsonb_build_object(
        'count',  (select count(*) from public.payout_requests where status = 'approved'),
        'amount', coalesce((select sum(total_usd) from public.payout_requests where status = 'approved'), 0)),
      'stockist_requests', (select count(*) from public.stockist_requests where status = 'pending'),
      'bulk_orders_to_review', (select count(*) from public.bulk_orders
                                where status in ('requested', 'payment_submitted')),
      'orders_to_ship', (select count(*) from public.orders
                         where payment_status = 'paid'
                           and status not in ('shipped', 'delivered', 'cancelled')
                           and shipped_at is null),
      'low_stock', (select count(*) from public.product_variants
                    where status = 'active' and stock > 0 and stock <= v_low),
      'out_of_stock', (select count(*) from public.product_variants
                       where status = 'active' and stock = 0)
    ),

    -- 5) Latest orders (all statuses) -------------------------------------
    'recent_orders', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select o.id,
               o.order_number as number,
               o.customer_name as customer,
               o.total_base as total_usd,
               o.status, o.payment_status,
               a.name as affiliate,
               s.name as stockist,
               o.created_at
        from public.orders o
        left join public.affiliates a on a.profile_id = o.affiliate_id
        left join public.stockists  s on s.profile_id = o.stockist_id
        order by o.created_at desc
        limit 8
      ) t
    ), '[]'::jsonb)

  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_dashboard(timestamptz, timestamptz) to authenticated;

commit;

-- The function needs a signed-in admin, so it cannot be tested from the SQL
-- editor ("Not authorized"). Check it exists, then test it on /admin:
-- select proname, prosecdef from pg_proc where proname = 'admin_dashboard';