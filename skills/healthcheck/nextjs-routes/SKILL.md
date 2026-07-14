---
name: healthcheck-nextjs-routes
description: Use when wiring @nexload-sdk/healthcheck-next into Next.js App Router liveness, readiness, startup, diagnostics, or metrics route modules, including a server-only manager singleton, GET/HEAD behavior, scope and status policy, no-store route constants, response formats, and fail-closed route protection. Do not use for non-Next servers.
---

# Next.js Health Routes

## Purpose

Build deterministic App Router health endpoints around one server-only manager while preserving scope semantics, status policy, cache prevention, and protection.

## Trigger boundary

- Use for Next route files, manager singleton imports, `createNextHealthRoute`, `createNextMetricsRoute`, methods, formats, status mapping, and route constants.
- Do not use for Express/Fastify/Bun routes, custom check internals, or exporter conversion internals.
- Compose with diagnostics security whenever details, diagnostics, metrics, auth, IP allowlists, or proxy trust enter scope.

## Source of truth

Use `packages/healthcheck/next/src/index.ts`, its tests/README, core HTTP/serializer contracts, and the actual Next route modules. Generated docs are secondary.

## Required inspection

Read the Next package README, package exports, full `src/index.ts`, `test/route.test.mjs`, the manager module, and all existing health route files before editing. Inspect Prometheus package behavior for metrics formats.

## Decision flow

1. Map each URL to exactly one scope or metrics purpose.
2. Reuse one manager singleton from a server-only module.
3. Choose summary versus JSON, default versus strict HTTP policy, and details exposure.
4. Add protection for diagnostics/metrics and validate proxy assumptions.
5. Apply Node/dynamic/no-store route constants where runtime checks need them.

## Implementation workflow

1. Create or verify the singleton manager outside route modules.
2. Export route handlers from the factory; do not wrap them unless extra behavior is tested.
3. Export `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `revalidate = 0`, and `fetchCache = "force-no-store"` for Node/process/container-backed routes.
4. Test GET/HEAD, body shape, status policy, protection, and headers.
5. Keep package README/docs synchronized when adapter behavior changes.

## Invariants

- Health routes require an explicit liveness/readiness/startup/diagnostics scope and return GET plus HEAD.
- HEAD runs the manager/status logic but returns no body.
- Default policy maps degraded to 200 and unhealthy to 503; strict readiness maps both degraded and unhealthy to 503.
- Metrics route is GET-only, defaults to scope `all`, uses monitoring profile, and always returns HTTP 200 with report status in headers.
- Every response is no-store; only `cache: "no-store"` is valid.
- Protection misconfiguration fails at route construction and authorization failure returns 401.

## Security and edge cases

Diagnostics and metrics are not automatically protected. `includeDetails` still uses serializer redaction and does not expose raw cause/stack. Custom headers must not override cache-control. IP/CIDR is IPv4-only, requires trusted proxy configuration, and denies missing/invalid forwarded IP.

## Verification

Build Prometheus before Next when metrics formatting changed, then run Next build/lint/test. Cover summary/JSON, GET/HEAD, default/strict statuses, metrics HTTP 200, content types, cache headers, invalid configuration, and authorized/unauthorized paths.

## Reference routing

- Read [route matrix](references/route-matrix.md) to map URLs, scopes, methods, and formats.
- Read [protection and proxy](references/protection-and-proxy.md) for fail-closed configuration.
- Read [App Router playbook](references/app-router-playbook.md) for singleton and route-module implementation.

## Handoff requirements

List every route, scope, format, method, HTTP policy, runtime constants, protection/proxy assumption, cache behavior, and test command. Call out any deployment-side access control not verified locally.
