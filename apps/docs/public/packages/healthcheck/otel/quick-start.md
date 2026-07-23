# Healthcheck OpenTelemetry quick start

Transform a report into resource attributes and metric records.

**Topic:** quick-start
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/quick-start/
```ts
import {
  createHealthManager,
  runtimeMetricsCollector,
} from "@nexload-sdk/healthcheck";
import {
  toOtelMetricRecords,
  toOtelResourceAttributes,
} from "@nexload-sdk/healthcheck-otel";

const health = createHealthManager({
  service: { name: "api", version: "1.0.0" },
  runtime: "auto",
  collectors: [runtimeMetricsCollector()],
});

const report = await health.run("all");
const resource = toOtelResourceAttributes(report);
const records = toOtelMetricRecords(report);

console.log(resource["service.name"]);
console.log(records[0]);
// api
// { name: "health.status", value: 1, attributes: { service: "api", scope: "all", status: "ok" }, ... }
```

Pass these plain values to the OpenTelemetry SDK configured by your application.
The service name proves resource mapping worked; the first record maps a
healthy aggregate status to `1`. Read the
[Core quick start](/nexload-sdk/packages/healthcheck/core/quick-start/) for manager scopes. If records are
missing or nothing reaches the backend, use
[Troubleshooting](./troubleshooting/).
