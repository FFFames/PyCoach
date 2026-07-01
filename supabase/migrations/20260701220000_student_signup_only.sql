-- Public signups are always students. Instructor access must be granted by an
-- administrator and cannot be requested through user-controlled auth metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    'student'::public.user_role
  ) on conflict (id) do nothing;

  insert into public.student_mastery (student_id, skill, probability)
  select new.id, skill, 0.30
  from unnest(array['variables','conditionals','loops','lists','functions']) as skill
  on conflict (student_id, skill) do nothing;

  return new;
end;
$$;
