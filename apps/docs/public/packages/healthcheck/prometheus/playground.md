# healthcheck-prometheus — Playground

Inspect a local readiness report.

**Topic:** playground
**Package:** `@nexload-sdk/healthcheck-prometheus` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/playground/
## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `ok`. The output includes the `nexload_health_status` series.

[API reference](/nexload-sdk/packages/healthcheck/prometheus/api/).
