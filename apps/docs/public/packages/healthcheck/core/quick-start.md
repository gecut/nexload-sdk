# Healthcheck Core quick start

Create a manager and run a readiness report.

**Topic:** quick-start
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/quick-start/
```ts
import {
  createHealthManager,
  memoryCheck,
  runtimeInfoCheck,
  shutdownCheck,
} from "@nexload-sdk/healthcheck";

export const health = createHealthManager({
  service: { name: "api", version: process.env.APP_VERSION },
  runtime: "auto",
  checks: [shutdownCheck(), runtimeInfoCheck(), memoryCheck()],
});

const report = await health.run("readiness");
console.log(report.status, report.summary);
```

For a healthy first run, the output resembles:

```text
ok {
  ok: 3,
  degraded: 0,
  unhealthy: 0,
  total: 3,
  criticalFailed: 0,
  nonCriticalFailed: 0
}
```

`ok` means every selected check passed. A `degraded` or `unhealthy` result is
still a successful execution of the manager; inspect `report.checks` to find
the check that changed the aggregate status.

`run()` returns data; it does not expose a URL. Use a framework route package or serialize the report in your own HTTP handler.

Start with dependency checks in `readiness`, not `liveness`. Protect reports that include details.

Next, read [Concepts](./concepts/) to assign checks to the correct scope, then
use [Guides](./guides/) to expose a route or exporter.
