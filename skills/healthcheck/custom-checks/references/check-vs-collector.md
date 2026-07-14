# Check versus collector

## Use a check when

- The observation must influence `ok`, `degraded`, or `unhealthy` service status.
- Readiness or startup should gate traffic or deployment.
- Critical versus non-critical aggregation represents a real operational consequence.
- A stable error code or check-local diagnostic metrics help explain failure.

Define it with `defineHealthCheck`. Declare explicit scopes. Prefer a per-scope criticality map when the same dependency is traffic-critical in readiness but informational in diagnostics.

Avoid external dependencies in liveness unless restarting the process is the intended recovery. A database outage in critical liveness can create a restart loop without repairing the database.

## Use a collector when

- The observation is telemetry only and must not change health status.
- Prometheus or OTel needs a typed `HealthMetric`.
- Stable resource attributes accompany metrics.

Define it with `defineMetricCollector`. Emit stable metric names, explicit units/types when useful, and bounded labels. Collector failure is isolated as `collector.<name>.up = 0`; it does not produce a failed check.

Do not rely on `defaultEnabled`; the current manager does not consume it. Use scopes to control collection.

## Avoid duplicate work

Do not query the same expensive dependency independently as both a check and collector unless shared caching and staleness are designed. Check-local metrics remain in JSON diagnostics; exporters intentionally consume only collector-produced `report.metrics`.

## Definition rules

- Names must be stable and unique within their registry.
- Return expected dependency failures rather than throwing so domain metrics/error codes survive.
- `ctx.result()` is currently an identity helper, not validation, redaction, or normalization.
- Definitions must not mutate application data, renew credentials, enqueue jobs, or repair dependencies.
