-- ================================================================
-- Migration 003: Invite access token + guest_sessions
-- Run in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Add token columns to invite_leads
alter table public.invite_leads
  add column if not exists access_token  text unique,
  add column if not exists token_used_at timestamptz,
  add column if not exists expires_at    timestamptz,
  add column if not exists course_group  text,
  add column if not exists subject_ids   uuid[];

create index if not exists idx_invite_leads_token on public.invite_leads (access_token);

-- Allow reading leads by token (public — validated server-side)
drop policy if exists "read lead by token" on public.invite_leads;
create policy "read lead by token"
  on public.invite_leads for select using (true);

-- Guest exam sessions — for students who access via invite token only
-- (no Supabase auth account needed)
create table if not exists public.guest_sessions (
  id               uuid primary key default uuid_generate_v4(),
  lead_id          uuid not null references public.invite_leads(id) on delete cascade,
  first_name       text,
  email            text,
  course_group     text not null,
  subject_ids      uuid[] not null,
  started_at       timestamptz default now(),
  submitted_at     timestamptz,
  time_remaining   int,
  is_auto_submitted boolean default false,
  total_score      numeric(6,2),
  max_score        numeric(6,2) default 400,
  constraint unique_guest_session unique (lead_id)
);

alter table public.guest_sessions enable row level security;
-- Guest sessions are read/written via service-role API routes only
create policy "allow all on guest_sessions" on public.guest_sessions for all using (true);

-- Guest answers
create table if not exists public.guest_answers (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.guest_sessions(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  subject_id      uuid not null references public.subjects(id) on delete cascade,
  selected_option char(1) check (selected_option in ('A','B','C','D')),
  is_correct      boolean,
  is_flagged      boolean default false,
  answered_at     timestamptz default now(),
  constraint unique_guest_answer unique (session_id, question_id)
);

alter table public.guest_answers enable row level security;
create policy "allow all on guest_answers" on public.guest_answers for all using (true);

-- Guest subject results
create table if not exists public.guest_subject_results (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.guest_sessions(id) on delete cascade,
  subject_id      uuid not null references public.subjects(id) on delete cascade,
  questions_total int not null,
  correct_count   int not null default 0,
  score           numeric(5,2) not null default 0,
  max_score       numeric(5,2) not null default 100,
  constraint unique_guest_subject_result unique (session_id, subject_id)
);

alter table public.guest_subject_results enable row level security;
create policy "allow all on guest_subject_results" on public.guest_subject_results for all using (true);
