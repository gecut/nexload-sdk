# Healthcheck OpenTelemetry guides

Bridge health reports into an existing telemetry pipeline.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/guides/
Create the report on a bounded schedule, transform it once, attach resource attributes to your configured resource, and record numeric values with matching instruments.

The transform may return string, boolean, or null collector values. Decide how your SDK bridge handles non-numeric values. Do not turn request IDs, user IDs, raw errors, or secret-bearing values into attributes.
