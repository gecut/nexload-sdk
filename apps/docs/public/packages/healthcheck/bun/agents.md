# healthcheck-bun — Agent usage

Configure a coding agent for @nexload-sdk/healthcheck-bun.

**Topic:** agents
**Package:** `@nexload-sdk/healthcheck-bun` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/agents/
## Install matching skills

Use the shared healthcheck skill for check design. There is no dedicated Bun skill.

### healthcheck-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/core/SKILL.md)

```text
Use when integrating or changing the runtime-neutral @nexload-sdk/healthcheck manager, scopes, profiles, aggregation, serialization, built-in checks, collectors, retries, timeouts, shutdown lifecycle, or report contracts. Do not use for framework route wiring, exporter formatting, or one custom check in isolation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-core
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-bun, load healthcheck-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/bun/llms.txt).

## Prompts

```text
Inspect a Bun server. Use @nexload-sdk/healthcheck-bun and healthcheck-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-bun integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
