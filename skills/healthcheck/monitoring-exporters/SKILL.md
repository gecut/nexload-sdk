---
name: healthcheck-monitoring-exporters
description: Use when converting an existing HealthReport with @nexload-sdk/healthcheck-prometheus or @nexload-sdk/healthcheck-otel, including Prometheus/OpenMetrics text, OTel resource attributes and metric records, collector-only export boundaries, prefixes, metric names, HELP descriptions, label allowlists, dropped labels, deterministic output, and cardinality review.
---

# Healthcheck Monitoring Exporters

## Purpose

Convert report-level monitoring data into predictable Prometheus/OpenMetrics text or OTel-friendly records without leaking check-local diagnostics or high-cardinality labels.

## Trigger boundary

- Use for exporter conversion, metric names/values, prefix, HELP, labels, OpenMetrics EOF, OTel resources/records, and output diagnosis.
- Do not use for collecting data, JSON redaction, route auth/cache, or complete OpenTelemetry SDK pipeline setup.
- Compose with custom checks/container resources for collector design and Next routes for serving the generated format.

## Source of truth

Use both exporter packages' source, tests, READMEs, and core `HealthReport` types. These helpers transform reports only; they do not run checks or send telemetry.

## Required inspection

Read `packages/healthcheck/prometheus/src/index.ts`, its tests/README, `packages/healthcheck/otel/src/index.ts`, its tests/README, core metric types, and the collector that produces each custom metric.

## Decision flow

1. Confirm data lives in `report.metrics`, not `check.metrics`.
2. Choose Prometheus, OpenMetrics, JSON, or OTel records from the consumer contract.
3. Define stable names/prefix and low-cardinality labels at the collector boundary.
4. Decide whether Prometheus HELP descriptions are required.
5. Snapshot exact output/records and audit dropped or unsanitized labels.

## Implementation workflow

1. Build a deterministic `HealthReport` fixture with checks and collector metrics.
2. Add failing assertions for exact names, values, labels, descriptions, ordering, and timestamps.
3. Implement conversion without reaching into check-local metrics.
4. Test Prometheus and OpenMetrics separately; test OTel resources and records separately.
5. Update package README when conversion behavior changes.

## Invariants

- Exporters consume existing reports and never run checks.
- Built-in aggregate/check status and duration series come from report/check fields.
- Custom monitoring series come only from collector-produced `report.metrics`.
- Prometheus drops disallowed/empty labels but keeps the metric.
- `includeDescriptions` emits HELP for built-ins and described collector metrics.
- OpenMetrics output is Prometheus text plus `# EOF`.
- OTel conversion copies labels verbatim; callers own sensitivity/cardinality and SDK instrument mapping.

## Security and edge cases

Never use tokens, URLs, errors, stacks, request/user/session IDs, or arbitrary tenant/resource IDs as labels. Prometheus allowlisting is not a general redactor; OTel has no label allowlist. Validate prefixes because the current implementation prepends the raw prefix. Null/non-finite Prometheus values are omitted; strings map to 1 rather than parsing numeric text.

## Verification

Run core build as needed, then build/lint/test both Prometheus and OTel packages. Assert exact deterministic text, normalization, value conversion, allowed/dropped labels, HELP, EOF, OTel status mapping, attributes, unit/type/observedAt, and collector-only behavior.

## Reference routing

- Read [exporter contracts](references/exporter-contracts.md) for format-specific behavior.
- Read [metric names and labels](references/metric-names-and-labels.md) for normalization, allowlists, and cardinality.
- Read [verification](references/verification.md) for fixture and snapshot coverage.

## Handoff requirements

State source collectors, chosen format, prefix/name policy, emitted and dropped labels, description behavior, OTel cardinality responsibility, exact output tests, and whether downstream SDK/export transport remains out of scope.
