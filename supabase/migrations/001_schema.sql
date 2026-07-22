-- ================================================================
-- JAMB CBT — Full Schema Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text not null default '',
  reg_number       text unique not null default '',
  contact_email    text,
  phone            text,
  date_of_birth    date,
  gender           text check (gender in ('Male','Female')),
  state_of_origin  text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);

-- ── subjects ─────────────────────────────────────────────────────
create table if not exists public.subjects (
  id         uuid primary key default uuid_generate_v4(),
  name       text unique not null,
  code       text unique not null,
  category   text not null,
  is_active  boolean default true,
  created_at timestamptz default now()
);
alter table public.subjects enable row level security;
create policy "public read subjects" on public.subjects for select using (true);

insert into public.subjects (name,code,category) values
  ('English Language',    'ENG','compulsory'),
  ('Mathematics',         'MTH','science'),
  ('Physics',             'PHY','science'),
  ('Chemistry',           'CHE','science'),
  ('Biology',             'BIO','science'),
  ('Agricultural Science','AGR','science'),
  ('Economics',           'ECO','commercial'),
  ('Commerce',            'COM','commercial'),
  ('Accounting',          'ACC','commercial'),
  ('Government',          'GOV','arts'),
  ('Literature in English','LIT','arts'),
  ('Geography',           'GEO','arts')
on conflict (code) do nothing;

-- ── questions ────────────────────────────────────────────────────
create table if not exists public.questions (
  id             uuid primary key default uuid_generate_v4(),
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  question_text  text not null,
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  correct_option char(1) not null check (correct_option in ('A','B','C','D')),
  explanation    text,
  difficulty     text default 'medium',
  year           int,
  created_at     timestamptz default now()
);
alter table public.questions enable row level security;
create policy "public read questions" on public.questions for select using (true);

-- ── exam_registrations ───────────────────────────────────────────
create table if not exists public.exam_registrations (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  course_group     text not null check (course_group in ('Science','Commercial','Arts')),
  subject_ids      uuid[] not null,
  status           text default 'registered' check (status in ('registered','in_progress','completed','abandoned')),
  registered_at    timestamptz default now(),
  exam_started_at  timestamptz,
  exam_ended_at    timestamptz,
  constraint unique_user_reg unique (user_id)
);
alter table public.exam_registrations enable row level security;
create policy "own registration" on public.exam_registrations for all using (auth.uid() = user_id);

-- ── exam_sessions ────────────────────────────────────────────────
create table if not exists public.exam_sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  registration_id   uuid not null references public.exam_registrations(id) on delete cascade,
  started_at        timestamptz default now(),
  submitted_at      timestamptz,
  time_remaining    int,
  is_auto_submitted boolean default false,
  total_score       numeric(6,2),
  max_score         numeric(6,2) default 400,
  constraint unique_session unique (registration_id)
);
alter table public.exam_sessions enable row level security;
create policy "own session" on public.exam_sessions for all using (auth.uid() = user_id);

-- ── exam_answers ─────────────────────────────────────────────────
create table if not exists public.exam_answers (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.exam_sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  subject_id      uuid not null references public.subjects(id) on delete cascade,
  selected_option char(1) check (selected_option in ('A','B','C','D')),
  is_correct      boolean,
  is_flagged      boolean default false,
  answered_at     timestamptz default now(),
  constraint unique_answer unique (session_id,question_id)
);
alter table public.exam_answers enable row level security;
create policy "own answers" on public.exam_answers for all using (auth.uid() = user_id);

-- ── subject_results ──────────────────────────────────────────────
create table if not exists public.subject_results (
  id               uuid primary key default uuid_generate_v4(),
  session_id       uuid not null references public.exam_sessions(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  questions_total  int not null,
  correct_count    int not null default 0,
  score            numeric(5,2) not null default 0,
  max_score        numeric(5,2) not null default 100,
  constraint unique_subject_result unique (session_id,subject_id)
);
alter table public.subject_results enable row level security;
create policy "own subject results" on public.subject_results for all using (auth.uid() = user_id);

-- ── invite_leads ─────────────────────────────────────────────────
create table if not exists public.invite_leads (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  first_name  text,
  invited_at  timestamptz default now(),
  registered  boolean default false,
  created_at  timestamptz default now()
);
alter table public.invite_leads enable row level security;
create policy "insert leads" on public.invite_leads for insert with check (true);
create policy "update leads" on public.invite_leads for update using (true);

-- ── Trigger: auto-create profile on signup ───────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,full_name,reg_number,contact_email,phone,date_of_birth,gender,state_of_origin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'reg_number',''),
    coalesce(new.raw_user_meta_data->>'contact_email',''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    nullif(new.raw_user_meta_data->>'date_of_birth','')::date,
    coalesce(new.raw_user_meta_data->>'gender',''),
    coalesce(new.raw_user_meta_data->>'state_of_origin','')
  )
  on conflict (id) do update set
    full_name=excluded.full_name, reg_number=excluded.reg_number,
    contact_email=excluded.contact_email, phone=excluded.phone,
    date_of_birth=excluded.date_of_birth, gender=excluded.gender,
    state_of_origin=excluded.state_of_origin, updated_at=now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Trigger: mark lead as registered ─────────────────────────────
create or replace function public.mark_lead_registered()
returns trigger language plpgsql security definer as $$
begin
  update public.invite_leads set registered=true
  where email=lower(new.contact_email) and registered=false;
  return new;
end;
$$;

drop trigger if exists on_profile_created_mark_lead on public.profiles;
create trigger on_profile_created_mark_lead
  after insert on public.profiles for each row
  when (new.contact_email is not null and new.contact_email != '')
  execute procedure public.mark_lead_registered();
