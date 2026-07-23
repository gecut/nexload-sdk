---
name: payload-schema-use
description: Use for consumer-side work with @nexload-sdk/payload-schema: migrating duplicated Payload and Zod fields, defining entities, choosing built-in factories versus field.native, deriving canonical input schemas, integrating compiled fields into existing collections, or diagnosing normalization and schema-availability failures. Do not use for package internals or generic Payload work.
---

# Payload Schema Use

## Purpose

Reuse intrinsic field contracts across Payload writes and application schemas while leaving persistence types, collection lifecycle, access, layout, and business rules with their existing owners.

## Trigger boundary

- Use for consumer entities, `defineEntity`, `field.*`, defaults, canonical schema derivation, native-field selection, migration, projections, and compiled-field integration.
- Keep generic collection design, access, hooks, tabs, adapters, storage, and unrelated Zod schemas with Payload or the application.
- Route factory, IR, compiler, adapter, error, package compatibility, or release changes to `payload-schema-develop`.

## Source of truth

Prefer the installed package's root exports and declarations, then its README and canonical docs. Inside this monorepo, source and public tests outrank prose. Payload-generated types remain authoritative for stored documents.

## Required inspection

- In this repository, inspect the root export, relevant option types, entity/compiler behavior, public tests, and the consuming collection.
- In an external consumer, inspect package exports/declarations, README/docs, collection fields/hooks/layout, and exact installed Payload/Zod versions; do not assume monorepo source exists.
- Read only the routed reference needed for the task.

## Decision flow

1. Separate intrinsic value rules from cross-field, request, database, access, workflow, and output concerns.
2. Use the built-in factory only when its canonical value shape matches the domain.
3. Use `field.native` for unsupported data fields; attach a sync schema only when the field belongs in consumer contracts.
4. Keep layout fields directly in Payload and compose ordered compiled fields inside them.
5. Derive small named schemas with strict `pick` or arbitrary Zod composition.

## Implementation workflow

1. Preserve collection slug, field names, hooks, access, versions, upload settings, localization, layout, and generated types.
2. Migrate one cohesive field group through the public root API.
3. Compile with `all`, `field`, or caller-ordered `pick`.
4. Replace only duplicated intrinsic constraints and normalization.
5. Verify direct parsing and a real Payload Local API write.
6. Report remaining application-owned validation and populated-output work.

## Invariants

- `required` controls Payload presence; `nullable` controls canonical `null`.
- Static `defaultValue` is parsed at definition; `dynamicDefaultValue` is forwarded opaquely; neither adds Zod `.default()`.
- Canonical relationship/upload values contain IDs or polymorphic references, never populated documents.
- Group/array schemas are strict and unavailable when any data descendant lacks a schema.
- Array row IDs are Payload metadata and are absent from canonical item schemas.
- Entity APIs do not create collections, persistence types, CRUD contracts, access rules, or layout.

## Security and edge cases

Keep secrets, request-dependent checks, database calls, authorization, and async refinements outside canonical fields. Treat `SCHEMA_UNAVAILABLE` as a contract failure with phase, reason, and blocking path; never silently omit the field. Validate populated external output separately.

## Verification

Run direct schema and consumer type tests, real Local API create/update coverage, and packed-consumer smoke when exports or installation change. Confirm exact Payload-family versions rather than treating a current-version smoke as a compatibility matrix.

## Reference routing

- Read [consumer contract](references/consumer-contract.md) for ownership, defaults, picker/error behavior, and public API examples.
- Read [field selection](references/field-selection.md) for canonical shapes, relationship/native/container decisions, and row metadata.
- Read [integration checklist](references/integration-checklist.md) for migration, diagnosis, environment-specific inspection, and verification commands.

## Handoff requirements

Report the entity and collection seams changed, canonical shapes affected, default/native decisions, exact versions and commands tested, any unavailable schema path, and remaining migration or populated-output risk.
