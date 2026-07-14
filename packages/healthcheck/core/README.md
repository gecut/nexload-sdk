# @nexload-sdk/healthcheck

Runtime-neutral health orchestration and monitoring reports for production services.

## What it is

`@nexload-sdk/healthcheck` runs checks and collectors safely, then returns a stable JSON report for liveness, readiness, startup, diagnostics, and monitoring exporters.

It provides:

- timeout and cancellation for every check
- thrown-error isolation
- critical/non-critical status aggregation
- raw machine-readable metrics
- redaction helpers
- framework-neutral report serialization
- plugin authoring helpers

## What it is not

- It does not start an HTTP server.
- It does not import Next.js, Payload, Prometheus, OpenTelemetry, Bun, `ping`, or `systeminformation`.
- It does not make database/cache/HTTP failures fail liveness by default.
- It does not expose diagnostics safely unless your route protects them.

## Install

```bash
pnpm add @nexload-sdk/healthcheck
```

Common integrations:

```bash
pnpm add @nexload-sdk/healthcheck-node
pnpm add @nexload-sdk/healthcheck-next
pnpm add @nexload-sdk/healthcheck-prometheus
pnpm add @nexload-sdk/healthcheck-payload payload
```

## Quick start

```ts
import {
  createHealthManager,
  memoryCheck,
  runtimeInfoCheck,
  shutdownCheck,
  timerLagCheck,
} from "@nexload-sdk/healthcheck";

export const health = createHealthManager({
  service: { name: "api", version: process.env.APP_VERSION },
  runtime: "auto",
  checks: [
    shutdownCheck(),
    runtimeInfoCheck(),
    memoryCheck(),
    timerLagCheck(),
  ],
});

const report = await health.run("readiness");
console.log(report.status);
```

## Core concepts

Scopes:

| Scope | Purpose | Dependency failures |
|---|---|---|
| `liveness` | Process should keep running. | No, not by default. |
| `readiness` | Service can receive traffic. | Yes. |
| `startup` | Startup has completed. | Yes. |
| `diagnostics` | Protected operational detail. | Usually non-critical. |

Checks affect health status. Collectors add monitoring data without changing status unless you explicitly model them as checks.

Default HTTP mapping is `ok -> 200`, `degraded -> 200`, `unhealthy -> 503`.

## Node.js setup

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
  collectors: [
    processMetricsCollector(),
    containerMetricsCollector(),
  ],
});
```

## Bun setup

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter, bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({ fetch: () => new Response("ok") });

export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [
    shutdownCheck(),
    bunServerMetricsCheck(server),
  ],
});
```

## Next.js App Router setup

Install:

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node @nexload-sdk/healthcheck-next
```

Create `src/lib/health.ts`:

```ts
import { createHealthManager, memoryCheck, shutdownCheck, timerLagCheck } from "@nexload-sdk/healthcheck";
import { containerResourceCheck, nodeRuntimeAdapter } from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: {
    name: "web",
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    environment: process.env.NODE_ENV,
  },
  runtime: nodeRuntimeAdapter(),
  checks: [
    shutdownCheck(),
    memoryCheck(),
    timerLagCheck(),
    containerResourceCheck({ scopes: ["diagnostics"] }),
  ],
});
```

Create `app/api/health/ready/route.ts`:

```ts
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "readiness",
  format: "json",
});
```

Diagnostics should be protected:

```ts
export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "diagnostics",
  format: "json",
  includeDetails: true,
  protect: {
    bearerToken: process.env.HEALTHCHECK_DIAGNOSTICS_TOKEN,
    trustProxy: true,
    allowCidrs: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  },
});
```

## Docker and container resource detection

`@nexload-sdk/healthcheck-node` reads cgroup v2 and v1 files before using Node or OS fallbacks.

It reports:

- memory current bytes
- memory limit bytes
- memory usage ratio
- CPU quota CPUs
- cpuset CPUs
- effective CPU count
- cgroup version
- source and confidence

This matters because `os.totalmem()` can describe the host, not the container.

## Kubernetes probes

Recommended mapping:

```txt
/livez       -> health.run("liveness")
/readyz      -> health.run("readiness")
/startupz    -> health.run("startup")
/diagnostics -> health.run("diagnostics") with protection
```

Do not put database, cache, or external HTTP checks in liveness unless you intentionally want those failures to restart the process.

## Monitoring exporters

JSON:

```ts
import { stringifyHealthJson } from "@nexload-sdk/healthcheck";

const body = stringifyHealthJson(report, { includeDetails: false, redact: true });
```

Prometheus/OpenMetrics:

```ts
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const text = toPrometheusText(report, { prefix: "nexload" });
```

Next.js metrics route:

```ts
import { createNextMetricsRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const { GET } = createNextMetricsRoute(health, {
  format: "prometheus",
  scope: "all",
  prefix: "nexload",
});
```

OpenTelemetry-friendly transforms:

```ts
import { toOtelMetricRecords, toOtelResourceAttributes } from "@nexload-sdk/healthcheck-otel";
```

## Custom checks

```ts
import { defineHealthCheck } from "@nexload-sdk/healthcheck";

const licenseCheck = defineHealthCheck({
  name: "license",
  scopes: ["readiness", "diagnostics"],
  critical: true,
  async run(ctx) {
    const valid = await verifyLicense({ signal: ctx.signal });

    return ctx.result({
      status: valid ? "ok" : "unhealthy",
      metrics: { valid },
      error: valid
        ? undefined
        : { code: "LICENSE_INVALID", message: "License is not valid." },
    });
  },
});
```

## Security and redaction

Public probe routes should return minimal data. Diagnostics and metrics can expose runtime versions, process metrics, dependency names, and failure details. Protect them with authentication, private networking, IP allowlists, or reverse-proxy rules.

Never expose:

- environment variables
- secrets
- authorization headers
- cookies
- database URLs
- connection strings
- raw stack traces in public responses

## Payload integration

```ts
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

const check = payloadHealthCheck(payload, {
  collection: "users",
  limit: 1,
  depth: 0,
});
```

Use a small deterministic collection. Payload is an optional peer dependency of the Payload package only.

## Performance model

The manager runs checks with a configurable concurrency limit, applies timeout/cancellation, and prevents a thrown check from rejecting the whole report. Built-in defaults avoid heavy diagnostics and avoid high-cardinality metric labels.

## Migration from previous versions

Breaking changes:

- `HealthCheckType` is replaced by `HealthScope`.
- Class-based checks are replaced by `defineHealthCheck()` factories.
- `HealthManager` construction is replaced by `createHealthManager()`.
- `NetworkHealthCheck` is replaced by `httpCheck()` plus Node `tcpCheck()` and `dnsCheck()`.
- Payload integration moved to `@nexload-sdk/healthcheck-payload`.
- Root no longer depends on `payload`, `ping`, `systeminformation`, logger, or env packages.
- Metrics are raw numbers/booleans/null where possible.

## Troubleshooting

- `CHECK_TIMEOUT`: the check exceeded its timeout or ignored cancellation.
- `CHECK_THROWN`: the check threw; the report stayed valid.
- `HEALTHCHECK_DEPENDENCY_UNAVAILABLE`: an HTTP dependency could not be reached.
- `HEALTHCHECK_ROUTE_UNAUTHORIZED`: a protected route rejected the request.
- `HEALTHCHECK_CONTAINER_LIMIT_UNAVAILABLE`: container resource data could not be read.

## LLM-friendly contract summary

When modifying this package:

1. Keep the root package runtime-neutral and lightweight.
2. Do not import Payload, Next.js, Prometheus, OpenTelemetry, Bun, `ping`, or `systeminformation` from root.
3. `HealthManager.run()` must not reject because one check failed.
4. Every check receives an `AbortSignal`.
5. Every check result includes `observedAt` and `durationMs`.
6. Metrics should be raw numbers, booleans, strings, or null.
7. Dependency checks affect readiness, not liveness, by default.
8. Diagnostics must be protected.
9. Container limits must prefer cgroup v2/v1 over host OS values.
10. Prometheus labels must stay low-cardinality.
