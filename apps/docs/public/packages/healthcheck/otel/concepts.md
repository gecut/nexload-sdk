# Healthcheck OpenTelemetry concepts

Understand resources, generated health records, and collector metrics.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/concepts/
Resource attributes describe service, deployment, runtime, architecture, and OS. Missing optional identity values become `"unknown"`.

Metric records include aggregate status, run duration, every check's status/duration, and report-level collector metrics. `ok`, `degraded`, and `unhealthy` map to `1`, `0.5`, and `0`. Collector labels become attributes; keep them low-cardinality.
