create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  message     text not null check (char_length(message) between 1 and 200),
  link        text,
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint announcements_dates_chk
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

alter table public.announcements enable row level security;

-- Visitors: only live announcements (active + inside the date window)
create policy "public reads live announcements"
  on public.announcements for select
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >  now())
  );

-- Admin: full access, including inactive and expired rows
create policy "admin manages announcements"
  on public.announcements for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );