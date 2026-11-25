# healthcheck-next — Agent usage

Configure a coding agent for @nexload-sdk/healthcheck-next.

**Topic:** agents
**Package:** `@nexload-sdk/healthcheck-next` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/agents/
## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-nextjs-routes

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/nextjs-routes/SKILL.md)

```text
Use when wiring @nexload-sdk/healthcheck-next into Next.js App Router liveness, readiness, startup, diagnostics, or metrics route modules, including a server-only manager singleton, GET/HEAD behavior, scope and status policy, no-store route constants, response formats, and fail-closed route protection. Do not use for non-Next servers.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-nextjs-routes
```

### healthcheck-diagnostics-security

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/diagnostics-security/SKILL.md)

```text
Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-diagnostics-security
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-next, load healthcheck-nextjs-routes when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/next/llms.txt).

## Prompts

```text
Expose health routes in Next.js. Use @nexload-sdk/healthcheck-next and healthcheck-nextjs-routes. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-next integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
