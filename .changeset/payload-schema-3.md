---
"@nexload-sdk/payload-schema": major
---

### Breaking Changes

- `entity.payload.*` replaced by `payloadFields(entity).*` imported from `@nexload-sdk/payload-schema/payload` (root entry is now browser-safe).
- Zod peer dependency floor raised to `>=4.1.0 <5.0.0`.
- `null` passes through canonical validation hooks unchanged for all fields (empty optional fields clear cleanly; required fields fail Payload's "This field is required." check).
- `Date` instances are accepted by the date hook and normalized to ISO 8601 strings.
- Built-in normalizations use `.overwrite()` instead of `.transform()`, making derived schemas codec-safe for `z.encode`.

### New

- `field.blocks()`: Discriminated polymorphic block containers with per-block schemas and child validation hooks.
- `pick(..., { optional: "auto" })`: Automatically marks fields without `required: true` as optional in derived schemas while preserving explicit required overrides.
- `Date` accepted by the date hook: Runtime date hook accepts JavaScript `Date` instances and normalizes valid dates to ISO strings.

For detailed migration instructions and examples, see the [Migrating to 3.0](https://gecut.github.io/nexload-sdk/packages/payload-schema/guides/) guide.
