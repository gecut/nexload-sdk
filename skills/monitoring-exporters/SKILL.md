---
name: nexload-healthcheck-monitoring-exporters
description: Use when exposing @nexload-sdk/healthcheck reports as JSON, Prometheus/OpenMetrics text, or OpenTelemetry-friendly records.
---

# Monitoring Exporters

Use core JSON helpers for API responses.

Use `@nexload-sdk/healthcheck-prometheus` for Prometheus and OpenMetrics text.

Use `@nexload-sdk/healthcheck-otel` for plain OpenTelemetry-friendly records and resource attributes.

Rules:

- Keep labels low-cardinality.
- Do not emit raw error messages, stack traces, tokens, user IDs, session IDs, or request IDs as labels.
- Prefer stable metric names and stable check names.
