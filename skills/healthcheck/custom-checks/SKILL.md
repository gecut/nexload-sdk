---
name: healthcheck-custom-checks
description: Use when writing custom @nexload-sdk/healthcheck checks or collectors with timeout, AbortSignal, stable errors, and raw metrics.
---

# Custom Checks

Use `defineHealthCheck()` and honor `ctx.signal`.

Required pattern:

```ts
const check = defineHealthCheck({
  name: "license",
  scopes: ["readiness", "diagnostics"],
  critical: true,
  async run(ctx) {
    const valid = await verifyLicense({ signal: ctx.signal });
    return ctx.result({
      status: valid ? "ok" : "unhealthy",
      metrics: { valid },
      error: valid ? undefined : { code: "LICENSE_INVALID", message: "License is not valid." },
    });
  },
});
```

Avoid:

- throwing raw errors intentionally
- returning formatted strings for numeric metrics
- using user IDs, request IDs, raw URLs with query strings, or error messages as metric labels
