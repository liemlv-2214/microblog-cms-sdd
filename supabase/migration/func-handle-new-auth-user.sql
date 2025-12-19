create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, created_at)
  values (
    new.id,
    new.email,
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
