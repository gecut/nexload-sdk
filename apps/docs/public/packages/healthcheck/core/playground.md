# healthcheck — Playground

Inspect a local readiness report.

**Topic:** playground
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/playground/
## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `unhealthy`. The report includes `"status": "unhealthy"`.

[API reference](/nexload-sdk/packages/healthcheck/core/api/).
