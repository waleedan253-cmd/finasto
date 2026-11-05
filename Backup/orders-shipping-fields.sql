alter table public.orders
  add column if not exists customer_phone       text,
  add column if not exists shipping_line1       text,
  add column if not exists shipping_line2       text,
  add column if not exists shipping_city        text,
  add column if not exists shipping_state       text,
  add column if not exists shipping_postal_code text;

alter table public.orders drop constraint if exists orders_customer_phone_format;
alter table public.orders add constraint orders_customer_phone_format
  check (customer_phone is null or customer_phone ~ '^\+[1-9][0-9]{6,14}$');

alter table public.orders drop constraint if exists orders_shipping_lengths;
alter table public.orders add constraint orders_shipping_lengths
  check (
    char_length(coalesce(shipping_line1, ''))       <= 200 and
    char_length(coalesce(shipping_line2, ''))       <= 200 and
    char_length(coalesce(shipping_city, ''))        <= 100 and
    char_length(coalesce(shipping_state, ''))       <= 100 and
    char_length(coalesce(shipping_postal_code, '')) <= 20
  );

notify pgrst, 'reload schema';