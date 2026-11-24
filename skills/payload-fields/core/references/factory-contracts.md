# Factory contracts

## Public root

`@nexload-sdk/payload-fields` re-exports slug, date, money, and plugin APIs. Documented server subpaths are `./slug`, `./date`, and `./money`. Admin components are exported separately under `./admin/*` for Payload Import Map use.

## Return shapes

- `slugField(options)` returns a readonly tuple `[TextField, CheckboxField]`; spread it into `fields`.
- `jalaliDateField(options)` returns one native Payload `DateField` with timezone-stable ISO storage.
- `jalaliDateRangeField(options)` returns a `RowField` containing `startsAt` and `endsAt` date fields with order validation.
- `moneyField(options)` returns one Payload `NumberField` storing integer minor units.
- `withJalaliTimestamps(fields, options)` returns a field array with virtual read-only timestamp fields.
- `iranMobileField(options)` returns a `TextField` for Iranian mobile numbers (`09...` or E.164) with cell formatting.
- `iranLandlineField(options)` returns a `TextField` for Iranian landlines with province area codes.
- `nationalCodeField(options)` returns a `TextField` with Iranian national code checksum validation.
- `legalIdField(options)` returns a `TextField` with Iranian legal entity ID checksum validation.
- `postalCodeField(options)` returns a `TextField` for 10-digit Iranian postal codes.
- `bankCardField(options)` returns a `TextField` with 16-digit bank card Luhn checksum validation.
- `shebaField(options)` returns a `TextField` with Iranian IBAN (Sheba) ISO 7064 validation.
- `ltrTextField(options)` returns a `TextField` forced to LTR layout (`nexload-ltr` class).
- `sortOrderField(options)` returns a sidebar `NumberField` for non-negative integer ordering.
- `iranAddressField(options)` returns a `GroupField` containing province, city, line, postal code, and optional recipient fields.
- `payloadFieldsPlugin(options)` returns a Payload plugin registering slug generator endpoints and `beforeOperation` string money normalization.
- Subpath `./schema` exposes `schemaFields` for `@nexload-sdk/payload-schema` (`iranAddressField` and `jalaliDateRangeField` are omitted in 4.0).

Do not change tuple/single return shapes in a patch. Consumer collection syntax depends on them.

## Protected semantics

Factories reject attempts to replace semantic field `name` or `type`. Slug also protects the paired lock name/type and requires lock localization to match slug localization.

Slug uniqueness only applies to top-level slug fields; slugs placed inside arrays or groups receive character formatting only.

`payloadFieldsPlugin()` is REQUIRED when money values are sent through REST or Local API as strings (Payload `parseFloat()`s number-field strings before field hooks; the plugin's `beforeOperation` hook converts Persian-digit/grouped strings to integers). Numbers work without the plugin.

Validation messages follow the admin language: `fa*` receives Persian messages, while all other locales receive English (v3 was always Persian).

Required Admin `Field`/`Cell` paths and `custom.nexload` metadata are package-owned. Consumer metadata can be merged, but semantic wiring must remain last and authoritative.

## Hook composition

- Slug consumer `beforeValidate` hooks run before package final normalization/synchronization.
- Money package validation rejects invalid storage/bounds/negative policy before delegating to consumer validation.
- Virtual Jalali timestamp consumer `afterRead` hooks run before the package formatter.

Test order whenever hook arrays change. A consumer hook must not silently remove final package enforcement.

## Compatibility

Use options-object calls only. Positional legacy helpers and the removed `editor` surface are not part of the current contract. Do not invent a `payload-editor` package in this scope.
