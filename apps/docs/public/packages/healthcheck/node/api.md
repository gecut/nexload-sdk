# Healthcheck Node API

Public exports for Node runtime and operational checks.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/api/
## Functions

### `containerMetricsCollector`

```ts
containerMetricsCollector(options?: ContainerResourceOptions & { scopes?: readonly HealthScope[]; }) => MetricCollectorDefinition<"container.metrics">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L172)

### `containerResourceCheck`

```ts
containerResourceCheck(options?: { scopes?: readonly HealthScope[]; memory?: { usageRatio?: { degraded: number; unhealthy: number; }; }; root?: string; critical?: boolean | Partial<Record<HealthScope, boolean>>; }) => HealthCheckDefinition<"container.resources">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L105)

### `dnsCheck`

```ts
dnsCheck(name: string, options: { hostname: string; recordType?: "A" | "AAAA" | "CNAME" | "TXT" | "MX"; scopes?: readonly HealthScope[]; timeoutMs?: number; }) => HealthCheckDefinition<string>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L254)

### `nodeRuntimeAdapter`

```ts
nodeRuntimeAdapter() => RuntimeAdapter
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L59)

### `parseCpuList`

```ts
parseCpuList(value: string | null) => number | null
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L81)

### `processMetricsCollector`

```ts
processMetricsCollector(options?: { scopes?: readonly HealthScope[]; }) => MetricCollectorDefinition<"process.metrics">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L147)

### `readContainerResourceSnapshot`

```ts
readContainerResourceSnapshot(options?: ContainerResourceOptions) => Promise<ContainerResourceSnapshot>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L307)

### `tcpCheck`

```ts
tcpCheck(name: string, options: { host: string; port: number; scopes?: readonly HealthScope[]; timeoutMs?: number; }) => HealthCheckDefinition<string>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L196)

## Interfaces

### `ContainerCpuSnapshot`

```ts
interface ContainerCpuSnapshot {
  quotaMicros: number | null
  periodMicros: number | null
  quotaCpus: number | null
  cpusetCpus: number | null
  availableParallelism: number | null
  hostCpuCount: number | null
  effectiveCpuCount: number | null
  isLimited: boolean
  source: string
}
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public interface exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L15)

### `ContainerMemorySnapshot`

```ts
interface ContainerMemorySnapshot {
  currentBytes: number | null
  limitBytes: number | null
  highBytes: number | null
  swapCurrentBytes: number | null
  swapLimitBytes: number | null
  isLimited: boolean
  usageRatio: number | null
  source: string
}
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public interface exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L4)

### `ContainerResourceOptions`

```ts
interface ContainerResourceOptions {
  root?: string
  platform?: string
}
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public interface exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L39)

### `ContainerResourceSnapshot`

```ts
interface ContainerResourceSnapshot {
  detected: boolean
  platform: string
  cgroupVersion: 1 | 2 | null
  isContainerLikely: boolean | null
  memory: ContainerMemorySnapshot
  cpu: ContainerCpuSnapshot
  source: "cgroup-v2" | "cgroup-v1" | "node" | "os" | "none"
  confidence: "high" | "medium" | "low"
  warnings: string[]
}
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public interface exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L27)

* `nodeRuntimeAdapter()` returns a core `RuntimeAdapter`.
* `containerResourceCheck()` evaluates container memory thresholds.
* `processMetricsCollector()` and `containerMetricsCollector()` produce report metrics.
* `tcpCheck(name, options)` and `dnsCheck(name, options)` create readiness checks.
* `readContainerResourceSnapshot()` reads cgroup/process/OS resources.
* `parseCpuList()` parses Linux cpuset lists.

The package exports container snapshot and options interfaces. Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts).
