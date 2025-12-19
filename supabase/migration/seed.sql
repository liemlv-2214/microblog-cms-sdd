-- =========================
-- Seed Categories
-- =========================
insert into categories (id, name, slug)
values
  (gen_random_uuid(), 'Backend', 'backend'),
  (gen_random_uuid(), 'Frontend', 'frontend'),
  (gen_random_uuid(), 'DevOps', 'devops')
on conflict do nothing;

-- =========================
-- Seed Tags
-- =========================
insert into tags (id, name, slug)
values
  (gen_random_uuid(), 'SDD', 'sdd'),
  (gen_random_uuid(), 'Next.js', 'nextjs'),
  (gen_random_uuid(), 'Supabase', 'supabase')
on conflict do nothing;
