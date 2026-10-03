# Healthcheck Prometheus: Production Guides & Scraping Setup | Nexload SDK

Configuring Prometheus endpoints, metric labels, Grafana alerts, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/guides/
## Exposing the `/metrics` Endpoint

Mount the exporter in your preferred HTTP framework:

```ts
import { prometheusExporter } from "@nexload-sdk/healthcheck-prometheus";
import { health } from "@/lib/health";

const exporter = prometheusExporter({
  prefix: "app_service",
  defaultLabels: {
    environment: process.env.NODE_ENV ?? "production",
  },
});

// Example inside a standard Web Fetch / Next.js / Bun handler:
export async function handleMetrics() {
  const report = await health.run("readiness");
  const body = exporter.export(report);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
```

***

## Generated Metrics Reference

The exporter produces standardized Prometheus gauges and histograms:

| Metric Name | Type | Description |
|---|---|---|
| `{prefix}_status` | Gauge | `1` when overall status is `ok`, `0.5` for `degraded`, `0` for `unhealthy`. |
| `{prefix}_check_status` | Gauge | Per-check status labeled with `check="<check_name>"` and `scope="<scope>"`. |
| `{prefix}_check_duration_seconds` | Gauge | Wall-clock execution time of each individual check in seconds. |

***

## Troubleshooting & Common Pitfalls

### 1. Prometheus Scraper Reports `text format parse error`

Ensure your HTTP response includes the header `Content-Type: text/plain; version=0.0.4; charset=utf-8` and ends with a trailing newline character.

### 2. High Cardinality Labels

Do not add dynamic user IDs or transient transaction IDs as metric labels. Use static service metadata (e.g. `cluster`, `region`, `service`).
