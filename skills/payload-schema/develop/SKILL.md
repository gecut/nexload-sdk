---
name: payload-schema-develop
description: Use when developing, reviewing, testing, or releasing @nexload-sdk/payload-schema internals: field factories, private IR, Payload compiler and canonical adapter, structured errors, cloning, type inference, compatibility fixtures, docs, skills, or distribution artifacts.
---

# Payload Schema Develop

## Purpose

Evolve the package as a small deep module while preserving one canonical validation source, public type precision, Payload lifecycle compatibility, and independent distribution.

## Trigger boundary

- Use for package source, factories, IR, compiler, adapter, errors, types, tests, CI, docs, skills, and release validation.
- Do not use for ordinary consumer entity migration; use `payload-schema-use`.
- Generic Payload or Zod work without this package is out of scope.

## Source of truth

Read root exports, public declarations, public-interface tests, README, canonical docs, package manifest, compatibility workflows, and current official Payload/Zod behavior. Latest approved decisions override older spec text.

## Required inspection

Inspect `package.json`, `src/index.ts`, public types/errors, field definitions, entity/compiler seam, clone logic, unit/type/integration/consumer tests, CI lanes, docs inventory, skill validation, lockfile, and worktree status.

## Decision flow

1. Confirm the behavior belongs in the small public API and has multiple real consumers.
2. Add a failing test through root exports or compiled Payload lifecycle.
3. Extend the existing private seed and closure-owned entity IR.
4. Keep Payload/Zod internals opaque and supported-version behavior locked by learning tests.
5. Update docs, skills, fixtures, compatibility, and Changeset when public behavior changes.

## Implementation workflow

1. Write acceptance and public contract tests first.
2. Implement the minimal source change without exporting internals.
3. Run unit and type tests before integration fixtures.
4. Exercise SQLite, PostgreSQL, generated types, and packed consumers as relevant.
5. Rebuild canonical docs and LLM indexes.
6. Validate both package skills and the whole workspace.

## Invariants

- Runtime root exports remain exactly five values.
- No WeakMap registry, global singleton, reflection metadata, private Zod internals, or deep public imports.
- Every facade call returns independent plain containers without executing getters.
- Consumer hooks precede one canonical field adapter; native validate remains unchanged.
- Group/array lifecycle adapters never recursively parse children.
- Error data is deterministic, safe, and never serializes values, schemas, functions, config, secrets, stack, or cause.
- Payload and Zod remain peer dependencies; core has no Lexical runtime dependency.

## Security and edge cases

Fail fast on reserved options, invalid native/layout fields, conflicting defaults, invalid constraints, and schema-less static defaults. Convert runtime canonical data failures to Payload `ValidationError`. Treat async detection as first-exercised sync parse behavior.

## Verification

Run package lint, unit, type, SQLite, PostgreSQL, consumer, compatibility, and build checks; validate tar contents and exports; run docs build, package/all skill validators, workspace build/lint, and `git diff --check`. Separate unrelated baseline failures.

## Reference routing

- Read [architecture invariants](references/architecture-invariants.md) for IR, compiler, adapter, and clone boundaries.
- Read [factory and error contract](references/factory-error-contract.md) before semantic changes.
- Read [release matrix](references/release-matrix.md) for fixtures, CI, docs, and package delivery.

## Handoff requirements

Report public behavior and architecture rationale, exact commands and version lanes, artifact/export checks, docs/skills/Changeset status, remaining compatibility risk, and unrelated baseline failures.
