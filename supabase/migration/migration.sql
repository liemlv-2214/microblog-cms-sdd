-- ============================================================================
-- Microblog CMS – Database Schema
-- Spec Driven Development (SDD)
-- ============================================================================

-- Enable uuid generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- USERS (Domain-level users, mirror auth.users)
-- ============================================================================
-- NOTE:
-- - id == auth.users.id (JWT sub)
-- - Needed for posts.author_id & comments.author_id relations
-- ============================================================================

create table if not exists users (
  id uuid primary key,
  email text not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- POSTS
-- ============================================================================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null,

  author_id uuid not null,
  status text not null check (status in ('draft','published','archived')),

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint posts_author_fkey
    foreign key (author_id)
    references users(id)
    on delete cascade
);

-- Unique slug only for published posts
create unique index if not exists posts_slug_unique
on posts (slug)
where status = 'published';

create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_posts_status on posts(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,

  content text not null,
  status text not null check (status in ('pending','approved','rejected','spam')),

  parent_comment_id uuid references comments(id) on delete cascade,

  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_comments_status on comments(status);
create index if not exists idx_comments_parent on comments(parent_comment_id);

-- ============================================================================
-- CATEGORIES
-- ============================================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================================
-- POST ↔ CATEGORIES (M:N)
-- ============================================================================
create table if not exists post_categories (
  post_id uuid references posts(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- ============================================================================
-- TAGS
-- ============================================================================
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- =========================
-- POST ↔ TAGS (N–N) ✅ FIXED
-- =========================
create table if not exists post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================================================
-- END
-- ============================================================================
