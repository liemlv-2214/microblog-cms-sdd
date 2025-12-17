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

## Notes for Reviewers
This repository focuses on Spec Driven Development methodology.
