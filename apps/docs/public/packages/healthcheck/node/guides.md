# Production Guides & Recipes

Configuring container resource checks in Docker/Kubernetes, TCP/DNS network probes, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/guides/
## Container Resource Checks in Kubernetes / Docker

When running inside containers, Node's `os.totalmem()` reports the host machine's total RAM rather than the container's cgroup memory limit. `@nexload-sdk/healthcheck-node` automatically inspects Linux cgroups to prevent silent out-of-memory (OOM) kills:

```ts
import { containerResourceCheck } from "@nexload-sdk/healthcheck-node";

const check = containerResourceCheck({
  memoryUsageWarningPercent: 80,  // "degraded" when above 80%
  memoryUsageCriticalPercent: 95, // "unhealthy" when above 95%
  cpuThrottleWarningPercent: 20,  // "degraded" when throttled >20%
});
```

***

## TCP & DNS Dependency Probes

Verify external database and downstream microservice reachability during readiness probes:

```ts
import { dnsCheck, tcpCheck } from "@nexload-sdk/healthcheck-node";

// 1. Verify TCP port connectivity (e.g. Postgres or Redis)
const redisTcp = tcpCheck({
  name: "redis.connection",
  host: process.env.REDIS_HOST ?? "localhost",
  port: 6379,
  timeoutMs: 2000,
  scopes: ["readiness"],
});

// 2. Verify external DNS resolution
const stripeDns = dnsCheck({
  name: "dns.stripe",
  hostname: "api.stripe.com",
  timeoutMs: 1500,
  scopes: ["readiness"],
});
```

***

## Troubleshooting & Common Pitfalls

### 1. `cgroup` Resource Check Reports "Degraded" on Non-Linux Hosts

On macOS or Windows development machines, Linux cgroup controllers do not exist. `@nexload-sdk/healthcheck-node` safely falls back to host OS metrics and reports a low-confidence degraded flag in dev environments. In production Linux containers, full cgroup v1/v2 metrics are parsed automatically.

### 2. TCP Probe Leaks Sockets

`tcpCheck` immediately destroys the created socket once the TCP handshake completes or times out. Ensure external firewalls allow transient health check connection attempts.
