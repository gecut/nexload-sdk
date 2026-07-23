# Healthcheck OpenTelemetry

Convert health reports to OpenTelemetry-friendly resources and metric records.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/
`@nexload-sdk/healthcheck-otel` converts a core report into resource attributes and plain metric records. It does not depend on, configure, or export through the OpenTelemetry SDK.

Use your existing SDK/meter pipeline to record the transformed values. Install Prometheus separately if you need text scraping.
