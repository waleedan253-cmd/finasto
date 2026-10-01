-- ════════════════════════════════════════════════════════════════════════
-- FINASTO — PRODUCT FLOW: complete database setup (production-ready)
-- ════════════════════════════════════════════════════════════════════════
--
-- Scope: everything the product flow needs and nothing else (admin product
-- create/edit, shop + home cards, offers, multi-currency prices, rates job).
-- The dashboard function (admin_dashboard) is NOT part of this file.
--
-- How to run
--   Paste the whole file into the Supabase SQL editor and run it once.
--   It is IDEMPOTENT: safe on a fresh database AND on your current one, and
--   safe to run again. It never drops data. The only destructive statement
--   is dropping the unused products.slug column (step 3).
--   It runs as ONE transaction: if any step fails, nothing is applied.
--
-- Prerequisite (checked in step 0)
--   public.is_admin() must already exist (it is used by every policy).
--
-- Money rule used everywhere
--   Prices are stored once, in USD (the base currency). Other currencies
--   are converted at read time using currency_rates. Admins never type
--   local-currency prices unless they use product_country_prices.
-- ════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────
-- 0) Prerequisite check — fail early with a clear message
-- ────────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception
      'public.is_admin() is missing. Create it first; every policy in this file depends on it.';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- 1) Shared helper — keeps updated_at current automatically
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────────────────
-- 2) countries — markets Finasto sells into
--    Used by product_country_prices (optional fixed local prices).
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.countries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique
                  check (code = upper(code) and length(code) = 2),
  currency_code text not null
                  check (currency_code = upper(currency_code) and length(currency_code) = 3),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.countries enable row level security;

drop policy if exists "anyone can read active countries" on public.countries;
create policy "anyone can read active countries"
  on public.countries for select
  using (active = true or public.is_admin());

drop policy if exists "admin manages countries" on public.countries;
create policy "admin manages countries"
  on public.countries for all
  using (public.is_admin())
  with check (public.is_admin());

-- Launch market. Add a row per market you expand into, for example:
--   insert into public.countries (name, code, currency_code)
--   values ('Pakistan', 'PK', 'PKR') on conflict (code) do nothing;
insert into public.countries (name, code, currency_code, active)
values ('Indonesia', 'ID', 'IDR', true)
on conflict (code) do nothing;


-- ────────────────────────────────────────────────────────────────────────
-- 3) products — one row per product (what the shop card shows)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text not null default '',
  category          text,
  status            text not null default 'draft'
                      check (status in ('active','disabled','draft')),
  -- Kept for compatibility. The homepage now uses active offers instead.
  featured          boolean not null default false,

  -- Card content entered by the admin
  tagline           text[] not null default '{}',
  short_description text   not null default '',
  features          text[] not null default '{}',
  origin            text,
  tasting_note      text,
  accent_color      text not null default '#2f855a'
                      check (accent_color ~ '^#[0-9a-fA-F]{6}$'),

  -- SEO
  meta_title        text,
  meta_description  text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Upgrade path for databases created before these columns existed.
-- (No-ops on a fresh database.)
alter table public.products
  add column if not exists tagline           text[] not null default '{}',
  add column if not exists short_description text   not null default '',
  add column if not exists features          text[] not null default '{}',
  add column if not exists origin            text,
  add column if not exists tasting_note      text,
  add column if not exists accent_color      text not null default '#2f855a'
    check (accent_color ~ '^#[0-9a-fA-F]{6}$');

-- Product URLs use the id now, so the slug column is no longer needed.
-- (Dropping it also removes its unique index and check constraint.)
alter table public.products drop column if exists slug;

create index if not exists products_status_idx     on public.products (status);
create index if not exists products_category_idx   on public.products (category);
-- Shop and home pages list active products newest first.
create index if not exists products_active_created_idx
  on public.products (created_at desc) where status = 'active';

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

-- Visitors only ever see active products. Admins see everything.
drop policy if exists "anyone can read active products" on public.products;
create policy "anyone can read active products"
  on public.products for select
  using (status = 'active' or public.is_admin());

drop policy if exists "admin manages products" on public.products;
create policy "admin manages products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 4) product_variants — packs, each with its own price, stock and offer
--    name   = the pack label shown in the admin ("20 Bags", "250g Pouch")
--    sku    = generated by the server on first save, never typed by hand
--    price  = USD. weight = grams.
--    Offer  = sale_price valid only between sale_starts_at and sale_ends_at
--             (exact moments in UTC; the shop applies them, so every
--             country sees the offer start and stop at the same instant).
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  name           text not null,
  sku            text not null unique,
  price          numeric(12,2) not null check (price >= 0),
  sale_price     numeric(12,2) check (sale_price is null or sale_price >= 0),
  sale_starts_at timestamptz,
  sale_ends_at   timestamptz,
  stock          integer not null default 0 check (stock >= 0),
  weight         numeric(10,2) check (weight is null or weight >= 0),
  status         text not null default 'active'
                   check (status in ('active','disabled','draft')),
  created_at     timestamptz not null default now()
);

-- Upgrade path for databases created before offers existed.
alter table public.product_variants
  add column if not exists sale_starts_at timestamptz,
  add column if not exists sale_ends_at   timestamptz;

-- Offer rules enforced by the database itself (the app validates too).
-- NOT VALID = checked for every new insert/update, but old rows are not
-- re-checked, so this never fails on existing data. To also verify old
-- rows later, run once:
--   alter table public.product_variants validate constraint sale_window_valid;
--   alter table public.product_variants validate constraint sale_below_price;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sale_window_valid'
      and conrelid = 'public.product_variants'::regclass
  ) then
    -- An offer price needs a start and an end, and the end must be later.
    alter table public.product_variants
      add constraint sale_window_valid check (
        sale_price is null
        or (sale_starts_at is not null
            and sale_ends_at is not null
            and sale_ends_at > sale_starts_at)
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'sale_below_price'
      and conrelid = 'public.product_variants'::regclass
  ) then
    -- An offer must actually be cheaper than the regular price.
    alter table public.product_variants
      add constraint sale_below_price check (
        sale_price is null or sale_price < price
      ) not valid;
  end if;
end $$;

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

alter table public.product_variants enable row level security;

-- Visitors only see active variants of active products.
drop policy if exists "anyone can read variants of visible products" on public.product_variants;
create policy "anyone can read variants of visible products"
  on public.product_variants for select
  using (
    public.is_admin()
    or (
      status = 'active'
      and exists (
        select 1 from public.products p
        where p.id = product_id and p.status = 'active'
      )
    )
  );

drop policy if exists "admin manages variants" on public.product_variants;
create policy "admin manages variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 5) product_images — references to files in Supabase Storage
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  url          text not null,
  storage_path text not null,
  alt          text not null default '',
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id);

-- At most one primary image per product.
create unique index if not exists product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary;

alter table public.product_images enable row level security;

drop policy if exists "anyone can read images of visible products" on public.product_images;
create policy "anyone can read images of visible products"
  on public.product_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

drop policy if exists "admin manages images" on public.product_images;
create policy "admin manages images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 6) product_country_prices — OPTIONAL fixed price for one market
--    When a row exists and is active, it wins over the converted price.
--    (The admin panel for this is currently switched off.)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.product_country_prices (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  price      numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, country_id)
);

create index if not exists product_country_prices_product_id_idx
  on public.product_country_prices (product_id);

alter table public.product_country_prices enable row level security;

drop policy if exists "anyone can read active country prices" on public.product_country_prices;
create policy "anyone can read active country prices"
  on public.product_country_prices for select
  using (
    public.is_admin()
    or (
      active = true
      and exists (
        select 1 from public.products p
        where p.id = product_id and p.status = 'active'
      )
    )
  );

drop policy if exists "admin manages country prices" on public.product_country_prices;
create policy "admin manages country prices"
  on public.product_country_prices for all
  using (public.is_admin())
  with check (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────
-- 7) currency_rates — one row per supported currency
--    rate_to_base = how many USD equal ONE unit of the currency
--                   (IDR ≈ 0.00006, GBP ≈ 1.3). USD needs no row.
--    The daily cron route (/api/cron/rates) updates ONLY the currencies
--    that already have a row here, so this table is the list of
--    currencies the shop supports.
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.currency_rates (
  currency_code text primary key
    check (currency_code = upper(currency_code) and length(currency_code) = 3),
  rate_to_base  numeric not null check (rate_to_base > 0),
  updated_at    timestamptz not null default now()
);

alter table public.currency_rates enable row level security;

-- Rates are public information: the shop needs them for every visitor.
drop policy if exists "anyone can read rates" on public.currency_rates;
create policy "anyone can read rates"
  on public.currency_rates for select
  using (true);

-- Admins may correct a rate by hand. The cron job uses the service-role
-- key, which bypasses RLS, so no public write policy is ever needed.
drop policy if exists "admin manages rates" on public.currency_rates;
create policy "admin manages rates"
  on public.currency_rates for all
  using (public.is_admin())
  with check (public.is_admin());

-- Supported currencies. The numbers are PLACEHOLDERS and are deliberately
-- stamped 'epoch' (very old), so the shop treats them as expired and never
-- shows them as live prices. The first run of the cron job replaces them
-- with real rates. Existing rows are never overwritten here.
insert into public.currency_rates (currency_code, rate_to_base, updated_at) values
  ('IDR', 0.000062, 'epoch'),
  ('MYR', 0.23,     'epoch'),
  ('PKR', 0.0036,   'epoch'),
  ('GBP', 1.3,      'epoch'),
  ('AED', 0.2723,   'epoch'),
  ('EUR', 1.15,     'epoch'),
  ('SGD', 0.78,     'epoch'),
  ('JPY', 0.0068,   'epoch')
on conflict (currency_code) do nothing;


-- ────────────────────────────────────────────────────────────────────────
-- 8) currency_rates_history — every accepted rate, for audits and refunds
--    Written only by the cron job. RLS is on with NO policies on purpose:
--    only the service-role key can read or write it.
--    (To show history in the admin later, add a select policy for
--    public.is_admin().)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.currency_rates_history (
  id                  bigint generated always as identity primary key,
  currency_code       text not null,
  rate_to_base        numeric not null check (rate_to_base > 0),
  provider_updated_at timestamptz not null,
  fetched_at          timestamptz not null default now()
);

create index if not exists currency_rates_history_code_idx
  on public.currency_rates_history (currency_code, fetched_at desc);

alter table public.currency_rates_history enable row level security;


-- ────────────────────────────────────────────────────────────────────────
-- 9) Storage — public bucket for product images
--    Anyone can view images; only admins can upload, replace or delete.
--    Limits: 5 MB per file, common web image types only.
-- ────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "admin uploads product images" on storage.objects;
create policy "admin uploads product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin updates product images" on storage.objects;
create policy "admin updates product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin deletes product images" on storage.objects;
create policy "admin deletes product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

commit;


-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (optional — run one at a time after the script)
-- ════════════════════════════════════════════════════════════════════════

-- A) Columns the app expects (products must NOT list "slug").
-- select table_name, column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name in ('products','product_variants','product_images',
--                      'product_country_prices','countries')
-- order by table_name, ordinal_position;

-- B) Policies. currency_rates should show: public select + admin all only.
-- select tablename, policyname, cmd, roles
-- from pg_policies
-- where tablename in ('products','product_variants','product_images',
--                     'product_country_prices','countries','currency_rates',
--                     'currency_rates_history')
-- order by tablename, policyname;

-- C) Rate freshness. After the first cron run every row should be recent.
-- select currency_code, rate_to_base, updated_at,
--        now() - updated_at as age
-- from public.currency_rates
-- order by currency_code;

-- D) Offers currently running in the shop.
-- select p.name, v.name as pack, v.price, v.sale_price,
--        v.sale_starts_at, v.sale_ends_at
-- from public.product_variants v
-- join public.products p on p.id = v.product_id
-- where v.sale_price is not null
--   and v.sale_starts_at <= now() and now() < v.sale_ends_at;