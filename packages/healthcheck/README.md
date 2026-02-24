# @nexload-sdk/healthcheck

Framework-agnostic health check manager for Node.js services with built-in liveness/readiness checks.

## Install

```bash
pnpm add @nexload-sdk/healthcheck
```

## Exports

Root exports (`@nexload-sdk/healthcheck`):

- `HealthManager`
- `HealthCheck` (base class)
- `MemoryHealthCheck`
- `ProcessorHealthCheck`
- `UptimeHealthCheck`
- `NetworkHealthCheck`
- core types (`HealthCheckResult`, `HealthStatus`, `HealthCheckType`, ...)

Database extension exports (`@nexload-sdk/healthcheck/database`):

- `DatabaseHealthCheck`
- `PayloadAdapter`
- `DatabaseClientAdapter`

## Quick Start

```ts
import {
  HealthManager,
  MemoryHealthCheck,
  ProcessorHealthCheck,
  UptimeHealthCheck,
  NetworkHealthCheck
} from "@nexload-sdk/healthcheck";
import { DatabaseHealthCheck, PayloadAdapter } from "@nexload-sdk/healthcheck/database";

const health = new HealthManager({
  checks: [
    new MemoryHealthCheck(),
    new ProcessorHealthCheck(),
    new UptimeHealthCheck(),
    new NetworkHealthCheck("8.8.8.8")
    // new DatabaseHealthCheck(new PayloadAdapter(payload, { collection: "users", limit: 1 }))
  ],
  security: { token: process.env.HEALTH_TOKEN }
});

health.setShutdownSignal(["SIGTERM", "SIGINT"]);

const readiness = await health.run("readiness");
```

## HealthManager API

### `new HealthManager(options?)`

Options:

- `checks?: HealthCheck[]`
- `security?: { token?: string; ipWhitelist?: string[] }`

### Methods

- `addCheck(check)`
- `run("liveness" | "readiness")`
- `setShutdownSignal(signals?)`
- `isShuttingDown()`
- `authorize(token?, ip?)`

## Built-in Checks

- `MemoryHealthCheck`: liveness + readiness (memory pressure)
- `ProcessorHealthCheck`: liveness (CPU load)
- `UptimeHealthCheck`: liveness
- `NetworkHealthCheck(host)`: readiness (ping latency)
- `DatabaseHealthCheck(adapter)`: readiness (subpath export)

## Notes

- The package does not expose an HTTP server; wire it into your framework route/controller.
- `HealthManager.run()` returns a summary object plus per-check `details`.
