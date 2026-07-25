---
name: payload-operations-core
description: Use for defining, reviewing, or diagnosing @nexload-sdk/payload-operations contracts, operation trees, Zod input/output boundaries, declared errors, safe results, type inference, public exports, and package-wide compatibility. Use the client or server sibling when transport or Payload endpoints are the primary concern.
---

# Payload Operations Core

## Purpose

Define one typed operation contract shared by callers and Payload handlers without coupling universal code to Payload server runtime.

## Trigger boundary

- Use for `operation`, `defineCMSOperations`, Zod boundaries, declared errors, `safe`, `isDefinedError`, tree validation, and public export review.
- Use `payload-operations-client` for client creation, transport, headers, plugins, timeout, and response diagnosis.
- Use `payload-operations-server` for endpoints, handlers, access, CORS, and Local API usage.
- Do not use for generic REST design, Payload CRUD, unrelated Zod schemas, or release publishing.

## Source of truth

Prefer installed exports and declarations. In this repository, inspect `packages/payload-operations/src`, package metadata, built declarations, and consuming examples. Treat prose as secondary and never infer private internals.

## Required inspection

Inspect package exports, contract/error types, the operation tree, relevant Zod schemas, consumer call sites, and exact installed Payload SDK, Payload, and Zod versions. Read only the routed references needed.

## Decision flow

1. Confirm the task is contract-wide rather than client- or server-specific.
2. Model input, output, and declared errors with Zod schemas.
3. Keep handler, wire, and client parsed types distinct.
4. Preserve the direct namespace tree on both client and handler sides.
5. Use public guards and tuples instead of reconstructing error brands.

## Implementation workflow

1. Define leaves with `operation()` and assemble them with `defineCMSOperations()`.
2. Use uppercase snake-case error codes with stable status and message.
3. Derive types through the public operation/client/server types.
4. Handle declared errors with `safe()` or `isDefinedError()`.
5. Update public docs when behavior changes.
6. Run package typecheck, lint, build, export smoke, docs, and skills validation.

## Invariants

- Client input is `z.input<input>`; handler input is parsed `z.output<input>`.
- Handler return is `z.input<output>`; client result is parsed `z.output<output>`.
- Schemas retain identity; contract wrappers and definition maps are immutable.
- Namespaces mirror directly with no `query` or `command` wrapper.
- Reserved path keys, malformed segments, invalid statuses, and invalid error codes fail early.
- Universal entrypoints do not import Payload server runtime.

## Security and edge cases

Reject unsafe path segments and prototype-sensitive keys. Do not trust a non-JSON or forged error envelope as a declared error. Keep unknown failures generic, do not expose causes, and do not accept undeclared error data.

## Verification

Run package typecheck, lint, build, and import every documented subpath from built output. Check declarations for `any` and private imports, confirm peers remain external, and validate docs examples and all Skills.

## Reference routing

- Read [contract model](references/contract-model.md) for operation trees and Zod boundaries.
- Read [error model](references/error-model.md) for factories, narrowing, and safe tuples.
- Read [package boundaries](references/package-boundaries.md) for exports, compatibility, and verification.

## Handoff requirements

Report contract shapes changed, input/output transforms involved, error codes affected, entrypoints checked, exact versions and commands run, docs/skills impact, and any remaining consumer risk.
