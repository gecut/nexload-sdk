# Production Guides & Recipes

Monitoring Bun.serve() HTTP servers, tracking active WebSocket connections, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/guides/
## Monitoring `Bun.serve()` Servers

Pass your `Bun.serve()` server instance into `bunServerMetricsCheck`:

```ts
import { bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({
  fetch(req) { /* ... */ },
  websocket: { /* ... */ },
});

const serverCheck = bunServerMetricsCheck(server, {
  maxPendingRequests: 500, // Degraded if pending requests exceed 500
});
```

The check inspects `server.pendingRequests` and active WebSocket connection counts, providing early warning when your server is overloaded.

***

## Troubleshooting & Common Pitfalls

### 1. `bunServerMetricsCheck` Requires a Valid Server Instance

Ensure you pass the return value of `Bun.serve()` into `bunServerMetricsCheck`. If called before the server starts, wrap the manager creation in a factory function or attach the check after server initialization.

### 2. Runtime Name Output

`report.runtime.name` will report `"bun"`. If your telemetry tools look for `"node"`, configure your metric exporter to recognize Bun runtime identifiers.
