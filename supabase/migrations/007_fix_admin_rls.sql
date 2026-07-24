-- ================================================================
-- Migration 007: Fix admin RLS so authenticated users can read
-- their own admin record during login verification
-- Run in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Drop the old restrictive policies
drop policy if exists "admin read"    on public.admins;
drop policy if exists "service insert" on public.admins;

-- Allow any authenticated user to read admins table
-- (login page checks if their email exists here after auth)
create policy "authenticated can read admins"
  on public.admins for select
  using (auth.role() = 'authenticated');

-- Allow insert (for setup — inserting your first admin via SQL)
create policy "service can insert admins"
  on public.admins for insert
  with check (true);

-- Allow super_admin to update/delete other admins
create policy "super_admin can manage admins"
  on public.admins for all
  using (
    exists (
      select 1 from public.admins
      where email = auth.jwt() ->> 'email'
      and role = 'super_admin'
      and is_active = true
    )
  );
