# Healthcheck Payload: Production Guides & Readiness Probes | Nexload SDK

Probing Payload collections, database latency, lightweight health queries, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/guides/
## Lightweight Readiness Probing

To minimize database load during frequent health checks (e.g. every 5-10 seconds by Kubernetes):

```ts
import { payloadReadinessCheck } from "@nexload-sdk/healthcheck-payload";

const check = payloadReadinessCheck(payload, {
  collection: "users",
  // Excluded from liveness probe:
  scopes: ["readiness"],
  timeoutMs: 3000,
});
```

The check requests zero population depth (`depth: 0`) and limits results to 1 document, ensuring minimal memory and database CPU utilization.

***

## Troubleshooting & Common Pitfalls

### 1. `PAYLOAD_QUERY_FAILED`

Indicates that the underlying database connection timed out or rejected the query. Check database pool exhaustion, connection string validity, or network partitions.

### 2. Readiness Probe Is Slow (>1 second)

Ensure the checked collection has an index and does not execute heavy `afterRead` hooks. If needed, create a dedicated minimal `_health` collection with a single static document.

### 3. Never Assign Payload Database Check to Liveness

If the database goes down, liveness failure will cause continuous pod restarts. Always assign database checks to `scopes: ["readiness"]`.
