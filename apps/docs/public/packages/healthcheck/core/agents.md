# healthcheck — Agent usage

Configure a coding agent for @nexload-sdk/healthcheck.

**Topic:** agents
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/agents/
## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/core/SKILL.md)

```text
Use when integrating or changing the runtime-neutral @nexload-sdk/healthcheck manager, scopes, profiles, aggregation, serialization, built-in checks, collectors, retries, timeouts, shutdown lifecycle, or report contracts. Do not use for framework route wiring, exporter formatting, or one custom check in isolation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-core
```

### healthcheck-custom-checks

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/custom-checks/SKILL.md)

```text
Use when implementing or reviewing an individual custom @nexload-sdk/healthcheck check or metric collector, including check-versus-collector choice, AbortSignal propagation, scope criticality, raw metrics, stable errors, timeout and retry safety, side effects, and focused tests. Do not use for manager-only setup or a shipped adapter.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-custom-checks
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
For @nexload-sdk/healthcheck, load healthcheck-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/core/llms.txt).

## Prompts

```text
Decide when a shop can accept traffic. Use @nexload-sdk/healthcheck and healthcheck-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
