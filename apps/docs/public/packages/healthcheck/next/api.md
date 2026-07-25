# Healthcheck Next.js API

Public App Router factories and option contracts.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/api/
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

* `createNextHealthRoute(manager, options)` returns `{ GET, HEAD }`.
* `createNextMetricsRoute(manager, options)` returns `{ GET, HEAD }`.
* `NextHealthRouteOptions` requires a health scope and supports format, status policy, details, protection, headers, and no-store cache.
* `NextMetricsRouteOptions` requires `prometheus`, `openmetrics`, or `json` format and supports scope, protection, prefix, and default labels.
* `NextHealthRouteProtection` supports bearer, Basic, IPv4/CIDR allowlists, and proxy-header configuration.

Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts).
