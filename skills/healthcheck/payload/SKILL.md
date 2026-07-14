---
name: healthcheck-payload
description: Use when integrating or reviewing @nexload-sdk/healthcheck-payload for Payload CMS dependency readiness, including the deterministic payload.find query contract, small limit and zero depth, optional where filters, expectedMinDocuments and empty-collection semantics, timeout normalization, readiness criticality, failure privacy, and adapter tests.
---

# Payload CMS Healthcheck

## Purpose

Verify Payload availability with a small deterministic query that gates readiness without turning business data or heavy reads into a health probe.

## Trigger boundary

- Use for `payloadHealthCheck`, Payload query options, expected document floors, timeout/failure behavior, scopes, and tests.
- Do not use for Payload fields, Jalali dates, money, slugs, generic database checks, or route exposure.
- Compose with core for manager policy and Next/security skills when serving the report.

## Source of truth

Use `packages/healthcheck/payload/src/index.ts`, its tests, README, and root package export. Do not import Payload through the core package.

## Required inspection

Read the Payload adapter README/package manifest, `src/index.ts`, `test/payload.test.mjs`, the target collection definition/access behavior, and manager timeout/serialization contracts.

## Decision flow

1. Choose a stable lightweight collection and optional narrow deterministic filter.
2. Keep limit small and depth zero unless evidence requires otherwise.
3. Decide whether empty results are valid; set `expectedMinDocuments` only for a real invariant.
4. Keep the check in readiness by default; add diagnostics only deliberately.
5. Test exact query arguments, expectation failure, thrown failure, and manager timeout.

## Implementation workflow

1. Create the adapter with an existing Payload instance and explicit collection.
2. Preserve default `limit: 1`, `depth: 0`, and optional `where` pass-through.
3. Register it once in the health manager; avoid liveness unless restart-on-Payload-failure is intended.
4. Serialize public output with default error suppression.
5. Build/lint/test the adapter and update its README if behavior changes.

## Invariants

- The adapter calls `payload.find` with collection, small limit, zero depth, and optional where.
- Default scopes are readiness; criticality is readiness true and diagnostics false.
- Without `expectedMinDocuments`, zero or unavailable totalDocs does not fail the check.
- With an expected minimum, totalDocs must be numeric and meet the floor.
- Expectation and query failures use stable `PAYLOAD_QUERY_FAILED` errors.
- Manager timeout yields `CHECK_TIMEOUT`; the adapter does not cancel `payload.find`.

## Security and edge cases

Do not use deep relationship expansion, expensive business predicates, writes, or user-dependent access. Raw query cause may exist in the report but public serialization suppresses it by default. Check-local Payload metrics do not appear in Prometheus/OTel unless a separate collector is designed.

## Verification

Run Payload adapter build/lint/test. Assert exact query arguments, empty default semantics, expected minimum pass/fail, custom option propagation, malformed totalDocs with an expectation, normalized thrown failure, timeout metadata/code, and scope criticality where changed.

## Reference routing

- Read [query contract](references/query-contract.md) for exact adapter behavior.
- Read [integration playbook](references/integration-playbook.md) for collection, scope, and exposure decisions.
- Read [testing](references/testing.md) for deterministic query and timeout coverage.

## Handoff requirements

State collection/filter rationale, limit/depth, expected minimum semantics, scopes/criticality, timeout caveat, exposed failure data, exact query assertions, and commands run.
