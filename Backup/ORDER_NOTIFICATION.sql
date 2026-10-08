-- ════════════════════════════════════════════════════════════════════════
-- AFFILIATE NEW-ORDER NOTIFICATION
-- Run AFTER payout-notifications.sql (needs notifications.recipient_id).
-- Safe to re-run. One transaction.
--
-- When an order that came through an affiliate's link becomes PAID, that
-- affiliate gets a notification. Paid, not created, so abandoned
-- checkouts never reach the bell.
-- orders.affiliate_id holds the affiliate's profile id, which is the same
-- id the affiliate bell filters on (recipient_id = signed-in user).
-- ════════════════════════════════════════════════════════════════════════

begin;

create or replace function public.notify_affiliate_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_commission numeric(12,2);
begin
  if new.affiliate_id is null then
    return new;
  end if;

  v_commission := round(
    coalesce(new.total_base, 0) * coalesce(new.affiliate_commission_percent, 0) / 100,
    2
  );

  -- No commission on this order: nothing worth telling the affiliate.
  if v_commission <= 0 then
    return new;
  end if;

  insert into public.notifications (type, title, message, link, recipient_id)
  values (
    'affiliate_new_order',
    'New order through your link',
    'Order ' || new.order_number || ' · commission USD '
      || to_char(v_commission, 'FM999999990.00'),
    '/affiliate/orders',
    new.affiliate_id
  );

  return new;

exception
  when others then
    -- A failed notification must never block the order.
    return new;
end;
$$;

-- Order created already paid.
drop trigger if exists orders_notify_affiliate_insert on public.orders;
create trigger orders_notify_affiliate_insert
  after insert on public.orders
  for each row
  when (new.payment_status = 'paid' and new.affiliate_id is not null)
  execute function public.notify_affiliate_on_paid_order();

-- Order that becomes paid later (the normal case).
drop trigger if exists orders_notify_affiliate_paid on public.orders;
create trigger orders_notify_affiliate_paid
  after update of payment_status on public.orders
  for each row
  when (
    new.payment_status = 'paid'
    and old.payment_status is distinct from 'paid'
    and new.affiliate_id is not null
  )
  execute function public.notify_affiliate_on_paid_order();

commit;