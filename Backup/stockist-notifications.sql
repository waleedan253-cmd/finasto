-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — STOCKIST NOTIFICATIONS (bulk orders + affiliate requests)
-- ════════════════════════════════════════════════════════════════════════
--
-- What it does
--   Whenever an admin moves a stockist's bulk order or affiliate request to
--   a new step, the stockist gets a notification in their bell.
--
-- How
--   Two database TRIGGERS watch the status column. A trigger runs inside the
--   same transaction as the change, so:
--     * a notification can never be missing for a change that was saved;
--     * a notification can never exist for a change that was rolled back;
--     * no existing function (quote_bulk_order, approve_bulk_payment,
--       approve_stockist_request, ...) has to be edited, and any future
--       code path that changes the status is covered too.
--   A failure while writing the notification is swallowed on purpose, so a
--   notification problem can never block the admin's action.
--
-- Events (the stockist's own actions never notify the stockist)
--   Bulk order
--     requested          -> awaiting_payment   "Bank details ready"
--     requested          -> rejected           "Order rejected" (+ reason)
--     payment_submitted  -> awaiting_payment   "Payment proof returned" (+ reason)
--     payment_submitted  -> approved           "Order approved"
--     awaiting_payment / payment_submitted -> cancelled   "Order cancelled" (+ reason)
--   Affiliate request
--     pending -> approved                      "Affiliate request approved"
--     pending -> rejected                      "Affiliate request rejected" (+ note)
--
-- Assumptions (check if a notification does not appear)
--   * notifications has: recipient_id (auth user id), type, title, message,
--     link, is_read. recipient_id NULL means "for admins" (as in your admin
--     bell); a stockist notification uses stockists.profile_id.
--   * Bulk order links go to /stockist/bulk-orders/<order id>.
--
-- Run: paste the whole file into the Supabase SQL editor and run it once.
-- Safe to run again. Runs as ONE transaction.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Pre-flight checks
-- ────────────────────────────────────────────────────────────────────────
do $$
declare
  v_dtype text;
begin
  if to_regclass('public.notifications') is null then
    raise exception 'Table public.notifications is missing.';
  end if;
  if to_regclass('public.bulk_orders') is null then
    raise exception 'Table public.bulk_orders is missing. Run the bulk orders SQL first.';
  end if;
  if to_regclass('public.stockist_requests') is null then
    raise exception 'Table public.stockist_requests is missing. Run requests-flow.sql first.';
  end if;

  select data_type into v_dtype
  from information_schema.columns
  where table_schema = 'public' and table_name = 'notifications'
    and column_name = 'type';
  if v_dtype is null then
    raise exception 'notifications.type column not found.';
  end if;
  if v_dtype = 'USER-DEFINED' then
    raise exception 'notifications.type is an enum, not text. Paste its definition and I will adapt this file.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications'
      and column_name = 'recipient_id'
  ) then
    raise exception 'notifications.recipient_id is missing.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) Allow the new notification types
--    Replaces any CHECK on notifications.type with one list: every type the
--    app already uses (from notifications.ts) plus the new stockist types.
-- ────────────────────────────────────────────────────────────────────────
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.notifications'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
  loop
    execute format('alter table public.notifications drop constraint %I', c.conname);
  end loop;

  alter table public.notifications
    add constraint notifications_type_check
    check (type in (
      'low_stock', 'new_order', 'withdrawal_request', 'stockist_request',
      'payout_requested', 'payout_approved', 'payout_rejected', 'payout_paid',
      'affiliate_new_order',
      -- new: stockist bulk orders
      'bulk_order_quoted', 'bulk_order_rejected', 'bulk_order_returned',
      'bulk_order_approved', 'bulk_order_cancelled',
      -- new: stockist affiliate requests
      'request_approved', 'request_rejected'
    ));
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 2) A stockist may read, mark read and clear ONLY their own notifications
--    (the same rule the affiliate bell uses). Inserts happen only inside the
--    trigger functions below; there is no insert policy on purpose.
-- ────────────────────────────────────────────────────────────────────────
drop policy if exists "stockist reads own notifications" on public.notifications;
create policy "stockist reads own notifications"
  on public.notifications for select
  using (public.is_stockist() and recipient_id = auth.uid());

drop policy if exists "stockist updates own notifications" on public.notifications;
create policy "stockist updates own notifications"
  on public.notifications for update
  using (public.is_stockist() and recipient_id = auth.uid())
  with check (public.is_stockist() and recipient_id = auth.uid());

drop policy if exists "stockist deletes own notifications" on public.notifications;
create policy "stockist deletes own notifications"
  on public.notifications for delete
  using (public.is_stockist() and recipient_id = auth.uid());


-- ────────────────────────────────────────────────────────────────────────
-- 3) Helper: write one notification for a stockist
--    Internal only: no one can call it from the browser. A stockist with no
--    login yet (profile_id is null) has no bell, so nothing is written.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.notify_stockist(
  p_stockist_id uuid,
  p_type        text,
  p_title       text,
  p_message     text,
  p_link        text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
begin
  select s.profile_id into v_recipient
  from public.stockists s
  where s.id = p_stockist_id;

  if v_recipient is null then
    return;
  end if;

  begin
    insert into public.notifications (recipient_id, type, title, message, link)
    values (v_recipient, p_type, p_title, left(p_message, 500), p_link);
  exception
    when others then
      -- Never block the admin's action because of a notification.
      raise warning 'notify_stockist failed: %', sqlerrm;
  end;
end;
$$;

revoke all on function public.notify_stockist(uuid, text, text, text, text)
  from public, anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────
-- 4) Trigger: bulk order status changes
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.trg_notify_bulk_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num  text := 'BO-' || lpad(new.number::text, 6, '0');
  v_link text := '/stockist/bulk-orders/' || new.id::text;
  v_note text := nullif(btrim(coalesce(new.admin_note, '')), '');
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.status = 'requested' and new.status = 'awaiting_payment' then
    perform public.notify_stockist(
      new.stockist_id, 'bulk_order_quoted', 'Bank details ready',
      v_num || ' was verified. Send your payment and upload the proof.',
      v_link);

  elsif old.status = 'requested' and new.status = 'rejected' then
    perform public.notify_stockist(
      new.stockist_id, 'bulk_order_rejected', 'Order rejected',
      v_num || ' was rejected.' || coalesce(' Reason: ' || v_note, ''),
      v_link);

  elsif old.status = 'payment_submitted' and new.status = 'awaiting_payment' then
    perform public.notify_stockist(
      new.stockist_id, 'bulk_order_returned', 'Payment proof returned',
      'Please upload a new proof for ' || v_num || '.'
        || coalesce(' ' || v_note, ''),
      v_link);

  elsif old.status = 'payment_submitted' and new.status = 'approved' then
    perform public.notify_stockist(
      new.stockist_id, 'bulk_order_approved', 'Order approved',
      v_num || ' was approved. The packs are now in your inventory.',
      v_link);

  elsif old.status in ('awaiting_payment', 'payment_submitted')
        and new.status = 'cancelled' then
    perform public.notify_stockist(
      new.stockist_id, 'bulk_order_cancelled', 'Order cancelled',
      v_num || ' was cancelled.' || coalesce(' Reason: ' || v_note, ''),
      v_link);
  end if;

  return new;
end;
$$;

drop trigger if exists bulk_orders_notify_stockist on public.bulk_orders;
create trigger bulk_orders_notify_stockist
  after update of status on public.bulk_orders
  for each row execute function public.trg_notify_bulk_order_status();


-- ────────────────────────────────────────────────────────────────────────
-- 5) Trigger: affiliate request decisions
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.trg_notify_request_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_note text := nullif(btrim(coalesce(new.admin_note, '')), '');
begin
  if old.status <> 'pending' or new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'approved' then
    perform public.notify_stockist(
      new.requesting_stockist_id, 'request_approved',
      'Affiliate request approved',
      new.affiliate_name || ' is now assigned to you.',
      '/stockist/requests');

  elsif new.status = 'rejected' then
    perform public.notify_stockist(
      new.requesting_stockist_id, 'request_rejected',
      'Affiliate request rejected',
      'Your request for ' || new.affiliate_name || ' was rejected.'
        || coalesce(' Reason: ' || v_note, ''),
      '/stockist/requests');
  end if;

  return new;
end;
$$;

drop trigger if exists stockist_requests_notify_stockist on public.stockist_requests;
create trigger stockist_requests_notify_stockist
  after update of status on public.stockist_requests
  for each row execute function public.trg_notify_request_status();

commit;

notify pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION (optional, run one at a time)
-- ════════════════════════════════════════════════════════════════════════

-- A) Both triggers exist:
-- select tgname, tgrelid::regclass as on_table
-- from pg_trigger
-- where tgname in ('bulk_orders_notify_stockist', 'stockist_requests_notify_stockist');

-- B) After you approve or reject something in the app, the stockist's
--    notification should be here (newest first):
-- select n.type, n.title, n.message, n.link, n.is_read, n.created_at
-- from public.notifications n
-- where n.recipient_id is not null
-- order by n.created_at desc
-- limit 10;