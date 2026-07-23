# Healthcheck Node quick start

Add Node and container observations to a health manager.

**Topic:** quick-start
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/quick-start/
This page includes the manager setup. Read the
[Core quick start](/nexload-sdk/packages/healthcheck/core/quick-start/) first if checks, collectors, or scopes
are new to you.

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";
import {
  containerResourceCheck,
  nodeRuntimeAdapter,
  processMetricsCollector,
} from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: nodeRuntimeAdapter(),
  checks: [shutdownCheck(), memoryCheck(), containerResourceCheck()],
  collectors: [processMetricsCollector()],
});

const report = await health.run("readiness");
console.log(report.status, report.runtime.name);
// ok node
```

This creates probes and report data, not an HTTP endpoint.
If the result is not `ok`, inspect `report.checks` and use
[Troubleshooting](./troubleshooting/).
