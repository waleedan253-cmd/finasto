-- ════════════════════════════════════════════════════════════════
-- REFERRALS (single source of truth)
-- Run AFTER affiliates.sql and affiliates-commission-bank.sql.
-- Safe to re-run. Replaces referral-links.sql, the old referral-fix.sql
-- and affiliate-single-link.sql, which can be deleted.
--
-- Every affiliate has ONE link: /r/<referral_code>.
--   1. affiliates.referral_code: created by the database, never typed.
--   2. Column guard: an affiliate can never change their own code.
--   3. resolve_affiliate_referral(): public lookup for the /r/ route.
--   4. resolve_referral_attribution(): public lookup for checkout.
--   5. Guests can add items to their own pending order.
--   6. Cleanup of the old per-product link system.
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════
-- SECTION 1: affiliates.referral_code
-- One short code per affiliate, used in the /r/<code> link and in the
-- finasto_ref cookie.
-- ════════════════════════════════════════════════════════════════
alter table public.affiliates
  add column if not exists referral_code text;

create or replace function public.generate_affiliate_referral_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.affiliates where referral_code = v_code
    );
  end loop;
  return v_code;
end;
$$;

-- Give every existing affiliate a code.
update public.affiliates
set referral_code = public.generate_affiliate_referral_code()
where referral_code is null;

alter table public.affiliates
  alter column referral_code set not null;

create unique index if not exists affiliates_referral_code_key
  on public.affiliates (referral_code);

-- New affiliates get a code automatically (the admin form never types one).
create or replace function public.set_affiliate_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_affiliate_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists affiliates_set_referral_code on public.affiliates;
create trigger affiliates_set_referral_code
  before insert on public.affiliates
  for each row execute function public.set_affiliate_referral_code();


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: column guard
-- RLS cannot restrict individual columns, so a trigger does it. Only an
-- admin may change status, stockist, email, login link, notes,
-- commission rate or referral code.
-- ════════════════════════════════════════════════════════════════
create or replace function public.protect_affiliate_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status             is distinct from old.status
     or new.stockist_id        is distinct from old.stockist_id
     or new.email              is distinct from old.email
     or new.profile_id         is distinct from old.profile_id
     or new.notes              is distinct from old.notes
     or new.commission_percent is distinct from old.commission_percent
     or new.referral_code      is distinct from old.referral_code
  then
    raise exception 'Only an admin can change affiliate status, stockist, email, notes, commission rate or referral code';
  end if;

  return new;
end;
$$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: /r/<code> resolver
-- Anonymous visitors cannot read affiliates (RLS), so the redirect route
-- calls this function. It returns a row ONLY for an active affiliate
-- that has a login (the same rule checkout uses, so a cookie is never
-- saved for a code checkout would ignore). It exposes the code only:
-- no name, email, phone or bank data.
-- ════════════════════════════════════════════════════════════════
create or replace function public.resolve_affiliate_referral(p_code text)
returns table (referral_code text)
language sql
stable
security definer
set search_path = public
as $$
  select a.referral_code
  from public.affiliates a
  where a.referral_code = upper(trim(p_code))
    and a.status = 'active'
    and a.profile_id is not null
  limit 1;
$$;

revoke all on function public.resolve_affiliate_referral(text) from public;
grant execute on function public.resolve_affiliate_referral(text) to anon, authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: checkout attribution resolver
-- Called by checkout (anonymous visitors included). Returns the
-- affiliate and their CURRENT active stockist for a referral code, only
-- when the affiliate is active and has a login. It exposes ids and
-- rates only, never email, phone or bank data.
-- profile ids are what orders.affiliate_id / orders.stockist_id
-- reference (profiles.id = auth user id).
-- ════════════════════════════════════════════════════════════════
create or replace function public.resolve_referral_attribution(p_code text)
returns table (
  affiliate_id uuid,
  affiliate_profile_id uuid,
  affiliate_name text,
  commission_percent numeric,
  stockist_id uuid,
  stockist_profile_id uuid,
  stockist_profit_percent numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.profile_id,
    a.name,
    a.commission_percent,
    s.id,
    s.profile_id,
    s.default_profit_percent
  from public.affiliates a
  left join public.stockists s
    on s.id = a.stockist_id and s.status = 'active'
  where a.referral_code = upper(trim(p_code))
    and a.status = 'active'
    and a.profile_id is not null
  limit 1;
$$;

revoke all on function public.resolve_referral_attribution(text) from public;
grant execute on function public.resolve_referral_attribution(text) to anon, authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: let guests add items to their own pending order
-- A guest cannot read orders, so the old policy check always failed for
-- them. This helper checks it with the owner's rights instead. Still
-- limited to pending orders, and order ids are random UUIDs that cannot
-- be guessed.
-- ════════════════════════════════════════════════════════════════
create or replace function public.is_pending_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id and o.payment_status = 'pending'
  );
$$;

revoke all on function public.is_pending_order(uuid) from public;
grant execute on function public.is_pending_order(uuid) to anon, authenticated;

drop policy if exists "guest creates items on pending order" on public.order_items;
create policy "guest creates items on pending order"
  on public.order_items for insert
  with check (public.is_pending_order(order_id));


-- ════════════════════════════════════════════════════════════════
-- SECTION 6: remove the old per-product link system
-- Dropping the table also removes its triggers and policies. Run this
-- only after the app code no longer calls resolve_referral_link().
-- ════════════════════════════════════════════════════════════════
drop table if exists public.referral_links cascade;
drop function if exists public.resolve_referral_link(text);
drop function if exists public.protect_referral_link_fields();


-- Quick checks:
--   select name, referral_code from public.affiliates;
--   select * from public.resolve_affiliate_referral('YOURCODE');