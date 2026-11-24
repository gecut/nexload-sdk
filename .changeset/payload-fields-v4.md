---
"@nexload-sdk/payload-fields": major
---

### Breaking Changes & Migration

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
