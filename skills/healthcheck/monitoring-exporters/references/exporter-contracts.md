# Exporter contracts

## Shared boundary

Prometheus and OTel accept an existing `HealthReport`. Neither creates a manager, runs a check, collects metrics, or sends telemetry.

Both emit built-in health status and duration records from report/check fields. Custom series come from `report.metrics`, which collectors populate. `check.metrics` remains JSON/report-local and is intentionally not flattened into monitoring output.

## Prometheus

`toPrometheusText(report, options)` supports:

- `prefix`, default `nexload`;
- `defaultLabels`;
- `includeDescriptions`.

Built-ins include aggregate status one-hot series, per-check status one-hot series, check duration, and run duration. Collector metrics are appended.

Finite numbers remain numeric, booleans map to 1/0, strings map to 1, and null/non-finite values are omitted. The package currently emits HELP when enabled but no TYPE lines.

`toOpenMetricsText` returns the same text with the OpenMetrics `# EOF` terminator.

## OpenTelemetry records

`toOtelResourceAttributes` maps service, deployment, instance, runtime, platform, and architecture attributes; absent optional values become `unknown`.

`toOtelMetricRecords` maps status values as ok=1, degraded=0.5, unhealthy=0. It emits aggregate/check status and durations, then report metrics. Collector name, value, unit, type, observedAt, and labels are preserved.

These records are SDK-friendly plain data, not OTel instruments. The caller must choose instruments, temporality, aggregation, exporter, and provider lifecycle.

## Non-contract assumptions

Do not claim check-local metrics are exported, OpenMetrics histograms are synthesized, Prometheus TYPE lines exist, or OTel labels are sanitized.
