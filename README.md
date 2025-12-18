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

### Outcome

STEP C2 establishes a **secure API boundary** that guarantees:
- Only authenticated users can access protected endpoints
- Only authorized roles can perform restricted actions
- The system is ready for business logic in STEP C3

This completes the progression:

**spec → API contract → route skeleton → auth guards**

---

## Notes for Reviewers

This repository focuses on **Spec Driven Development methodology** rather than feature completeness.

