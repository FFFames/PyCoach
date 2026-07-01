create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'instructor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.assignments (
  id text primary key,
  title text not null,
  description text not null,
  starter_code text not null,
  difficulty text not null check (difficulty in ('Beginner','Intermediate')),
  skill text not null check (skill in ('variables','conditionals','loops','lists','functions')),
  tests jsonb not null default '[]'::jsonb,
  rubric text not null default '',
  reference_solution text not null default '',
  hidden_tests jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint assignments_tests_are_arrays
    check (jsonb_typeof(tests) = 'array' and jsonb_typeof(hidden_tests) = 'array')
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id text not null references public.assignments(id),
  code text not null,
  grade smallint not null check (grade between 0 and 100),
  feedback text not null,
  submitted_at timestamptz not null default now()
);

create table public.student_mastery (
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null check (skill in ('variables','conditionals','loops','lists','functions')),
  probability numeric(6,5) not null default 0.30 check (probability between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (student_id, skill)
);

alter table public.profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.student_mastery enable row level security;

create policy "assignments readable by authenticated users" on public.assignments for select to authenticated using (true);
create policy "students read own profile" on public.profiles for select to authenticated using (id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='instructor'));
create policy "students insert own submissions" on public.submissions for insert to authenticated with check (student_id=auth.uid());
create policy "submissions visible to owner or instructor" on public.submissions for select to authenticated using (student_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='instructor'));
create policy "mastery visible to owner or instructor" on public.student_mastery for select to authenticated using (student_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='instructor'));

grant select (id, title, description, starter_code, difficulty, skill, tests, created_at)
  on public.assignments to authenticated;
