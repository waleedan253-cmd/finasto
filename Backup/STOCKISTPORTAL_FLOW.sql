-- ════════════════════════════════════════════════════════════════════════
-- STOCKIST PORTAL, STEP 1: own profile (Settings)
-- Run AFTER stockists.sql (the file that created stockists, is_stockist()
-- and current_stockist_id()). Safe to re-run. Runs as ONE transaction.
--
-- What this does
--   1. A stockist no longer touches the stockists table directly. They read
--      their own record through my_stockist_profile() and save their own
--      details through update_my_stockist_profile(). That way the admin-only
--      notes can never be read, and email / status / discount / login link
--      can never be changed from the browser.
--   2. The old self-service policies are removed (they allowed reading notes
--      and left email and profile_id editable).
--   3. The column guard is tightened as a second line of defence.
--
-- The discount rate is stockists.default_profit_percent. The stockist sees
-- it read-only; only an admin can change it.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight checks
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.stockists') is null then
    raise exception 'Table public.stockists is missing.';
  end if;
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() is missing.';
  end if;
  if to_regprocedure('public.is_stockist()') is null then
    raise exception 'public.is_stockist() is missing.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) Remove direct self-service access to the stockists table.
--    The admin policy stays. A stockist now goes through the functions in
--    section 3, which return and accept only the safe columns.
-- ────────────────────────────────────────────────────────────────────────
drop policy if exists "stockist reads own record" on public.stockists;
drop policy if exists "stockist updates own contact details" on public.stockists;


-- ────────────────────────────────────────────────────────────────────────
-- 2) Column guard (defence in depth). Even if a self-update policy were
--    added back later, a non-admin still cannot change these columns.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.protect_stockist_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status                 is distinct from old.status
     or new.default_profit_percent is distinct from old.default_profit_percent
     or new.email                  is distinct from old.email
     or new.profile_id             is distinct from old.profile_id
     or new.notes                  is distinct from old.notes
  then
    raise exception 'Only an admin can change stockist status, discount rate, email, notes or login link';
  end if;

  return new;
end;
$$;

drop trigger if exists stockists_protect_admin_fields on public.stockists;
create trigger stockists_protect_admin_fields
  before update on public.stockists
  for each row execute function public.protect_stockist_admin_fields();


-- ────────────────────────────────────────────────────────────────────────
-- 3) Functions the portal uses
-- ────────────────────────────────────────────────────────────────────────

-- 3a) Read my own record. Returns safe columns only (no notes, no
--     profile_id). Returns no row for anyone who is not a stockist.
create or replace function public.my_stockist_profile()
returns table (
  id               uuid,
  name             text,
  email            text,
  phone            text,
  country          text,
  region           text,
  status           text,
  discount_percent numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.email, s.phone, s.country, s.region,
         s.status, s.default_profit_percent
  from public.stockists s
  where public.is_stockist()
    and s.profile_id = auth.uid()
  limit 1;
$$;

-- 3b) Save my own details. Only these four fields can be written here.
create or replace function public.update_my_stockist_profile(
  p_name    text,
  p_phone   text,
  p_country text,
  p_region  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_stockist() then
    raise exception 'Not authorized';
  end if;

  select s.id into v_id
  from public.stockists s
  where s.profile_id = auth.uid() and s.status = 'active';
  if v_id is null then
    raise exception 'Your stockist account is not active';
  end if;

  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 120 then
    raise exception 'Name must be 1 to 120 characters';
  end if;
  if char_length(coalesce(p_phone, ''))   > 30
     or char_length(coalesce(p_country, '')) > 60
     or char_length(coalesce(p_region, ''))  > 60 then
    raise exception 'A field is too long';
  end if;

  update public.stockists
  set name    = btrim(p_name),
      phone   = nullif(btrim(coalesce(p_phone, '')), ''),
      country = nullif(btrim(coalesce(p_country, '')), ''),
      region  = nullif(btrim(coalesce(p_region, '')), '')
  where id = v_id;
end;
$$;

revoke all on function public.my_stockist_profile()                         from public, anon;
revoke all on function public.update_my_stockist_profile(text, text, text, text) from public, anon;
grant execute on function public.my_stockist_profile()                         to authenticated;
grant execute on function public.update_my_stockist_profile(text, text, text, text) to authenticated;

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════════════

-- A) Only the admin policy should remain on stockists:
-- select policyname, cmd from pg_policies where tablename = 'stockists';

-- B) Both functions exist and are SECURITY DEFINER (prosecdef = true):
-- select proname, prosecdef from pg_proc
-- where proname in ('my_stockist_profile', 'update_my_stockist_profile');

-- NOTE: auth.uid() is empty in the SQL editor, so the two functions cannot
-- be tested here. Test them through the Settings page once it exists.