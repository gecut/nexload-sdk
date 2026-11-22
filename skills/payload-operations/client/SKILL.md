---
name: payload-operations-client
description: "Use for implementing, integrating, reviewing, or diagnosing the @nexload-sdk/payload-operations clients: createOperationsClient from ./client (pure RPC client), createCMSClient from ./cms (PayloadSDK integration), operation calls, base URL and path handling, request headers, transport plugins, timeoutPlugin from ./plugins/timeout, response decoding via z.decodeAsync, and browser-safe client packaging."
---

# Payload Operations Client

## Purpose

Expose a typed operation tree through a lightweight RPC client (`createOperationsClient`) or combined with the native Payload SDK (`createCMSClient`) using a shared transport pipeline and bidirectional codecs.

## Trigger boundary

- Use for `createOperationsClient` (from `@nexload-sdk/payload-operations/client`), `createCMSClient` (from `@nexload-sdk/payload-operations/cms`), `cms.payload`, `cms.operations`, call options, transport/plugins, headers, URLs, `timeoutPlugin` (from `@nexload-sdk/payload-operations/plugins/timeout`), and response decoding via `z.decodeAsync`.
- Use `payload-operations-core` for contract/error model changes and `payload-operations-server` for endpoints/access.
- Do not use for generic fetch wrappers, Payload server handlers, auth token parsing, retry, cache, batching, or SDK internals.

## Source of truth

Prefer installed client/plugin exports and declarations:
- `@nexload-sdk/payload-operations/client`: `createOperationsClient`, `defineClientPlugin`, transport types (pure universal client; zero dependency on `@payloadcms/sdk`).
- `@nexload-sdk/payload-operations/cms`: `createCMSClient`, `createPayloadFetchAdapter`, CMS client types (requires optional peer `@payloadcms/sdk`).
- `@nexload-sdk/payload-operations/plugins/timeout`: `timeoutPlugin`, `isTimeoutError`, `TimeoutPluginOptions`.
- `@nexload-sdk/payload-operations/errors`: `safe`, `isDefinedError`, `CMSOperationError`.

In this repository, inspect client, transport, timeout, errors, package exports, and built artifacts. Treat the Payload SDK only through its public constructor and methods.

## Required inspection

Inspect the operation contract, client options, base URL/base path, base and call `RequestInit`, plugin order, custom fetch, abort signals, expected response schemas, and exact peer versions (`zod >=4.1.0 <5.0.0`).

## Decision flow

1. Determine whether the client needs the native Payload SDK:
   - Custom operations only: use `createOperationsClient` from `@nexload-sdk/payload-operations/client` (zero `@payloadcms/sdk` dependency).
   - Custom operations + Payload SDK: use `createCMSClient` from `@nexload-sdk/payload-operations/cms` (requires `@payloadcms/sdk`).
2. Build the client with the shared contract, `baseURL`, and matching `basePath`.
3. Compose named plugins with explicit request-source handling. Use `timeoutPlugin({ timeout: ms })` from `@nexload-sdk/payload-operations/plugins/timeout`.
4. Client pre-validates caller input with `safeParseAsync`, then transmits the original `z.input` value as JSON; defaults and transforms run on the server.
5. Client decodes JSON responses with `z.decodeAsync(output, json)` to `z.output<output>`.
6. Handle declared errors with `safe()` or `isDefinedError()`.

## Implementation workflow

1. For pure RPC operations:
```ts
import { createOperationsClient } from "@nexload-sdk/payload-operations/client";
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";

const client = createOperationsClient({
  baseURL: "https://cms.example.com",
  basePath: "/api/operations",
  operations,
  plugins: [timeoutPlugin({ timeout: 5000 })],
});
```
2. For integrated Payload SDK:
```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/cms";
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";

const cms = createCMSClient<Config, typeof operations>({
  operations,
  basePath: "/api/operations",
  payload: { baseURL: "https://cms.example.com" },
  plugins: [timeoutPlugin({ timeout: 5000 })],
});
```
3. Call operations from the materialized `client` or `cms.operations` tree.
4. Use `safe()` for declared-error result flow.
5. Change transport behavior through `defineClientPlugin`, not SDK internals.
6. Run typecheck, lint, build, subpath import, and consumer smoke checks.

## Invariants

- Pure client entry `./client` exports `createOperationsClient` with zero runtime dependency on `@payloadcms/sdk` or `payload`.
- `./cms` exports `createCMSClient`; `@payloadcms/sdk` is an optional peer dependency.
- `timeoutPlugin` is exported from `@nexload-sdk/payload-operations/plugins/timeout` and takes `{ timeout: number }` (not `{ ms }`).
- `cms.payload` is the actual `PayloadSDK` instance, not a proxy.
- Plugin one is outermost; plugin names are unique.
- Requests identify `source` as `payload` or `operation`.
- Operation method and body override caller options; caller headers override base headers.
- Input validation: client pre-validates with `safeParseAsync` (fails with 422 before network), checks JSON serializability (400 if fails), then transmits the original input value (`z.input`). The client-side parse result is discarded; server runs defaults and transforms.
- Response decoding: client decodes response JSON via `z.decodeAsync(output, json)` and defined error data via `z.decodeAsync(data, json)`.

## Security and edge cases

Reject empty base URLs and query/hash-bearing base URLs. Do not log bodies, credentials, or error causes in generic plugins. Treat non-JSON success, invalid output, forged envelopes, and mismatched statuses as safe framework failures. Preserve caller cancellation and native SDK errors.

## Verification

Use a recording transport or custom fetch to inspect URL, source, metadata, headers, body, signal, and plugin order. Verify invalid input makes no request, client sends original input, response decoding reconstructs `Date` instances, and root/client artifacts do not load Payload server runtime or `@payloadcms/sdk`.

## Reference routing

- Read [client construction](references/client-construction.md) for createOperationsClient vs createCMSClient, generics, facade, and paths.
- Read [transport pipeline](references/transport-pipeline.md) for timeoutPlugin, plugins, headers, and signals.
- Read [response handling](references/response-handling.md) for input transmission, z.decodeAsync decoding, and error downgrade rules.

## Handoff requirements

Report client options changed, client entry used (`./client` vs `./cms`), URL/path assumptions, plugin order, header precedence, abort/timeout behavior, response cases checked, exact versions and commands run, and any native SDK behavior left untouched.
