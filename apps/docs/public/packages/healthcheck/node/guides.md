# Healthcheck Node guides

Configure container thresholds and network dependency checks.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/guides/
```ts
import { containerResourceCheck, dnsCheck, tcpCheck } from "@nexload-sdk/healthcheck-node";

const checks = [
  containerResourceCheck({
    memory: { usageRatio: { degraded: 0.85, unhealthy: 0.95 } },
    scopes: ["diagnostics"],
  }),
  tcpCheck("postgres", { host: "db", port: 5432, timeoutMs: 500 }),
  dnsCheck("service-dns", { hostname: "api.internal", recordType: "A" }),
];
```

Keep infrastructure dependencies in readiness. A DNS or database outage should not normally restart a healthy process.
