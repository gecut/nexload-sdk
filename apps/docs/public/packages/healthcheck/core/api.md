# Healthcheck Core API

Public runtime and type exports of the health orchestration package.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/api/
## Functions

### `aggregateStatus`

```ts
aggregateStatus(results: readonly HealthCheckResult[]) => HealthStatus
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/aggregate.ts#L18)

### `autoRuntimeAdapter`

```ts
autoRuntimeAdapter() => RuntimeAdapter
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/runtime.ts#L113)

### `createAbortSignal`

```ts
createAbortSignal(timeoutMs: number | undefined, parent?: AbortSignal) => { signal: AbortSignal; dispose: () => void; }
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/timeout.ts#L1)

### `createHealthManager`

```ts
createHealthManager(options: HealthManagerOptions) => HealthManager
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/manager.ts#L95)

### `defineHealthCheck`

```ts
defineHealthCheck<TName extends string>(definition: HealthCheckDefinition<TName>) => HealthCheckDefinition<TName>
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/define.ts#L6)

### `defineMetricCollector`

```ts
defineMetricCollector<TName extends string>(definition: MetricCollectorDefinition<TName>) => MetricCollectorDefinition<TName>
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/define.ts#L10)

### `genericRuntimeAdapter`

```ts
genericRuntimeAdapter() => RuntimeAdapter
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/runtime.ts#L101)

### `httpCheck`

```ts
httpCheck(name: string, url: string | URL, options?: HttpCheckOptions) => HealthCheckDefinition<string>
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/http-check.ts#L30)

### `memoryCheck`

```ts
memoryCheck(options?: { scopes?: readonly HealthScope[]; availableRatio?: { degraded: number; unhealthy: number; }; usedRatio?: { degraded: number; unhealthy: number; }; critical?: boolean | Partial<Record<HealthScope, boolean>>; }) => HealthCheckDefinition<"memory">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/checks.ts#L125)

### `runtimeInfoCheck`

```ts
runtimeInfoCheck(options?: { scopes?: readonly HealthScope[]; critical?: boolean; }) => HealthCheckDefinition<"runtime.info">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/checks.ts#L29)

### `runtimeMetricsCollector`

```ts
runtimeMetricsCollector(options?: { scopes?: readonly HealthScope[]; }) => MetricCollectorDefinition<"runtime.metrics">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/collectors.ts#L9)

### `shutdownCheck`

```ts
shutdownCheck(options?: { scopes?: readonly HealthScope[]; }) => HealthCheckDefinition<"shutdown">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/checks.ts#L49)

### `sleep`

```ts
sleep(ms: number, signal?: AbortSignal) => Promise<void>
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/timeout.ts#L42)

### `startupCheck`

```ts
startupCheck(options: { isStarted: () => boolean | Promise<boolean>; scopes?: readonly HealthScope[]; timeoutMs?: number; }) => HealthCheckDefinition<"startup">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/checks.ts#L69)

### `statusToHttpStatus`

```ts
statusToHttpStatus(status: HealthStatus, policy?: HealthHttpStatusPolicy) => number
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/http.ts#L18)

### `stringifyHealthJson`

```ts
stringifyHealthJson(report: HealthReport, options?: HealthJsonOptions) => string
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/serializers.ts#L122)

### `summarizeChecks`

```ts
summarizeChecks(results: readonly HealthCheckResult[]) => HealthSummary
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/aggregate.ts#L7)

### `timerLagCheck`

```ts
timerLagCheck(options?: { scopes?: readonly HealthScope[]; sampleMs?: number; thresholds?: { degradedMs: number; unhealthyMs: number; }; critical?: boolean; }) => HealthCheckDefinition<"timer.lag">
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/checks.ts#L90)

### `toHealthJson`

```ts
toHealthJson(report: HealthReport, options?: HealthJsonOptions) => HealthReport
```

Public function exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/serializers.ts#L87)

## Constants

### `DEFAULT_HTTP_STATUS_POLICY`

```ts
DEFAULT_HTTP_STATUS_POLICY: HealthHttpStatusPolicy
```

Public constant exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/http.ts#L6)

### `HEALTH_ERROR_CODES`

```ts
HEALTH_ERROR_CODES: { readonly CHECK_THROWN: "CHECK_THROWN"; readonly CHECK_TIMEOUT: "CHECK_TIMEOUT"; readonly CHECK_ABORTED: "CHECK_ABORTED"; readonly HEALTHCHECK_TIMEOUT: "HEALTHCHECK_TIMEOUT"; readonly HEALTHCHECK_ABORTED: "HEALTHCHECK_ABORTED"; readonly HEALTHCHECK_DEPENDENCY_UNAVAILABLE: "HEALTHCHECK_DEPENDENCY_UNAVAILABLE"; readonly HEALTHCHECK_CONTAINER_LIMIT_UNAVAILABLE: "HEALTHCHECK_CONTAINER_LIMIT_UNAVAILABLE"; readonly HEALTHCHECK_ROUTE_UNAUTHORIZED: "HEALTHCHECK_ROUTE_UNAUTHORIZED"; readonly HEALTHCHECK_INVALID_CONFIG: "HEALTHCHECK_INVALID_CONFIG"; readonly HTTP_STATUS_MISMATCH: "HTTP_STATUS_MISMATCH"; readonly HTTP_BODY_MISMATCH: "HTTP_BODY_MISMATCH"; readonly TCP_CONNECT_FAILED: "TCP_CONNECT_FAILED"; readonly DNS_RESOLVE_FAILED: "DNS_RESOLVE_FAILED"; readonly DATABASE_PING_FAILED: "DATABASE_PING_FAILED"; readonly PAYLOAD_QUERY_FAILED: "PAYLOAD_QUERY_FAILED"; readonly RUNTIME_UNSUPPORTED: "RUNTIME_UNSUPPORTED"; readonly METRIC_UNAVAILABLE: "METRIC_UNAVAILABLE"; }
```

Public constant exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/errors.ts#L1)

### `STRICT_READINESS_HTTP_STATUS_POLICY`

```ts
STRICT_READINESS_HTTP_STATUS_POLICY: HealthHttpStatusPolicy
```

Public constant exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/http.ts#L12)

## Interfaces

### `EnvironmentIdentity`

```ts
interface EnvironmentIdentity {
  name?: string
  region?: string
  zone?: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L31)

### `HealthCheckDefinition`

```ts
interface HealthCheckDefinition<TName extends string = string> {
  kind?: "check"
  name: TName
  component?: string
  scopes: readonly HealthScope[]
  critical?: boolean | Partial<Record<HealthScope, boolean>>
  timeoutMs?: number
  retries?: RetryPolicy
  tags?: readonly string[]
  run(context: HealthRunContext): Promise<HealthCheckRunResult> | HealthCheckRunResult
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L181)

### `HealthCheckResult`

```ts
interface HealthCheckResult<TName extends string = string> {
  name: TName
  component?: string
  scope: HealthRunScope
  status: HealthStatus
  critical: boolean
  observedAt: string
  durationMs: number
  timedOut: boolean
  attempt: number
  metrics: HealthMetrics
  details?: HealthDetails
  error?: HealthErrorInfo
  tags?: readonly string[]
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L101)

### `HealthCheckRunResult`

```ts
interface HealthCheckRunResult {
  status: HealthStatus
  metrics?: HealthMetrics
  details?: HealthDetails
  error?: HealthErrorInfo
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L174)

### `HealthErrorInfo`

```ts
interface HealthErrorInfo {
  code: string
  message: string
  causeName?: string
  causeMessage?: string
  stack?: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L76)

### `HealthHttpStatusPolicy`

```ts
interface HealthHttpStatusPolicy {
  ok: number
  degraded: number
  unhealthy: number
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L246)

### `HealthJsonOptions`

```ts
interface HealthJsonOptions {
  includeDetails?: boolean
  redact?: boolean
  redaction?: Partial<RedactionPolicy>
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/serializers.ts#L81)

### `HealthLinks`

```ts
interface HealthLinks {
  self?: string
  metrics?: string
  diagnostics?: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L126)

### `HealthManager`

```ts
interface HealthManager {
  register(check: HealthCheckDefinition): HealthManager
  registerCollector(collector: MetricCollectorDefinition): HealthManager
  unregister(name: string): boolean
  run(scope: HealthRunScope, options?: HealthRunOptions): Promise<HealthReport>
  setShutdownState(state: boolean, reason?: string): void
  isShuttingDown(): boolean
  dispose(): void
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L236)

### `HealthManagerOptions`

```ts
interface HealthManagerOptions {
  service: ServiceIdentity
  runtime?: RuntimeAdapter | "auto"
  environment?: EnvironmentIdentity
  defaults?: {
    timeoutMs?: number
    concurrency?: number
    /** Defaults to true. Set false to report timed-out checks as degraded. */
    unhealthyOnTimeout?: boolean
    includeStack?: boolean
    profile?: HealthDataProfile
  }
  /** Profiles are passed to checks and collectors as context hints. */
  profiles?: Partial<Record<HealthScope, HealthDataProfile>> & { default?: HealthDataProfile }
  /** @deprecated Configure redaction when calling toHealthJson or stringifyHealthJson. */
  redaction?: Partial<RedactionPolicy>
  checks?: readonly HealthCheckDefinition[]
  collectors?: readonly MetricCollectorDefinition[]
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L207)

### `HealthMetric`

```ts
interface HealthMetric {
  name: string
  value: HealthMetricValue
  unit?:
    | "bytes"
    | "seconds"
    | "milliseconds"
    | "ratio"
    | "count"
    | "percent"
    | "state"
  type?: "gauge" | "counter" | "histogram" | "info"
  labels?: Record<string, string>
  description?: string
  observedAt?: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L84)

### `HealthReport`

```ts
interface HealthReport {
  schemaVersion: "2.0"
  service: ServiceIdentity
  scope: HealthRunScope
  status: HealthStatus
  observedAt: string
  durationMs: number
  runtime: RuntimeIdentity
  environment?: EnvironmentIdentity
  summary: HealthSummary
  checks: readonly HealthCheckResult[]
  metrics: readonly HealthMetric[]
  resources?: Record<string, unknown>
  links?: HealthLinks
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L132)

### `HealthRunContext`

```ts
interface HealthRunContext {
  scope: HealthRunScope
  signal: AbortSignal
  runtime: RuntimeAdapter
  service: ServiceIdentity
  profile: HealthDataProfile
  now: () => number
  getShutdownState: () => { shuttingDown: boolean, reason?: string }
  result: (result: HealthCheckRunResult) => HealthCheckRunResult
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L163)

### `HealthRunOptions`

```ts
interface HealthRunOptions {
  signal?: AbortSignal
  profile?: HealthDataProfile
  /** @deprecated Select a profile and configure serializer detail options instead. */
  includeDiagnostics?: boolean
  includeStacks?: boolean
  timeoutMs?: number
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L227)

### `HealthSummary`

```ts
interface HealthSummary {
  ok: number
  degraded: number
  unhealthy: number
  total: number
  criticalFailed: number
  nonCriticalFailed: number
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L117)

### `HttpCheckOptions`

```ts
interface HttpCheckOptions {
  scopes?: readonly HealthScope[]
  method?: "GET" | "HEAD" | "POST"
  headers?: HeadersInit
  body?: BodyInit | null
  expectedStatus?: number | readonly number[] | { min: number, max: number }
  validateBody?: (body: string, response: Response) => boolean | Promise<boolean>
  timeoutMs?: number
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/http-check.ts#L10)

### `MetricCollectionResult`

```ts
interface MetricCollectionResult {
  metrics: readonly HealthMetric[]
  resources?: Record<string, unknown>
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L193)

### `MetricCollectorDefinition`

```ts
interface MetricCollectorDefinition<TName extends string = string> {
  kind?: "collector"
  name: TName
  scopes?: readonly HealthScope[]
  defaultEnabled?: boolean
  timeoutMs?: number
  collect(context: HealthRunContext): Promise<MetricCollectionResult> | MetricCollectionResult
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L198)

### `RedactionPolicy`

```ts
interface RedactionPolicy {
  redactSecrets: boolean
  redactUrls: "none" | "query" | "origin" | "full"
  includeStack: boolean
  includeErrorMessage: boolean
  allowedDetailKeys?: readonly string[]
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L155)

### `RetryPolicy`

```ts
interface RetryPolicy {
  attempts: number
  delayMs?: number
  backoff?: "none" | "linear" | "exponential"
  retryOn?: readonly HealthStatus[]
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L148)

### `RuntimeAdapter`

```ts
interface RuntimeAdapter {
  name: RuntimeIdentity["name"]
  now(): number
  uptimeSeconds(): number | null
  getRuntimeInfo(): RuntimeIdentity
  getMemory?(): RuntimeMemorySnapshot | Promise<RuntimeMemorySnapshot>
  getCpu?(previous?: RuntimeCpuSnapshot): RuntimeCpuSnapshot | Promise<RuntimeCpuSnapshot>
  onShutdown?(signals: readonly string[], callback: (signal: string) => void): () => void
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L66)

### `RuntimeCpuSnapshot`

```ts
interface RuntimeCpuSnapshot {
  userMicros: number | null
  systemMicros: number | null
  availableParallelism: number | null
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L60)

### `RuntimeIdentity`

```ts
interface RuntimeIdentity {
  name: "node" | "bun" | "unknown"
  version?: string
  revision?: string
  platform?: string
  arch?: string
  pid?: number
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L37)

### `RuntimeMemorySnapshot`

```ts
interface RuntimeMemorySnapshot {
  rssBytes: number | null
  heapTotalBytes: number | null
  heapUsedBytes: number | null
  externalBytes: number | null
  arrayBuffersBytes: number | null
  constrainedBytes: number | null
  availableBytes: number | null
  totalBytes: number | null
  usedRatio: number | null
  availableRatio: number | null
  source: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L46)

### `ServiceIdentity`

```ts
interface ServiceIdentity {
  name: string
  version?: string
  environment?: string
  instanceId?: string
}
```

Public interface exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L24)

## Types

### `HealthDataProfile`

```ts
type HealthDataProfile
  = | "probe"
    | "summary"
    | "monitoring"
    | "diagnostics"
    | "full";
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L11)

### `HealthDetails`

```ts
type HealthDetails = Record<string, unknown>;
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L22)

### `HealthErrorCode`

```ts
type HealthErrorCode
  = (typeof HEALTH_ERROR_CODES)[keyof typeof HEALTH_ERROR_CODES];
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/errors.ts#L21)

### `HealthMetricValue`

```ts
type HealthMetricValue = string | number | boolean | null;
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L18)

### `HealthMetrics`

```ts
type HealthMetrics = Record<string, HealthMetricValue>;
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L20)

### `HealthRunScope`

```ts
type HealthRunScope = HealthScope | "all";
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L9)

### `HealthScope`

```ts
type HealthScope
  = | "liveness"
    | "readiness"
    | "startup"
    | "diagnostics";
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L3)

### `HealthStatus`

```ts
type HealthStatus = "ok" | "degraded" | "unhealthy";
```

Public type exported by @nexload-sdk/healthcheck.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/core/types.ts#L1)

## Primary runtime exports

* `createHealthManager(options)` creates a manager with `run`, shutdown-state, and registration operations.
* `defineHealthCheck()` and `defineMetricCollector()` preserve typed definitions.
* `runtimeInfoCheck`, `shutdownCheck`, `startupCheck`, `timerLagCheck`, `memoryCheck`, and `httpCheck` create built-in checks.
* `runtimeMetricsCollector()` produces report-level runtime metrics.
* `toHealthJson()` and `stringifyHealthJson()` serialize reports with detail and redaction controls.
* `aggregateStatus()` and `summarizeChecks()` operate on completed results.
* `statusToHttpStatus()` applies `DEFAULT_HTTP_STATUS_POLICY` or `STRICT_READINESS_HTTP_STATUS_POLICY`.
* `genericRuntimeAdapter()` and `autoRuntimeAdapter()` avoid importing a runtime integration.
* `createAbortSignal()` and `sleep()` support cancellation-aware checks.

`HEALTH_ERROR_CODES` is the stable error-code vocabulary. Public types include manager, report, check, collector, runtime, retry, redaction, metric, HTTP-policy, and serialization contracts.

Source: [`packages/healthcheck/core/src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/index.ts)
