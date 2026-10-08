-- ════════════════════════════════════════════════════════════════════════
-- PAYOUTS (affiliate commission requests, manual payment, proof)
-- Run AFTER: affiliates.sql, affiliates-commission-bank.sql,
--            referral-fix.sql and order-lifecycle.sql.
-- Safe to re-run. Runs as ONE transaction: all of it applies, or none.
--
-- How money flows
--   1. An order becomes PAYABLE when it is paid, shipped, its refund
--      window has ended, it was not refunded/cancelled, and it is not in
--      another open or paid request. payable_orders() is the single
--      source of truth for that rule; the affiliate's page AND the
--      request function both use it, so they can never disagree.
--   2. The affiliate ticks payable orders (one or many) and sends ONE
--      request. The commission, FX rate and bank details are FROZEN on
--      the request, so later changes never alter an old request.
--   3. Admin approves (or rejects with a reason, which releases the
--      orders), pays manually, then records the payment with a
--      reference and a proof file. The affiliate sees it under Accounts.
--   4. A refund AFTER a payout was paid becomes a negative adjustment
--      that is netted off the affiliate's next request. History is
--      never edited.
--
-- Nobody writes these tables directly. Every change goes through the
-- functions below, which check the caller's role and the current state,
-- so the rules cannot be bypassed from the browser.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ════════════════════════════════════════════════════════════════
-- SECTION 0: pre-flight
-- ════════════════════════════════════════════════════════════════
do $$
begin
  if to_regprocedure('public.is_admin()') is null
     or to_regprocedure('public.is_affiliate()') is null
     or to_regprocedure('public.current_affiliate_id()') is null
     or to_regprocedure('public.touch_updated_at()') is null then
    raise exception 'Role helper functions are missing. Run affiliates.sql first.';
  end if;
  if to_regclass('public.affiliate_bank_details') is null then
    raise exception 'affiliate_bank_details is missing. Run affiliates-commission-bank.sql first.';
  end if;
  if to_regclass('public.order_settings') is null then
    raise exception 'order_settings is missing. Run order-lifecycle.sql first.';
  end if;
end $$;

-- Replace the old empty placeholder payout_requests table (different
-- design: requester_id / amount). Only dropped if it has the OLD shape
-- AND no rows, so real data is never lost. A plain DROP (no CASCADE)
-- also fails loudly if something else still depends on it.
do $$
begin
  if to_regclass('public.payout_requests') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name = 'payout_requests'
         and column_name = 'affiliate_id'
     )
  then
    if exists (select 1 from public.payout_requests) then
      raise exception 'The old payout_requests table has rows. Not dropping it; send them to me first.';
    end if;
    drop table public.payout_requests;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 1: minimum payout setting (admin-editable, default none)
-- ════════════════════════════════════════════════════════════════
alter table public.order_settings
  add column if not exists min_payout_usd numeric(10,2) not null default 0
    check (min_payout_usd >= 0);


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: payout_requests
-- One row per request. Statuses: requested -> approved -> paid,
-- or rejected (from requested or approved).
-- ════════════════════════════════════════════════════════════════
create table if not exists public.payout_requests (
  id                  uuid primary key default gen_random_uuid(),
  request_number      text not null unique,

  -- RESTRICT: affiliates are only ever soft-deleted, so history stays.
  affiliate_id        uuid not null
                        references public.affiliates(id) on delete restrict,

  status              text not null default 'requested'
                        check (status in ('requested','approved','paid','rejected')),

  -- Amounts in USD (the base currency). total = items + adjustments.
  items_total_usd     numeric(12,2) not null check (items_total_usd >= 0),
  adjustments_usd     numeric(12,2) not null default 0 check (adjustments_usd <= 0),
  total_usd           numeric(12,2) not null check (total_usd > 0),

  -- Indicative amount in the affiliate's payout currency, frozen at
  -- request time. fx_rate_to_usd = USD per 1 unit of that currency. Left
  -- empty when no FRESH rate exists (placeholder rates are never used).
  payout_currency     text not null check (payout_currency ~ '^[A-Z]{3}$'),
  fx_rate_to_usd      numeric check (fx_rate_to_usd is null or fx_rate_to_usd > 0),
  fx_rate_updated_at  timestamptz,
  total_payout_amount numeric(14,2) check (total_payout_amount is null or total_payout_amount >= 0),

  -- Copy of the affiliate's bank details at the moment of the request.
  bank_snapshot       jsonb not null,

  requested_at        timestamptz not null default now(),

  approved_at         timestamptz,
  approved_by         uuid references auth.users(id) on delete set null,

  rejected_at         timestamptz,
  rejected_by         uuid references auth.users(id) on delete set null,
  rejection_reason    text,

  -- What the admin actually sent, recorded when marking paid.
  paid_at             timestamptz,
  paid_by             uuid references auth.users(id) on delete set null,
  payment_reference   text,
  payment_proof_path  text,   -- path inside the private payout-proofs bucket
  paid_amount         numeric(14,2) check (paid_amount is null or paid_amount > 0),
  paid_currency       text check (paid_currency is null or paid_currency ~ '^[A-Z]{3}$'),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Each status must carry the facts that prove it.
  constraint payout_approved_fields check (
    status not in ('approved','paid') or approved_at is not null
  ),
  constraint payout_rejected_fields check (
    status <> 'rejected' or (rejected_at is not null and rejection_reason is not null)
  ),
  constraint payout_paid_fields check (
    status <> 'paid' or (
      paid_at is not null
      and payment_reference is not null
      and payment_proof_path is not null
      and paid_amount is not null
      and paid_currency is not null
    )
  )
);

create index if not exists payout_requests_affiliate_idx
  on public.payout_requests (affiliate_id, created_at desc);
create index if not exists payout_requests_status_idx
  on public.payout_requests (status, created_at desc);

drop trigger if exists payout_requests_touch_updated_at on public.payout_requests;
create trigger payout_requests_touch_updated_at
  before update on public.payout_requests
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: payout_request_items
-- One row per order inside a request, with the commission frozen.
-- is_active stays true while the request is open or paid and becomes
-- false only when the request is rejected. The unique index below is
-- what guarantees an order can never be in two live requests, even
-- with a double click or two browser tabs.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.payout_request_items (
  id                uuid primary key default gen_random_uuid(),
  payout_request_id uuid not null
                      references public.payout_requests(id) on delete restrict,
  order_id          uuid not null
                      references public.orders(id) on delete restrict,

  order_number      text not null,
  order_total_usd   numeric(12,2) not null check (order_total_usd > 0),
  commission_percent numeric(5,2) not null
                      check (commission_percent > 0 and commission_percent <= 100),
  commission_usd    numeric(12,2) not null check (commission_usd >= 0),

  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists payout_request_items_request_idx
  on public.payout_request_items (payout_request_id);
create index if not exists payout_request_items_order_idx
  on public.payout_request_items (order_id);

create unique index if not exists payout_request_items_one_live_order
  on public.payout_request_items (order_id)
  where is_active;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: payout_adjustments
-- A refund that happens AFTER a payout was paid creates one negative
-- row here (created by a trigger, Section 9). It is netted off the
-- affiliate's next request. A rejected request gives its adjustments
-- back so they are applied again next time.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.payout_adjustments (
  id                 uuid primary key default gen_random_uuid(),
  affiliate_id       uuid not null
                       references public.affiliates(id) on delete restrict,
  order_id           uuid not null unique
                       references public.orders(id) on delete restrict,
  amount_usd         numeric(12,2) not null check (amount_usd < 0),
  reason             text not null,
  applied_request_id uuid references public.payout_requests(id) on delete restrict,
  created_at         timestamptz not null default now()
);

create index if not exists payout_adjustments_affiliate_idx
  on public.payout_adjustments (affiliate_id, applied_request_id);


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: payout_events (audit log, admin-readable only)
-- Who did what, and when, for every status change.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.payout_events (
  id                bigint generated always as identity primary key,
  payout_request_id uuid not null
                      references public.payout_requests(id) on delete restrict,
  event             text not null
                      check (event in ('requested','approved','rejected','paid')),
  actor_id          uuid,
  actor_role        text,
  note              text,
  created_at        timestamptz not null default now()
);

create index if not exists payout_events_request_idx
  on public.payout_events (payout_request_id, created_at);


-- ════════════════════════════════════════════════════════════════
-- SECTION 6: payable_orders(): THE eligibility rule
-- Callable by the affiliate (their own orders only) or an admin.
-- commission = order total in USD x the rate SAVED ON THE ORDER at
-- checkout, so a later change to the affiliate's rate never touches it.
-- ════════════════════════════════════════════════════════════════
create or replace function public.payable_orders(p_affiliate_id uuid)
returns table (
  order_id              uuid,
  order_number          text,
  ordered_at            timestamptz,
  shipped_at            timestamptz,
  refund_window_ends_at timestamptz,
  order_total_usd       numeric,
  commission_percent    numeric,
  commission_usd        numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile uuid;
begin
  if not (public.is_admin() or p_affiliate_id = public.current_affiliate_id()) then
    raise exception 'Not authorized';
  end if;

  select a.profile_id into v_profile
  from public.affiliates a
  where a.id = p_affiliate_id;

  return query
  select
    o.id,
    o.order_number,
    o.created_at,
    o.shipped_at,
    o.refund_window_ends_at,
    o.total_base,
    o.affiliate_commission_percent,
    round(o.total_base * o.affiliate_commission_percent / 100, 2)
  from public.orders o
  where o.affiliate_id = v_profile
    and o.payment_status = 'paid'
    and o.status in ('shipped', 'delivered')
    and o.refund_window_ends_at is not null
    and o.refund_window_ends_at <= now()
    and o.total_base is not null and o.total_base > 0
    and coalesce(o.affiliate_commission_percent, 0) > 0
    and not exists (
      select 1 from public.payout_request_items i
      where i.order_id = o.id and i.is_active
    )
  order by o.shipped_at, o.created_at;
end;
$$;

revoke all on function public.payable_orders(uuid) from public, anon;
grant execute on function public.payable_orders(uuid) to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 7: affiliate_earnings_summary(): the totals shown to the
-- affiliate and the admin. Calculated, never typed in by anyone.
--   pending_usd            paid orders not yet payable (refund window
--                          still open, or not shipped yet)
--   available_usd          payable commission, plus any refund
--                          adjustments (can be negative)
--   refund_adjustments_usd the adjustment part of available_usd
--   in_review_usd          requests waiting for admin or approved
--   paid_usd               requests already paid
-- ════════════════════════════════════════════════════════════════
create or replace function public.affiliate_earnings_summary(p_affiliate_id uuid)
returns table (
  pending_usd            numeric,
  available_usd          numeric,
  refund_adjustments_usd numeric,
  in_review_usd          numeric,
  paid_usd               numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_pending numeric;
  v_payable numeric;
  v_adjust  numeric;
  v_review  numeric;
  v_paid    numeric;
begin
  if not (public.is_admin() or p_affiliate_id = public.current_affiliate_id()) then
    raise exception 'Not authorized';
  end if;

  select a.profile_id into v_profile
  from public.affiliates a
  where a.id = p_affiliate_id;

  select coalesce(sum(round(o.total_base * o.affiliate_commission_percent / 100, 2)), 0)
    into v_pending
  from public.orders o
  where o.affiliate_id = v_profile
    and o.payment_status = 'paid'
    and o.status <> 'cancelled'
    and o.total_base > 0
    and coalesce(o.affiliate_commission_percent, 0) > 0
    and (o.refund_window_ends_at is null or o.refund_window_ends_at > now())
    and not exists (
      select 1 from public.payout_request_items i
      where i.order_id = o.id and i.is_active
    );

  select coalesce(sum(p.commission_usd), 0) into v_payable
  from public.payable_orders(p_affiliate_id) p;

  select coalesce(sum(adj.amount_usd), 0) into v_adjust
  from public.payout_adjustments adj
  where adj.affiliate_id = p_affiliate_id and adj.applied_request_id is null;

  select coalesce(sum(r.total_usd), 0) into v_review
  from public.payout_requests r
  where r.affiliate_id = p_affiliate_id and r.status in ('requested', 'approved');

  select coalesce(sum(r.total_usd), 0) into v_paid
  from public.payout_requests r
  where r.affiliate_id = p_affiliate_id and r.status = 'paid';

  return query select v_pending, v_payable + v_adjust, v_adjust, v_review, v_paid;
end;
$$;

revoke all on function public.affiliate_earnings_summary(uuid) from public, anon;
grant execute on function public.affiliate_earnings_summary(uuid) to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 8: the request / approve / reject / paid functions
-- ════════════════════════════════════════════════════════════════

-- 8a) request_payout: the affiliate sends one request for 1..200 orders.
create or replace function public.request_payout(p_order_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aff            uuid;
  v_aff_status     text;
  v_ids            uuid[];
  v_bank           public.affiliate_bank_details%rowtype;
  v_eligible_count integer;
  v_items_total    numeric(12,2);
  v_adjustments    numeric(12,2);
  v_total          numeric(12,2);
  v_min            numeric(10,2);
  v_currency       text;
  v_rate           numeric;
  v_rate_at        timestamptz;
  v_payout_amount  numeric(14,2);
  v_request_id     uuid;
  v_number         text;
begin
  if not public.is_affiliate() then
    raise exception 'Not authorized';
  end if;
  v_aff := public.current_affiliate_id();
  if v_aff is null then
    raise exception 'Not authorized';
  end if;

  -- Lock this affiliate's row: two clicks or two tabs run one after the
  -- other, never at the same time.
  select a.status into v_aff_status
  from public.affiliates a
  where a.id = v_aff
  for update;

  if v_aff_status is distinct from 'active' then
    raise exception 'Your account is not active';
  end if;

  select array_agg(distinct x) into v_ids
  from unnest(coalesce(p_order_ids, '{}'::uuid[])) as x;

  if v_ids is null or cardinality(v_ids) = 0 then
    raise exception 'Select at least one order';
  end if;
  if cardinality(v_ids) > 200 then
    raise exception 'Select at most 200 orders per request';
  end if;

  select * into v_bank
  from public.affiliate_bank_details
  where affiliate_id = v_aff;
  if not found then
    raise exception 'Add your bank details in Settings before requesting a payout';
  end if;

  -- Every selected order must be payable RIGHT NOW (re-checked here, not
  -- trusted from the page).
  select count(*), coalesce(sum(p.commission_usd), 0)
    into v_eligible_count, v_items_total
  from public.payable_orders(v_aff) p
  where p.order_id = any (v_ids);

  if v_eligible_count <> cardinality(v_ids) then
    raise exception 'One or more selected orders are not available for payout';
  end if;

  -- Refunds that happened after an earlier payout was paid are netted off.
  select coalesce(sum(adj.amount_usd), 0) into v_adjustments
  from public.payout_adjustments adj
  where adj.affiliate_id = v_aff and adj.applied_request_id is null;

  v_total := v_items_total + v_adjustments;

  if v_total <= 0 then
    raise exception 'Your balance after refund adjustments is not positive yet';
  end if;

  select s.min_payout_usd into v_min from public.order_settings s where s.id;
  if v_total < coalesce(v_min, 0) then
    raise exception 'The minimum payout is % USD', v_min;
  end if;

  -- Indicative amount in the payout currency. Only a FRESH rate is used;
  -- the placeholder rates stamped long ago are ignored on purpose.
  v_currency := upper(v_bank.payout_currency);
  if v_currency = 'USD' then
    v_rate := 1;
    v_rate_at := now();
    v_payout_amount := v_total;
  else
    select r.rate_to_base, r.updated_at into v_rate, v_rate_at
    from public.currency_rates r
    where r.currency_code = v_currency
      and r.updated_at > now() - interval '3 days';

    if v_rate is not null then
      v_payout_amount := round(v_total / v_rate, 2);
    end if;
  end if;

  -- Human-friendly request number, e.g. PAY-20261008-3FA9.
  loop
    v_number := 'PAY-' || to_char(now() at time zone 'utc', 'YYYYMMDD') || '-'
                || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    exit when not exists (
      select 1 from public.payout_requests r where r.request_number = v_number
    );
  end loop;

  insert into public.payout_requests (
    request_number, affiliate_id, status,
    items_total_usd, adjustments_usd, total_usd,
    payout_currency, fx_rate_to_usd, fx_rate_updated_at, total_payout_amount,
    bank_snapshot
  ) values (
    v_number, v_aff, 'requested',
    v_items_total, v_adjustments, v_total,
    v_currency, v_rate, v_rate_at, v_payout_amount,
    jsonb_build_object(
      'account_holder_name',     v_bank.account_holder_name,
      'bank_name',               v_bank.bank_name,
      'bank_country',            v_bank.bank_country,
      'account_number_or_iban',  v_bank.account_number_or_iban,
      'swift_bic',               v_bank.swift_bic,
      'routing_code',            v_bank.routing_code,
      'payout_currency',         v_currency
    )
  )
  returning id into v_request_id;

  insert into public.payout_request_items (
    payout_request_id, order_id, order_number,
    order_total_usd, commission_percent, commission_usd
  )
  select v_request_id, p.order_id, p.order_number,
         p.order_total_usd, p.commission_percent, p.commission_usd
  from public.payable_orders(v_aff) p
  where p.order_id = any (v_ids);

  update public.payout_adjustments
  set applied_request_id = v_request_id
  where affiliate_id = v_aff and applied_request_id is null;

  insert into public.payout_events (payout_request_id, event, actor_id, actor_role)
  values (v_request_id, 'requested', auth.uid(), 'affiliate');

  return v_request_id;

exception
  when unique_violation then
    raise exception 'One or more of these orders is already in a payout request';
end;
$$;

revoke all on function public.request_payout(uuid[]) from public, anon;
grant execute on function public.request_payout(uuid[]) to authenticated;


-- 8b) approve_payout: admin accepts the amount.
create or replace function public.approve_payout(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  perform 1 from public.payout_requests r
  where r.id = p_request_id for update;

  -- If an order was refunded after the request was sent, the total is no
  -- longer right. The admin rejects the request, and the affiliate sends
  -- a new one with only the valid orders.
  if exists (
    select 1
    from public.payout_request_items i
    join public.orders o on o.id = i.order_id
    where i.payout_request_id = p_request_id
      and i.is_active
      and o.payment_status <> 'paid'
  ) then
    raise exception 'An order in this request was refunded. Reject the request so the affiliate can send a new one.';
  end if;

  update public.payout_requests
  set status      = 'approved',
      approved_at = now(),
      approved_by = auth.uid()
  where id = p_request_id and status = 'requested';

  if not found then
    raise exception 'Request not found or already processed';
  end if;

  insert into public.payout_events (payout_request_id, event, actor_id, actor_role)
  values (p_request_id, 'approved', auth.uid(), 'admin');
end;
$$;

revoke all on function public.approve_payout(uuid) from public, anon;
grant execute on function public.approve_payout(uuid) to authenticated;


-- 8c) reject_payout: admin declines, with a reason the affiliate sees.
--     The orders and any refund adjustments are released, so the
--     affiliate can request them again.
create or replace function public.reject_payout(p_request_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if char_length(v_reason) < 3 then
    raise exception 'Please give the affiliate a reason';
  end if;

  perform 1 from public.payout_requests r
  where r.id = p_request_id for update;

  update public.payout_requests
  set status           = 'rejected',
      rejected_at      = now(),
      rejected_by      = auth.uid(),
      rejection_reason = v_reason
  where id = p_request_id and status in ('requested', 'approved');

  if not found then
    raise exception 'Request not found or already processed';
  end if;

  update public.payout_request_items
  set is_active = false
  where payout_request_id = p_request_id;

  update public.payout_adjustments
  set applied_request_id = null
  where applied_request_id = p_request_id;

  insert into public.payout_events (payout_request_id, event, actor_id, actor_role, note)
  values (p_request_id, 'rejected', auth.uid(), 'admin', v_reason);
end;
$$;

revoke all on function public.reject_payout(uuid, text) from public, anon;
grant execute on function public.reject_payout(uuid, text) to authenticated;


-- 8d) mark_payout_paid: admin records the manual payment.
--     The proof file must already be uploaded to the payout-proofs
--     bucket under "<request id>/<file name>".
create or replace function public.mark_payout_paid(
  p_request_id    uuid,
  p_reference     text,
  p_proof_path    text,
  p_paid_amount   numeric,
  p_paid_currency text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text := btrim(coalesce(p_reference, ''));
  v_currency  text := upper(btrim(coalesce(p_paid_currency, '')));
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if v_reference = '' then
    raise exception 'Enter the payment reference';
  end if;
  if p_proof_path is null
     or p_proof_path not like (p_request_id::text || '/%') then
    raise exception 'Upload the payment proof first';
  end if;
  if p_paid_amount is null or p_paid_amount <= 0 then
    raise exception 'Enter the amount you sent';
  end if;
  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'Enter a 3-letter currency code';
  end if;

  perform 1 from public.payout_requests r
  where r.id = p_request_id for update;

  if exists (
    select 1
    from public.payout_request_items i
    join public.orders o on o.id = i.order_id
    where i.payout_request_id = p_request_id
      and i.is_active
      and o.payment_status <> 'paid'
  ) then
    raise exception 'An order in this request was refunded. Reject the request so the affiliate can send a new one.';
  end if;

  update public.payout_requests
  set status             = 'paid',
      paid_at            = now(),
      paid_by            = auth.uid(),
      payment_reference  = v_reference,
      payment_proof_path = p_proof_path,
      paid_amount        = p_paid_amount,
      paid_currency      = v_currency
  where id = p_request_id and status = 'approved';

  if not found then
    raise exception 'Request not found, or it has not been approved yet';
  end if;

  insert into public.payout_events (payout_request_id, event, actor_id, actor_role, note)
  values (p_request_id, 'paid', auth.uid(), 'admin', v_reference);
end;
$$;

revoke all on function public.mark_payout_paid(uuid, text, text, numeric, text) from public, anon;
grant execute on function public.mark_payout_paid(uuid, text, text, numeric, text) to authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 9: refund AFTER a payout was paid -> negative adjustment
-- Fires when an order becomes refunded. If that order sits in a PAID
-- request, its commission is deducted from the affiliate's next
-- request. (A refund while a request is still open is caught by
-- approve_payout / mark_payout_paid above.)
-- ════════════════════════════════════════════════════════════════
create or replace function public.create_payout_adjustment_on_refund()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.payout_adjustments (affiliate_id, order_id, amount_usd, reason)
  select r.affiliate_id, new.id, -i.commission_usd,
         'Order ' || new.order_number || ' was refunded after its payout was paid'
  from public.payout_request_items i
  join public.payout_requests r on r.id = i.payout_request_id
  where i.order_id = new.id
    and i.is_active
    and r.status = 'paid'
    and i.commission_usd > 0
  on conflict (order_id) do nothing;

  return new;
end;
$$;

drop trigger if exists orders_payout_adjustment_on_refund on public.orders;
create trigger orders_payout_adjustment_on_refund
  after update of payment_status on public.orders
  for each row
  when (new.payment_status = 'refunded'
        and old.payment_status is distinct from 'refunded')
  execute function public.create_payout_adjustment_on_refund();


-- ════════════════════════════════════════════════════════════════
-- SECTION 10: Row Level Security
-- READ ONLY from the browser. All writes go through the functions in
-- Section 8, so direct insert/update/delete is also revoked.
--   Admin     : read everything.
--   Affiliate : read their own requests, items and adjustments.
--   Others    : nothing. The audit log is admin-only.
-- ════════════════════════════════════════════════════════════════
alter table public.payout_requests      enable row level security;
alter table public.payout_request_items enable row level security;
alter table public.payout_adjustments   enable row level security;
alter table public.payout_events        enable row level security;

revoke insert, update, delete, truncate
  on public.payout_requests, public.payout_request_items,
     public.payout_adjustments, public.payout_events
  from anon, authenticated;

drop policy if exists "admin reads payout requests" on public.payout_requests;
create policy "admin reads payout requests"
  on public.payout_requests for select
  using (public.is_admin());

drop policy if exists "affiliate reads own payout requests" on public.payout_requests;
create policy "affiliate reads own payout requests"
  on public.payout_requests for select
  using (public.is_affiliate() and affiliate_id = public.current_affiliate_id());

drop policy if exists "admin reads payout items" on public.payout_request_items;
create policy "admin reads payout items"
  on public.payout_request_items for select
  using (public.is_admin());

drop policy if exists "affiliate reads own payout items" on public.payout_request_items;
create policy "affiliate reads own payout items"
  on public.payout_request_items for select
  using (
    public.is_affiliate()
    and exists (
      select 1 from public.payout_requests r
      where r.id = payout_request_id
        and r.affiliate_id = public.current_affiliate_id()
    )
  );

drop policy if exists "admin reads payout adjustments" on public.payout_adjustments;
create policy "admin reads payout adjustments"
  on public.payout_adjustments for select
  using (public.is_admin());

drop policy if exists "affiliate reads own payout adjustments" on public.payout_adjustments;
create policy "affiliate reads own payout adjustments"
  on public.payout_adjustments for select
  using (public.is_affiliate() and affiliate_id = public.current_affiliate_id());

drop policy if exists "admin reads payout events" on public.payout_events;
create policy "admin reads payout events"
  on public.payout_events for select
  using (public.is_admin());


-- ════════════════════════════════════════════════════════════════
-- SECTION 11: private storage bucket for payment proofs
-- NOT public. Files live at "<payout request id>/<file name>".
--   Admin     : upload, replace, delete and read.
--   Affiliate : read ONLY proofs of their own requests (through a
--               short-lived signed link, never a public URL).
-- 10 MB limit; PDF and common image types only.
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payout-proofs',
  'payout-proofs',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin reads payout proofs" on storage.objects;
create policy "admin reads payout proofs"
  on storage.objects for select
  using (bucket_id = 'payout-proofs' and public.is_admin());

drop policy if exists "affiliate reads own payout proofs" on storage.objects;
create policy "affiliate reads own payout proofs"
  on storage.objects for select
  using (
    bucket_id = 'payout-proofs'
    and public.is_affiliate()
    and exists (
      select 1 from public.payout_requests r
      where r.id::text = (storage.foldername(name))[1]
        and r.affiliate_id = public.current_affiliate_id()
    )
  );

drop policy if exists "admin uploads payout proofs" on storage.objects;
create policy "admin uploads payout proofs"
  on storage.objects for insert
  with check (bucket_id = 'payout-proofs' and public.is_admin());

drop policy if exists "admin updates payout proofs" on storage.objects;
create policy "admin updates payout proofs"
  on storage.objects for update
  using (bucket_id = 'payout-proofs' and public.is_admin())
  with check (bucket_id = 'payout-proofs' and public.is_admin());

drop policy if exists "admin deletes payout proofs" on storage.objects;
create policy "admin deletes payout proofs"
  on storage.objects for delete
  using (bucket_id = 'payout-proofs' and public.is_admin());

commit;


-- ════════════════════════════════════════════════════════════════
-- VERIFICATION (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════
-- Tables and RLS:
-- select tablename, rowsecurity from pg_tables
-- where tablename like 'payout_%' order by tablename;
--
-- Policies:
-- select tablename, policyname, cmd from pg_policies
-- where tablename like 'payout_%' order by tablename, policyname;
--
-- Functions:
-- select proname, prosecdef from pg_proc
-- where proname in ('payable_orders','affiliate_earnings_summary',
--   'request_payout','approve_payout','reject_payout','mark_payout_paid',
--   'create_payout_adjustment_on_refund') order by proname;
--
-- Private bucket (public must be false):
-- select id, public, file_size_limit from storage.buckets where id = 'payout-proofs';