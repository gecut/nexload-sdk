# @nexload-sdk/healthcheck-otel

OpenTelemetry-friendly transforms for `@nexload-sdk/healthcheck`. This package does not depend on the OpenTelemetry SDK.

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/api/)

The transforms export `report.metrics` produced by collectors. Check-local metrics remain in JSON reports. Collector labels become OpenTelemetry attributes, so callers must keep them low-cardinality and free of secrets, user IDs, request IDs, and raw error messages.
