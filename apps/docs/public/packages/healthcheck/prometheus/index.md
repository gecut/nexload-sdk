# Healthcheck Prometheus

Serialize health reports as Prometheus or OpenMetrics text.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/
`@nexload-sdk/healthcheck-prometheus` converts a completed core report to Prometheus or OpenMetrics text. It does not start a metrics server or push data.

Install it separately from core and expose its output through your framework. Exporters read report-level collector metrics; check-local metrics stay in JSON.
