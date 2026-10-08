-- ════════════════════════════════════════════════════════════════════════
-- PAYOUT NOTIFICATIONS
-- Run AFTER payouts.sql. Safe to re-run. One transaction.
--
-- recipient_id: NULL = admin notification (all existing rows stay admin).
--               a user id = that affiliate's own notification.
-- A trigger on payout_events creates the notifications, so every status
-- change (request, approve, reject, paid) is covered with no change to
-- the payout functions.
-- ════════════════════════════════════════════════════════════════════════

begin;

alter table public.notifications
  add column if not exists recipient_id uuid
    references auth.users(id) on delete cascade;

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);

-- Replace the open policies (using true) with owner-based ones.
drop policy if exists "notifications select" on public.notifications;
drop policy if exists "notifications insert" on public.notifications;
drop policy if exists "notifications update" on public.notifications;
drop policy if exists "notifications delete" on public.notifications;

-- Admin sees admin notifications. A user sees only their own.
create policy "notifications select" on public.notifications
  for select to authenticated
  using (
    (recipient_id is null and public.is_admin())
    or recipient_id = (select auth.uid())
  );

-- Same rule as today (any signed-in user can raise an ADMIN notification),
-- but nobody can write a notification addressed to another user.
create policy "notifications insert" on public.notifications
  for insert to authenticated
  with check (recipient_id is null);

create policy "notifications update" on public.notifications
  for update to authenticated
  using (
    (recipient_id is null and public.is_admin())
    or recipient_id = (select auth.uid())
  );

create policy "notifications delete" on public.notifications
  for delete to authenticated
  using (
    (recipient_id is null and public.is_admin())
    or recipient_id = (select auth.uid())
  );

-- ── Trigger: payout_events -> notifications ─────────────────────────────
create or replace function public.notify_on_payout_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req      public.payout_requests%rowtype;
  v_user     uuid;
  v_amount   text;
begin
  select * into v_req from public.payout_requests where id = new.payout_request_id;
  if not found then
    return new;
  end if;

  v_amount := 'USD ' || to_char(v_req.total_usd, 'FM999999990.00');

  select a.profile_id into v_user
  from public.affiliates a
  where a.id = v_req.affiliate_id;

  if new.event = 'requested' then
    -- To the admin.
    insert into public.notifications (type, title, message, link, recipient_id)
    values (
      'payout_requested',
      'New payout request',
      v_req.request_number || ' for ' || v_amount,
      '/admin/payouts/' || v_req.id,
      null
    );

  elsif new.event = 'approved' then
    insert into public.notifications (type, title, message, link, recipient_id)
    values (
      'payout_approved',
      'Payout request approved',
      v_req.request_number || ' (' || v_amount || ') was approved.',
      '/affiliate/payouts',
      v_user
    );

  elsif new.event = 'rejected' then
    insert into public.notifications (type, title, message, link, recipient_id)
    values (
      'payout_rejected',
      'Payout request rejected',
      v_req.request_number || ': ' || coalesce(new.note, 'No reason given.'),
      '/affiliate/payouts',
      v_user
    );

  elsif new.event = 'paid' then
    insert into public.notifications (type, title, message, link, recipient_id)
    values (
      'payout_paid',
      'Payout paid',
      v_req.request_number || ' (' || v_amount || ') has been paid.',
      '/affiliate/accounts',
      v_user
    );
  end if;

  return new;

exception
  when others then
    -- A failed notification must never block a payout action.
    return new;
end;
$$;

drop trigger if exists payout_events_notify on public.payout_events;
create trigger payout_events_notify
  after insert on public.payout_events
  for each row execute function public.notify_on_payout_event();

commit;