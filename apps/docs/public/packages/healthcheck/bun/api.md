# API Reference & Compatibility

Public API symbol reference and runtime compatibility matrix for Healthcheck Bun.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `bunRuntimeAdapter`

```ts
bunRuntimeAdapter() => RuntimeAdapter
```

**Exported from:** `@nexload-sdk/healthcheck-bun`

Public function exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L54)

### `bunRuntimeInfoCheck`

```ts
bunRuntimeInfoCheck(options?: { scopes?: readonly HealthScope[]; }) => HealthCheckDefinition<"bun.runtime">
```

**Exported from:** `@nexload-sdk/healthcheck-bun`

Public function exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L74)

### `bunServerMetricsCheck`

```ts
bunServerMetricsCheck(server: BunServerLike, options?: { scopes?: readonly HealthScope[]; }) => HealthCheckDefinition<"bun.server.metrics">
```

**Exported from:** `@nexload-sdk/healthcheck-bun`

Public function exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L91)

## Interfaces

### `BunServerLike`

```ts
interface BunServerLike {
  pendingRequests?: number
  pendingWebSockets?: number
  subscriberCount?: (topic: string) => number
}
```

**Exported from:** `@nexload-sdk/healthcheck-bun`

Public interface exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L15)

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Bun** | `>=1.0.0` | Verified on Bun 1.1+ |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
