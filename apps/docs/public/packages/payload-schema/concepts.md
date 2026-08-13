# Concepts

Understand canonical schemas, compilation, schema availability, cloning, and lifecycle ordering.

**Topic:** concepts
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/concepts/
## One intrinsic contract

A field definition owns validation and normalization intrinsic to that value. The entity can compile ordinary Payload fields or expose the same Zod schema. CRUD-specific optionality, authorization, populated documents, and business workflows stay outside the entity.

## Payload lifecycle

Canonical parsing is appended as a server-side field `beforeValidate` hook. Existing consumer hooks run first. `undefined` passes without parsing, allowing Payload required/default behavior to remain authoritative. Zod data errors become Payload `ValidationError` instances with dot paths and the original `req`.

Groups and arrays validate only their own shape/nullability/row bounds at the parent adapter; Payload traversal invokes child adapters exactly once. Payload array row IDs are preserved during lifecycle processing but excluded from canonical consumer schemas.

## Schema availability

Native data fields may omit a schema and still compile for Payload. Such a field is absent from schema context. A group or array containing it also becomes unavailable, and `pick` throws `SCHEMA_UNAVAILABLE` with the exact `blockingFieldPath`.

## State and cloning

The returned entity facade, fields map, and context are frozen. Each Payload compilation clones plain object/array containers and preserves special values such as functions, regular expressions, components, and class instances by reference. Input option objects are not promised to be deeply snapshotted at definition time; never mutate them after passing them to a factory.

## Sync-only canonical schemas

Canonical schemas must parse synchronously. Async refinements are detected when an exercised parse first returns a Promise and are reported as `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED` with phase `definition`.
