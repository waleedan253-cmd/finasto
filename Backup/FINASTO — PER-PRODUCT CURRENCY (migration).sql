-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — PER-PRODUCT CURRENCY (migration)
-- Run once in the Supabase SQL editor. Safe to re-run. Drops no data.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- 1) products.currency_code
--    Every existing product was priced in USD, so DEFAULT 'USD' keeps all
--    current prices correct without touching any row.
alter table public.products
  add column if not exists currency_code text not null default 'USD';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_currency_code_format'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_currency_code_format
      check (currency_code = upper(currency_code) and length(currency_code) = 3);
  end if;
end $$;

-- 2) Only supported currencies are allowed: USD, or one that has a row in
--    currency_rates. A trigger is used instead of a foreign key because
--    USD has no row there (and must not get one: the cron job and getRates()
--    treat USD as the implicit base).
create or replace function public.check_product_currency()
returns trigger
language plpgsql
as $$
begin
  if new.currency_code <> 'USD'
     and not exists (
       select 1 from public.currency_rates r
       where r.currency_code = new.currency_code
     ) then
    raise exception 'Unsupported currency: %', new.currency_code
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists products_check_currency on public.products;
create trigger products_check_currency
  before insert or update of currency_code on public.products
  for each row execute function public.check_product_currency();

-- 3) Order snapshot. Each line records what the admin priced it at, in
--    which currency, and the rate used to get unit_price (USD), so later
--    rate changes never alter history. Nullable: old rows have no snapshot.
alter table public.order_items
  add column if not exists original_unit_price numeric(12,2),
  add column if not exists price_currency      text,
  add column if not exists rate_used           numeric;

-- 4) Make sure every currency the code already mentions has a rate row.
--    PHP is in COUNTRY_CURRENCY and SYMBOLS but was missing from the seed.
--    Stamped 'epoch' so it counts as expired until the cron job fills it.
insert into public.currency_rates (currency_code, rate_to_base, updated_at)
values ('PHP', 0.017, 'epoch')
on conflict (currency_code) do nothing;

commit;

-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION (run one at a time after the script)
-- ════════════════════════════════════════════════════════════════════════

-- A) Every product has a currency (all USD right after the migration).
-- select currency_code, count(*) from public.products group by 1;

-- B) The trigger blocks an unsupported code. This should FAIL with
--    "Unsupported currency: XXX".
-- update public.products set currency_code = 'XXX' where false;  -- no-op
-- (to truly test, run it on one real id, then confirm the error)

-- C) New order_items columns exist.
-- select column_name from information_schema.columns
-- where table_name = 'order_items'
--   and column_name in ('original_unit_price','price_currency','rate_used');