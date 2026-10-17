-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — APPROVE CREATES THE AFFILIATE (migration)
-- ════════════════════════════════════════════════════════════════════════
--
-- Before: approving a request for an email that had no affiliate failed with
-- "No affiliate with this email exists yet", so the admin had to create the
-- affiliate first.
--
-- Now, ONE transaction does everything when the admin clicks Approve:
--   * email matches an existing affiliate -> it is reassigned to the
--     requesting stockist (as before);
--   * no affiliate has that email         -> the affiliate is CREATED from
--     what the stockist typed (name, email), assigned to the requesting
--     stockist, status 'active', with the commission % the admin confirms.
--   Either way: a history row is written and the request is marked approved.
--   If any step fails, nothing is saved.
--
-- The invite email is NOT sent here (a database function cannot call Supabase
-- Auth). The server action sends it right after this function commits, using
-- the existing inviteAffiliateUser(). If the invite fails, the approval stands
-- and the admin uses "Resend invite" from the affiliates list.
--
-- Run ON TOP of requests-claim-flow.sql. Do NOT run requests-claim-flow.sql
-- again afterwards: it would bring back the old approve_stockist_request().
-- Safe to run again. Runs as ONE transaction.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- The old two-argument version must go, or both would exist side by side.
drop function if exists public.approve_stockist_request(uuid, text);

create or replace function public.approve_stockist_request(
  p_request_id         uuid,
  p_note               text    default null,
  p_commission_percent numeric default 10
)
returns table (out_affiliate_id uuid, out_created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  r         public.stockist_requests%rowtype;
  v_aff     uuid;
  v_current uuid;
  v_created boolean := false;
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

  if not exists (
    select 1 from public.stockists
    where id = r.requesting_stockist_id and status = 'active'
  ) then
    raise exception 'The requesting stockist is no longer active';
  end if;

  -- Use the matched affiliate; if there was none at submit time, look the
  -- email up again (it may exist now).
  v_aff := r.affiliate_id;
  if v_aff is null then
    select a.id into v_aff
    from public.affiliates a
    where lower(btrim(a.email)) = r.affiliate_email
    limit 1;
  end if;

  if v_aff is null then
    -- No affiliate yet: create it, already assigned to the requester.
    if p_commission_percent is null
       or p_commission_percent < 0
       or p_commission_percent > 100 then
      raise exception 'Commission must be between 0 and 100';
    end if;

    begin
      insert into public.affiliates
        (name, email, stockist_id, status, commission_percent)
      values
        (r.affiliate_name, r.affiliate_email, r.requesting_stockist_id,
         'active', p_commission_percent)
      returning id into v_aff;

      v_created := true;
      v_current := null;  -- first assignment: nobody before
    exception
      when unique_violation then
        -- Someone created this email a moment ago; treat it as existing.
        select a.id into v_aff
        from public.affiliates a
        where lower(btrim(a.email)) = r.affiliate_email
        limit 1;
        if v_aff is null then
          raise exception 'Could not create the affiliate. Please try again.';
        end if;
    end;
  end if;

  if not v_created then
    -- Existing affiliate: lock it and read who owns it right now.
    select a.stockist_id into v_current
    from public.affiliates a where a.id = v_aff for update;

    if v_current is not distinct from r.requesting_stockist_id then
      raise exception 'This affiliate is already assigned to that stockist';
    end if;

    update public.affiliates
    set stockist_id = r.requesting_stockist_id
    where id = v_aff;
  end if;

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

  return query select v_aff, v_created;
end;
$$;

revoke all on function public.approve_stockist_request(uuid, text, numeric) from public, anon;
grant execute on function public.approve_stockist_request(uuid, text, numeric) to authenticated;

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERY (optional — run after the script)
-- ════════════════════════════════════════════════════════════════════════

-- Exactly ONE approve_stockist_request should exist, with args
-- (p_request_id uuid, p_note text, p_commission_percent numeric).
-- select proname, pg_get_function_identity_arguments(oid) as args, prosecdef
-- from pg_proc
-- where pronamespace = 'public'::regnamespace
--   and proname = 'approve_stockist_request';

-- NOTE: auth.uid() is empty in the SQL editor, so the function cannot be
-- tested here. Test it through the app (stockist submit, admin approve).