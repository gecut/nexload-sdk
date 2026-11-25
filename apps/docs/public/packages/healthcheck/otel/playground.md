# healthcheck-otel — Playground

Inspect a local readiness report.

**Topic:** playground
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/playground/
## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `unhealthy`. The `health.status` metric record has value `0`.

[API reference](/nexload-sdk/packages/healthcheck/otel/api/).
