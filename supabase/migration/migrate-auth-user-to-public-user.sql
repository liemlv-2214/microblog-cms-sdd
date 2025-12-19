insert into public.users (id, email, created_at)
select id, email, created_at
from auth.users
on conflict (id) do nothing;
