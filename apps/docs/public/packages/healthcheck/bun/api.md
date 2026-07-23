# Healthcheck Bun API

Public Bun runtime exports.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/api/
## Functions

### `bunRuntimeAdapter`

```ts
bunRuntimeAdapter() => RuntimeAdapter
```

Public function exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L54)

### `bunRuntimeInfoCheck`

```ts
bunRuntimeInfoCheck(options?: { scopes?: readonly HealthScope[]; }) => HealthCheckDefinition<"bun.runtime">
```

Public function exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L74)

### `bunServerMetricsCheck`

```ts
bunServerMetricsCheck(server: BunServerLike, options?: { scopes?: readonly HealthScope[]; }) => HealthCheckDefinition<"bun.server.metrics">
```

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

Public interface exported by @nexload-sdk/healthcheck-bun.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts#L15)

* `bunRuntimeAdapter()` returns the core runtime adapter.
* `bunRuntimeInfoCheck(options?)` creates the `bun.runtime` diagnostic check.
* `bunServerMetricsCheck(server, options?)` creates `bun.server.metrics`.
* `BunServerLike` is the minimal server shape: pending request/WebSocket counters and optional subscribers.

Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts).
