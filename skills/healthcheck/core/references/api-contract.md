# API contract

## Manager lifecycle

`createHealthManager(options)` accepts service identity, an optional runtime adapter, environment identity, defaults, scope profiles, checks, and collectors. Register with `register` or `registerCollector`, remove by name with `unregister`, and call `dispose` during teardown.

When the runtime implements `onShutdown`, the manager tracks `SIGTERM` and `SIGINT`. `setShutdownState`, `isShuttingDown`, and `shutdownCheck()` expose this lifecycle without direct process access in core.

## Checks

`defineHealthCheck` adds `kind: "check"` to a `HealthCheckDefinition`:

- `name`: stable unique name.
- `scopes`: explicit subset of liveness, readiness, startup, diagnostics.
- `critical`: boolean or per-scope map.
- `timeoutMs`, `retries`, and `tags`: orchestration metadata.
- `run(context)`: returns status plus optional raw metrics, details, and stable error info.

The manager records observed time, duration, attempt count, timeout state, resolved criticality, and empty metrics when absent.

## Collectors

`defineMetricCollector` adds `kind: "collector"`. A collector may declare scopes and timeout, then returns typed `HealthMetric[]` and optional resource attributes. Collector failure does not add a failed check; it emits `collector.<name>.up = 0` into report metrics.

`defaultEnabled` exists in the public type but is not used by manager selection. Do not claim it filters collectors.

## Report

`HealthReport` uses schema version `2.0` and contains service, scope, aggregate status, runtime/environment identity, summary, sorted checks, collector metrics, and optional resources/links.

`check.metrics` is a raw JSON/report diagnostic map. Monitoring exporters consume only `report.metrics`, which comes from collectors.

## Serialization

`toHealthJson(report, options)` returns a sanitized report. `stringifyHealthJson` JSON-encodes the same shape. `includeDetails` defaults false and `redact` defaults true. Serializer policy, not manager options, controls exposure.
