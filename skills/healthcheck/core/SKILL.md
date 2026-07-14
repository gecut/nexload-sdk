---
name: healthcheck-core
description: Use when integrating or changing the runtime-neutral @nexload-sdk/healthcheck manager, scopes, profiles, aggregation, serialization, built-in checks, collectors, retries, timeouts, shutdown lifecycle, or report contracts. Do not use for framework route wiring, exporter formatting, or one custom check in isolation.
---

# Healthcheck Core

## Purpose

Build or review the orchestration layer around `@nexload-sdk/healthcheck` without leaking framework, runtime-specific, or monitoring concerns into the core.

## Trigger boundary

- Use for `createHealthManager`, manager lifecycle, scope selection, criticality, profiles, report aggregation, JSON serialization, built-in checks, and collectors.
- Do not use for Next.js route handlers, cgroup implementation, Payload queries, or Prometheus/OTel conversion; use the matching sibling skill.
- Compose with `healthcheck-custom-checks` when adding a new check and with `healthcheck-diagnostics-security` when exposing report data.

## Source of truth

Treat package source and tests as authoritative. README examples must agree with exports in `packages/healthcheck/core/src/index.ts`; skills and docs never override runtime behavior.

## Required inspection

Read `packages/healthcheck/core/README.md`, `package.json`, `src/index.ts`, `src/core/types.ts`, `src/core/manager.ts`, `src/core/aggregate.ts`, `src/core/serializers.ts`, and the relevant tests before editing.

## Decision flow

1. Identify whether the change affects a check result, collector output, manager orchestration, report aggregation, or serialization.
2. Select only the scopes that need the work; avoid `all` in route configuration.
3. Decide criticality per scope, then timeout and retry policy.
4. Keep check-local raw metrics in `check.metrics`; use collectors for `report.metrics`.
5. Apply exposure/redaction only when serializing or serving the report.

## Implementation workflow

1. Confirm exported types and existing behavior with a focused test.
2. Configure one long-lived manager; register checks and collectors before serving traffic.
3. Pass `AbortSignal` through blocking work and use stable error codes.
4. Test scope selection, aggregation, timeout/retry behavior, and serialization separately.
5. Update the package README in the same change when behavior changes.

## Invariants

- Core remains runtime-neutral; runtime access goes through `RuntimeAdapter`.
- Only a critical `unhealthy` check makes the aggregate `unhealthy`; any other non-`ok` result degrades it.
- Readiness and startup checks default critical; liveness and diagnostics default non-critical unless configured.
- Profiles are context hints for checks and collectors, not automatic response filters.
- Timeout defaults to `unhealthy`; `defaults.unhealthyOnTimeout: false` converts timeout status to `degraded`.
- Manager-level `redaction` and run-level `includeDiagnostics` are deprecated no-ops.

## Security and edge cases

Default JSON serialization excludes details, error messages, causes, and stacks. Opt in only for a protected diagnostics route. Preserve bounded concurrency, external abort propagation, collector failure isolation, deterministic check ordering, and shutdown disposal.

## Verification

Run `pnpm -C packages/healthcheck/core build`, `pnpm -C packages/healthcheck/core lint`, and `pnpm -C packages/healthcheck/core test`. Add focused assertions for every changed scope, status, timeout, retry, or redaction contract.

## Reference routing

- Read [API contract](references/api-contract.md) for manager, report, check, and collector shapes.
- Read [scopes, status, and profiles](references/scopes-status-and-profiles.md) for selection and aggregation decisions.
- Read [implementation playbook](references/implementation-playbook.md) for lifecycle, failure handling, and tests.

## Handoff requirements

Report the affected scopes, criticality decisions, timeout/retry policy, serialization exposure, tests run, and any package/README/docs contract that remains intentionally unchanged.
