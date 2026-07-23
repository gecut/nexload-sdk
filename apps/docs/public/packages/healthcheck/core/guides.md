# Healthcheck Core guides

Design custom checks, safe scopes, and operational output.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/guides/
## Define a dependency check

```ts
import { defineHealthCheck } from "@nexload-sdk/healthcheck";

const database = defineHealthCheck({
  name: "database",
  component: "postgres",
  scopes: ["readiness", "diagnostics"],
  critical: { readiness: true, diagnostics: false },
  timeoutMs: 1_000,
  async run(ctx) {
    await db.query("select 1", { signal: ctx.signal });
    return { status: "ok", metrics: { up: true } };
  },
});
```

Honor `ctx.signal`, use stable error codes, and keep details free of credentials. Put checks for recoverable dependencies in readiness. Liveness should normally test the process itself.

Call `health.setShutdownState(true, reason)` before draining traffic. `shutdownCheck()` then makes liveness and readiness unhealthy.

Use `stringifyHealthJson(report, { includeDetails: false, redact: true })` for public output. Prefer exporter packages for monitoring rather than scraping diagnostic JSON.
