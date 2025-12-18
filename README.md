# Microblog CMS – Spec Driven Development (SDD)

This repository demonstrates a **Spec Driven Development (SDD)** workflow
using GitHub Copilot Agent Mode, SpecKit-style specifications, and MCP
integration (Context7).

The project implements **Microblog CMS (Bài 10)** as part of the SDD learning
exercise.

---

## Completed Steps

### ✅ Step A1 – Project Initialization
- Defined project scope and selected **Microblog CMS** as the target problem.
- Established SDD goals and evaluation criteria.
- Created initial repository structure.
- Documented learning objectives and submission requirements.

**Source Structure**
```text
.
├─ app/
│  ├─ layout.tsx
│  └─ page.tsx
├─ package.json
├─ tsconfig.json
├─ next.config.js
└─ README.md
```

---

### ✅ Step A2 – Tooling & Agent Setup
- Enabled **GitHub Copilot Agent Mode**.
- Set up SpecKit-style workflow (commands & templates).
- Configured **MCP (Context7)** integration and documented runtime limitations.
- Added documentation under `docs/mcp.md` to justify MCP usage.

**Source Structure**
```text
.
├─ .speckit/
│  ├─ commands/
│  └─ templates/
├─ docs/
│  └─ mcp.md
└─ README.md
```

---

## ✅ Step B1 – Product Specification
- Define template `create-product-spec.yaml`
- Defined product vision, goals, and success criteria. 
- Identifed target users (Admin, Editor, Reader).
- Documented core features and explicit non-goals for v1.
- Created `spec/product.md` as the single source of truth for product intent.

**Source Structure**
```text
.
├─ spec/
│  └─ product.md
```

---

## ✅ Step B2 – Domain Modeling
- Define template `create-domain-spec.yaml`
- Created a conceptual domain model in `spec/domain.md`.
- Identified core domain entities: User, Post, Category, Tag, Comment.
- Modeled lifecycle states and separated domain from implementation.

**Source Structure**
```text
.
├─ spec/
│  ├─ product.md
│  └─ domain.md
```

---

## ✅ Step B3 – User Flow Specifications
- Define template `create-flow-spec.yaml`
- Defined core user flows under `spec/flows/`.
- Covered author, reader, and moderation interactions.

**Source Structure**
```text
.
├─ spec/
│  ├─ domain.md
│  └─ flows/
│     ├─ author-create-post.md
│     ├─ author-publish-post.md
│     ├─ reader-view-posts.md
│     ├─ reader-submit-comment.md
│     └─ moderate-comment.md
```

---

## ✅ Step B4 – API Specification
- Defined RESTful API contracts derived from user flows.
- Created `spec/api.md`.

**Source Structure**
```text
.
├─ spec/
│  ├─ flows/
│  └─ api.md
```

---

## ✅ Step C1 – SpecKit Custom Command & Agent Code Generation

STEP C1 demonstrates the transition from **specification-only**
to **spec-driven code generation**.

- Created a custom SpecKit command: `.speckit/commands/gen-api.yaml`
- Used GitHub Copilot Agent Mode to generate API route skeletons
- Code is generated strictly from `spec/api.md`
- No business logic implemented (handlers return `501 Not Implemented`)

This confirms a working **spec → agent → code** workflow.

**Source Structure**
```text
.
├─ .speckit/
│  └─ commands/
│     └─ gen-api.yaml
├─ spec/
│  └─ api.md
├─ app/
│  └─ api/
│     ├─ posts/
│     ├─ comments/
│     └─ moderation/
```

---

## ✅ Step C2 – Authentication & Role Guards

STEP C2 focuses on implementing **authentication and authorization guards**
on top of the API skeleton generated in STEP C1.

At this stage, the goal is to enforce **security boundaries**
without introducing any business logic or database access.

### What Was Done

- Implemented **JWT authentication** using Supabase JWT
- Added **role-based access control (RBAC)** for all protected API routes
- Centralized authentication and authorization logic into shared utilities
- Ensured all routes still return **placeholder responses** (`501 Not Implemented`)
- Strictly followed the API contract defined in `spec/api.md`

### Key Principles Followed

- ✅ No business logic
- ✅ No database access
- ✅ Stateless authentication (JWT only)
- ✅ Authorization enforced before processing
- ✅ Spec-first, code-second

### Authentication Utilities

**Source Structure**
```text
.
├─ lib/
│  └─ auth/
│     ├─ supabase.ts
│     └─ index.ts
```

- JWT verification implemented using `jose`
- Token extracted from `Authorization: Bearer <token>`
- User identity and role derived from token claims
- Shared helpers:
  - `requireAuth(request)`
  - `hasRole(user, roles)`
  - Standard error responses (401, 403, 404, 409, 422)

### API Routes with Guards Applied

**Source Structure**
```text
.
├─ app/
│  └─ api/
│     ├─ posts/
│     │  ├─ route.ts
│     │  ├─ [slug]/route.ts
│     │  └─ [id]/publish/route.ts
│     ├─ posts/[id]/comments/route.ts
│     └─ comments/[id]/moderate/route.ts
```

Each protected route follows a consistent pattern:
1. Authenticate request (JWT validation)
2. Authorize user role
3. Defer ownership and business rules to STEP C3
4. Return `501 Not Implemented`

---

# Step C3 – Business Logic Implementation (Spec → Code)

STEP C3 implements **business logic for each API endpoint** strictly following:

* API contracts defined in `spec/api.md`
* Behaviors defined in **STEP B3 – User Flows**

Each sub-step focuses on **one API endpoint only** to:

* Avoid scope creep
* Keep changes reviewable
* Preserve Spec Driven Development discipline

---

## ✅ C3.1 – Create Draft Post

**API:** `POST /api/posts`

* Implemented draft post creation logic
* Enforced authentication & role (`editor`, `admin`)
* Validated title & content
* Generated slug (no uniqueness check at draft stage)
* Categories & tags optional for drafts
* Inserted post with `status = draft`

**Related spec:**

* `spec/api.md` – Create Post
* `spec/flows/author-create-post.md`

---

## ✅ C3.2 – Publish Post

**API:** `PATCH /api/posts/{id}/publish`

* Validated post exists and is in draft status
* Enforced ownership (author) or admin role
* Validated publish rules:

  * Content length ≥ 100
  * At least one category assigned
* Enforced slug uniqueness at publish time
* Transitioned state: `draft → published`
* Set `published_at` timestamp

**Related spec:**

* `spec/api.md` – Publish Post
* `spec/flows/author-publish-post.md`

---

## ✅ C3.3 – List Published Posts

**API:** `GET /api/posts`

* Public endpoint (no authentication)
* Returned only published posts
* Supported pagination & sorting
* Included author summary, categories, tags
* Excluded draft and unpublished content

**Related spec:**

* `spec/api.md` – List Posts
* `spec/flows/reader-view-posts.md`

---

## ✅ C3.4 – Get Post Detail

**API:** `GET /api/posts/{slug}`

* Public endpoint
* Fetched post by slug
* Ensured post is published
* Included full content, author, categories, tags
* Returned 404 for non-existent or unpublished posts

**Related spec:**

* `spec/api.md` – Get Post Detail
* `spec/flows/reader-view-posts.md`

---

## ✅ C3.5 – Submit Comment

**API:** `POST /api/posts/{id}/comments`

* Enforced authentication (`viewer`, `editor`, `admin`)
* Validated comment content (1–5000 chars)
* Ensured post exists and is published
* Supported optional parent comment (single-level replies)
* Created comment with `status = pending`

**Related spec:**

* `spec/api.md` – Submit Comment
* `spec/flows/reader-submit-comment.md`

---

## ✅ C3.6 – List Approved Comments

**API:** `GET /api/posts/{id}/comments`

* Public endpoint
* Returned only approved comments
* Supported pagination and sorting
* Included single-level nested replies
* Omitted moderation-only fields

**Related spec:**

* `spec/api.md` – List Comments
* `spec/flows/reader-view-posts.md`

---

## ✅ C3.7 – Moderate Comment

**API:** `PATCH /api/comments/{id}/moderate`

* Enforced authentication (`admin`, `editor`)
* Admin can moderate any comment
* Editor can moderate comments on own posts only
* Validated comment exists and is pending
* Prevented double moderation (`409 Conflict`)
* Updated status to `approved`, `rejected`, or `spam`
* Returned response matching API spec exactly

**Related spec:**

* `spec/api.md` – Moderate Comment
* `spec/flows/moderate-comment.md`

---

## Notes for Reviewers

This repository focuses on **Spec Driven Development methodology** rather than feature completeness.

