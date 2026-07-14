# Implementation playbook

## Build the manager

1. Create a singleton per process with stable service identity and the correct runtime adapter.
2. Register inexpensive liveness checks, traffic-gating readiness checks, initialization startup checks, and protected diagnostics deliberately.
3. Put monitoring metrics in collectors; do not expect exporters to flatten check-local metrics.
4. Set scope-specific criticality before choosing HTTP status behavior in an adapter.
5. Dispose the manager during application teardown or test cleanup.

## Check execution

Use `ctx.signal` in fetch, timers, database clients, and custom waits. Return stable `HealthErrorInfo.code`; keep volatile exception text in cause fields so serializers can suppress it. Avoid mutations, background jobs, retries outside the manager, or logging secrets from `run`.

The manager bounds concurrent checks and collectors with the configured concurrency. Results complete out of order but checks are sorted by name in the report. Metrics retain collector completion order; exporters that require deterministic output must sort.

## Redaction

Use probe serialization without details. A protected diagnostics route may opt into details and selected error text. Secret-looking keys are redacted and URL policy defaults to stripping query/hash. `allowedDetailKeys` applies recursively per object and can remove more data than intended; test the resulting JSON.

Never rely on manager-level `redaction` or run-level `includeDiagnostics`; both remain deprecated compatibility fields and have no effect.

## Minimum tests

- scope selection and per-scope criticality;
- aggregate status for critical and non-critical failures;
- timeout with both unhealthy policies;
- retry count and retry-on status;
- external abort versus timeout error code;
- collector failure isolation;
- profile visible in check and collector context;
- public serializer suppression and protected opt-in;
- shutdown state and dispose behavior when touched.

Use the fake runtime pattern in `packages/healthcheck/core/test/core.test.mjs` for deterministic duration/runtime assertions.
