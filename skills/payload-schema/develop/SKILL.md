---
name: payload-schema-develop
description: "Use for internal development or review of @nexload-sdk/payload-schema itself: factories, private field seed and compiler, canonical beforeValidate adapter, cloning, structured errors, public type inference, package fixtures, packed distribution, compatibility evidence, or release-impact analysis. Do not use for consumer entity migration or generic Payload/Zod work."
---

# Payload Schema Develop

## Purpose

Evolve the package as a small deep module while preserving one canonical validation source, precise public types, Payload lifecycle behavior, safe failures, and independent distribution.

## Trigger boundary

- Use for package source, factories, private state, compiler/adapter, errors, type tests, package fixtures, distribution, compatibility evidence, and release-impact review.
- Route ordinary entity migration, native-field selection, schema derivation, and collection integration to `payload-schema-use`.
- Generic Payload, Zod, collection UI, access, storage, or editor work is out of scope.

## Source of truth

Read current root exports, public types/tests, implementation, manifest, changelog, docs, helper scripts, and workflow files. Derive version and release facts live; never preserve a historical bootstrap claim. Current code outranks skill prose.

## Required inspection

Inspect only the seams affected by the request, plus package manifest and worktree status. For release or compatibility claims, inspect actual workflow files and consumer/config fixtures rather than inferring automation from a helper script.

## Decision flow

1. Prove the behavior belongs in the public package and has more than one real consumer.
2. Add a failing test through root exports, public types, or compiled Payload lifecycle.
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

- Runtime root exports remain exactly the five documented values unless an approved public change says otherwise.
- Private state is symbol-backed and closure-owned; there is no WeakMap/global registry or metadata reflection.
- Compilation clones arrays and plain objects by descriptor without executing getters; opaque values remain references.
- Consumer `beforeValidate` hooks precede one canonical adapter; native `validate` remains unchanged.
- Group/array parent adapters validate containers and never recursively parse children.
- Error data is bounded and deterministic and excludes raw values, schemas, functions, config, secrets, stack, and serialized cause.
- Payload/Zod remain peers and core has no Lexical runtime dependency.

## Security and edge cases

Respect fail-fast option/default/name/constraint checks and convert runtime canonical data failures to Payload `ValidationError` with `req` and dot paths. Async canonical behavior is detected only when sync parsing first encounters a Promise. Treat caller option objects as mutable input references until compilation; do not claim definition-time snapshot immutability.

## Verification

Distinguish a current-version packed smoke from a supported-version matrix. Run only commands that exist, inspect tar contents and exports, and report absent workflows or unrun lanes. Determine Changeset impact from the current version and requested public behavior; never assume an initial-major release.

## Reference routing

- Read [architecture boundaries](references/architecture-invariants.md) for seed/entity/compiler/adapter/cloning behavior and the mutable-input caveat.
- Read [factory and error contract](references/factory-error-contract.md) before changing validation, defaults, relationships, errors, or async behavior.
- Read [release evidence](references/release-matrix.md) for live version discovery, actual commands, distribution proof, and CI-claim rules.

## Handoff requirements

Report public behavior, architecture rationale, exact commands and version lanes actually run, artifact/export checks, docs/skills/release-impact status, absent automation, remaining compatibility risk, and unrelated baseline failures.
