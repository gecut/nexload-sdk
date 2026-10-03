# Healthcheck Node: Node.js & Container Integration | Nexload SDK

Node.js runtime adapter, cgroup v1/v2 container metrics, process metrics, and TCP/DNS health checks.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/
**Package:** `@nexload-sdk/healthcheck-node`

**Current released version:** `2.1.0`

Node.js runtime, process, cgroup, TCP, and DNS adapters for @nexload-sdk/healthcheck.

[npm](https://www.npmjs.com/package/@nexload-sdk/healthcheck-node) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/healthcheck/node)

`@nexload-sdk/healthcheck-node` equips `@nexload-sdk/healthcheck` with Node.js runtime introspection, process telemetry, Linux cgroup v1/v2 container resource limits, and TCP/DNS dependency checks.

***

## 10-Second Code Snippet

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";
import {
  containerResourceCheck,
  nodeRuntimeAdapter,
  processMetricsCollector,
} from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "node-service" },
  runtime: nodeRuntimeAdapter(),
  checks: [shutdownCheck(), memoryCheck(), containerResourceCheck()],
  collectors: [processMetricsCollector()],
});

const report = await health.run("readiness");
console.log(report.status, report.runtime.name); // "ok", "node"
```

***

## What You Get

* **Node.js Runtime Adapter**: Exposes V8 heap memory stats, event loop delays, process uptime, and active handle counts.
* **Linux Container & Cgroup Detection**: Autodetects Linux cgroup v1 and cgroup v2 memory limits and CPU quotas inside Docker, Kubernetes, or Dokploy containers.
* **Network Dependency Probes**: Built-in non-blocking `tcpCheck()` and `dnsCheck()` to verify database reachability and DNS resolution.
* **Process & Container Collectors**: Observational collectors that append telemetry without failing deployment health probes.

***

## Installation & Requirements

```bash
pnpm add @nexload-sdk/healthcheck-node @nexload-sdk/healthcheck
```

With alternative package managers:

```bash
# npm
npm install @nexload-sdk/healthcheck-node @nexload-sdk/healthcheck

# bun
bun add @nexload-sdk/healthcheck-node @nexload-sdk/healthcheck
```

Requires Node.js `>=20.9.0`.

***

## Next Steps

* Explore [Production Guides & Container Recipes](./guides/) for Docker limits, TCP checks, and troubleshooting.
* Check the [API Reference & Signatures](./api/) for all exported checks and adapters.
