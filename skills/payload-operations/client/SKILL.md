---
name: payload-operations-client
description: Use for implementing, integrating, reviewing, or diagnosing the @nexload-sdk/payload-operations client: createCMSClient, the native PayloadSDK facade, operation calls, base URL and path handling, request headers, transport plugins, timeout behavior, response validation, and browser-safe client packaging.
---

# Payload Operations Client

## Purpose

Expose one native Payload SDK and a typed operation tree through a shared transport pipeline while preserving validation, abort, and error boundaries.

## Trigger boundary

- Use for `createCMSClient`, `cms.payload`, `cms.operations`, call options, transport/plugins, headers, URLs, timeout, and response parsing.
- Use `payload-operations-core` for contract/error model changes and `payload-operations-server` for endpoints/access.
- Do not use for generic fetch wrappers, Payload server handlers, auth token parsing, retry, cache, batching, or SDK internals.

## Source of truth

Prefer installed client/root/plugin exports and declarations. In this repository, inspect client, transport, timeout, errors, package exports, and built artifacts. Treat the Payload SDK only through its public constructor and methods.

## Required inspection

Inspect the operation contract, client options, base URL/base path, base and call `RequestInit`, plugin order, custom fetch, abort signals, expected response schemas, and exact peer versions.

## Decision flow

1. Confirm the issue belongs to operation transport rather than native SDK behavior.
2. Build the client with the shared contract and Payload SDK options.
3. Normalize one base URL and one matching operation base path.
4. Compose named plugins with explicit request-source handling.
5. Preserve caller abort, timeout identity, and response validation.

## Implementation workflow

1. Call `createCMSClient<Config, typeof operations>()` when Payload config typing is supplied.
2. Pass `baseURL`, optional `baseInit`, custom `fetch`, plugins, and the shared operation path option.
3. Call methods from the materialized `cms.operations` tree.
4. Use `safe()` for declared-error result flow or catch and narrow explicitly.
5. Change transport behavior through `defineClientPlugin`, not SDK internals.
6. Run typecheck, lint, build, subpath import, and consumer smoke checks.

## Invariants

- `cms.payload` is the actual `PayloadSDK` instance, not a proxy.
- Plugin one is outermost; plugin names are unique.
- Requests identify `source` as `payload` or `operation`.
- Operation method and body override caller options; caller headers override base headers.
- `Content-Length` is removed and JSON content type is controlled by the operation call.
- Validation failure occurs before network; successful data is parsed asynchronously.

## Security and edge cases

Reject empty base URLs and query/hash-bearing base URLs. Do not log bodies, credentials, or error causes in generic plugins. Treat non-JSON success, invalid output, forged envelopes, and mismatched statuses as safe framework failures. Preserve caller cancellation and native SDK errors.

## Verification

Use a recording transport or custom fetch to inspect URL, source, metadata, headers, body, signal, and plugin order. Verify invalid input makes no request, transforms run at intended boundaries, void maps to 204/undefined, and root/client artifacts do not load Payload server runtime.

## Reference routing

- Read [client construction](references/client-construction.md) for generics, facade, and paths.
- Read [transport pipeline](references/transport-pipeline.md) for plugins, headers, and signals.
- Read [response handling](references/response-handling.md) for parsing and error downgrade rules.

## Handoff requirements

Report client options changed, URL/path assumptions, plugin order, header precedence, abort/timeout behavior, response cases checked, exact versions and commands run, and any native SDK behavior left untouched.
