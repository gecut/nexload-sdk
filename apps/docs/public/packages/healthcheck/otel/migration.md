# Migrate Healthcheck OpenTelemetry

Verify resource and metric mapping after an upgrade.

**Topic:** migration
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/migration/
This page targets `@nexload-sdk/healthcheck-otel` 2.1.0 with Core 4.1.0.
Identify your source version in the
[OpenTelemetry changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/CHANGELOG.md).

Upgrade core and transform together. Snapshot resource keys, generated metric names, status numeric mapping, units, timestamps, and collector attributes.

Run your SDK bridge tests because SDK compatibility is application-owned. Coordinate attribute/name changes with dashboards, recording rules, and alerts; roll back if telemetry identity changes unexpectedly.
