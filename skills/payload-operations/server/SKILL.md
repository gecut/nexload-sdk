---
name: payload-operations-server
description: "Use for implementing, integrating, reviewing, or diagnosing @nexload-sdk/payload-operations on Payload: createPayloadEndpoints, complete handler trees, partial access overrides, authentication semantics, request parsing, CORS and OPTIONS, declared errors, output validation, request-scoped Local API use, and server-safe failures."
---

# Payload Operations Server

## Purpose

Mount a shared operation contract as Payload endpoints with exact handler coverage, explicit access, validated boundaries, CORS, and leak-resistant errors.

## Trigger boundary

- Use for `createPayloadEndpoints`, handlers, access defaults/overrides, POST/OPTIONS routes, CORS, request parsing, Local API, and server failures.
- Use `payload-operations-core` for contract/error typing and `payload-operations-client` for transport/timeout.
- Do not use for generic Payload collections, JWT/cookie parsing, client plugins, transaction abstraction, or custom HTTP verbs.

## Source of truth

Prefer installed server exports and declarations plus the exact Payload endpoint types. In this repository, inspect server source, contract/error boundaries, package peers, Payload config integration, and built server declarations.

## Required inspection

Inspect the operation tree, complete handler tree, access override tree, base path, Payload config endpoints, `req.user`, handler Local API calls, output/error schemas, CORS settings, and exact Payload version.

## Decision flow

1. Confirm client and server share the same frozen contract and normalized base path.
2. Require one handler for every operation and no extra leaves.
3. Choose explicit public overrides; otherwise preserve authenticated-by-default access.
4. Keep request authentication and transaction context owned by Payload.
5. Validate input, handler output, and declared error data asynchronously.

## Implementation workflow

1. Call `createPayloadEndpoints({ operations, handlers, access, basePath })`.
2. Spread returned endpoints into Payload config.
3. Implement handlers with parsed `input`, `req`, metadata, and generated `errors`.
4. Use `req.payload` and pass `req`, `user: req.user`, and `overrideAccess: false` when caller-scoped authorization is required.
5. Add public access only with an explicit operation override.
6. Run package checks, Payload config typecheck, route smoke, CORS checks, docs, and Skills validation.

## Invariants

- Handler trees are complete and exact; access trees are partial but contain only valid operation leaves.
- Default access is `Boolean(req.user)`; denial is 401 without a user and 403 with a user.
- Empty body becomes `undefined`; non-empty body requires JSON content type and valid JSON.
- Input and output schemas use async parsing.
- Undefined successful output becomes 204; other success is JSON 200.
- Every success/error/preflight response uses Payload CORS headers.

## Security and edge cases

Do not parse JWTs, API keys, or cookies in this package. Do not bypass Payload access or lose request transaction context in Local API calls. Sanitize input issues; never expose output issues, exceptions, Payload errors, stacks, or causes. Only declared errors matching the current operation cross the boundary.

## Verification

Typecheck a real Payload config and smoke authenticated, anonymous, denied, invalid JSON, invalid input, declared error, unknown exception, invalid output, void, and OPTIONS flows. Confirm CORS headers on all responses and exact runtime handler/access tree rejection.

## Reference routing

- Read [endpoint assembly](references/endpoint-assembly.md) for trees, paths, methods, and responses.
- Read [access and Local API](references/access-and-local-api.md) for authorization and request context.
- Read [server error boundary](references/server-error-boundary.md) for validation, declared errors, and leak prevention.

## Handoff requirements

Report routes and base path mounted, public/authenticated access decisions, Local API context handling, response/error scenarios checked, CORS evidence, exact Payload version and commands run, and any application-owned transaction risk.
