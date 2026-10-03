# Healthcheck Core: Production Guides & Architecture | Nexload SDK

Authoring custom checks, configuring timeouts and retries, status aggregation rules, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/guides/
## Authoring Custom Checks

A check implements a simple async contract returning an object with `status` and optional `data`:

```ts
import type { CheckDefinition } from "@nexload-sdk/healthcheck";

export function postgresCheck(dbPool: any): CheckDefinition {
  return {
    name: "database.postgres",
    scopes: ["readiness", "diagnostics"], // Excluded from liveness!
    critical: true,                       // Failure marks service unhealthy
    timeoutMs: 3000,                      // Abort after 3 seconds
    run: async () => {
      const client = await dbPool.connect();
      try {
        await client.query("SELECT 1");
        return { status: "ok" };
      } finally {
        client.release();
      }
    },
  };
}
```

***

## Status Aggregation Model

The health manager aggregates results across all executed checks according to strict operational hierarchy:

1. **`unhealthy`**: If ANY critical check fails (`status: "unhealthy"` or unhandled error).
2. **`degraded`**: If all critical checks pass, but one or more non-critical checks return `"degraded"` or `"unhealthy"`.
3. **`ok`**: When all executed checks pass with `"ok"`.

```ts
const report = await health.run("readiness");

// Kubernetes readiness HTTP response pattern:
const httpStatus = report.status === "ok" ? 200 : report.status === "degraded" ? 200 : 503;
```

***

## The Liveness Cascade Anti-Pattern

> \[!CAUTION]
> **Never Put External Dependencies into Liveness Probes!**
> If your database has an outage and your Postgres check is part of `liveness`, Kubernetes will kill and restart every single application container simultaneously. This creates a massive thundering herd that prevents the database from ever recovering.
>
> * Put database, cache, and third-party checks in **`readiness`**.
> * Put only internal process deadlock, event-loop lag, and memory starvation checks in **`liveness`**.

***

## Troubleshooting & Common Pitfalls

### 1. Check Is Timing Out Intermittently

Check timeouts use native `AbortSignal`. If your database or HTTP client does not accept an `AbortSignal`, the background query may continue running after the manager times out. Always pass `signal` to underlying network clients:

```ts
run: async ({ signal }) => {
  return await fetch("https://internal.service/health", { signal });
}
```

### 2. Service Restart Loop During Deployments

Ensure slow cold-start operations (e.g. database migrations) are assigned to the `startup` scope and your deployment orchestrator configures a `startupProbe` with an appropriate `failureThreshold`.

### 3. Sensitive Credentials Leaking in Health Reports

When returning error data from checks, `@nexload-sdk/healthcheck` automatically redacts standard authorization headers and connection strings. Do not manually format plain-text database URLs with passwords into the public `message` string.
