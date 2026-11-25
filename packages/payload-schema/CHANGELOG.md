# Changelog

## 3.0.0

### Major Changes

- 0f84db8: ### Breaking Changes
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

## 2.0.0

### Major Changes

- 783e1e4: publish

## 1.1.1

### Patch Changes

- abe627e: publish

## 1.1.0

### Minor Changes

- df4443b: republish

## 1.0.0

### Major Changes

- 53f8c3f: Add the initial stable Payload Schema package for canonical Payload fields and reusable Zod contracts.
- Add the initial stable Payload Schema package for canonical Payload fields and reusable Zod contracts.

## Unreleased

- Initial independent ESM package with canonical field factories, Payload compilation, Zod schema derivation, structured errors, inspection, and native field support.
