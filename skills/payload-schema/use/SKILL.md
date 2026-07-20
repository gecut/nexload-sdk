---
name: payload-schema-use
description: Use when consuming or migrating to @nexload-sdk/payload-schema: defining entities, choosing canonical factories versus field.native, deriving Zod schemas, integrating compiled fields into Payload collections, or diagnosing consumer contract errors.
---

# Payload Schema Use

## Purpose

Reuse one intrinsic field contract across Payload writes and application Zod schemas without moving collection lifecycle or inventing persistence types.

## Trigger boundary

- Use for `defineEntity`, `field.*`, schema derivation, migration, native selection, defaults, projections, and Payload collection integration.
- Do not use for generic Payload collection work, UI layout, access control, database adapters, or unrelated Zod schemas.
- Use `payload-schema-develop` when changing package internals, factories, compiler, adapter, errors, compatibility, or release assets.

## Source of truth

Read package exports, types, tests, README, canonical docs, and the consuming collection. Payload-generated types remain authoritative for stored documents.

## Required inspection

Inspect `packages/payload-schema/src/index.ts`, the relevant factory option types, the entity definition, existing collection fields/hooks/layout, derived schemas, and exact Payload/Zod versions.

## Decision flow

1. Separate intrinsic field rules from cross-field, workflow, access, and output concerns.
2. Use a built-in factory when its canonical value matches the domain.
3. Use `field.native` for unsupported data fields; keep layout fields directly in Payload.
4. Derive small named schemas with arbitrary composition or strict `pick`.
5. Keep populated relationships and output projection explicit.

## Implementation workflow

1. Preserve existing collection lifecycle and field names.
2. Add or adjust the entity definition through the public root API.
3. Compile fields with `all`, `field`, or ordered `pick`.
4. Replace duplicated application constraints with canonical schemas.
5. Test direct schema parsing and real Payload writes.
6. Update consumer docs when integration behavior changes.

## Invariants

- `required` is Payload presence; `nullable` is canonical value nullability.
- Static `defaultValue` is definition-validated; dynamic defaults use `dynamicDefaultValue`.
- Neither default mode adds Zod `.default()`.
- Canonical relationships contain IDs or polymorphic references, never populated documents.
- Schema-less native descendants make their group or array schema unavailable.
- Entity APIs do not create collections or CRUD-specific schemas.

## Security and edge cases

Never place secrets, request-dependent checks, database calls, async refinement, or authorization inside canonical field schemas. Do not expose inspection as an API model. Validate external populated output separately.

## Verification

Run the consumer typecheck, direct schema tests, Payload integration tests, package consumer smoke when exports are involved, and `git diff --check`. Confirm exact Payload family versions.

## Reference routing

- Read [consumer contract](references/consumer-contract.md) for ownership, defaults, and schema behavior.
- Read [field selection](references/field-selection.md) for factory/native/container decisions.
- Read [integration checklist](references/integration-checklist.md) for migration and Payload verification.

## Handoff requirements

Report entities and collection seams changed, schema contracts affected, defaults/native choices, Payload and Zod versions tested, commands run, and remaining migration risk.
