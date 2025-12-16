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

### ✅ Step A2 – Tooling & Agent Setup
- Enabled **GitHub Copilot Agent Mode**.
- Set up SpecKit-style workflow (commands & templates).
- Configured **MCP (Context7)** integration and documented runtime limitations.
- Added documentation under `docs/mcp.md` to justify MCP usage.

---

## ✅ Step B1 – Product Specification
- Defined product vision, goals, and success criteria.
- Identified target users (Admin, Editor, Reader).
- Documented core features and explicit non-goals for v1.
- Created `spec/product.md` as the single source of truth for product intent.

This step answers **“What are we building and why?”**

---

## ✅ Step B2 – Domain Modeling
- Created a conceptual domain model in `spec/domain.md`.
- Identified core domain entities:
  - User
  - Post
  - Category
  - Tag
  - Comment
- Defined entity responsibilities and relationships.
- Modeled lifecycle states (Draft → Published, Pending → Approved).
- Explicitly separated **domain concepts** from implementation details.

> Note:  
> Domain modeling at this step focuses on **conceptual correctness**, not
> database schema or API design. Detailed persistence and optimization
> concerns are deferred to later steps.

This step answers **“What concepts exist in the system?”**

---

## ✅ Step B3 – User Flow Specifications
- Defined core user flows under `spec/flows/`:
  - Author publishes a post
  - Reader views published posts
  - Reader submits a comment
  - Admin/Author moderates comments
- Each flow specifies:
  - Actor
  - Preconditions
  - Trigger
  - Happy path
  - Key alternate/error flows
  - Resulting state changes
- Flows are intentionally kept at the **behavioral level**, avoiding
  UI, API, and database implementation details.

These flows act as the bridge between **Domain (B2)** and **API Design (B4)**.

This step answers **“How do users interact with the system?”**

---

## STEP B4 – API Specification (Contract Definition)

In STEP B4, the API specification for the Microblog CMS (v1) was defined
using a Spec Driven Development (SDD) approach.

All API endpoints are derived **strictly from existing user flows**
defined in `spec/flows/`.  
No new features or behaviors were introduced beyond the approved v1 scope.

### Objectives
- Translate user flows into clear, RESTful API contracts
- Define authentication and authorization boundaries per endpoint
- Establish request/response structures before implementation
- Ensure backend implementation can be done without ambiguity

### Deliverables
- `spec/api.md` – Complete API specification including:
  - HTTP method and endpoint paths
  - Authentication requirements and allowed roles
  - Request body and parameters (essential fields only)
  - Example success responses
  - Common error responses (HTTP status codes)
- Clear mapping between:
  - User flows (B3)
  - API endpoints (B4)

### Scope & Constraints
- APIs are limited to **v1 behavior only**
- No database schemas, ORM logic, or framework-specific details included
- No UI or frontend behavior described
- No additional endpoints beyond documented user flows

### Outcome
This step establishes a **contract-first backend design**.
The API specification serves as the single source of truth for the next phase,
where implementation (STEP C1+) can proceed safely and predictably.

---

## Next Steps

### 🔜 Step C – Implementation
- Implement APIs using **Next.js App Router + TypeScript**.
- Use **Supabase** for authentication and data persistence.
- Deploy to **Vercel or Cloudflare Workers** (optional).

---

## Model Context Protocol (MCP)

This project integrates **Model Context Protocol (MCP)** as part of the SDD
workflow.

- Context7 is configured as an external knowledge provider.
- MCP usage, limitations, and justification are documented in
  `docs/mcp.md`.

---

## Repository Structure

```
.
├─ spec/
│  ├─ product.md
│  ├─ domain.md
│  └─ flows/
│     ├─ author-create-post.md
│     ├─ author-publish-post.md
│     ├─ reader-view-posts.md
│     ├─ reader-submit-comment.md
│     └─ moderate-comment.md
├─ docs/
│  └─ mcp.md
└─ README.md
```

---

## Notes for Reviewers

- This repository focuses on **SDD methodology**, not feature completeness.
- Specifications are intentionally layered:
  - Product → Domain → Flow → API → Code
- External tools (MCP) may not always be available at runtime; limitations
  are documented transparently.

---

## Author

Prepared as part of an internal SDD learning exercise.
