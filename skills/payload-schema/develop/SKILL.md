---
name: payload-schema-develop
description: "Use for internal development or review of @nexload-sdk/payload-schema itself: factories, private field seeds and compilation under /payload, canonical beforeValidate adapter, null semantics, Date normalization, blocks containers, cloning, structured errors, public type inference, package fixtures, packed distribution, browser-safe root verification, compatibility evidence, or release-impact analysis. Do not use for consumer entity migration or generic Payload/Zod work."
---

# Payload Schema Develop

## Purpose

Evolve the package as a small deep module while preserving one canonical validation source, precise public types, pure browser-safe root entry, Payload compilation under `/payload`, safe failures, and independent distribution.

## Trigger boundary

- Use for package source, factories (`field.blocks`, etc.), private state, compiler/adapter, null pass-through, Date normalization, errors (`INVALID_ENTITY`), type tests, package fixtures, browser bundle tests, distribution, compatibility evidence, and release-impact review.
- Route ordinary entity migration, native-field selection, schema derivation, and collection integration to `payload-schema-use`.
- Generic Payload, Zod, collection UI, access, storage, or editor work is out of scope.

## Source of truth

Read current exports, public types/tests, implementation, manifest, changelog, docs, helper scripts, and workflow files. Root entry `@nexload-sdk/payload-schema` is pure and browser-safe; Payload compilation lives in `src/payload/` and is exported from `@nexload-sdk/payload-schema/payload` (`payloadFields`). Derive version and release facts live; never preserve a historical bootstrap claim. Current code outranks skill prose.

## Required inspection

Inspect only the seams affected by the request, plus package manifest and worktree status. For release or compatibility claims, inspect actual workflow files and consumer/config fixtures rather than inferring automation from a helper script.

## Decision flow

1. Prove the behavior belongs in the public package and has more than one real consumer.
2. Add a failing test through root exports, `/payload` exports, public types, or compiled Payload lifecycle.
3. Extend the existing private seed/entity/compiler seam; do not create a parallel public interface.
4. Keep private Payload/Zod internals opaque and lock supported public behavior with learning tests.
5. Update docs, skill guidance, fixtures, compatibility evidence, and release impact only as required by the actual change.

## Implementation workflow

1. Write observable acceptance and type/runtime contract tests first.
2. Implement the smallest change without exporting internals.
3. Run unit and type tests before database and packed-consumer fixtures.
4. Exercise only relevant SQLite/Postgres/config/distribution boundaries, then expand for public changes.
5. Rebuild canonical docs and LLM indexes when public behavior changes.
6. Validate both package skills, workspace checks, artifacts, and current release evidence.

## Invariants

- Runtime root exports remain exactly the five documented values: `defineEntity`, `field`, `defaultIdSchema`, `PayloadSchemaError`, `isPayloadSchemaError`. Root has zero runtime dependency on `payload` and bundles cleanly for the browser.
- `@nexload-sdk/payload-schema/payload` exports `payloadFields(entity)`, which compiles fields for Node/Payload config. Rejects non-entities with `INVALID_ENTITY`.
- Private state is symbol-backed and closure-owned; there is no WeakMap/global registry or metadata reflection.
- Compilation clones arrays and plain objects by descriptor without executing getters; opaque values remain references.
- Consumer `beforeValidate` hooks precede one canonical adapter; native `validate` remains unchanged.
- Canonical beforeValidate adapter passes `null` through unchanged for all fields (matching `undefined`); Payload's required validator handles presence.
- Runtime date hook accepts valid `Date` instances and normalizes them to ISO strings; canonical and derived schemas remain strict ISO strings.
- Built-in normalizations use `.overwrite()`, making derived schemas codec-safe for `z.encode`.
- Group/array/blocks parent adapters validate containers and never recursively parse children.
- Error data is bounded and deterministic and excludes raw values, schemas, functions, config, secrets, stack, and serialized cause.
- Payload and Zod are peer dependencies (Payload `>=3.85.0 <4`, Zod `>=4.1.0 <5`); core has no Lexical runtime dependency.

## Security and edge cases

Respect fail-fast option/default/name/constraint checks and convert runtime canonical data failures to Payload `ValidationError` with `req` and dot paths. Async canonical behavior is detected only when sync parsing first encounters a Promise. Treat caller option objects as mutable input references until compilation; do not claim definition-time snapshot immutability.

## Verification

Distinguish a current-version packed smoke from a supported-version matrix. Run browser-bundle test to verify root entry imports no Node built-ins. Run only commands that exist, inspect tar contents and exports, and report absent workflows or unrun lanes. Determine Changeset impact from the current version and requested public behavior.

## Reference routing

- Read [architecture boundaries](references/architecture-invariants.md) for root vs `/payload` entry split, seed/entity/compiler/adapter/cloning behavior, and mutable-input caveat.
- Read [factory and error contract](references/factory-error-contract.md) before changing validation, blocks, defaults, relationships, errors, codec safety, or async behavior.
- Read [release evidence](references/release-matrix.md) for live version discovery, peer dependencies (Zod 4.1+), actual commands, distribution proof, and CI-claim rules.

## Handoff requirements

Report public behavior, architecture rationale, exact commands and version lanes actually run, artifact/export checks, docs/skills/release-impact status, absent automation, remaining compatibility risk, and unrelated baseline failures.
