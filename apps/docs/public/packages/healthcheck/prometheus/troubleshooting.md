# Troubleshoot Healthcheck Prometheus

Diagnose missing series, labels, and scrape output.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/troubleshooting/
* A collector metric is absent: null and non-finite values are skipped.
* A label is absent: only the package allowlist is emitted.
* A check-local measurement is absent: exporters use `report.metrics`; add a collector.
* Metric names changed: normalization replaces unsupported characters and collapses underscores.
* Prometheus rejects OpenMetrics output: use the matching serializer and content type.
