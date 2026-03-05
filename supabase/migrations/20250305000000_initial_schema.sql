-- Single table for app state: range, tracks, commitments, questions (same shape as frontend).
create table if not exists public.app_state (
  id text primary key default 'default',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Anyone (including anon) can read.
create policy "app_state_select"
  on public.app_state for select
  using (true);

-- Only authenticated users (editors) can insert or update.
create policy "app_state_insert"
  on public.app_state for insert
  to authenticated
  with check (true);

create policy "app_state_update"
  on public.app_state for update
  to authenticated
  using (true)
  with check (true);
