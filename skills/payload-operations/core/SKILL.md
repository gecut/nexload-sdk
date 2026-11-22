---
name: payload-operations-core
description: "Use for defining, reviewing, or diagnosing @nexload-sdk/payload-operations contracts, operation trees, Zod codec boundaries, Date handling via z.codec, declared errors, safe results, type inference, public subpaths, and package-wide compatibility. Use the client or server sibling when transport or Payload endpoints are the primary concern."
---

# Payload Operations Core

## Purpose

Define one typed operation contract shared by callers and Payload handlers using bidirectional Zod codecs without coupling universal code to Payload server runtime.

## Trigger boundary

- Use for `operation`, `defineCMSOperations`, Zod codec boundaries, Date handling via `z.codec`, declared errors, `safe`, `isDefinedError`, tree validation, and public export review.
- Use `payload-operations-client` for client creation (`createOperationsClient` from `./client`, `createCMSClient` from `./cms`), transport, headers, plugins, timeout, and response diagnosis.
- Use `payload-operations-server` for endpoints (`createPayloadEndpoints`), handlers, required `access.default`, `maxBodyBytes`, CORS, and Local API usage.
- Do not use for generic REST design, Payload CRUD, unrelated Zod schemas, or release publishing.

## Source of truth

Prefer installed exports and declarations. The package exposes explicit subpaths:
- `@nexload-sdk/payload-operations` (root): `operation`, `defineCMSOperations`, `safe`, `isDefinedError`, `isTimeoutError`, and types (universal; no `payload` or `@payloadcms/sdk`).
- `./contract`: `operation`, `defineCMSOperations`, and contract types.
- `./errors`: `safe`, `isDefinedError`, `CMSOperationError`, `isCMSOperationError`, and types.
- `./client`: `createOperationsClient`, `defineClientPlugin`, transport types.
- `./cms`: `createCMSClient`, `createPayloadFetchAdapter`, CMS client types (requires optional peer `@payloadcms/sdk`).
- `./plugins/timeout`: `timeoutPlugin`, `isTimeoutError`, `TimeoutPluginOptions`.
- `./server`: `createPayloadEndpoints`, `CMSOperationError`, `DEFAULT_MAX_BODY_BYTES`, server types.

In this repository, inspect `packages/payload-operations/src`, package metadata, built declarations, and consuming examples. Treat prose as secondary.

## Required inspection

Inspect package exports, contract/error types, the operation tree, relevant Zod schemas, consumer call sites, and exact installed Payload SDK, Payload, and Zod versions (`zod >=4.1.0 <5.0.0`). Read only the routed references needed.

## Decision flow

1. Confirm the task is contract-wide rather than client- or server-specific.
2. Model input, output, and declared errors with Zod schemas.
3. Keep caller input, handler input, handler return, wire encoding, and client decoded types distinct.
4. Output and error-data schemas must be codec-safe (use `z.codec` for transformations or rich types like `Date`).
5. Preserve the direct namespace tree on both client and handler sides.
6. Use public guards and tuples (`safe()`, `isDefinedError()`) instead of reconstructing error brands.

## Implementation workflow

1. Define leaves with `operation()` and assemble them with `defineCMSOperations()`.
2. Ensure output and error-data schemas are codec-safe; use `z.codec` for `Date` instances.
3. Use uppercase snake-case error codes with stable status, message, and optional typed data.
4. Derive types through the public operation/client/server types.
5. Handle declared errors with `safe()` or `isDefinedError()`.
6. Update public docs when behavior changes.
7. Run package typecheck, lint, build, export smoke, docs, and skills validation.

## Invariants

- Client input is `z.input<input>`; client pre-validates with `safeParseAsync` and sends original input; handler input is parsed `z.output<input>`.
- Handler return is `z.output<output>`; server encodes with `z.encodeAsync`; client decodes with `z.decodeAsync` to `z.output<output>`.
- Defined error data follows the same codec model: factory takes `z.output<data>`, server encodes, client decodes.
- Output and error-data schemas must be codec-safe (plain schemas, `.overwrite()`, or `z.codec`). Unidirectional `.transform()` fails with 500 on the server.
- Date objects must use `z.codec(z.iso.datetime(), z.date(), { decode, encode })`.
- Schemas retain identity; contract wrappers and definition maps are immutable.
- Namespaces mirror directly with no `query` or `command` wrapper.
- Reserved path keys, malformed segments, invalid statuses, and invalid error codes fail early.
- Universal entrypoints do not import Payload server runtime.
- Zod peer dependency is `>=4.1.0 <5.0.0`; `@payloadcms/sdk` is an optional peer dependency.

## Security and edge cases

Reject unsafe path segments and prototype-sensitive keys. Server `z.encodeAsync` on `z.object` output schemas drops unrecognized keys automatically, preventing internal data leaks. Do not trust a non-JSON or forged error envelope as a declared error. Keep unknown failures generic, do not expose causes, and do not accept undeclared error data.

## Verification

Run package typecheck, lint, build, and import every documented subpath from built output. Check declarations for `any` and private imports, confirm peers remain external, and validate docs examples and all Skills.

## Reference routing

- Read [contract model](references/contract-model.md) for operation trees, codec boundaries, Date handling, and schema rules.
- Read [error model](references/error-model.md) for factories, narrowing, CMSOperationError exports, and safe tuples.
- Read [package boundaries](references/package-boundaries.md) for explicit subpaths, peer dependencies, and verification.

## Handoff requirements

Report contract shapes changed, codecs/transforms involved, error codes affected, entrypoints checked, exact versions and commands run, docs/skills impact, and any remaining consumer risk.
