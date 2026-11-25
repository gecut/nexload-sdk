# @nexload-sdk/healthcheck-node

**Node.js runtime adapter, cgroup v1/v2 container probes, TCP, and DNS checks for `@nexload-sdk/healthcheck`.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/node/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/node/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-node)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-node)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node](https://img.shields.io/badge/runtime-Node-lightgrey.svg)

> [!IMPORTANT]
> A new major release is pending across the healthcheck family in `.changeset/healthcheck-major.md` (import ordering updates, no runtime behavior changes).

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/healthcheck-node` supplies Node.js-specific runtime telemetry, Linux cgroup v1/v2 container resource detection, and network reachability checks (`tcpCheck`, `dnsCheck`) for `@nexload-sdk/healthcheck`. It solves `os.totalmem()` reporting host memory instead of container limits inside Docker/Kubernetes and removes heavy native dependencies like `ping` or `systeminformation`. It is for Node.js services and Next.js Node runtime apps.

What it is not:

- Not an HTTP server or Next.js route handler (use `@nexload-sdk/healthcheck-next`).
- Not a standalone process manager.
- Not compatible with browser or Edge runtimes (uses `node:net`, `node:dns/promises`, `node:fs/promises`, `node:os`, `node:process`).

## Philosophy

- **Container-first resource detection:** Reads cgroup v2 and v1 files and preserves fractional CPU quotas like `0.5`. The runtime memory adapter falls back to `process.constrainedMemory()` / `os.totalmem()`.
- **Zero external dependencies:** Uses built-in `node:*` modules only.
- **Readiness vs. diagnostics separation:** `tcpCheck` and `dnsCheck` target `readiness` (critical), while `containerResourceCheck`, `processMetricsCollector`, and `containerMetricsCollector` default to `diagnostics`.

## Install

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node
# or
npm install @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node
# or
yarn add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node
# or
bun add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies (`@nexload-sdk/healthcheck` is a direct dependency) |

## Quick start

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";
import {
  containerMetricsCollector,
  containerResourceCheck,
  nodeRuntimeAdapter,
  processMetricsCollector,
} from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: nodeRuntimeAdapter(),
  checks: [
    shutdownCheck(),
    memoryCheck(),
    containerResourceCheck({ scopes: ["diagnostics"] }),
  ],
  collectors: [processMetricsCollector(), containerMetricsCollector()],
});
```

## Usage

Container snapshots report memory current and limit bytes, usage ratio, CPU quota, cpuset CPUs, effective CPU count, cgroup version, source, and confidence. `os.totalmem()` can describe the host rather than the container.

### TCP and DNS reachability checks

```ts
import { dnsCheck, tcpCheck } from "@nexload-sdk/healthcheck-node";

const dbTcp = tcpCheck("postgres-tcp", {
  host: "postgres",
  port: 5432,
  timeoutMs: 2000,
});

const apiDns = dnsCheck("api-dns", {
  hostname: "api.internal",
  recordType: "A",
  timeoutMs: 1500,
});
```

### Container resource thresholds

```ts
import { containerResourceCheck } from "@nexload-sdk/healthcheck-node";

const containerCheck = containerResourceCheck({
  scopes: ["diagnostics"],
  memory: {
    usageRatio: { degraded: 0.8, unhealthy: 0.95 },
  },
});
```

## API

### Root entry (`@nexload-sdk/healthcheck-node`)

| Export | Kind | Summary |
| --- | --- | --- |
| `nodeRuntimeAdapter` | `function` | `RuntimeAdapter` using `process`, `os`, and cgroup snapshots |
| `containerResourceCheck` | `function` | Health check reporting cgroup memory and CPU limits |
| `processMetricsCollector` | `function` | Collector emitting `process.*` RSS, heap, CPU, and FS metrics |
| `containerMetricsCollector` | `function` | Collector emitting `container.*` cgroup metrics |
| `tcpCheck` | `function` | TCP socket connection probe (`HEALTH_ERROR_CODES.TCP_CONNECT_FAILED`) |
| `dnsCheck` | `function` | DNS resolution probe (`HEALTH_ERROR_CODES.DNS_RESOLVE_FAILED`) |
| `readContainerResourceSnapshot`, `ContainerResourceOptions`, etc. | `function` / `type` | Re-exported cgroup resource helpers and types from `./cgroup` |

## Configuration

| Function | Option | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `containerResourceCheck` | `scopes` | `readonly HealthScope[]` | `["diagnostics"]` | Scopes where the check runs |
| `containerResourceCheck` | `memory.usageRatio` | `{ degraded: number; unhealthy: number }` | `undefined` | Optional memory usage ratio thresholds |
| `tcpCheck` | `host`, `port`, `timeoutMs`, `scopes` | `string`, `number`, `number`, `HealthScope[]` | `scopes: ["readiness"]` | Target host/port and probe timeout |
| `dnsCheck` | `hostname`, `recordType`, `timeoutMs`, `scopes` | `string`, `"A" \| "AAAA" \| "CNAME" \| "TXT" \| "MX"`, `number`, `HealthScope[]` | `recordType: "A"`, `scopes: ["readiness"]` | Hostname and DNS record type to resolve |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtime:** Node.js only (`node:dns/promises`, `node:net`, `node:fs/promises`, `node:os`, `node:process`, and Linux `/sys/fs/cgroup` reads).

## Caveats

> [!WARNING]
> Do not expose `containerResourceCheck`, `processMetricsCollector`, or `containerMetricsCollector` on public unauthenticated endpoints; they reveal process PID (`processMetricsCollector`), platform, cgroup file paths, and container limits. `runtimeInfoCheck` with `nodeRuntimeAdapter` also exposes architecture and PID.

> [!NOTE]
> On non-Linux hosts, the container snapshot reports `detected: false`, null memory limits, and low confidence; `containerResourceCheck` reports degraded. On Linux without readable cgroup files, confidence is medium, or low when warnings occur. `nodeRuntimeAdapter().getMemory()` falls back to `process.constrainedMemory()` and then `os.totalmem()` for total bytes.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and runtime-neutral checks
- [healthcheck-next](../next/README.md) — Next.js App Router route factories
- [healthcheck-prometheus](../prometheus/README.md) — Prometheus text exporter for collector metrics

## License

MIT
