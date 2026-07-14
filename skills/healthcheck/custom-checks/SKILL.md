---
name: healthcheck-custom-checks
description: Use when implementing or reviewing an individual custom @nexload-sdk/healthcheck check or metric collector, including check-versus-collector choice, AbortSignal propagation, scope criticality, raw metrics, stable errors, timeout and retry safety, side effects, and focused tests. Do not use for manager-only setup or a shipped adapter.
---

# Custom Health Checks and Collectors

## Purpose

Create deterministic, cancellation-aware definitions that preserve health semantics and remain safe under timeout and retry.

## Trigger boundary

- Use for one custom dependency check, threshold check, or metric collector and its tests.
- Do not use for built-in manager wiring, Next routes, cgroup parsing, exporter encoding, or the shipped Payload adapter.
- Compose with `healthcheck-core` when manager policy changes and with security/exporter skills when output will be exposed or exported.

## Source of truth

Use the core public types, manager behavior, built-ins, tests, and package README. Client-library behavior is secondary and must be adapted to the core contract.

## Required inspection

Read `packages/healthcheck/core/src/core/types.ts`, `src/core/define.ts`, `src/core/manager.ts`, `src/core/errors.ts`, similar definitions in `src/checks.ts`, `src/collectors.ts`, or `src/http-check.ts`, and `test/core.test.mjs`.

## Decision flow

1. Use a check only when the observation must affect health status; otherwise use a collector.
2. Choose scopes and criticality from operational consequences, not convenience.
3. Define a total latency budget, cancellation path, and retry eligibility.
4. Return raw bounded metrics and stable errors; keep sensitive or volatile data out.
5. Test definition behavior directly, then manager integration.

## Implementation workflow

1. Write a failing test for the status/metric/error contract.
2. Implement with `defineHealthCheck` or `defineMetricCollector` and a stable unique name.
3. Check `ctx.signal.aborted` and pass `ctx.signal` into every cancellable operation.
4. Return expected failures explicitly; throw only unexpected faults.
5. Add manager tests for scope, criticality, timeout, retry, aggregation, and serialization as applicable.

## Invariants

- Checks are side-effect free and safe to repeat or overlap.
- Metrics are `string | number | boolean | null`, not formatted text with units.
- Monitoring labels are bounded and low-cardinality.
- Error codes are stable; generic messages do not contain credentials or raw exceptions.
- Retry is limited to transient idempotent work and fits inside the endpoint latency budget.
- Collector failure cannot change health status; check failure can.

## Security and edge cases

Serializer redaction does not sanitize `check.metrics`. Never emit tokens, connection strings, auth headers, query-bearing URLs, tenant/user/request IDs, or exception messages in metrics, details, resources, or labels. Cancellation is cooperative; ignored signals can leak or overlap work after timeout.

## Verification

Build before testing because package tests consume `dist`: `pnpm -C packages/healthcheck/core build`, then lint and test. Assert the underlying client receives the signal and the exact attempt count/status/error code.

## Reference routing

- Read [check versus collector](references/check-vs-collector.md) for the primary design decision.
- Read [timeout, retry, and errors](references/timeout-retry-and-errors.md) for cancellation and failure normalization.
- Read [testing patterns](references/testing-patterns.md) for direct and manager-level coverage.

## Handoff requirements

State why the definition is a check or collector, selected scopes and criticality, worst-case retry budget, cancellation evidence, output sensitivity/cardinality review, and exact tests run.
