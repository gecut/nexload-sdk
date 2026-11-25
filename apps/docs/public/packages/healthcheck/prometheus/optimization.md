# healthcheck-prometheus — Optimization

Production choices for @nexload-sdk/healthcheck-prometheus.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-prometheus` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/optimization/
## Use supported labels

Use low-cardinality labels from the exporter allowlist. Unsupported labels are dropped.

## Export collector metrics

Use a metric collector for custom series. Metrics attached to individual checks stay in the JSON report.

## Choose the exposition format

Use `toPrometheusText` for Prometheus text or `toOpenMetricsText` for OpenMetrics text. Both serialize an existing report.

## Review dropped labels

The allowlist also applies to `defaultLabels` and collector labels. Unsupported labels are silently dropped.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/monitoring-exporters/SKILL.md).
