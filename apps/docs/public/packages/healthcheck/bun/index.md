# Overview & Quick Start

Bun runtime adapter and server metrics health check integration for Bun HTTP services.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/
**Package:** `@nexload-sdk/healthcheck-bun`

**Current released version:** `2.1.0`

Bun runtime adapter and Bun server metrics for @nexload-sdk/healthcheck.

[npm](https://www.npmjs.com/package/@nexload-sdk/healthcheck-bun) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/healthcheck/bun)

`@nexload-sdk/healthcheck-bun` connects `@nexload-sdk/healthcheck` to the Bun JavaScript runtime and `Bun.serve()` HTTP server metrics.

***

## 10-Second Code Snippet

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter, bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({
  fetch: (req) => {
    if (new URL(req.url).pathname === "/health") {
      return health.run("readiness").then((r) => Response.json(r));
    }
    return new Response("OK");
  },
});

export const health = createHealthManager({
  service: { name: "bun-service" },
  runtime: bunRuntimeAdapter(),
  checks: [shutdownCheck(), bunServerMetricsCheck(server)],
});
```

***

## What You Get

* **Native Bun Runtime Adapter**: Queries JavaScriptCore heap statistics, Bun process uptime, and platform architecture.
* **`Bun.serve()` Server Metrics**: Observes pending requests and active WebSocket connections directly from the native Bun server handle.
* **Zero Node Dependencies**: Implemented cleanly against Bun global APIs without unnecessary Node.js polyfills.

***

## Installation & Requirements

```bash
bun add @nexload-sdk/healthcheck-bun @nexload-sdk/healthcheck
```

Requires Bun `>=1.0.0`.

***

## Next Steps

* Explore [Production Guides & Server Recipes](./guides/) for Bun HTTP servers, WebSocket counters, and troubleshooting.
* Check the [API Reference & Signatures](./api/) for all exported checks and adapters.
