-- Create a profile and initial mastery rows whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'role' = 'instructor'
      then 'instructor'::public.user_role
      else 'student'::public.user_role
    end
  ) on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'role', 'student') = 'student' then
    insert into public.student_mastery (student_id, skill, probability)
    select new.id, skill, 0.30
    from unnest(array['variables','conditionals','loops','lists','functions']) as skill
    on conflict (student_id, skill) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Avoid recursive profile RLS checks by resolving instructor status in a
-- security-definer helper that callers cannot alter.
create or replace function public.is_instructor()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'instructor'
  );
$$;

revoke all on function public.is_instructor() from public;
grant execute on function public.is_instructor() to authenticated;

drop policy if exists "students read own profile" on public.profiles;
create policy "profiles visible to owner or instructor"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_instructor());

drop policy if exists "students insert own submissions" on public.submissions;
create policy "students insert own submissions"
  on public.submissions for insert to authenticated
  with check (student_id = (select auth.uid()));

drop policy if exists "submissions visible to owner or instructor" on public.submissions;
create policy "submissions visible to owner or instructor"
  on public.submissions for select to authenticated
  using (student_id = (select auth.uid()) or public.is_instructor());

drop policy if exists "mastery visible to owner or instructor" on public.student_mastery;
create policy "mastery visible to owner or instructor"
  on public.student_mastery for select to authenticated
  using (student_id = (select auth.uid()) or public.is_instructor());

create policy "students update own mastery"
  on public.student_mastery for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

grant select on public.assignments to authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.submissions to authenticated;
grant select, update on public.student_mastery to authenticated;

create index if not exists submissions_student_submitted_idx
  on public.submissions (student_id, submitted_at desc);
create index if not exists submissions_assignment_idx
  on public.submissions (assignment_id);
