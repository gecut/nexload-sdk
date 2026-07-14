---
name: healthcheck-core
description: Use when integrating or modifying @nexload-sdk/healthcheck core health managers, scopes, checks, collectors, reports, profiles, redaction, or JSON output.
---

# Nexload Healthcheck Core

Use `@nexload-sdk/healthcheck` for runtime-neutral orchestration only.

Rules:

- Create managers with `createHealthManager()`.
- Use scopes exactly: `liveness`, `readiness`, `startup`, `diagnostics`.
- Put dependency checks in readiness by default, not liveness.
- Keep diagnostics protected and detail-rich only behind private routes.
- Metrics should be raw numbers, booleans, strings, or null.
- Do not import Next.js, Payload, Bun, Prometheus, OpenTelemetry, `ping`, or `systeminformation` from root.

Preferred minimal setup:

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: "auto",
  checks: [shutdownCheck(), memoryCheck()],
});
```
