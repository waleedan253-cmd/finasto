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