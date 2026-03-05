# Deploy to Vercel with Supabase

This app uses **Supabase** for auth (editors) and storage (app state). Viewers get read-only access without logging in; editors sign in with email/password to edit.

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration:

```sql
-- From supabase/migrations/20250305000000_initial_schema.sql
create table if not exists public.app_state (
  id text primary key default 'default',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "app_state_select"
  on public.app_state for select
  using (true);

create policy "app_state_insert"
  on public.app_state for insert
  to authenticated
  with check (true);

create policy "app_state_update"
  on public.app_state for update
  to authenticated
  using (true)
  with check (true);
```

3. In **Authentication → Providers**, ensure **Email** is enabled (default).
4. Create editor accounts: **Authentication → Users → Add user** (email + password). Only these users can edit; everyone else is read-only.
5. In **Settings → API**, copy **Project URL** and **anon public** key.

## 2. Environment variables

**Local:** Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` = Project URL  
- `VITE_SUPABASE_ANON_KEY` = anon key  

**Vercel:** In the project **Settings → Environment Variables**, add the same two variables for Production (and Preview if you want). Redeploy after saving.

## 3. Deploy to Vercel

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. Build settings are auto-detected (Vite). Deploy.
3. Add the Supabase env vars (step 2) and redeploy.

## 4. Behavior

- **Viewers (not logged in):** See all data (tracks, capacity, questions). No edit controls; timeline bars and capacity dots are not clickable.
- **Editors (signed in):** See “Log out” in the header; can edit date range, drag tracks, change capacity dots, and add/edit questions. Changes are written to Supabase (debounced) and to localStorage.
- **Data:** On load, the app reads from Supabase (`app_state.data`). If the row is empty or Supabase isn’t configured, it uses localStorage or in-code defaults. Only authenticated users can insert/update `app_state` (RLS).
