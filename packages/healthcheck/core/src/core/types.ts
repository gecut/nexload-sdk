export type HealthStatus = "ok" | "degraded" | "unhealthy";

export type HealthScope
  = | "liveness"
    | "readiness"
    | "startup"
    | "diagnostics";

export type HealthRunScope = HealthScope | "all";

export type HealthDataProfile
  = | "probe"
    | "summary"
    | "monitoring"
    | "diagnostics"
    | "full";

export type HealthMetricValue = string | number | boolean | null;

export type HealthMetrics = Record<string, HealthMetricValue>;

export type HealthDetails = Record<string, unknown>;

export interface ServiceIdentity {
  name: string
  version?: string
  environment?: string
  instanceId?: string
}

export interface EnvironmentIdentity {
  name?: string
  region?: string
  zone?: string
}

export interface RuntimeIdentity {
  name: "node" | "bun" | "unknown"
  version?: string
  revision?: string
  platform?: string
  arch?: string
  pid?: number
}

export interface RuntimeMemorySnapshot {
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

export interface RuntimeCpuSnapshot {
  userMicros: number | null
  systemMicros: number | null
  availableParallelism: number | null
}

export interface RuntimeAdapter {
  name: RuntimeIdentity["name"]
  now(): number
  uptimeSeconds(): number | null
  getRuntimeInfo(): RuntimeIdentity
  getMemory?(): RuntimeMemorySnapshot | Promise<RuntimeMemorySnapshot>
  getCpu?(previous?: RuntimeCpuSnapshot): RuntimeCpuSnapshot | Promise<RuntimeCpuSnapshot>
  onShutdown?(signals: readonly string[], callback: (signal: string) => void): () => void
}

export interface HealthErrorInfo {
  code: string
  message: string
  causeName?: string
  causeMessage?: string
  stack?: string
}

export interface HealthMetric {
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

export interface HealthCheckResult<TName extends string = string> {
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

export interface HealthSummary {
  ok: number
  degraded: number
  unhealthy: number
  total: number
  criticalFailed: number
  nonCriticalFailed: number
}

export interface HealthLinks {
  self?: string
  metrics?: string
  diagnostics?: string
}

export interface HealthReport {
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

export interface RetryPolicy {
  attempts: number
  delayMs?: number
  backoff?: "none" | "linear" | "exponential"
  retryOn?: readonly HealthStatus[]
}

export interface RedactionPolicy {
  redactSecrets: boolean
  redactUrls: "none" | "query" | "origin" | "full"
  includeStack: boolean
  includeErrorMessage: boolean
  allowedDetailKeys?: readonly string[]
}

export interface HealthRunContext {
  scope: HealthRunScope
  signal: AbortSignal
  runtime: RuntimeAdapter
  service: ServiceIdentity
  profile: HealthDataProfile
  now: () => number
  getShutdownState: () => { shuttingDown: boolean, reason?: string }
  result: (result: HealthCheckRunResult) => HealthCheckRunResult
}

export interface HealthCheckRunResult {
  status: HealthStatus
  metrics?: HealthMetrics
  details?: HealthDetails
  error?: HealthErrorInfo
}

export interface HealthCheckDefinition<TName extends string = string> {
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

export interface MetricCollectionResult {
  metrics: readonly HealthMetric[]
  resources?: Record<string, unknown>
}

export interface MetricCollectorDefinition<TName extends string = string> {
  kind?: "collector"
  name: TName
  scopes?: readonly HealthScope[]
  defaultEnabled?: boolean
  timeoutMs?: number
  collect(context: HealthRunContext): Promise<MetricCollectionResult> | MetricCollectionResult
}

export interface HealthManagerOptions {
  service: ServiceIdentity
  runtime?: RuntimeAdapter | "auto"
  environment?: EnvironmentIdentity
  defaults?: {
    timeoutMs?: number
    concurrency?: number
    unhealthyOnTimeout?: boolean
    includeStack?: boolean
    profile?: HealthDataProfile
  }
  profiles?: Partial<Record<HealthScope, HealthDataProfile>> & { default?: HealthDataProfile }
  redaction?: Partial<RedactionPolicy>
  checks?: readonly HealthCheckDefinition[]
  collectors?: readonly MetricCollectorDefinition[]
}

export interface HealthRunOptions {
  signal?: AbortSignal
  profile?: HealthDataProfile
  includeDiagnostics?: boolean
  includeStacks?: boolean
  timeoutMs?: number
}

export interface HealthManager {
  register(check: HealthCheckDefinition): HealthManager
  registerCollector(collector: MetricCollectorDefinition): HealthManager
  unregister(name: string): boolean
  run(scope: HealthRunScope, options?: HealthRunOptions): Promise<HealthReport>
  setShutdownState(state: boolean, reason?: string): void
  isShuttingDown(): boolean
  dispose(): void
}

export interface HealthHttpStatusPolicy {
  ok: number
  degraded: number
  unhealthy: number
}
