# API Reference & Compatibility

Public API symbol reference, functions, and compatibility matrix for Healthcheck Node.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `containerMetricsCollector`

```ts
containerMetricsCollector(options?: ContainerResourceOptions & { scopes?: readonly HealthScope[]; }) => MetricCollectorDefinition<"container.metrics">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L174)

### `containerResourceCheck`

```ts
containerResourceCheck(options?: { scopes?: readonly HealthScope[]; memory?: { usageRatio?: { degraded: number; unhealthy: number; }; }; root?: string; critical?: boolean | Partial<Record<HealthScope, boolean>>; }) => HealthCheckDefinition<"container.resources">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L107)

### `dnsCheck`

```ts
dnsCheck(name: string, options: { hostname: string; recordType?: "A" | "AAAA" | "CNAME" | "TXT" | "MX"; scopes?: readonly HealthScope[]; timeoutMs?: number; }) => HealthCheckDefinition<string>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L256)

### `nodeRuntimeAdapter`

```ts
nodeRuntimeAdapter() => RuntimeAdapter
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L60)

### `parseCpuList`

```ts
parseCpuList(value: string | null) => number | null
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L84)

### `processMetricsCollector`

```ts
processMetricsCollector(options?: { scopes?: readonly HealthScope[]; }) => MetricCollectorDefinition<"process.metrics">
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L149)

### `readContainerResourceSnapshot`

```ts
readContainerResourceSnapshot(options?: ContainerResourceOptions) => Promise<ContainerResourceSnapshot>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/cgroup.ts#L313)

### `tcpCheck`

```ts
tcpCheck(name: string, options: { host: string; port: number; scopes?: readonly HealthScope[]; timeoutMs?: number; }) => HealthCheckDefinition<string>
```

**Exported from:** `@nexload-sdk/healthcheck-node`

Public function exported by @nexload-sdk/healthcheck-node.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts#L198)

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

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Linux Cgroups** | v1 & v2 | Verified in Docker & Kubernetes |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
