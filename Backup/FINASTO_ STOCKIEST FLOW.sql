-- ════════════════════════════════════════════════════════════════
-- SECTION 1: stockists table
-- Core entity, separate from affiliates and admin. Columns match
-- exactly what stockist-queries.ts / stockist-actions.ts already use.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.stockists (
  id                     uuid primary key default gen_random_uuid(),

  -- Business contact details (per the client's original Stockist prompt)
  name                   text not null,
  email                  text not null unique,
  phone                  text,
  country                text,
  region                 text,

  -- Status is a soft-delete model: 'deleted' is a status, never a row
  -- delete, so order_items.stockist_id (added later) never points at a
  -- vanished row and historical financial data stays correct.
  status                 text not null default 'active'
                           check (status in ('active', 'inactive', 'deleted')),

  -- Applied automatically on products with no per-product override.
  default_profit_percent numeric(5,2) not null default 10
                           check (default_profit_percent >= 0 and default_profit_percent <= 100),

  -- Admin-only reference notes — never shown to the stockist themselves.
  notes                  text,

  -- Links to auth.users.id once inviteStockistUser() succeeds.
  -- Nullable: a stockist can exist as a record before their invite
  -- email is accepted (or if the invite failed and needs a retry).
  profile_id             uuid references auth.users(id) on delete set null,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Lookups the app actually performs: search by name/email, filter by
-- status, and the stockist dashboard's "who am I" join via profile_id.
create index if not exists stockists_status_idx on public.stockists (status);
create index if not exists stockists_profile_id_idx on public.stockists (profile_id);


-- ════════════════════════════════════════════════════════════════
-- SECTION 2: keep updated_at current automatically
-- Reuses the touch_updated_at() function created earlier for products
-- — one shared trigger function, not a duplicate per table.
-- ════════════════════════════════════════════════════════════════
drop trigger if exists stockists_touch_updated_at on public.stockists;
create trigger stockists_touch_updated_at
  before update on public.stockists
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════════════════════════════
-- SECTION 3: is_stockist() helper
-- Same pattern as is_admin() — reads the role out of the JWT's
-- app_metadata, which only the server (service-role client) can set.
-- Built now so the Affiliates/Orders sections' RLS can reuse it later
-- instead of re-deriving it.
-- ════════════════════════════════════════════════════════════════
create or replace function public.is_stockist()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'stockist';
$$;

-- Returns the calling stockist's own stockists.id (via profile_id), or
-- null if the caller isn't a stockist. Used below so RLS policies don't
-- repeat the same subquery, and will be reused by the Stockist dashboard
-- (Affiliates/Orders sections) for "my own data" policies later.
create or replace function public.current_stockist_id()
returns uuid
language sql
stable
as $$
  select id from public.stockists where profile_id = auth.uid();
$$;


-- ════════════════════════════════════════════════════════════════
-- SECTION 4: Row Level Security
-- Admin: full access, always. Stockist: can read (and lightly update)
-- ONLY their own row — never another stockist's, never create/delete.
-- Everyone else (customers, affiliates): no access at all.
-- ════════════════════════════════════════════════════════════════
alter table public.stockists enable row level security;

create policy "admin manages stockists"
  on public.stockists for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "stockist reads own record"
  on public.stockists for select
  using (public.is_stockist() and profile_id = auth.uid());

-- Deliberately narrow: a stockist can update only their own contact
-- details, never their own status or profit percent — those stay
-- admin-only (enforced by column list in the check, not just using()).
create policy "stockist updates own contact details"
  on public.stockists for update
  using (public.is_stockist() and profile_id = auth.uid())
  with check (
    public.is_stockist()
    and profile_id = auth.uid()
    -- status and default_profit_percent are re-asserted unchanged below
    -- via a trigger in Section 5, since RLS alone can't restrict
    -- individual columns on an UPDATE.
  );


-- ════════════════════════════════════════════════════════════════
-- SECTION 5: column-level guard for self-updates
-- RLS's with check() can't say "this column may not change" — only a
-- trigger can. This stops a stockist from ever editing their own
-- status or profit % through a self-service update, even though the
-- row-level policy above allows the update itself.
-- ════════════════════════════════════════════════════════════════
create or replace function public.protect_stockist_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new; -- admin can change anything
  end if;

  if new.status is distinct from old.status
     or new.default_profit_percent is distinct from old.default_profit_percent
  then
    raise exception 'Only an admin can change stockist status or profit percent';
  end if;

  return new;
end;
$$;

drop trigger if exists stockists_protect_admin_fields on public.stockists;
create trigger stockists_protect_admin_fields
  before update on public.stockists
  for each row execute function public.protect_stockist_admin_fields();



  -- ════════════════════════════════════════════════════════════════════════
-- FINASTO — REQUESTS FLOW: stockist asks to move an affiliate (production)
-- ════════════════════════════════════════════════════════════════════════
--
-- Flow
--   1. A stockist submits a request: which affiliate, which NEW stockist,
--      and a reason. It is stored as status 'pending'.
--   2. The admin sees it on the Requests page and decides:
--        Approve -> ONE transaction: affiliates.stockist_id is changed and
--                   the change is logged in affiliate_stockist_history, then
--                   the request is marked 'approved'.
--        Reject  -> only the status and a required note are recorded.
--   3. The stockist can always read the result of their own requests.
--   Nothing changes silently: only an admin's click moves an affiliate.
--
-- Security model
--   * Nobody writes to these tables directly. Every write goes through a
--     SECURITY DEFINER function that checks who is calling, so the rules
--     cannot be bypassed from the browser.
--   * Past orders keep the stockist they were created with (the order row
--     stores its own stockist_id). Reassigning an affiliate only affects
--     future orders; history rows are the audit trail.
--
-- How to run
--   Paste the whole file into the Supabase SQL editor and run it once.
--   It is IDEMPOTENT (safe to run again) and runs as ONE transaction.
--
-- Assumed schema (checked in step 0, with a clear error if different):
--   stockists(id, profile_id, status)    affiliates(id, stockist_id)
--   public.is_admin()                    (used by the admin policies)
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight checks — stop early with a clear message
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'public.is_admin() is missing. Create it first.';
  end if;

  if to_regclass('public.stockists') is null then
    raise exception 'Table public.stockists is missing.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stockists'
      and column_name in ('id','profile_id','status')
    having count(*) = 3
  ) then
    raise exception 'public.stockists must have the columns id, profile_id and status.';
  end if;

  if to_regclass('public.affiliates') is null then
    raise exception 'Table public.affiliates is missing. Build the Affiliates section first.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'affiliates'
      and column_name = 'stockist_id'
  ) then
    raise exception 'public.affiliates.stockist_id is missing. The Affiliates section must add it first.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) Helpers
-- ────────────────────────────────────────────────────────────────────────

-- Keeps updated_at current (same helper as the product flow).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- "Which stockists row is the logged-in user?" SECURITY DEFINER so it works
-- even when a stockist cannot read the stockists table directly. Used by the
-- read policy and by the submit function.
create or replace function public.current_stockist_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.id
  from public.stockists s
  where s.profile_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_stockist_id() from public, anon;
grant execute on function public.current_stockist_id() to authenticated;


-- ────────────────────────────────────────────────────────────────────────
-- 2) stockist_requests — one row per request
--    from_stockist_id = the affiliate's stockist at request time, which is
--    also the stockist who submitted it (only the current stockist may ask).
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.stockist_requests (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid not null references public.affiliates(id)  on delete restrict,
  from_stockist_id uuid not null references public.stockists(id)   on delete restrict,
  to_stockist_id   uuid not null references public.stockists(id)   on delete restrict,
  reason           text not null
                     check (char_length(btrim(reason)) between 5 and 500),
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  admin_note       text
                     check (admin_note is null or char_length(admin_note) <= 500),
  reviewed_by      uuid references auth.users(id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- A request must move the affiliate to a different stockist.
  constraint stockist_requests_different_stockists
    check (from_stockist_id <> to_stockist_id),

  -- Review fields are filled exactly when a decision has been made.
  constraint stockist_requests_review_consistent
    check (
      (status = 'pending'  and reviewed_at is null)
      or (status <> 'pending' and reviewed_at is not null)
    ),

  -- A rejection must always explain itself.
  constraint stockist_requests_reject_needs_note
    check (status <> 'rejected' or char_length(btrim(coalesce(admin_note, ''))) > 0)
);

-- At most ONE open request per affiliate (blocks duplicate submissions).
create unique index if not exists stockist_requests_one_pending_idx
  on public.stockist_requests (affiliate_id)
  where status = 'pending';

-- Admin list: newest first, filtered by status tab.
create index if not exists stockist_requests_status_created_idx
  on public.stockist_requests (status, created_at desc);

-- Stockist list: "my requests".
create index if not exists stockist_requests_from_stockist_idx
  on public.stockist_requests (from_stockist_id, created_at desc);

drop trigger if exists stockist_requests_touch_updated_at on public.stockist_requests;
create trigger stockist_requests_touch_updated_at
  before update on public.stockist_requests
  for each row execute function public.touch_updated_at();

alter table public.stockist_requests enable row level security;

-- Read only. There are deliberately NO insert/update/delete policies:
-- all writes go through the functions in step 4.
drop policy if exists "admin reads requests" on public.stockist_requests;
create policy "admin reads requests"
  on public.stockist_requests for select
  using (public.is_admin());

drop policy if exists "stockist reads own requests" on public.stockist_requests;
create policy "stockist reads own requests"
  on public.stockist_requests for select
  using (from_stockist_id = public.current_stockist_id());


-- ────────────────────────────────────────────────────────────────────────
-- 3) affiliate_stockist_history — audit trail of every reassignment
--    from_stockist_id is NULL for a first assignment. Rows are written only
--    by approve_stockist_request() and are never edited or deleted.
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.affiliate_stockist_history (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid not null references public.affiliates(id) on delete restrict,
  from_stockist_id uuid references public.stockists(id) on delete restrict,
  to_stockist_id   uuid not null references public.stockists(id) on delete restrict,
  request_id       uuid references public.stockist_requests(id) on delete set null,
  changed_by       uuid references auth.users(id) on delete set null,
  reason           text,
  changed_at       timestamptz not null default now()
);

create index if not exists affiliate_stockist_history_affiliate_idx
  on public.affiliate_stockist_history (affiliate_id, changed_at desc);

alter table public.affiliate_stockist_history enable row level security;

drop policy if exists "admin reads stockist history" on public.affiliate_stockist_history;
create policy "admin reads stockist history"
  on public.affiliate_stockist_history for select
  using (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 4) Functions — the only way to write. Each runs as ONE transaction.
-- ────────────────────────────────────────────────────────────────────────

-- 4a) Stockist submits a request.
create or replace function public.submit_stockist_request(
  p_affiliate_id   uuid,
  p_to_stockist_id uuid,
  p_reason         text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stockist uuid;
  v_current  uuid;
  v_request  uuid;
begin
  v_stockist := public.current_stockist_id();
  if v_stockist is null then
    raise exception 'Only a stockist can submit a request';
  end if;

  if not exists (
    select 1 from public.stockists where id = v_stockist and status = 'active'
  ) then
    raise exception 'Your stockist account is not active';
  end if;

  if char_length(btrim(coalesce(p_reason, ''))) < 5 then
    raise exception 'Please give a reason (at least 5 characters)';
  end if;

  -- Only the affiliate's CURRENT stockist may ask to move it.
  select a.stockist_id into v_current
  from public.affiliates a where a.id = p_affiliate_id;
  if not found or v_current is distinct from v_stockist then
    raise exception 'That affiliate is not assigned to you';
  end if;

  if p_to_stockist_id = v_stockist then
    raise exception 'Choose a different stockist';
  end if;

  if not exists (
    select 1 from public.stockists where id = p_to_stockist_id and status = 'active'
  ) then
    raise exception 'The selected stockist is not available';
  end if;

  insert into public.stockist_requests (affiliate_id, from_stockist_id, to_stockist_id, reason)
  values (p_affiliate_id, v_stockist, p_to_stockist_id, btrim(p_reason))
  returning id into v_request;

  return v_request;

exception
  when unique_violation then
    raise exception 'This affiliate already has a pending request';
end;
$$;

-- 4b) Admin approves: reassign + log + mark approved, all or nothing.
create or replace function public.approve_stockist_request(
  p_request_id uuid,
  p_note       text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r         public.stockist_requests%rowtype;
  v_current uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  -- Lock the request so two admins cannot decide it at the same time.
  select * into r from public.stockist_requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request was already %', r.status;
  end if;

  -- Lock the affiliate and make sure it still belongs to the requester.
  select a.stockist_id into v_current
  from public.affiliates a where a.id = r.affiliate_id for update;
  if v_current is distinct from r.from_stockist_id then
    raise exception 'The affiliate was reassigned after this request was made. Reject it and ask for a new request.';
  end if;

  if not exists (
    select 1 from public.stockists where id = r.to_stockist_id and status = 'active'
  ) then
    raise exception 'The requested stockist is no longer active';
  end if;

  update public.affiliates
  set stockist_id = r.to_stockist_id
  where id = r.affiliate_id;

  insert into public.affiliate_stockist_history
    (affiliate_id, from_stockist_id, to_stockist_id, request_id, changed_by, reason)
  values
    (r.affiliate_id, r.from_stockist_id, r.to_stockist_id, r.id, auth.uid(), r.reason);

  update public.stockist_requests
  set status      = 'approved',
      admin_note  = nullif(btrim(coalesce(p_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = r.id;
end;
$$;

-- 4c) Admin rejects: record the decision and a required note. No data changes.
create or replace function public.reject_stockist_request(
  p_request_id uuid,
  p_note       text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.stockist_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if char_length(btrim(coalesce(p_note, ''))) = 0 then
    raise exception 'Please add a short note explaining the rejection';
  end if;

  select * into r from public.stockist_requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request was already %', r.status;
  end if;

  update public.stockist_requests
  set status      = 'rejected',
      admin_note  = btrim(p_note),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = r.id;
end;
$$;

-- Only logged-in users may call these; each function re-checks the role.
revoke all on function public.submit_stockist_request(uuid, uuid, text)  from public, anon;
revoke all on function public.approve_stockist_request(uuid, text)       from public, anon;
revoke all on function public.reject_stockist_request(uuid, text)        from public, anon;
grant execute on function public.submit_stockist_request(uuid, uuid, text) to authenticated;
grant execute on function public.approve_stockist_request(uuid, text)      to authenticated;
grant execute on function public.reject_stockist_request(uuid, text)       to authenticated;

commit;


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (optional — run one at a time after the script)
-- ════════════════════════════════════════════════════════════════════════

-- A) Tables exist and RLS is on (rowsecurity should be true for both).
-- select tablename, rowsecurity from pg_tables
-- where schemaname = 'public'
--   and tablename in ('stockist_requests', 'affiliate_stockist_history');

-- B) Policies: both tables should have SELECT policies only.
-- select tablename, policyname, cmd from pg_policies
-- where tablename in ('stockist_requests', 'affiliate_stockist_history')
-- order by tablename, policyname;

-- C) The three functions exist and are SECURITY DEFINER (prosecdef = true).
-- select proname, prosecdef from pg_proc
-- where proname in ('submit_stockist_request', 'approve_stockist_request',
--                   'reject_stockist_request', 'current_stockist_id');

-- D) Open requests, newest first (admin view, run as service role / owner).
-- select r.id, a.id as affiliate, fs.name as from_stockist,
--        ts.name as to_stockist, r.reason, r.created_at
-- from public.stockist_requests r
-- join public.affiliates a  on a.id  = r.affiliate_id
-- join public.stockists  fs on fs.id = r.from_stockist_id
-- join public.stockists  ts on ts.id = r.to_stockist_id
-- where r.status = 'pending'
-- order by r.created_at desc;

-- NOTE: auth.uid() is empty in the SQL editor, so the three request functions
-- cannot be tested here. Test them through the app (stockist submit, admin
-- approve / reject).



-- ## create unique index
select profile_id, count(*) from public.stockists where profile_id is not null group by profile_id having count(*) > 1;

create unique index if not exists stockists_profile_id_key on public.stockists (profile_id) where profile_id is not null;

-- ## affiliates.profile_id

alter table public.affiliates
  add constraint affiliates_profile_id_profiles_fkey
  foreign key (profile_id) references public.profiles(id)
  on delete set null
  not valid;

alter table public.affiliates
  validate constraint affiliates_profile_id_profiles_fkey;

notify pgrst, 'reload schema';