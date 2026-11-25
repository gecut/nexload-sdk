# @nexload-sdk/payload-fields

## 4.0.0

### Major Changes

- caf9e51: ### Breaking Changes & Migration
  1. **ESM-only & Payload baseline:** Package is now strictly ESM-only and targets `payload` and `@payloadcms/ui` `>=3.85.0 <4.0.0` (React 19).
  2. **Package location:** Moved to `packages/payload-fields` in the monorepo.
  3. **Slugs unique by default:** `slugField` now creates unique indexes and checks for collisions (`-2`, `-3` suffixes) for top-level slugs. Existing database duplicates must be resolved before migration, or pass `unique: false`. Slugs inside arrays/groups receive character formatting only.
  4. **Jalali timezone stability:** `jalaliDateField` with `dayOnly` or `monthOnly` now stores canonical noon in `timeZone` (default `Asia/Tehran`), preventing browser timezone drift.
  5. **Admin language-aware messages:** Field validation messages now follow `req.i18n.language` or `useTranslation()` (`fa*` -> Persian, otherwise English; v3 was always Persian).
  6. **Money API string normalization:** `payloadFieldsPlugin()` is REQUIRED when sending money values as strings (e.g. Persian digits or thousands-separated strings) via REST or Local API, because Payload's core parses number fields before field hooks. Plain numbers work without the plugin.
  7. **Payload Import Map:** Regenerate your Payload Import Map (`pnpm payload generate:importmap`) after upgrading to resolve new and updated Admin component paths.
  8. **Optional schema adapter:** `./schema` subpath exposes `schemaFields` for `@nexload-sdk/payload-schema`. In 4.0, `iranAddressField` and `jalaliDateRangeField` are not included in `./schema`.

  ### New
  - Iranian contact and identity fields: `iranMobileField` (national or E.164), `iranLandlineField`, `nationalCodeField`, `legalIdField`, `postalCodeField`.
  - Banking and utility fields: `bankCardField`, `shebaField`, `ltrTextField`, `sortOrderField`.
  - Structured address group: `iranAddressField` with 31 Iranian provinces, city, address line, postal code, and optional recipient fields.
  - Paired Jalali date range: `jalaliDateRangeField` with order validation.
  - Schema adapter: `@nexload-sdk/payload-fields/schema` exporting `schemaFields`.
  - Cell components for list views: `MoneyCell`, `FormattedCell`, `JalaliDateCell`.

### Minor Changes

- 6875785: Set `order = 900` (`PAYLOAD_FIELDS_PLUGIN_ORDER`) and `slug = "nexload-fields"` on `payloadFieldsPlugin` so Payload applies it after plugins that add collections.

### Patch Changes

- a8cae4a: Log slug generator failures once through `req.payload.logger` (`payload_fields.slug.generation_failed`) before responding 500.
- Updated dependencies [0f84db8]
- Updated dependencies [f4c1346]
  - @nexload-sdk/payload-schema@3.0.0
  - @nexload-sdk/persian@1.0.0

## 3.1.0

### Minor Changes

- df4443b: republish

## 3.0.0

### Major Changes

- 19ae881: Rebuild Payload field factories around managed Unicode slugs, Jalali dates, integer minor-unit money values, and server-side slug generation. Month-only Jalali selections now persist the first Jalali day of the selected month at canonical local noon. Slug generation rejects malformed or inherited registry keys, and locked slugs retain their prior value when a source is cleared with null. Documented `./slug`, `./date`, and `./money` server subpaths now ship executable ESM and CommonJS outputs.

## 2.0.1

### Patch Changes

- 3dd0f8c: Rebuild HealthCheck Package

## 2.0.0

### Major Changes

- 8e2ccd3: rebuild all with ai

## 1.0.6

### Patch Changes

- 375efd2: update deps and rebuild

## 1.0.5

### Patch Changes

- 45f667b: rebuild bundler

## 1.0.4

### Patch Changes

- 4cd35f4: update deps

## 1.0.3

### Patch Changes

- b48c35b: update deps

## 1.0.2

### Patch Changes

- 3367298: fix export paths

## 1.0.1

### Patch Changes

- 453828a: fix export path

## 1.0.0

### Major Changes

- a3a7a72: update
