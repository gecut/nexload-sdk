# @nexload-sdk/healthcheck-next

**Next.js App Router `GET`/`HEAD` health and metrics route factories for `@nexload-sdk/healthcheck`.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/next/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/next/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-next)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-next)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Next.js | Node | Edge](https://img.shields.io/badge/runtime-Next.js%20%7C%20Node%20%7C%20Edge-lightgrey.svg)

> [!IMPORTANT]
> A new major release is pending across the healthcheck family in `.changeset/healthcheck-major.md` (import ordering updates, no runtime behavior changes).

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/healthcheck-next` creates Web Standard `Request` -> `Response` handlers (`createNextHealthRoute`, `createNextMetricsRoute`) for Next.js App Router route files. It solves repetitive `Cache-Control: no-store` headers, HTTP status mapping (`200` vs `503`), Prometheus/OpenMetrics formatting, and fail-closed route protection for diagnostics and metrics endpoints. It is for Next.js App Router services.

What it is not:

- Not a Pages Router (`pages/api/*`) adapter.
- Not a Next.js middleware or authentication framework.

## Philosophy

- **Fail-closed protection:** Supplying `protect` requires at least one valid policy (bearer token, Basic auth, or IPv4/CIDR allowlist) and throws `HEALTHCHECK_INVALID_CONFIG` at startup if misconfigured.
- **Uncached by default:** Every response sets `cache-control: no-store, max-age=0`; report responses also set `x-health-status`, `x-health-scope`, `x-health-duration-ms`, `x-health-service`, and `x-health-instance` when `instanceId` is set.
- **Constant-time credential checks:** Bearer and Basic auth comparisons use a constant-time byte loop.

## Install

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-next
# or
npm install @nexload-sdk/healthcheck @nexload-sdk/healthcheck-next
# or
yarn add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-next
# or
bun add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-next
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies (`@nexload-sdk/healthcheck` and `@nexload-sdk/healthcheck-prometheus` are direct dependencies) |

## Quick start

```ts
// app/api/health/ready/route.ts
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "readiness",
  format: "json",
});
```

## Usage

### Protected diagnostics route

```ts
// app/api/health/diagnostics/route.ts
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "diagnostics",
  format: "json",
  includeDetails: true,
  protect: {
    bearerToken: process.env.HEALTHCHECK_DIAGNOSTICS_TOKEN,
    trustProxy: true,
    allowCidrs: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  },
});
```

### Prometheus / OpenMetrics route

```ts
// app/api/metrics/route.ts
import { createNextMetricsRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET } = createNextMetricsRoute(health, {
  format: "prometheus",
  scope: "all",
  prefix: "nexload",
});
```

## API

### Root entry (`@nexload-sdk/healthcheck-next`)

| Export | Kind | Summary |
| --- | --- | --- |
| `createNextHealthRoute` | `function` | Returns `{ GET, HEAD }` route handlers for a `HealthScope` |
| `createNextMetricsRoute` | `function` | Returns `{ GET }` handler emitting `prometheus`, `openmetrics`, or `json` |
| `NextHealthRouteOptions` | `interface` | Options for `createNextHealthRoute` |
| `NextMetricsRouteOptions` | `interface` | Options for `createNextMetricsRoute` |
| `NextHealthRouteProtection` | `interface` | Bearer, Basic, IPv4, and CIDR protection policy |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scope` | `HealthScope` (health) / `HealthRunScope` (metrics) | Required (health) / `"all"` (metrics) | Scope passed to `manager.run()` |
| `format` | `"json" \| "summary"` (health) / `"prometheus" \| "openmetrics" \| "json"` (metrics) | `"json"` (health) / Required (metrics) | Response serialization format |
| `httpStatus` (health only) | `HealthHttpStatusPolicy` | `DEFAULT_HTTP_STATUS_POLICY` | Status code mapping for `ok`, `degraded`, `unhealthy` |
| `includeDetails` (health only) | `boolean \| ((req: Request) => boolean)` | `false` | Controls detail inclusion in JSON responses |
| `protect` | `NextHealthRouteProtection` | `undefined` | Optional fail-closed auth and IPv4 allowlist policy |
| `headers` (health only) | `HeadersInit \| ((report) => HeadersInit)` | `undefined` | Extra response headers merged onto `baseHeaders` |
| `cache` (health only) | `"no-store"` | `"no-store"` | Only `"no-store"` is supported |

Metrics route options also include `prefix` (string, default `"nexload"`) and `defaultLabels` (`Record<string, string>`). The metrics route uses the `"monitoring"` profile and responds with status 200 for reports.

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtime:** Uses Web Standard `Request`, `Response`, `Headers`, `TextEncoder`, and `atob`—compatible with Next.js Node.js and Edge runtimes (use `runtime = "nodejs"` if your `HealthManager` uses `@nexload-sdk/healthcheck-node`).

## Caveats

> [!CAUTION]
> IP (`allowIps`) and CIDR (`allowCidrs`) protection require `trustProxy: true` and currently accept IPv4 addresses only. Only enable `trustProxy: true` when `proxyHeader` (default `"x-forwarded-for"`) is set and stripped by your reverse proxy.

> [!WARNING]
> `bearerToken` and `basicAuth` cannot be configured together on the same route because they share the `Authorization` header. Supplying an empty `protect: {}` object throws `HEALTHCHECK_INVALID_CONFIG`.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and status policies
- [healthcheck-node](../node/README.md) — Node.js runtime adapter for Next.js `runtime = "nodejs"`
- [healthcheck-prometheus](../prometheus/README.md) — Prometheus and OpenMetrics serializers used by `createNextMetricsRoute`

## License

MIT
