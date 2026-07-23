# Healthcheck Prometheus quick start

Convert a health report to Prometheus text.

**Topic:** quick-start
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/quick-start/
```ts
import {
  createHealthManager,
  runtimeMetricsCollector,
} from "@nexload-sdk/healthcheck";
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const health = createHealthManager({
  service: { name: "api" },
  runtime: "auto",
  collectors: [runtimeMetricsCollector()],
});

const report = await health.run("all");
const body = toPrometheusText(report, {
  prefix: "nexload",
  includeDescriptions: true,
});

console.log(body);
```

The output includes aggregate health and collector series, for example:

```text
nexload_health_status{service="api",scope="all",status="ok"} 1
nexload_service_uptime_seconds{service="api",scope="all"} 42
```

The exact uptime value varies. The status series proves the report was
serialized; the runtime series proves report-level collector metrics were
included.

Return `body` with the Prometheus text content type and `cache-control: no-store`.
Read the [Core quick start](/nexload-sdk/packages/healthcheck/core/quick-start/) for manager scopes. If a
series is absent or rejected, use [Troubleshooting](./troubleshooting/).
