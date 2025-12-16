# Microblog CMS – Spec Driven Development

This project is a **learning exercise for Spec Driven Development (SDD)**, focusing on:

- Using **GitHub Copilot Agent Mode** as a development collaborator
- Applying a **SpecKit-inspired workflow** (Spec → Flow → Code)
- Integrating **Model Context Protocol (MCP)** into the development process
- Building a small but complete product: **Microblog CMS**

---

## Project Scope

**Microblog CMS** is a lightweight content management system that supports:

- Writing short posts (draft / publish)
- Tagging posts
- Displaying posts in a timeline and by tag
- Commenting with moderation

The primary goal of this repository is **not feature completeness**, but to
demonstrate a **clear, traceable Spec Driven Development workflow**.

---

## Technology Stack

- **Next.js** (App Router)
- **TypeScript**
- **Supabase** (planned for database & backend services)
- **GitHub Copilot Agent Mode**
- **SpecKit-inspired SDD workflow**
- **Model Context Protocol (MCP)**

---

## Step A1 – Project & Environment Setup ✅

The initial project setup establishes a clean and modern development foundation.

### Completed Tasks
- Created a **public GitHub repository**
- Initialized a **Next.js project** with:
  - App Router
  - TypeScript
  - ESLint
- Verified the application runs locally
- Created a **Supabase project** for future backend integration
- Performed an initial clean commit

This step ensures the project starts from a stable and reviewable baseline.

---

## Step A2 – SDD Tooling Setup ✅

Step A2 focuses on preparing the tools required for Spec Driven Development.

### GitHub Copilot Agent Mode
- GitHub Copilot is used in **Agent Mode**, not simple chat mode
- The agent is able to:
  - Read repository files
  - Analyze project structure
  - Participate in planning and specification discussions

This enables an **agent-assisted SDD workflow**, where the agent collaborates
throughout the spec and implementation phases.

---

### SpecKit-Inspired Workflow

This project follows the workflow described in:  
https://github.com/github/spec-kit

Instead of relying on a dedicated CLI, the workflow is implemented through:

- Structured specification files under `spec/`
- Custom command and template definitions under `.speckit/`
- Execution of “SpecKit commands” via GitHub Copilot Agent prompts

This approach preserves the core ideas of SpecKit while remaining tool-agnostic
and suitable for the current environment.

---

### Model Context Protocol (MCP) – Context7

Model Context Protocol (MCP) is integrated as part of the SDD workflow.

- **Context7** is configured as the MCP server example
- MCP is intended to provide:
  - Best practices for Next.js App Router API design
  - Guidance on Supabase schema design
  - Architectural input during spec refinement

Due to current limitations of the GitHub Copilot Agent runtime,
Context7 MCP could not be invoked directly at runtime.
This behavior, along with the intended usage and mitigation strategy,
is fully documented in:

👉 `docs/mcp.md`

---

## Repository Structure (Current)

```text
.
├── app/                # Next.js App Router
├── spec/               # SDD specifications (product, domain, flows, etc.)
├── .speckit/           # SpecKit-inspired commands & templates
├── docs/
│   └── mcp.md          # MCP integration documentation
├── screenshots/        # Evidence screenshots for the assignment
└── README.md
```

## Step B1 – Product Specification ✅

Step B1 marks the beginning of the actual **Spec Driven Development (SDD)** process.
In this step, the product is defined **before any domain modeling or code implementation**.

### Objective
- Establish a clear and shared understanding of the product
- Define scope, users, and core features
- Create a single source of truth for subsequent specifications

---

### SpecKit-Inspired Command Execution

The product specification is generated using a **SpecKit-inspired workflow**:

- A command definition describes *what* should be generated
- A Markdown template defines *how* the specification should be structured
- GitHub Copilot Agent executes the command and fills in the content

Key files involved:

```text
.speckit/
├── commands/
│   └── create-product-spec.yaml
├── templates/
│   └── product-spec.md
spec/
└── product.md
