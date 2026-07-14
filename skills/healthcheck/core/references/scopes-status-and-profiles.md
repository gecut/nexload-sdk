# Scopes, status, and profiles

## Scope intent

- `liveness`: can the process continue running; avoid ordinary dependency outages that cause restart loops.
- `readiness`: can the instance safely receive traffic now; critical dependencies normally belong here.
- `startup`: has initialization completed; use for slow bootstrap gates.
- `diagnostics`: deeper operational evidence; protect it when details are exposed.
- `all`: manager-only union for deliberate internal inspection, not a default public route.

A check runs when its declared scopes include the requested scope. A collector with no scopes matches every scope. Keep scope lists explicit to avoid exporting expensive metrics on probes.

## Criticality and aggregation

If `critical` is omitted, readiness and startup resolve to critical while liveness and diagnostics resolve to non-critical. A boolean applies to all scopes; a map overrides individual scopes.

Aggregation rules are exact:

1. Any critical `unhealthy` result makes the report `unhealthy`.
2. Otherwise any `degraded` or non-critical `unhealthy` result makes the report `degraded`.
3. Otherwise the report is `ok`.

`HealthSummary` separately counts ok, degraded, unhealthy, critical failed, and non-critical failed checks.

## Profiles

Profiles are `probe`, `summary`, `monitoring`, `diagnostics`, or `full`. Resolution order is run option, scope profile, default profile, manager default, then `summary`.

The resolved profile is passed in `HealthRunContext`. It does not automatically remove checks, details, or metrics. A check or collector may use it as a cost/detail hint; the route and serializer still own exposure.

## Timeout and retry

Timeout resolution is check, run, manager default, then 1000 ms. A timeout produces `CHECK_TIMEOUT`; default status is unhealthy. Set `defaults.unhealthyOnTimeout: false` only when a timeout should degrade rather than fail a critical gate.

`retries.attempts` means retries after the first attempt. Successful results retry only when their status is in `retryOn` (default unhealthy). Thrown/timeout attempts retry while attempts remain. Backoff may be none, linear, or exponential.
