# logger — Agent usage

Configure a coding agent for @nexload-sdk/logger.

**Topic:** agents
**Package:** `@nexload-sdk/logger` v5.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/logger/agents/
## Install matching skills

Install the skills whose triggers match the task.

### logger

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/logger/SKILL.md)

```text
MUST be loaded before writing, changing or reviewing ANY log call, console.* call, catch block, error handling, job/worker, outbound HTTP/provider call, route handler or observability code in a project that uses @nexload-sdk/logger. Decides whether a log is needed, its level, event name and fields, and what must never be logged. Do not use for metrics/health endpoints (use healthcheck skills).
```

```bash
npx skills add gecut/nexload-sdk --skill logger
```

## Project AGENTS.md

```markdown
Before adding, changing or reviewing any log call, console call, catch block, job/worker or outbound call, load the installed logger skill and follow its Decision flow. Use @nexload-sdk/logger for application and package logging. Never use console.* in package or app source.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/logger/llms.txt).

## Prompts

```text
Correlate a request with its log events. Use @nexload-sdk/logger and logger. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/logger integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
