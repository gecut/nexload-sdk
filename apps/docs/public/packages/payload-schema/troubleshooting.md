# Troubleshooting

Diagnose Payload Schema definition, derivation, hook, and validation failures.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/payload-schema` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/troubleshooting/
## `SCHEMA_UNAVAILABLE`

The selected native field lacks a canonical schema, or a container has a schema-less descendant. The error phase is `schema-derivation`; inspect `data.reason` and `data.blockingFieldPath`. Add a schema, exclude the field from the projection, or keep that field Payload-only.

## Default configuration fails

* both defaults: `CONFLICTING_DEFAULT_CONFIGURATION`;
* invalid static value: `INVALID_DEFAULT_VALUE`;
* static default without schema: `INVALID_FIELD_CONFIGURATION`;
* `payload.defaultValue`: `RESERVED_PAYLOAD_OPTION`.

Move static and dynamic defaults to the factory-level options.

## Payload returns `ValidationError`

This is expected for invalid canonical data. Its paths are dot-based, including nested indices such as `gallery.0.alt`, and it carries `req`. Fix input or schema constraints; do not catch it as `PayloadSchemaError`.

## Async schema error

Canonical schemas are sync-only. Replace async refinement with a separate async application boundary or Payload hook. Detection can occur only when a value exercises the async path.

## A field changed after entity definition

Input option objects must be treated as write-once. The entity facade is frozen, but deeply nested caller-owned options are not guaranteed to be snapshotted until compilation. Stop mutating them and recreate the entity from final configuration.

## Unknown or layout field

JavaScript callers receive `UNKNOWN_FIELD` for invalid facade keys. `field.native` rejects Payload layout/UI fields; compose those directly in the collection.

Use `isPayloadSchemaError(error, code)` and safe `toJSON()` output when logging package configuration failures.
