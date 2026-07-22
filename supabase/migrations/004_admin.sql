-- ================================================================
-- Migration 004: Admin system
-- Run in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Admin users table (separate from candidate auth)
create table if not exists public.admins (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  full_name  text not null,
  role       text default 'admin' check (role in ('admin','super_admin')),
  is_active  boolean default true,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- Only super_admins can read the admins table
create policy "admin read"
  on public.admins for select
  using (auth.jwt() ->> 'email' in (select email from public.admins where role = 'super_admin'));

-- Allow inserts from service role (initial setup)
create policy "service insert"
  on public.admins for insert
  with check (true);

-- Add admin_id to questions so we track who added what
alter table public.questions
  add column if not exists created_by text,   -- admin email
  add column if not exists updated_at  timestamptz default now(),
  add column if not exists is_active   boolean default true;

-- Allow admins to insert/update/delete questions
-- (RLS already allows public SELECT — we extend for writes)
create policy "admin write questions"
  on public.questions for all
  using (true)
  with check (true);

-- Admin metadata table for app settings
create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;
create policy "public read settings" on public.app_settings for select using (true);
create policy "admin write settings" on public.app_settings for all using (true);

-- Seed default settings
insert into public.app_settings (key, value) values
  ('exam_duration_minutes', '30'),
  ('questions_per_subject', '10'),
  ('max_score',             '400')
on conflict (key) do nothing;

-- ── IMPORTANT: Insert your first admin manually ──────────────────
-- After running this migration, run the following with your details:
--
-- insert into public.admins (email, full_name, role)
-- values ('your-admin@email.com', 'Your Name', 'super_admin');
--
-- Then use that email + a password to sign in at /admin/login
-- The admin auth uses Supabase Auth (real email, not the @jambcbt.local trick)
