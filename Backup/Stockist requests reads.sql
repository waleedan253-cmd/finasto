-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — REQUESTS FLOW v2: stockist CLAIMS an affiliate (migration)
-- ════════════════════════════════════════════════════════════════════════
--
-- Flow
--   1. A stockist types the affiliate's name, email and a description, and
--      submits. It is stored as 'pending' under the stockist's own account.
--      The stockist never sees other stockists or other stockists' affiliates,
--      and is never told whether the email exists.
--   2. The admin sees the request, the matched affiliate (if the email exists)
--      and that affiliate's current stockist, then decides:
--        Approve -> ONE transaction: affiliates.stockist_id becomes the
--                   requesting stockist, the change is logged in
--                   affiliate_stockist_history, the request is 'approved'.
--        Reject  -> only the status and a required note are recorded.
--   3. Past orders keep the stockist they were created with.
--
-- Run ON TOP of the earlier requests-flow.sql (do NOT run requests-flow.sql
-- again afterwards: it would bring back the old function signatures).
-- Replaces stockist-requests-reads.sql (one function left: list_my_requests).
--
-- Safe to run again. Runs as ONE transaction.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight: stop if old-style requests exist
--    Old rows have a target stockist that the new model does not keep, so
--    they cannot be converted safely. If they are test data, clear them first:
--        delete from public.stockist_requests;
-- ────────────────────────────────────────────────────────────────────────
do $$
declare
  v_old_rows bigint;
begin
  if to_regclass('public.stockist_requests') is null then
    raise exception 'public.stockist_requests is missing. Run requests-flow.sql first.';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stockist_requests'
      and column_name = 'to_stockist_id'
  ) then
    select count(*) into v_old_rows from public.stockist_requests;
    if v_old_rows > 0 then
      raise exception
        'stockist_requests has % old-style row(s). If they are test data, run: delete from public.stockist_requests;  then run this file again.',
        v_old_rows;
    end if;
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) Table changes
-- ────────────────────────────────────────────────────────────────────────

-- Old columns and rules that no longer apply.
alter table public.stockist_requests
  drop constraint if exists stockist_requests_different_stockists;
alter table public.stockist_requests
  drop column if exists to_stockist_id;
drop index if exists public.stockist_requests_one_pending_idx;
drop index if exists public.stockist_requests_from_stockist_idx;

-- Renames: from_stockist_id -> requesting_stockist_id, reason -> description.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stockist_requests'
      and column_name = 'from_stockist_id'
  ) then
    alter table public.stockist_requests
      rename column from_stockist_id to requesting_stockist_id;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'stockist_requests_from_stockist_id_fkey'
      and conrelid = 'public.stockist_requests'::regclass
  ) then
    alter table public.stockist_requests
      rename constraint stockist_requests_from_stockist_id_fkey
      to stockist_requests_requesting_stockist_id_fkey;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stockist_requests'
      and column_name = 'reason'
  ) then
    alter table public.stockist_requests
      rename column reason to description;
  end if;
end $$;

-- New columns: what the stockist typed. The table is empty at this point
-- (step 0), so NOT NULL is safe.
alter table public.stockist_requests
  add column if not exists affiliate_name  text not null,
  add column if not exists affiliate_email text not null;

-- affiliate_id is now the MATCHED affiliate: empty until the email matches.
alter table public.stockist_requests
  alter column affiliate_id drop not null;

-- Input rules.
alter table public.stockist_requests
  drop constraint if exists stockist_requests_affiliate_name_len;
alter table public.stockist_requests
  add constraint stockist_requests_affiliate_name_len
  check (char_length(btrim(affiliate_name)) between 2 and 100);

alter table public.stockist_requests
  drop constraint if exists stockist_requests_affiliate_email_valid;
alter table public.stockist_requests
  add constraint stockist_requests_affiliate_email_valid
  check (
    affiliate_email = lower(btrim(affiliate_email))
    and char_length(affiliate_email) between 3 and 254
    and position('@' in affiliate_email) > 1
  );

-- At most ONE open request per stockist and affiliate email.
create unique index if not exists stockist_requests_one_pending_idx
  on public.stockist_requests (requesting_stockist_id, affiliate_email)
  where status = 'pending';

-- Stockist list: "my requests".
create index if not exists stockist_requests_requesting_stockist_idx
  on public.stockist_requests (requesting_stockist_id, created_at desc);

-- Read policy for the stockist, pointed at the renamed column.
drop policy if exists "stockist reads own requests" on public.stockist_requests;
create policy "stockist reads own requests"
  on public.stockist_requests for select
  using (requesting_stockist_id = public.current_stockist_id());


-- ────────────────────────────────────────────────────────────────────────
-- 2) Functions
-- ────────────────────────────────────────────────────────────────────────

-- Old signatures and helpers that no longer exist.
drop function if exists public.submit_stockist_request(uuid, uuid, text);
drop function if exists public.list_my_affiliates();
drop function if exists public.list_transfer_targets();
drop function if exists public.list_my_requests();

-- 2a) Stockist submits a claim.
create or replace function public.submit_stockist_request(
  p_affiliate_name  text,
  p_affiliate_email text,
  p_description     text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stockist uuid;
  v_name     text := btrim(coalesce(p_affiliate_name, ''));
  v_email    text := lower(btrim(coalesce(p_affiliate_email, '')));
  v_desc     text := btrim(coalesce(p_description, ''));
  v_aff      uuid;
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

  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    raise exception 'Please enter the affiliate''s name (2 to 100 characters)';
  end if;

  if char_length(v_email) < 3 or char_length(v_email) > 254
     or position('@' in v_email) < 2 then
    raise exception 'Please enter a valid email address';
  end if;

  if char_length(v_desc) < 5 or char_length(v_desc) > 500 then
    raise exception 'Please add a description (5 to 500 characters)';
  end if;

  -- Match by email. Nothing about the match is returned to the stockist,
  -- except when the affiliate is already theirs.
  select a.id, a.stockist_id into v_aff, v_current
  from public.affiliates a
  where lower(btrim(a.email)) = v_email
  limit 1;

  if v_aff is not null and v_current is not distinct from v_stockist then
    raise exception 'This affiliate is already assigned to you';
  end if;

  insert into public.stockist_requests
    (requesting_stockist_id, affiliate_id, affiliate_name, affiliate_email, description)
  values
    (v_stockist, v_aff, v_name, v_email, v_desc)
  returning id into v_request;

  return v_request;

exception
  when unique_violation then
    raise exception 'You already have a pending request for this email';
end;
$$;

-- 2b) Admin approves: assign + log + mark approved, all or nothing.
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
  v_aff     uuid;
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

  -- Use the matched affiliate; if there was none at submit time, try the
  -- email again (the affiliate may have signed up since).
  v_aff := r.affiliate_id;
  if v_aff is null then
    select a.id into v_aff
    from public.affiliates a
    where lower(btrim(a.email)) = r.affiliate_email
    limit 1;
  end if;
  if v_aff is null then
    raise exception 'No affiliate with this email exists yet. Reject the request, or approve it after the affiliate signs up.';
  end if;

  -- Lock the affiliate and read who owns it right now.
  select a.stockist_id into v_current
  from public.affiliates a where a.id = v_aff for update;

  if v_current is not distinct from r.requesting_stockist_id then
    raise exception 'This affiliate is already assigned to that stockist';
  end if;

  if not exists (
    select 1 from public.stockists
    where id = r.requesting_stockist_id and status = 'active'
  ) then
    raise exception 'The requesting stockist is no longer active';
  end if;

  update public.affiliates
  set stockist_id = r.requesting_stockist_id
  where id = v_aff;

  insert into public.affiliate_stockist_history
    (affiliate_id, from_stockist_id, to_stockist_id, request_id, changed_by, reason)
  values
    (v_aff, v_current, r.requesting_stockist_id, r.id, auth.uid(), r.description);

  update public.stockist_requests
  set status       = 'approved',
      affiliate_id = v_aff,
      admin_note   = nullif(btrim(coalesce(p_note, '')), ''),
      reviewed_by  = auth.uid(),
      reviewed_at  = now()
  where id = r.id;
end;
$$;

-- reject_stockist_request() is unchanged: it only touches status, note and
-- review fields.

-- 2c) The stockist's own requests, newest first. Only what they typed plus
--     the decision. Never the matched affiliate or its current stockist.
create or replace function public.list_my_requests()
returns table (
  id              uuid,
  status          text,
  affiliate_name  text,
  affiliate_email text,
  description     text,
  admin_note      text,
  created_at      timestamptz,
  reviewed_at     timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.status,
    r.affiliate_name,
    r.affiliate_email,
    r.description,
    r.admin_note,
    r.created_at,
    r.reviewed_at
  from public.stockist_requests r
  where public.current_stockist_id() is not null
    and r.requesting_stockist_id = public.current_stockist_id()
  order by r.created_at desc;
$$;

-- Only logged-in users may call these; each function re-checks the role.
revoke all on function public.submit_stockist_request(text, text, text) from public, anon;
revoke all on function public.approve_stockist_request(uuid, text)      from public, anon;
revoke all on function public.list_my_requests()                        from public, anon;
grant execute on function public.submit_stockist_request(text, text, text) to authenticated;
grant execute on function public.approve_stockist_request(uuid, text)      to authenticated;
grant execute on function public.list_my_requests()                        to authenticated;

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (optional — run one at a time after the script)
-- ════════════════════════════════════════════════════════════════════════

-- A) New column list (expect requesting_stockist_id, affiliate_name,
--    affiliate_email, description; no to_stockist_id or from_stockist_id).
-- select column_name, is_nullable from information_schema.columns
-- where table_schema = 'public' and table_name = 'stockist_requests'
-- order by ordinal_position;

-- B) Functions and their signatures (submit must be text, text, text).
-- select proname, pg_get_function_identity_arguments(oid) as args, prosecdef
-- from pg_proc
-- where pronamespace = 'public'::regnamespace
--   and proname in ('submit_stockist_request', 'approve_stockist_request',
--                   'reject_stockist_request', 'list_my_requests');

-- NOTE: auth.uid() is empty in the SQL editor, so the functions cannot be
-- tested here. Test them through the app (stockist submit, admin approve /
-- reject).