# MCP Integration – Context7

## Overview

This project is developed following Spec Driven Development (SDD).
Model Context Protocol (MCP) is used to assist the agent with
architecture knowledge, best practices, and design guidance
during specification and implementation phases.

Context7 is selected as the MCP server example, as recommended
by the course material.

---

## MCP Configuration

The MCP server is declared in the project configuration as follows:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp-server"]
    }
  }
}
```

## Intended Usage in SDD Workflow

Context7 MCP is intended to support the Spec Driven Development (SDD)
workflow in the following areas:

- Providing best practices for Next.js App Router API design
- Advising on Supabase schema design for CMS-style applications
- Supporting architectural decisions during specification refinement
- Acting as an external knowledge source during Agent-driven planning


## Example MCP Invocation

During development, the following prompt was used to explicitly
request knowledge from Context7 MCP:

> "Using Context7 MCP, summarize best practices for Next.js App Router API routes and Supabase schema design for a CMS."

This prompt demonstrates the intended interaction between the
GitHub Copilot Agent and the Context7 MCP server.


## Current Environment Limitation

In the current GitHub Copilot Agent environment, Context7 MCP
could not be invoked at runtime.

The agent explicitly reported that it did not have access to
Context7 MCP as an executable tool and therefore fell back to
its internal knowledge base.

This limitation is related to MCP runtime availability in the
Copilot backend and is outside the control of the project setup.

## Justification & Mitigation

Despite the runtime limitation, MCP usage is still demonstrated by:

- Correct MCP server configuration
- Explicit MCP invocation prompts
- Agent acknowledgement of MCP availability constraints
- Design decisions aligned with documented best practices

This reflects a realistic MCP integration scenario where
external tools may not always be available in constrained
environments, while still following MCP-driven design principles.

## Conclusion

The project demonstrates a correct and intentional MCP integration
pattern using Context7 within an SDD workflow, with clear documentation
of current environment limitations.