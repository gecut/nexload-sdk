---
name: payload-operations-server
description: "Use for implementing, integrating, reviewing, or diagnosing @nexload-sdk/payload-operations on Payload: createPayloadEndpoints, complete handler trees, required access.default, request body limits via maxBodyBytes, request parsing, CORS and OPTIONS, declared errors, output encoding via z.encodeAsync, request-scoped Local API use, and server-safe failures."
---

# Payload Operations Server

## Purpose

Mount a shared operation contract as Payload endpoints with exact handler coverage, required default access, body size limits, validated boundaries, CORS, and leak-resistant encoded responses.

## Trigger boundary

- Use for `createPayloadEndpoints`, handlers, required `access.default` and optional `overrides`, `maxBodyBytes` (413 limits), POST/OPTIONS routes, CORS, request parsing, Local API, output encoding, and server failures.
- Use `payload-operations-core` for contract/error typing and `payload-operations-client` for transport/timeout.
- Do not use for generic Payload collections, JWT/cookie parsing, client plugins, transaction abstraction, or custom HTTP verbs.

## Source of truth

Prefer installed server exports and declarations plus the exact Payload endpoint types. Exported from `@nexload-sdk/payload-operations/server`: `createPayloadEndpoints`, `CMSOperationError`, `DEFAULT_MAX_BODY_BYTES`, server types. In this repository, inspect server source, contract/error boundaries, package peers, Payload config integration, and built server declarations.

## Required inspection

Inspect the operation tree, complete handler tree, required `access.default` and optional `overrides` tree, `maxBodyBytes`, base path, Payload config endpoints, `req.user`, handler Local API calls, output/error schemas, CORS settings, and exact Payload version.

## Decision flow

1. Confirm client and server share the same frozen contract and normalized base path.
2. Require one handler for every operation and no extra leaves.
3. Configure required `access.default`; add explicit public overrides where needed.
4. Keep request authentication and transaction context owned by Payload.
5. Handler returns `z.output<output>`; server encodes responses and error data asynchronously with `z.encodeAsync`.
6. Enforce `maxBodyBytes` (default 1 MiB); oversized requests return 413 `PAYLOAD_TOO_LARGE`.

## Implementation workflow

1. Call `createPayloadEndpoints({ operations, handlers, access, basePath, maxBodyBytes })`.
2. Ensure `access.default` is provided (throws `TypeError` at config time if missing).
3. Spread returned endpoints into Payload config.
4. Implement handlers returning `z.output<output>` with parsed `input`, `req`, metadata, and generated `errors`.
5. Use `req.payload` and pass `{ overrideAccess: false, req }` when caller-scoped collection access control is required.
6. Manage database transactions explicitly when multi-step atomicity is needed.
7. Run package checks, Payload config typecheck, route smoke, CORS checks, docs, and Skills validation.

## Invariants

- Handler trees are complete and exact; access trees are partial but contain only valid operation leaves.
- `access.default` is strictly required at config time; omitting it throws `TypeError: createPayloadEndpoints requires access.default.`.
- Denial returns 401 when `req.user` is absent and 403 when authenticated caller is denied.
- Request body limits: `maxBodyBytes` defaults to `1_048_576` (1 MiB). Fast-rejects oversized `Content-Length` headers and stream byte counts with 413 `PAYLOAD_TOO_LARGE`.
- Handler returns `z.output<output>`. The server encodes output via `z.encodeAsync(output, result)`. Standard `z.object` schemas strip unknown keys automatically, preventing data leaks.
- Defined error data is encoded via `z.encodeAsync(data, value)`.
- Output and error-data schemas must be codec-safe. Unidirectional `.transform()` calls cause the server to return 500 `INTERNAL_SERVER_ERROR`.
- No automatic transactions: operations do not wrap database calls in transactions.
- Local API `overrideAccess` caveat: Payload 3 `req.payload` calls run with `overrideAccess: true` by default; pass `{ overrideAccess: false, req }` when caller authorization is required.
- Empty body becomes `undefined`; non-empty body requires JSON content type and valid JSON.
- Undefined successful output becomes 204; other success is JSON 200.
- Every success/error/preflight response uses Payload CORS headers.

## Security and edge cases

Do not parse JWTs, API keys, or cookies in this package. Local API calls default to `overrideAccess: true`; pass `{ overrideAccess: false, req }` to preserve collection-level permissions. Output encoding automatically strips unmodeled keys, but avoid `z.looseObject` or `.passthrough()` unless exposure is intended. Only declared errors matching the current operation cross the boundary; undeclared exceptions become generic 500 responses without leaking stacks or causes.

## Verification

Typecheck a real Payload config and smoke authenticated, anonymous, denied, oversized body (413), invalid JSON, invalid input, declared error, unknown exception, invalid output, void, and OPTIONS flows. Confirm CORS headers on all responses and exact runtime handler/access tree rejection.

## Reference routing

- Read [endpoint assembly](references/endpoint-assembly.md) for trees, paths, maxBodyBytes, methods, and responses.
- Read [access and Local API](references/access-and-local-api.md) for required access.default, overrides, Local API overrideAccess caveat, and transaction boundaries.
- Read [server error boundary](references/server-error-boundary.md) for validation, output encoding via z.encodeAsync, declared errors, and leak prevention.

## Handoff requirements

Report routes and base path mounted, required access.default policy and public overrides, maxBodyBytes configured, Local API context handling, response/error scenarios checked, CORS evidence, exact Payload version and commands run, and any application-owned transaction risk.
