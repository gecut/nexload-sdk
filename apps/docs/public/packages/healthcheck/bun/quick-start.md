# Healthcheck Bun quick start

Connect a Bun server to a health manager.

**Topic:** quick-start
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/quick-start/
This page includes the manager setup. Read the
[Core quick start](/nexload-sdk/packages/healthcheck/core/quick-start/) first if checks or scopes are new to
you.

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter, bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({ fetch: () => new Response("ok") });
export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [shutdownCheck(), bunServerMetricsCheck(server)],
});

const report = await health.run("readiness");
console.log(report.status, report.runtime.name);
// ok bun
```

This first call proves the adapter and server check run. Expose
`health.run("readiness")` in your own Bun handler afterward. If runtime or
server counters are missing, use [Troubleshooting](./troubleshooting/).
