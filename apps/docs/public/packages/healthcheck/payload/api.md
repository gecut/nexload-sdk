# API Reference & Compatibility

Public API symbol reference and compatibility matrix for Healthcheck Payload.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `payloadHealthCheck`

```ts
payloadHealthCheck(payload: PayloadLike, options: PayloadHealthCheckOptions) => HealthCheckDefinition<"payload">
```

**Exported from:** `@nexload-sdk/healthcheck-payload`

Public function exported by @nexload-sdk/healthcheck-payload.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts#L34)

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

**Exported from:** `@nexload-sdk/healthcheck-payload`

Public interface exported by @nexload-sdk/healthcheck-payload.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts#L11)

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload 3.86.0 |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
