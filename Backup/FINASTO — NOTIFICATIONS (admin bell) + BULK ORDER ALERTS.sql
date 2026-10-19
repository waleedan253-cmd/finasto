-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — allow the two new admin bulk-order notification types
-- Keeps all 16 existing types exactly as they are and adds:
--   bulk_order_request      (a stockist submitted a bulk order request)
--   bulk_payment_submitted  (a stockist uploaded proof of payment)
-- Safe to run again. Every existing row stays valid, because the new list
-- contains the whole old list.
-- ════════════════════════════════════════════════════════════════════════

begin;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type = any (array[
    'low_stock',
    'new_order',
    'withdrawal_request',
    'stockist_request',
    'payout_requested',
    'payout_approved',
    'payout_rejected',
    'payout_paid',
    'affiliate_new_order',
    'bulk_order_quoted',
    'bulk_order_rejected',
    'bulk_order_returned',
    'bulk_order_approved',
    'bulk_order_cancelled',
    'request_approved',
    'request_rejected',
    -- new
    'bulk_order_request',
    'bulk_payment_submitted'
  ]));

commit;

notify pgrst, 'reload schema';

-- ── Verify (run one at a time) ──────────────────────────────────────────
-- 1) This test insert should now succeed (before the fix it failed):
-- insert into public.notifications (type, title, message, link)
-- values ('bulk_order_request', 'Test', 'Test message', '/admin/bulk-orders');
-- Then delete the test row:
-- delete from public.notifications where title = 'Test' and message = 'Test message';
--
-- 2) Both triggers are attached to bulk_orders:
-- select tgname, tgenabled from pg_trigger
-- where tgrelid = 'public.bulk_orders'::regclass and not tgisinternal;
-- (you should see bulk_orders_notify_new and bulk_orders_notify_payment)