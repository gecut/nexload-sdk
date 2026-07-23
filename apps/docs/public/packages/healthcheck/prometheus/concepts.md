# Healthcheck Prometheus concepts

Understand exported series, labels, and OpenMetrics output.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/concepts/
Every export includes aggregate status, check status, check duration, run duration, and `report.metrics`. Metric names are normalized and prefixed.

Only the built-in low-cardinality label allowlist is retained. String metric values become `1`; booleans become `1` or `0`; null and non-finite numbers are skipped. OpenMetrics output is Prometheus text plus `# EOF`.
