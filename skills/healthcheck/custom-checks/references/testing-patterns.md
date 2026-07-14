# Testing patterns

## Layer 1: pure behavior

Extract threshold/status mapping when it has branches. Test boundaries exactly: below, equal, above, null/unavailable, and invalid input. Keep formatting out of metric values.

## Layer 2: direct definition

Call `run` or `collect` with a minimal context to verify:

- the client receives `ctx.signal`;
- known success/failure maps to exact status, metrics, and error code;
- no secret or high-cardinality value is emitted;
- profile-dependent cost/detail behavior is deliberate.

Do not mock the definition itself. Fake the external client boundary with deterministic behavior.

## Layer 3: manager integration

Register the real definition in `createHealthManager` and assert:

- inclusion/exclusion by scope;
- resolved criticality and aggregate status;
- exact attempts and retry-on behavior;
- timeout versus external abort error code;
- timeout policy (`unhealthy` or `degraded`);
- collector failure isolation;
- public serializer suppression when details/errors exist.

Use a fake runtime for deterministic clocks where duration matters. Build before tests because current package tests import `dist/index.mjs`.

## Review checklist

- Could a retry duplicate a write or overlap an ignored timeout?
- Does liveness depend on an external system?
- Are values raw and labels bounded?
- Are error codes stable and messages generic?
- Does total worst-case latency fit the route budget?
- Is the check critical only in scopes where failure should change routing/deployment?

When composition crosses into exporter formatting, stop at collector-output invariants and inspect the exporter skill/source before specifying wire behavior. In the current Prometheus implementation, only label keys in its explicit allowlist survive, report metric order is preserved, label keys are sorted, HELP is optional, and TYPE lines are not emitted.
