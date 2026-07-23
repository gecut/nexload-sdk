# Troubleshoot Healthcheck OpenTelemetry

Diagnose missing identity, incompatible values, and high-cardinality attributes.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/troubleshooting/
* Resource values say `unknown`: supply service/environment identity to core and use a runtime adapter.
* Collector records are absent: collectors populate `report.metrics`; check-local metrics are represented only by status/duration records.
* The SDK rejects a value: bridge only value kinds supported by the chosen instrument.
* Cardinality grows: remove dynamic collector labels before recording.
* Nothing is exported: this package transforms only; configure an SDK exporter.
