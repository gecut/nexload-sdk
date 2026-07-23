# Healthcheck Prometheus examples

Expose OpenMetrics output from a framework handler.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/examples/
```ts
import { toOpenMetricsText } from "@nexload-sdk/healthcheck-prometheus";

const report = await health.run("all");
return new Response(toOpenMetricsText(report, {
  prefix: "my_service",
  defaultLabels: { version: process.env.APP_VERSION ?? "unknown" },
}), {
  headers: { "content-type": "application/openmetrics-text; version=1.0.0", "cache-control": "no-store" },
});
```

Executable serializer cases: [`prometheus.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/test/prometheus.test.mjs).

The documentation example is type-checked in CI: [`healthcheck-prometheus.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-prometheus.ts).
