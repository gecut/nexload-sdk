---
name: nexload-healthcheck-next-route
description: Use when adding Next.js App Router health, readiness, liveness, startup, diagnostics, or metrics routes for @nexload-sdk/healthcheck-next.
---

# Next.js Health Routes

Use `@nexload-sdk/healthcheck-next`.

Every route with Node/process/container checks must export:

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
```

Readiness route:

```ts
export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "readiness",
  format: "json",
});
```

Protect diagnostics and metrics with a bearer token, IP allowlist, or private network rule.
