---
name: healthcheck-diagnostics-security
description: Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
---

# Healthcheck Diagnostics Security

## Purpose

Keep public probes minimal and make diagnostics/metrics fail closed across serialization, route protection, proxy trust, and telemetry data design.

## Trigger boundary

- Use for exposure matrices, protected diagnostics/metrics, redaction, credentials, IP/CIDR policy, proxy headers, cache policy, secrets, and cardinality.
- Do not use as the primary skill for check logic, exporter encoding, or route-file structure.
- Compose with `healthcheck-nextjs-routes` for App Router endpoints and `healthcheck-monitoring-exporters` for metric names/labels.

## Source of truth

Use core serializer source/tests for data suppression and the Next adapter source/tests for protection behavior. Deployment proxy/network configuration remains external policy and must be verified separately.

## Required inspection

Read `packages/healthcheck/core/src/core/serializers.ts`, `src/core/types.ts`, relevant core tests, `packages/healthcheck/next/src/index.ts`, route tests, and the actual route/deployment proxy configuration in scope.

## Decision flow

1. Classify each endpoint as public probe, internal probe, private diagnostics, or private metrics.
2. Minimize fields before adding protection; authentication does not justify unnecessary secrets.
3. Choose credential and network rules, then validate configuration at route construction.
4. Trust forwarded IP only behind a controlled proxy and an explicit header contract.
5. Verify unauthorized, missing-header, invalid-IP, redaction, and no-store behavior.

## Implementation workflow

1. Write the exposure matrix and identify every data producer: checks, collectors, resources, labels, identities, and links.
2. Keep public routes summary-only or JSON without details.
3. Configure private routes with explicit serializer opt-ins and fail-closed `protect` rules.
4. Test construction-time misconfiguration and runtime denial separately.
5. Review reverse-proxy behavior and label cardinality outside the application unit test.

## Invariants

- Details, original error messages, causes, and stacks are suppressed by default.
- Protection is optional in the adapter, so diagnostics and metrics must opt in operationally.
- `protect: {}`, an empty password, and blank bearer token/username are invalid; IP/CIDR rules require `trustProxy: true`.
- Current allowlists are IPv4-only and policy classes compose with AND semantics.
- Missing or invalid proxy addresses deny with 401.
- Health responses use `cache-control: no-store, max-age=0`.
- Metrics and labels never contain secrets or unbounded identifiers.

## Security and edge cases

Serializer redaction covers details/resources, not check/report metrics, identities, links, or labels. `redact: false` still does not reveal error messages without explicit opt-in. `trustProxy` is an assertion, not proxy-chain verification. Do not let custom headers override cache-control; reject whitespace-only secrets in application configuration even where runtime validation is less strict.

## Verification

Run core and Next build/lint/test suites. Add tests for public suppression, protected opt-in, empty configuration, incorrect credentials, absent/invalid proxy IP, invalid CIDR, AND composition, unauthorized HEAD where relevant, and immutable no-store headers.

## Reference routing

- Read [exposure matrix](references/exposure-matrix.md) before choosing route payloads.
- Read [redaction and error policy](references/redaction-and-error-policy.md) before exposing report fields.
- Read [route hardening](references/route-hardening.md) for fail-closed auth, proxy, and cache rules.

## Handoff requirements

Provide the endpoint classification, exposed fields, protection layers, proxy trust assumption, serializer opt-ins, label/secret review, denial tests, and any deployment control that could not be verified in the repo.
