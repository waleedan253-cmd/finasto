-- ════════════════════════════════════════════════════════════════════════
-- AFFILIATE PROFILE LOCK + DISPLAY CURRENCY
-- Run AFTER affiliates.sql and affiliates-commission-bank.sql.
-- Safe to re-run. One transaction.
--
-- The affiliate completes username + phone + country ONCE through
-- complete_affiliate_profile(). That call also sets display_currency from
-- the country and locks all four fields. After the lock only an admin can
-- change them. The browser can never write these columns directly: the
-- guard trigger below rejects it, so a disabled form field is not the
-- only protection.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ── Pre-flight ──────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_admin()') is null
     or to_regprocedure('public.is_affiliate()') is null
     or to_regprocedure('public.current_affiliate_id()') is null then
    raise exception 'Role helper functions are missing. Run affiliates.sql first.';
  end if;
  if to_regclass('public.affiliates') is null then
    raise exception 'affiliates table is missing. Run affiliates.sql first.';
  end if;
end $$;

-- ── Columns ─────────────────────────────────────────────────────────────
-- phone and country already exist. phone is saved as +E.164, for example
-- +923001234567. country keeps the readable name, country_code the ISO code.
alter table public.affiliates
  add column if not exists name              text,
  add column if not exists country_code      text,
  add column if not exists display_currency  text,
  add column if not exists profile_locked_at  timestamptz;



alter table public.affiliates
  drop constraint if exists affiliates_country_code_format;
alter table public.affiliates
  add constraint affiliates_country_code_format
  check (country_code is null or country_code ~ '^[A-Z]{2}$');

alter table public.affiliates
  drop constraint if exists affiliates_display_currency_format;
alter table public.affiliates
  add constraint affiliates_display_currency_format
  check (display_currency is null or display_currency ~ '^[A-Z]{3}$');



-- ── Country -> display currency ─────────────────────────────────────────
-- The four supported markets get their own currency. Every other country
-- sees USD. Keep this in step with the map in lib/currency.ts.
create or replace function public.country_to_currency(p_country_code text)
returns text
language sql
immutable
as $$
  select case upper(coalesce(p_country_code, ''))
    when 'ID' then 'IDR'
    when 'MY' then 'MYR'
    when 'GB' then 'GBP'
    when 'PK' then 'PKR'
    else 'USD'
  end;
$$;

-- ── Column guard (replaces the function from affiliates-commission-bank) ─
-- Same checks as before, plus the new locked fields. The only way a
-- non-admin can change them is through complete_affiliate_profile(),
-- which switches on a flag that exists for that one transaction only.
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
  then
    raise exception 'Only an admin can change affiliate status, stockist, email, notes or commission rate';
  end if;

  if coalesce(current_setting('app.affiliate_profile_lock', true), '') <> 'on'
     and (
       new.name          is distinct from old.name
       or new.phone             is distinct from old.phone
       or new.country           is distinct from old.country
       or new.country_code      is distinct from old.country_code
       or new.display_currency  is distinct from old.display_currency
       or new.profile_locked_at is distinct from old.profile_locked_at
     )
  then
    raise exception 'name, phone and country are set once and locked. Contact support to change them';
  end if;

  return new;
end;
$$;
-- The trigger affiliates_protect_admin_fields already calls this function
-- by name, so replacing the function is enough.

-- ── complete_affiliate_profile(): the one-time save ─────────────────────
drop function if exists public.complete_affiliate_profile(text, text, text, text);
create or replace function public.complete_affiliate_profile(
  p_name     text,
  p_phone        text,
  p_country_code text,
  p_country_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id       uuid;
  v_status   text;
  v_locked   timestamptz;
  v_name text := lower(btrim(coalesce(p_name, '')));
  v_phone    text := regexp_replace(btrim(coalesce(p_phone, '')), '[\s\-().]', '', 'g');
  v_cc       text := upper(btrim(coalesce(p_country_code, '')));
  v_country  text := btrim(coalesce(p_country_name, ''));
begin
  if not public.is_affiliate() then
    raise exception 'Not authorized';
  end if;
  v_id := public.current_affiliate_id();
  if v_id is null then
    raise exception 'Not authorized';
  end if;

  -- Lock the row: two clicks or two tabs run one after the other.
  select a.status, a.profile_locked_at into v_status, v_locked
  from public.affiliates a
  where a.id = v_id
  for update;

  if v_status is distinct from 'active' then
    raise exception 'Your account is not active';
  end if;
  if v_locked is not null then
    raise exception 'Your profile is already locked';
  end if;

  if v_name !~ '^[a-z0-9_]{3,30}$' then
    raise exception 'name must be 3 to 30 characters: letters, numbers and underscore only';
  end if;
  if v_phone !~ '^\+[1-9][0-9]{6,14}$' then
    raise exception 'Enter a valid phone number with its country code';
  end if;
  if v_cc !~ '^[A-Z]{2}$' or v_country = '' or char_length(v_country) > 60 then
    raise exception 'Select your country';
  end if;

  -- Allow the guard trigger for this transaction only.
  perform set_config('app.affiliate_profile_lock', 'on', true);

  update public.affiliates
  set name          = v_name,
      phone             = v_phone,
      country           = v_country,
      country_code      = v_cc,
      display_currency  = public.country_to_currency(v_cc),
      profile_locked_at = now()
  where id = v_id;

  perform set_config('app.affiliate_profile_lock', 'off', true);

exception
  when unique_violation then
    raise exception 'That name is already taken';
end;
$$;

revoke all on function public.complete_affiliate_profile(text, text, text, text)
  from public, anon;
grant execute on function public.complete_affiliate_profile(text, text, text, text)
  to authenticated;
  drop index if exists public.affiliates_username_lower_idx;
alter table public.affiliates drop constraint if exists affiliates_username_format;
alter table public.affiliates drop column if exists username;

commit;