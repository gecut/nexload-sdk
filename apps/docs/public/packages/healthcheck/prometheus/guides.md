# Healthcheck Prometheus guides

Publish safe, stable health metrics.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/guides/
Use a stable prefix and low-cardinality default labels. Register core collectors for monitoring data; metrics inside individual check results are not promoted to report-level series.

Protect metrics according to your network model. Never place secrets, user IDs, request IDs, URLs with tokens, or raw error messages in labels. Coordinate name or label changes with dashboards and alerts.
