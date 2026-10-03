# API Reference & Compatibility

Public API symbol reference and compatibility matrix for Healthcheck Next.js.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `createNextHealthRoute`

```ts
createNextHealthRoute(manager: HealthManager, options: NextHealthRouteOptions) => { GET: (request: Request) => Promise<Response>; HEAD: (request: Request) => Promise<Response>; }
```

**Exported from:** `@nexload-sdk/healthcheck-next`

Public function exported by @nexload-sdk/healthcheck-next.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts#L280)

### `createNextMetricsRoute`

```ts
createNextMetricsRoute(manager: HealthManager, options: NextMetricsRouteOptions) => { GET: (request: Request) => Promise<Response>; }
```

**Exported from:** `@nexload-sdk/healthcheck-next`

Public function exported by @nexload-sdk/healthcheck-next.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts#L334)

## Interfaces

### `NextHealthRouteOptions`

```ts
interface NextHealthRouteOptions {
  scope: HealthScope
  format?: "json" | "summary"
  httpStatus?: HealthHttpStatusPolicy
  includeDetails?: boolean | ((request: Request) => boolean)
  protect?: NextHealthRouteProtection
  headers?: HeadersInit | ((report: HealthReport) => HeadersInit)
  cache?: "no-store"
}
```

**Exported from:** `@nexload-sdk/healthcheck-next`

Public interface exported by @nexload-sdk/healthcheck-next.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts#L32)

### `NextHealthRouteProtection`

```ts
interface NextHealthRouteProtection {
  bearerToken?: string
  basicAuth?: {
    username: string
    password: string
  }
  allowCidrs?: readonly string[]
  allowIps?: readonly string[]
  trustProxy?: boolean
  proxyHeader?: "x-forwarded-for" | "x-real-ip" | string
}
```

**Exported from:** `@nexload-sdk/healthcheck-next`

Public interface exported by @nexload-sdk/healthcheck-next.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts#L20)

### `NextMetricsRouteOptions`

```ts
interface NextMetricsRouteOptions {
  format: "prometheus" | "openmetrics" | "json"
  scope?: HealthRunScope
  protect?: NextHealthRouteProtection
  prefix?: string
  defaultLabels?: Record<string, string>
}
```

**Exported from:** `@nexload-sdk/healthcheck-next`

Public interface exported by @nexload-sdk/healthcheck-next.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts#L42)

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Next.js** | `>=14.0.0` | Verified on Next.js 14 & 15 App Router |
| **Node.js** | `>=20.9.0` | Node.js Route Handler runtime |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
