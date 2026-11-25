# healthcheck-otel — Optimization

Production choices for @nexload-sdk/healthcheck-otel.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-otel` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/optimization/
## Bound attribute cardinality

Keep user IDs, request IDs and raw error text out of collector labels. These labels become metric attributes.

## Publish custom values through collectors

Read exported values from report.metrics. Check-local metrics stay in the JSON report.

## Separate mapping from delivery

The package maps an existing report to resource attributes and metric records. It runs in Node.js, Bun, Edge, and browsers.

## Avoid sensitive attributes

Collector labels become metric attributes. Review their values before exposing records to a monitoring backend.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/monitoring-exporters/SKILL.md).
