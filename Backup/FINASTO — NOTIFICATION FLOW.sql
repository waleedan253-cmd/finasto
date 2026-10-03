create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_created_at_idx
  on public.notifications (created_at desc);

alter table public.notifications enable row level security;

create policy "notifications select" on public.notifications
  for select to authenticated using (true);

create policy "notifications insert" on public.notifications
  for insert to authenticated with check (true);

create policy "notifications update" on public.notifications
  for update to authenticated using (true);

create policy "notifications delete" on public.notifications
  for delete to authenticated using (true);