-- ════════════════════════════════════════════════════════════════
-- SECTION 1: affiliates table
-- Same shape as stockists: name/email/phone live here directly, and
-- profile_id links to auth.users once the invite succeeds.
-- stockist_id is OPTIONAL: an affiliate can exist with no stockist.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.affiliates (
  id            uuid primary key default gen_random_uuid(),

  name          text not null,
  email         text not null unique,
  phone         text,
  country       text,
  region        text,

  -- Soft-delete model, same as stockists: 'deleted' is a status, never
  -- a row delete, so future orders.affiliate_id never dangles.
  status        text not null default 'active'
                  check (status in ('active', 'inactive', 'deleted')),

  -- Optional assignment. NULL = unassigned. If a stockist row were ever
  -- hard-deleted, affiliates fall back to unassigned instead of breaking.
  stockist_id   uuid references public.stockists(id) on delete set null,

  -- Admin-only reference notes, never shown to the affiliate.
  notes         text,

  -- Set once inviteAffiliateUser() succeeds (nullable until then).
  profile_id    uuid references auth.users(id) on delete set null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists affiliates_status_idx      on public.affiliates (status);
create index if not exists affiliates_profile_id_idx  on public.affiliates (profile_id);
create index if not exists affiliates_stockist_id_idx on public.affiliates (stockist_id);


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: keep updated_at current (shared touch_updated_at())
-- ════════════════════════════════════════════════════════════════
drop trigger if exists affiliates_touch_updated_at on public.affiliates;
create trigger affiliates_touch_updated_at
  before update on public.affiliates
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: role helpers (same pattern as is_admin / is_stockist)
-- ════════════════════════════════════════════════════════════════
create or replace function public.is_affiliate()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'affiliate';
$$;

-- The calling affiliate's own affiliates.id (null if not an affiliate).
-- Reused later by Orders RLS ("my own orders/sales").
create or replace function public.current_affiliate_id()
returns uuid
language sql
stable
as $$
  select id from public.affiliates where profile_id = auth.uid();
$$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: Row Level Security
-- Admin: full access.
-- Affiliate: read + lightly update ONLY their own row.
-- Stockist: read-only access to affiliates assigned to them.
-- Everyone else: nothing.
-- ════════════════════════════════════════════════════════════════
alter table public.affiliates enable row level security;

drop policy if exists "admin manages affiliates" on public.affiliates;
create policy "admin manages affiliates"
  on public.affiliates for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "affiliate reads own record" on public.affiliates;
create policy "affiliate reads own record"
  on public.affiliates for select
  using (public.is_affiliate() and profile_id = auth.uid());

drop policy if exists "affiliate updates own contact details" on public.affiliates;
create policy "affiliate updates own contact details"
  on public.affiliates for update
  using (public.is_affiliate() and profile_id = auth.uid())
  with check (public.is_affiliate() and profile_id = auth.uid());
  -- Which columns may change is enforced by the trigger in Section 5.

drop policy if exists "stockist reads assigned affiliates" on public.affiliates;
create policy "stockist reads assigned affiliates"
  on public.affiliates for select
  using (
    public.is_stockist()
    and stockist_id is not null
    and stockist_id = public.current_stockist_id()
  );


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: column-level guard for self-updates
-- RLS can't restrict individual columns, so a trigger blocks a
-- non-admin from changing status, stockist assignment, email
-- (login identity) or the auth link, even on their own row.
-- ════════════════════════════════════════════════════════════════
create or replace function public.protect_affiliate_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status      is distinct from old.status
     or new.stockist_id is distinct from old.stockist_id
     or new.email       is distinct from old.email
     or new.profile_id  is distinct from old.profile_id
     or new.notes       is distinct from old.notes
  then
    raise exception 'Only an admin can change affiliate status, stockist, email or notes';
  end if;

  return new;
end;
$$;

drop trigger if exists affiliates_protect_admin_fields on public.affiliates;
create trigger affiliates_protect_admin_fields
  before update on public.affiliates
  for each row execute function public.protect_affiliate_admin_fields();



  -- #Affiliates commission bank#


  -- ════════════════════════════════════════════════════════════════
-- MIGRATION: affiliate commission rate + bank details
-- Run AFTER affiliates.sql. Safe to re-run (idempotent).
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════
-- SECTION 1: commission_percent on affiliates
-- Set by the admin when creating/editing an affiliate. Existing rows
-- get 0 until the admin sets a rate.
-- ════════════════════════════════════════════════════════════════
alter table public.affiliates
  add column if not exists commission_percent numeric(5,2) not null default 0;

alter table public.affiliates
  drop constraint if exists affiliates_commission_percent_range;
alter table public.affiliates
  add constraint affiliates_commission_percent_range
  check (commission_percent >= 0 and commission_percent <= 100);


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: extend the column guard
-- Replaces the function from affiliates.sql. A non-admin (the affiliate
-- editing their own row) can no longer change commission_percent, so an
-- affiliate can never raise their own rate.
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
  then
    raise exception 'Only an admin can change affiliate status, stockist, email, notes or commission rate';
  end if;

  return new;
end;
$$;
-- The trigger affiliates_protect_admin_fields already exists and calls
-- this function by name, so replacing the function is enough.


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: affiliate_bank_details
-- Separate table (one row per affiliate) instead of columns on
-- affiliates, because the "stockist reads assigned affiliates" policy
-- lets a stockist read the whole affiliates row. Here only the admin
-- and the affiliate themselves have any access.
-- International-friendly: IBAN or local account number in one field,
-- SWIFT/BIC, an optional local routing code (sort code, IFSC, ABA...),
-- and the currency the affiliate wants to be paid in.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.affiliate_bank_details (
  affiliate_id          uuid primary key
                          references public.affiliates(id) on delete cascade,

  account_holder_name   text not null,
  bank_name             text not null,
  bank_country          text not null,
  account_number_or_iban text not null,
  swift_bic             text,
  routing_code          text,
  payout_currency       text not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Light sanity checks only. Strict per-country rules (and the IBAN
  -- checksum) are handled in the app so valid accounts are not rejected.
  constraint bank_swift_format
    check (swift_bic is null or swift_bic ~ '^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$'),
  constraint bank_currency_format
    check (payout_currency ~ '^[A-Za-z]{3}$'),
  constraint bank_field_lengths
    check (
      char_length(account_holder_name)    <= 120 and
      char_length(bank_name)              <= 120 and
      char_length(bank_country)           <= 60  and
      char_length(account_number_or_iban) <= 50  and
      (routing_code is null or char_length(routing_code) <= 30)
    )
);

drop trigger if exists affiliate_bank_details_touch_updated_at
  on public.affiliate_bank_details;
create trigger affiliate_bank_details_touch_updated_at
  before update on public.affiliate_bank_details
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: Row Level Security for bank details
-- Admin: full access (the app masks the account number in the UI).
-- Affiliate: read, create and update ONLY their own row. No delete.
-- Stockists, customers, everyone else: no access at all.
-- ════════════════════════════════════════════════════════════════
alter table public.affiliate_bank_details enable row level security;

drop policy if exists "admin manages bank details"
  on public.affiliate_bank_details;
create policy "admin manages bank details"
  on public.affiliate_bank_details for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "affiliate reads own bank details"
  on public.affiliate_bank_details;
create policy "affiliate reads own bank details"
  on public.affiliate_bank_details for select
  using (
    public.is_affiliate()
    and affiliate_id = public.current_affiliate_id()
  );

drop policy if exists "affiliate creates own bank details"
  on public.affiliate_bank_details;
create policy "affiliate creates own bank details"
  on public.affiliate_bank_details for insert
  with check (
    public.is_affiliate()
    and affiliate_id = public.current_affiliate_id()
  );

drop policy if exists "affiliate updates own bank details"
  on public.affiliate_bank_details;
create policy "affiliate updates own bank details"
  on public.affiliate_bank_details for update
  using (
    public.is_affiliate()
    and affiliate_id = public.current_affiliate_id()
  )
  with check (
    public.is_affiliate()
    and affiliate_id = public.current_affiliate_id()
  );