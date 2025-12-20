# Microblog CMS – Spec Driven Development (SDD) Review Guide

## Overview

This project demonstrates **Spec Driven Development (SDD)** methodology applied to a modern Microblog CMS. The implementation strictly follows the sequence: **Plan → Spec → Tasks → Implementation**.

All features documented in this README are **currently implemented** and available in the codebase. This document serves as a reference for reviewers to understand the project structure, APIs, and screens.

---

## 0. Business Context & System Purpose

### Problem Statement

Many small teams and internal products need a lightweight publishing platform
that supports:

- Multiple authors
- Draft & publish workflow
- Editorial control
- Community interaction via comments
- Administrative moderation

Most existing CMS solutions are either:
- Too heavy (WordPress-scale)
- Too unstructured (headless CMS without strict rules)
- Hard to reason about when requirements evolve

### Solution Overview

This Microblog CMS is designed as a **clear, spec-driven, role-based content platform**
that demonstrates how a real-world system can be built with:

- Explicit specifications
- Predictable workflows
- Strong separation between business rules and infrastructure
- Full traceability from spec → API → persistence → UI

### Key Business Capabilities

- **Authors (Editors)** can:
  - Create draft posts
  - Assign categories and tags
  - Publish posts when ready

- **Administrators** can:
  - View all posts regardless of status
  - Publish or reject draft posts
  - Moderate user comments

- **Readers / Viewers** can:
  - Browse published posts
  - Read post details
  - Participate via comments (with moderation)

### Non-Goals (Explicitly Out of Scope)

To keep the system focused and reviewable, v1 intentionally excludes:

- User management UI
- Post editing after publish
- Advanced search or analytics
- Notifications or real-time updates
- Media/file uploads

These constraints are intentional and documented in the specification.

### Why Spec Driven Development (SDD)?

This project uses SDD to ensure:

- Business rules are defined before code exists
- APIs are predictable and reviewable
- Implementation decisions are traceable to specs
- The system can scale in complexity without becoming fragile

---

## 1. SDD EXECUTION OVERVIEW

### 1.1 Plan Phase

**Product Goal:**
Build a lightweight Content Management System enabling multiple authors to create, publish, and manage blog posts with categorization and community engagement features.

**Primary Objectives:**
1. Provide authors with a streamlined interface to write and publish content
2. Enable administrators to manage content and moderate comments
3. Allow readers to discover content through categories and tags
4. Support real-time community engagement through comments
5. Ensure content discoverability with SEO-friendly URLs

**Target Users:**
- **Content Authors (Editors):** Create, edit, and publish posts
- **Administrators:** Manage posts, moderate comments, oversee system
- **Readers (Public):** Discover and consume content
- **Viewers:** Read-only access to published posts

**Scope for v1:**
- ✅ Post creation, publishing, and draft management
- ✅ Category and tag support
- ✅ Public comment submission
- ✅ Comment moderation (admin/editor)
- ✅ Role-based access control (admin, editor, viewer)
- ❌ User management (future)
- ❌ Search/full-text indexing (future)
- ❌ Notifications (future)

### 1.2 Specification Phase

**Documents Generated:**

1. **`spec/product.md`**
   - Product goals and user personas
   - Feature scope and constraints
   - Role-based access control matrix

2. **`spec/domain.md`**
   - Domain model entities (User, Post, Category, Tag, Comment)
   - Entity relationships
   - Content lifecycle (draft → published → archived)
   - Comment moderation states (pending → approved/rejected/spam)

3. **`spec/api.md`**
   - REST API specification
   - Authentication method (Supabase JWT Bearer token)
   - Role-based authorization rules
   - All endpoint contracts with request/response formats
   - Status codes and error handling

4. **`spec/flows/`**
   - `author-create-post.md` – Post creation workflow
   - `author-publish-post.md` – Post publishing workflow
   - `reader-view-posts.md` – Timeline and post discovery
   - `reader-submit-comment.md` – Comment submission
   - `admin-moderate-comments.md` – Comment moderation workflow

### 1.3 Task Breakdown

**Backend Implementation (C-Steps):**

| Step | Task | Focus |
|------|------|-------|
| C1 | API Route Skeletons | Generate placeholder routes for all endpoints |
| C2 | Authentication & Role Guards | Add JWT validation and RBAC checks |
| C3 | Business Logic | Implement endpoint logic with database access |
| C4 | Persistence Layer | Extract database queries into reusable functions |

**Frontend Implementation (E-Steps):**

| Step | Task | Focus |
|------|------|-------|
| E1 | Timeline Page | Display published posts with filtering |
| E2 | Post Detail Page | Show full post with comments |
| E3 | Comment UI | Submit comments and list approved comments |
| E4 | Create Post Form | Author interface for draft post creation |
| E5 | Publish Post Flow | UI for publishing draft posts |
| E6 | Admin Dashboard | Central hub for admin features |

**API Scope Separation:**

- **Public APIs** (`/api/posts`, `/api/comments`) – Accessible to all users
- **Protected APIs** (`/api/posts/{id}/publish`, `/api/posts/{id}/comments`) – Requires authentication
- **Admin APIs** (`/api/admin/posts`, `/api/admin/comments/pending`) – Requires admin role

### 1.4 Implementation

**Technology Stack:**
- **Backend:** Next.js App Router (TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase JWT
- **Frontend:** React with "use client" for client components
- **Styling:** Inline CSS (no external UI libraries)

**Architecture:**
```
app/
  ├── api/              # All API routes
  │   ├── posts/        # Post endpoints
  │   ├── categories/   # Category list (public)
  │   ├── tags/         # Tag list (public)
  │   └── admin/        # Admin-only endpoints
  ├── posts/            # Public post pages
  ├── admin/            # Admin dashboard and pages
  └── page.tsx          # Timeline (homepage)

lib/
  ├── auth/             # JWT validation and RBAC
  ├── db/               # Database client
  ├── posts/            # Post business logic + persistence
  └── comments/         # Comment business logic + persistence
```

---

## 2. API REFERENCE

All APIs use **JSON** format and require `Content-Type: application/json` header for POST/PATCH requests.

### 2.1 Authentication & Authorization

**Method:** Bearer Token in `Authorization` header
```
Authorization: Bearer {jwt_token}
```

**Token Source:** Supabase JWT (from environment: `NEXT_PUBLIC_USER_JWT`, `NEXT_PUBLIC_ADMIN_JWT`)

**Role-Based Permissions:**

| Operation | Admin | Editor | Viewer | Public |
|-----------|:-----:|:------:|:------:|:------:|
| Create Post | ✅ | ✅ | ❌ | ❌ |
| Publish Post | ✅ | ✅ (own) | ❌ | ❌ |
| List All Posts | ✅ | ❌ | ❌ | ❌ |
| List Published Posts | ✅ | ✅ | ✅ | ✅ |
| View Post Detail | ✅ | ✅ | ✅ | ✅ |
| Submit Comment | ✅ | ✅ | ✅ | ✅ |
| List Approved Comments | ✅ | ✅ | ✅ | ✅ |
| Moderate Comments | ✅ | ✅ (own posts) | ❌ | ❌ |
| View Pending Comments | ✅ | ❌ | ❌ | ❌ |

### 2.2 Posts Resource

#### POST /api/posts – Create Draft Post
**Authentication:** Required (editor, admin)  
**Status Code:** 201 Created

**Request Body:**
```json
{
  "title": "string (5-200 chars, required)",
  "content": "string (can be partial for draft)",
  "category_ids": ["uuid"],
  "tag_ids": ["uuid"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "slug": "may-change-until-published",
  "title": "Post Title",
  "content": "...",
  "author_id": "uuid",
  "status": "draft",
  "published_at": null,
  "created_at": "2024-12-16T10:30:00Z",
  "updated_at": "2024-12-16T10:30:00Z",
  "category_ids": ["uuid"],
  "tag_ids": ["uuid"]
}
```

#### GET /api/posts – List Published Posts
**Authentication:** Optional (public)  
**Status Code:** 200 OK

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 50)
- `category` (string, category slug)
- `tag` (string, tag slug)
- `search` (string, full-text search)
- `sort` (string: "newest" | "oldest", default: "newest")

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-slug",
      "author": {
        "id": "uuid",
        "email": "author@example.com"
      },
      "status": "published",
      "published_at": "2024-12-16T10:35:00Z",
      "created_at": "2024-12-16T10:30:00Z",
      "comment_count": 3,
      "category_ids": ["uuid"],
      "tag_ids": ["uuid"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

#### GET /api/posts/{id} – Get Post Detail
**Authentication:** Optional (public)  
**Status Code:** 200 OK

**Response:**
```json
{
  "id": "uuid",
  "title": "Post Title",
  "slug": "post-slug",
  "content": "Full post content...",
  "author": {
    "id": "uuid",
    "email": "author@example.com"
  },
  "status": "published",
  "published_at": "2024-12-16T10:35:00Z",
  "created_at": "2024-12-16T10:30:00Z",
  "comment_count": 3,
  "category_ids": ["uuid"],
  "tag_ids": ["uuid"]
}
```

#### PATCH /api/posts/{id}/publish – Publish Draft Post
**Authentication:** Required (editor for own posts, admin for any)  
**Status Code:** 200 OK

**Request Body:**
```json
{}
```

**Validation:**
- Post must exist and be in "draft" status
- Content must be ≥100 characters
- At least one category must be assigned
- Slug must be unique among published posts

**Error Responses:**
- `400 Bad Request` – Validation failed (content too short, no categories, invalid references)
- `404 Not Found` – Post not found
- `409 Conflict` – Post not in draft status
- `403 Forbidden` – Not author or admin

### 2.3 Comments Resource

#### POST /api/posts/{id}/comments – Submit Comment
**Authentication:** Required (all authenticated users)  
**Status Code:** 201 Created

**Request Body:**
```json
{
  "content": "string (1-5000 chars)",
  "parent_comment_id": "uuid (optional, for replies)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "content": "Comment text...",
  "author": {
    "id": "uuid",
    "email": "commenter@example.com"
  },
  "status": "pending",
  "created_at": "2024-12-16T11:00:00Z"
}
```

**Validation:**
- Post must exist and be published
- Comment content must be 1–5000 characters
- Parent comment (if specified) must exist and belong to same post

#### GET /api/posts/{id}/comments – List Approved Comments
**Authentication:** Optional (public)  
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": "uuid",
    "post_id": "uuid",
    "content": "Comment text...",
    "author": {
      "id": "uuid",
      "email": "commenter@example.com"
    },
    "status": "approved",
    "created_at": "2024-12-16T11:00:00Z",
    "replies": [
      {
        "id": "uuid",
        "content": "Reply to comment...",
        "author": { "id": "uuid", "email": "..." },
        "created_at": "2024-12-16T11:05:00Z"
      }
    ]
  }
]
```

### 2.4 Admin APIs

#### GET /api/admin/posts – List All Posts (Admin Only)
**Authentication:** Required (admin only)  
**Status Code:** 200 OK

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "status": "draft | published | archived",
      "author": {
        "id": "uuid",
        "email": "author@example.com"
      },
      "created_at": "2024-12-16T10:30:00Z",
      "published_at": "2024-12-16T10:35:00Z | null"
    }
  ]
}
```

**Scope:** Returns all posts regardless of status (draft, published, archived)

#### GET /api/admin/comments/pending – List Pending Comments
**Authentication:** Required (admin only)  
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": "uuid",
    "post_id": "uuid",
    "content": "Comment awaiting moderation...",
    "author": {
      "id": "uuid",
      "email": "commenter@example.com"
    },
    "created_at": "2024-12-16T11:00:00Z"
  }
]
```

#### PATCH /api/admin/comments/{id}/moderate – Moderate Comment
**Authentication:** Required (admin, or editor for own posts)  
**Status Code:** 200 OK

**Request Body:**
```json
{
  "status": "approved | rejected | spam"
}
```

**Response (if approved):**
```json
{
  "id": "uuid",
  "status": "approved",
  "approved_at": "2024-12-16T11:10:00Z"
}
```

**Response (if rejected/spam):**
```json
{
  "id": "uuid",
  "status": "rejected | spam"
}
```

**Validation:**
- Comment must exist
- Comment must be in "pending" status
- Cannot moderate already-moderated comments (409 Conflict)
- Editors can only moderate comments on their own posts

### 2.5 Reference Data APIs

#### GET /api/categories – List Active Categories
**Authentication:** Optional (public)  
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology"
  }
]
```

**Scope:** Returns only active categories (is_active = true), ordered alphabetically

#### GET /api/tags – List All Tags
**Authentication:** Optional (public)  
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "JavaScript",
    "slug": "javascript"
  }
]
```

**Scope:** Returns all tags, ordered alphabetically

### 2.6 Error Responses

All APIs follow consistent error handling:

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Bad Request | Invalid query parameters, validation errors |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token, insufficient role permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Invalid state transition (e.g., publish non-draft post) |
| 422 | Unprocessable Entity | Semantic error (e.g., duplicate slug) |
| 500 | Server Error | Unexpected database or system error |

**Error Response Format:**
```json
{
  "error": "Error message"
}
```

---

## 3. UI SCREENS & ROUTES

### 3.1 Public Screens

#### `/` – Timeline (Homepage)
**Access:** Public (all users)  
**Component:** `app/page.tsx`

**Features:**
- List published posts with pagination
- "+ Create Post" button (visible only when logged in)
- Post cards showing title, author, published date
- Link to post detail page

#### `/posts/{id}` – Post Detail
**Access:** Public  
**Component:** `app/posts/[id]/page.tsx`

**Features:**
- Full post content
- Author information
- Published/created dates
- Comment section with approved comments
- Comment submission form (for authenticated users)

#### `/posts/new` – Create Post
**Access:** Authenticated (editor, admin)  
**Component:** `app/posts/new/page.tsx`

**Features:**
- Server component rendering `CreatePostForm`
- Form to create new draft post with:
  - Title input
  - Content textarea
  - Category multi-select (checkboxes)
  - Tag multi-select (checkboxes)
  - Submit button
- Auto-redirect to home on success
- Error messages on failure

### 3.2 Admin Screens

#### `/admin` – Admin Dashboard
**Access:** Admin only  
**Component:** `app/admin/page.tsx`

**Features:**
- Dashboard header with welcome message
- Navigation cards for:
  - "Manage Posts" → `/admin/posts`
  - "Moderate Comments" → `/admin/comments`
- Stats cards showing:
  - Number of draft posts
  - Number of pending comments
- Breadcrumb navigation for back-navigation
- Responsive grid layout with hover effects

#### `/admin/posts` – Admin Posts Management
**Access:** Admin only  
**Component:** `app/admin/posts/page.tsx`

**Features:**
- Breadcrumb: "Admin Dashboard / Manage Posts"
- Table listing all posts (draft, published, archived) with:
  - Title
  - Status (color-coded: draft=yellow, published=green, archived=gray)
  - Author email
  - Created date
  - Published date
  - Publish button (for draft posts only)
- Admin can view all posts regardless of status
- Links to admin dashboard via breadcrumb

#### `/admin/comments` – Admin Comments Moderation
**Access:** Admin only  
**Component:** `app/admin/comments/page.tsx`

**Features:**
- Breadcrumb: "Admin Dashboard / Moderate Comments"
- List of pending comments with:
  - Comment content
  - Author email
  - Created date
  - Action buttons: Approve, Reject, Mark as Spam
- Real-time moderation feedback
- Links to admin dashboard via breadcrumb

### 3.3 Navigation Structure

```
Public Pages:
/                  → Timeline (published posts)
/posts/{id}        → Post detail + comments
/posts/new         → Create post form (auth required)

Admin Pages:
/admin             → Dashboard (admin only)
/admin/posts       → Manage all posts (admin only)
/admin/comments    → Moderate comments (admin only)
```

---

## 4. DATABASE SETUP & MIGRATION

### 4.1 Supabase Configuration

**Location:** `supabase/` folder

**Files:**
- `config.toml` – Supabase project configuration
- `migration/migration.sql` – Main database schema
- `migration/seed.sql` – Sample data (if any)
- `migration/trigger-created-auth-user.sql` – Auth trigger
- `migration/func-handle-new-auth-user.sql` – Auth function
- `migration/migrate-auth-user-to-public-user.sql` – Migration script

### 4.2 Database Schema

**Core Tables:**

1. **`users`** – Application users (mirrors auth.users)
   - `id` (UUID, primary key) – References auth.users.id
   - `email` (TEXT) – User email
   - `created_at` (TIMESTAMPTZ) – Account creation date

2. **`posts`** – Blog posts
   - `id` (UUID, primary key)
   - `title` (TEXT) – Post title
   - `slug` (TEXT) – URL-safe slug
   - `content` (TEXT) – Full post content
   - `author_id` (UUID, FK) – References users.id
   - `status` (TEXT) – 'draft' | 'published' | 'archived'
   - `published_at` (TIMESTAMPTZ) – Publication timestamp
   - `created_at` (TIMESTAMPTZ) – Creation timestamp
   - `updated_at` (TIMESTAMPTZ) – Last update timestamp
   - **Index:** `posts_slug_unique` on (slug) where status='published'
   - **Index:** `idx_posts_author_id` on (author_id)
   - **Index:** `idx_posts_status` on (status)

3. **`comments`** – Post comments
   - `id` (UUID, primary key)
   - `post_id` (UUID, FK) – References posts.id
   - `author_id` (UUID, FK) – References users.id
   - `content` (TEXT) – Comment text
   - `status` (TEXT) – 'pending' | 'approved' | 'rejected' | 'spam'
   - `parent_comment_id` (UUID, FK) – For nested replies (optional)
   - `created_at` (TIMESTAMPTZ)
   - `approved_at` (TIMESTAMPTZ) – Set when approved
   - **Index:** `idx_comments_post_id` on (post_id)
   - **Index:** `idx_comments_status` on (status)
   - **Index:** `idx_comments_parent` on (parent_comment_id)

4. **`categories`** – Post categories
   - `id` (UUID, primary key)
   - `name` (TEXT) – Category name
   - `slug` (TEXT) – URL-safe slug
   - `is_active` (BOOLEAN) – Active/inactive flag

5. **`tags`** – Post tags
   - `id` (UUID, primary key)
   - `name` (TEXT) – Tag name
   - `slug` (TEXT) – URL-safe slug

6. **`post_categories`** – Post-category junction
   - `post_id` (UUID, FK)
   - `category_id` (UUID, FK)

7. **`post_tags`** – Post-tag junction
   - `post_id` (UUID, FK)
   - `tag_id` (UUID, FK)

### 4.3 Setup Instructions

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note project URL and API keys

#### Step 2: Run Schema Migration
```bash
# Using supabase CLI
supabase db push

# OR manually:
# - Copy contents of supabase/migration/migration.sql
# - Paste into Supabase SQL Editor
# - Execute
```

#### Step 3: Run Triggers & Functions
Execute in order:
1. `supabase/migration/trigger-created-auth-user.sql` – Create auth trigger
2. `supabase/migration/func-handle-new-auth-user.sql` – Create auth handler function

#### Step 4: Seed Sample Data (Optional)
```bash
# Execute seed.sql to load sample posts, categories, tags
supabase db push -- seeds
```

#### Step 5: Set Environment Variables
```
# .env.local or .env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000

# Testing with sample JWTs (from seeds or Supabase dashboard)
NEXT_PUBLIC_ADMIN_JWT=your_admin_token
NEXT_PUBLIC_USER_JWT=your_editor_token
```

### 4.4 Auth Integration Notes

**Auth Flow:**
1. Supabase Auth creates user in `auth.users` table
2. Trigger `trigger-created-auth-user` fires on signup
3. Function `func-handle-new-auth-user` inserts row into `public.users`
4. JWT token contains user id (sub), email, role
5. API routes extract role from JWT and enforce permissions

**User ID Mapping:**
- `auth.users.id` (Supabase Auth) = `public.users.id` (Application)
- JWT sub claim = user id
- Posts and comments reference `public.users.id` via `author_id` FK

**Role Assignment:**
- Roles assigned in Supabase User metadata
- JWT includes role claim
- API middleware checks role for authorization

---

## 5. SPECIFICATION DOCUMENTS

All specification documents are in `spec/` folder:

- **`spec/product.md`** – Product goals, user personas, scope
- **`spec/domain.md`** – Domain entities, relationships, lifecycles
- **`spec/api.md`** – Complete API specification with all endpoints
- **`spec/flows/`** – User flow diagrams
  - `author-create-post.md` – Creating draft posts
  - `author-publish-post.md` – Publishing draft posts
  - `reader-view-posts.md` – Browsing posts
  - `reader-submit-comment.md` – Commenting
  - `admin-moderate-comments.md` – Comment moderation

---

## 6. PROJECT STRUCTURE

```
microblog-cms-sdd/
├── app/
│   ├── admin/
│   │   ├── page.tsx                          # Dashboard
│   │   ├── posts/
│   │   │   ├── page.tsx                     # Posts management
│   │   │   ├── admin-post-list.tsx          # Posts list component
│   │   │   └── admin-post-actions.tsx       # Publish/reject actions
│   │   └── comments/
│   │       ├── page.tsx                     # Comments moderation
│   │       └── moderation-actions.tsx       # Approve/reject actions
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts                     # POST (create), GET (list)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts                 # GET (detail)
│   │   │   │   ├── publish/route.ts         # PATCH (publish)
│   │   │   │   └── comments/route.ts        # POST (comment), GET (list)
│   │   ├── categories/route.ts              # GET (list active)
│   │   ├── tags/route.ts                    # GET (list all)
│   │   └── admin/
│   │       ├── posts/route.ts               # GET (all posts)
│   │       └── comments/
│   │           ├── pending/route.ts         # GET (pending)
│   │           └── [id]/moderate/route.ts   # PATCH (moderate)
│   ├── posts/
│   │   ├── [id]/
│   │   │   ├── page.tsx                     # Post detail page
│   │   │   ├── comment-form.tsx             # Comment submission form
│   │   │   └── comment-list.tsx             # Approved comments list
│   │   └── new/
│   │       ├── page.tsx                     # Create post page
│   │       └── create-post-form.tsx         # Form component
│   ├── page.tsx                             # Timeline (home)
│   ├── layout.tsx                           # Root layout
│   └── globals.css                          # Global styles
├── lib/
│   ├── auth/
│   │   ├── index.ts                         # Auth utilities, RBAC
│   │   └── supabase.ts                      # JWT validation
│   ├── db/
│   │   └── supabase.ts                      # Supabase client
│   ├── posts/
│   │   ├── persistence.ts                   # Database queries
│   │   └── validation.ts                    # Input validation
│   └── comments/
│       ├── persistence.ts                   # Database queries
│       └── validation.ts                    # Input validation
├── spec/
│   ├── product.md                           # Product specification
│   ├── domain.md                            # Domain model
│   ├── api.md                               # API specification
│   └── flows/                               # User flow diagrams
├── supabase/
│   ├── config.toml                          # Supabase config
│   └── migration/
│       ├── migration.sql                    # Schema
│       ├── seed.sql                         # Sample data
│       ├── trigger-created-auth-user.sql    # Auth trigger
│       ├── func-handle-new-auth-user.sql    # Auth function
│       └── migrate-auth-user-to-public-user.sql  # Migration
├── package.json                             # Dependencies
├── tsconfig.json                            # TypeScript config
├── next.config.ts                           # Next.js config
└── README_SDD.md                            # This file
```

---

## 7. IMPLEMENTATION NOTES FOR REVIEWERS

### 7.1 Spec Driven Development (SDD) Discipline

This project strictly follows SDD principles:

1. **Specification-First:** All code derives from API spec (`spec/api.md`) and flow specs
2. **Task Isolation:** Each step (C1-C4, E1-E6) focuses on single responsibility
3. **Incremental Delivery:** Features implemented as complete stacks (API → UI)
4. **Test-Driven:** API contracts defined before implementation
5. **Code Reviewability:** Changes in SDD steps are focused and reviewable

### 7.2 Authentication & Authorization

**Implementation Pattern:**

All protected routes follow this pattern:
```typescript
// 1. Authenticate request (JWT validation)
const auth = await requireAuth(request)
if (auth.error) return error response

// 2. Authorize by role
if (!hasRole(auth.user, ['admin', 'editor'])) return forbidden

// 3. Execute business logic with authenticated user context
```

**Testing Authentication:**
- Use environment JWTs: `NEXT_PUBLIC_ADMIN_JWT`, `NEXT_PUBLIC_USER_JWT`
- JWT must be valid Supabase JWT for your project
- Pass in Authorization header: `Bearer {token}`

### 7.3 Persistence Layer Pattern

Database access is centralized in persistence modules:
- `lib/posts/persistence.ts` – All post database queries
- `lib/comments/persistence.ts` – All comment database queries

Benefits:
- Single source of truth for schema knowledge
- Reusable across multiple route handlers
- Easier to test and maintain
- Separate concerns: DB queries vs business logic

### 7.4 Known Limitations (v1)

- No search/full-text indexing (query-based filtering only)
- No pagination for comments (all approved comments returned)
- No comment reply nesting support (prepared in schema, not in UI)
- No user management/registration UI (uses Supabase Auth)
- No email notifications
- No rate limiting implemented
- Admin can only view pending comments (not approved)

---

## 8. TESTING THE SYSTEM

### 8.1 Using API with cURL

**Create Draft Post:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post...",
    "category_ids": ["uuid"],
    "tag_ids": ["uuid"]
  }'
```

**List Published Posts:**
```bash
curl http://localhost:3000/api/posts?page=1&limit=10&sort=newest
```

**Publish Draft Post:**
```bash
curl -X PATCH http://localhost:3000/api/posts/{post_id}/publish \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Submit Comment:**
```bash
curl -X POST http://localhost:3000/api/posts/{post_id}/comments \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'
```

**Moderate Comment:**
```bash
curl -X PATCH http://localhost:3000/api/admin/comments/{comment_id}/moderate \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### 8.2 Testing UI Pages

1. **Timeline:** Visit `http://localhost:3000` (public, no auth needed)
2. **Create Post:** Login, click "+ Create Post", fill form, submit
3. **Post Detail:** Click on any post to view full content + comments
4. **Admin Dashboard:** Visit `/admin` (must be logged in as admin)
5. **Manage Posts:** `/admin/posts` (view all posts by status)
6. **Moderate Comments:** `/admin/comments` (approve/reject pending)

---

## 9. COMPLIANCE CHECKLIST

### ✅ STEP C1 – API Route Skeletons
- [x] Generated skeleton routes for all endpoints
- [x] Routes return 501 Not Implemented
- [x] Consistent error handling across routes

### ✅ STEP C2 – Authentication & Role Guards
- [x] JWT validation on protected routes
- [x] Role-based authorization (admin, editor, viewer)
- [x] Proper 401/403 error responses
- [x] All routes protected per spec

### ✅ STEP C3 – Business Logic Implementation
- [x] C3.1 Create Draft Post – `POST /api/posts`
- [x] C3.2 Publish Post – `PATCH /api/posts/{id}/publish`
- [x] C3.3 List Published Posts – `GET /api/posts`
- [x] C3.4 Get Post Detail – `GET /api/posts/{id}`
- [x] C3.5 Submit Comment – `POST /api/posts/{id}/comments`
- [x] C3.6 List Approved Comments – `GET /api/posts/{id}/comments`
- [x] C3.7 Moderate Comment – `PATCH /api/admin/comments/{id}/moderate`
- [x] C3.8 List Pending Comments – `GET /api/admin/comments/pending`

### ✅ STEP C4 – Persistence Layer Extraction
- [x] Post persistence functions in `lib/posts/persistence.ts`
- [x] Comment persistence functions in `lib/comments/persistence.ts`
- [x] Validation functions in respective validation modules
- [x] Clean separation of DB queries from route logic

### ✅ STEP E1–E3 – Public UI Pages
- [x] E1 Timeline page listing published posts
- [x] E2 Post detail page with full content
- [x] E3 Comment submission and list

### ✅ STEP E4–E6 – Admin & Author Features
- [x] E4 Create post form with categories/tags
- [x] E5 Publish post flow with validation
- [x] E6 Admin dashboard with navigation
- [x] Admin posts management page
- [x] Admin comments moderation page

### ✅ API Features per Spec
- [x] All endpoints return correct status codes
- [x] Request/response formats match spec exactly
- [x] Validation rules enforced (content length, categories, etc.)
- [x] Error messages descriptive and actionable
- [x] Pagination implemented for post list
- [x] Filtering by category/tag/search implemented

---

## Conclusion

This Microblog CMS project demonstrates complete SDD implementation from concept through production-ready code. All features are fully implemented, tested, and documented.

For questions or clarifications, refer to the specification documents in `spec/` folder.
