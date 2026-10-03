# Healthcheck Suite

The **Healthcheck Suite** is a modular, zero-dependency family of 7 packages designed to provide production-grade liveness, readiness, and observability probing across heterogeneous runtimes without coupling the core logic to any web framework or transport.

---

## 1. Core Architecture (`@nexload-sdk/healthcheck`)

The core package (`packages/healthcheck/core`) defines the foundation:

### Core Concepts:
- **Checks (`HealthCheck`):** Discrete, named assertions that evaluate a single subsystem or dependency (e.g., PostgreSQL connectivity, Redis ping, disk space). Returns a status (`healthy`, `degraded`, `unhealthy`).
- **Collectors (`MetricCollector`):** Informational samplers that gather quantitative runtime telemetry (e.g., memory usage, event loop latency, request count) without asserting an unhealthy status.
- **Scopes (`HealthScope`):** Groupings of checks to support distinct operational intents:
  - `liveness`: Is the process running and able to process work? (If failing, container orchestrator restarts the pod).
  - `readiness`: Can the service accept customer traffic right now? (If failing, load balancer removes the pod).
  - `startup`: Has initial bootstrap completed?
- **HealthManager:** The central orchestrator that registers checks, enforces individual and overall execution timeouts, executes checks concurrently, and aggregates results into a deterministic `HealthReport`.

---

## 2. The 7 Packages & Their Responsibilities

### 1. `@nexload-sdk/healthcheck` (Core)
- **Path:** `packages/healthcheck/core`
- **Responsibility:** Pure TypeScript health check manager, status aggregation logic, timeout wrappers, and serialization helpers.
- **Dependencies:** None (zero external dependencies).

### 2. `@nexload-sdk/healthcheck-node`
- **Path:** `packages/healthcheck/node`
- **Responsibility:** Probes tailored to Node.js environments:
  - Node.js process metrics (resident set size, heap used/total, external memory, active handles).
  - Linux `cgroups` (v1 and v2) memory and CPU limits detection (essential inside Kubernetes / Docker containers).
  - Network reachability checks (TCP socket connect probe, DNS resolution probe).
- **Caveat:** Does not create an HTTP endpoint; supplies checks to the `HealthManager`.

### 3. `@nexload-sdk/healthcheck-bun`
- **Path:** `packages/healthcheck/bun`
- **Responsibility:** Probes and collectors tailored for Bun:
  - Identifies Bun runtime version and environment flags.
  - Observes `Bun.serve` server statistics (requests received, active connections).
  - Used in Nexload's `apps/api` (Bun BFF layer).

### 4. `@nexload-sdk/healthcheck-next`
- **Path:** `packages/healthcheck/next`
- **Responsibility:** Next.js App Router route handlers:
  - Provides `createHealthRouteHandler()` to generate `GET` handlers for `app/api/health/route.ts`.
  - Automatically sets `Cache-Control: no-store, no-cache, must-revalidate` and appropriate HTTP status codes (200 for healthy/degraded, 503 for unhealthy).
  - Supports content negotiation (JSON by default, Prometheus text if requested via query or header).

### 5. `@nexload-sdk/healthcheck-prometheus`
- **Path:** `packages/healthcheck/prometheus`
- **Responsibility:** Serializes a `HealthReport` into valid Prometheus / OpenMetrics plain text format:
  - Maps check statuses to gauge metrics (`service_health_status{check="db"} 1`).
  - Serializes collector values with appropriate HELP and TYPE comments.
  - Zero dependencies (does not require `prom-client`).

### 6. `@nexload-sdk/healthcheck-otel`
- **Path:** `packages/healthcheck/otel`
- **Responsibility:** Transforms a `HealthReport` into OpenTelemetry-compatible resource attributes and metric data points:
  - Does not require pulling in the heavy `@opentelemetry/sdk-metrics` if only emitting data structures.
  - Enables clean bridging to OpenTelemetry Collectors.

### 7. `@nexload-sdk/healthcheck-payload`
- **Path:** `packages/healthcheck/payload`
- **Responsibility:** Payload CMS readiness check:
  - Performs a controlled, lightweight query via Payload Local API (e.g., querying a system collection with `limit: 1`).
  - Verifies that Payload has initialized and that PostgreSQL database queries succeed without crashing the process.

---

## 3. Example: Composing Healthcheck in a Nexload Service

```typescript
import { HealthManager } from '@nexload-sdk/healthcheck';
import { createNodeMemoryCollector, createTcpCheck } from '@nexload-sdk/healthcheck-node';
import { createPayloadReadinessCheck } from '@nexload-sdk/healthcheck-payload';
import { formatPrometheus } from '@nexload-sdk/healthcheck-prometheus';
import payload from 'payload';

// 1. Initialize manager
const health = new HealthManager({ serviceName: 'nexload-cms' });

// 2. Register runtime telemetry
health.registerCollector(createNodeMemoryCollector());

// 3. Register dependency checks
health.registerCheck(
  createTcpCheck({
    name: 'postgres_tcp',
    host: 'postgres',
    port: 5432,
    timeoutMs: 2000,
    scope: 'readiness',
  })
);

health.registerCheck(
  createPayloadReadinessCheck({
    payload,
    scope: 'readiness',
  })
);

// 4. Execute on demand
const report = await health.run({ scope: 'readiness' });
if (report.status === 'unhealthy') {
  console.error('Service unhealthy:', report);
}
```
