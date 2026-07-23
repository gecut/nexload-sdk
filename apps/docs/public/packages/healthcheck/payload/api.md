# Healthcheck Payload API

Public Payload readiness-check exports.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/api/
## Functions

### `payloadHealthCheck`

```ts
payloadHealthCheck(payload: PayloadLike, options: PayloadHealthCheckOptions) => HealthCheckDefinition<"payload">
```

Public function exported by @nexload-sdk/healthcheck-payload.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts#L32)

## Interfaces

### `PayloadHealthCheckOptions`

```ts
interface PayloadHealthCheckOptions {
  collection: string
  limit?: number
  timeoutMs?: number
  where?: Record<string, unknown>
  depth?: number
  expectedMinDocuments?: number
  scopes?: readonly HealthScope[]
}
```

Public interface exported by @nexload-sdk/healthcheck-payload.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts#L10)

`payloadHealthCheck(payload, options)` returns `HealthCheckDefinition<"payload">`.

`PayloadHealthCheckOptions` requires `collection` and supports `limit`, `timeoutMs`, `where`, `depth`, `expectedMinDocuments`, and `scopes`. Defaults are `limit: 1`, `depth: 0`, and `scopes: ["readiness"]`.

Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts).
