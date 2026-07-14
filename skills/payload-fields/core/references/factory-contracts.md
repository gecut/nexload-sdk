# Factory contracts

## Public root

`@nexload-sdk/payload-fields` re-exports slug, date, money, and plugin APIs. Documented server subpaths are `./slug`, `./date`, and `./money`. Admin components are exported separately under `./admin/*` for Payload Import Map use.

## Return shapes

- `slugField(options)` returns a readonly tuple `[TextField, CheckboxField]`; spread it into `fields`.
- `jalaliDateField(options)` returns one native Payload `DateField`.
- `moneyField(options)` returns one Payload `NumberField` storing integer minor units.
- `withJalaliTimestamps(fields, options)` returns a field array with virtual read-only timestamp fields.
- `payloadFieldsPlugin(options)` returns a Payload plugin that may register the slug generator endpoint.

Do not change tuple/single return shapes in a patch. Consumer collection syntax depends on them.

## Protected semantics

Factories reject attempts to replace semantic field `name` or `type`. Slug also protects the paired lock name/type and requires lock localization to match slug localization.

Required Admin `Field`/`Cell` paths and `custom.nexload` metadata are package-owned. Consumer metadata can be merged, but semantic wiring must remain last and authoritative.

## Hook composition

- Slug consumer `beforeValidate` hooks run before package final normalization/synchronization.
- Money package validation rejects invalid storage/bounds/negative policy before delegating to consumer validation.
- Virtual Jalali timestamp consumer `afterRead` hooks run before the package formatter.

Test order whenever hook arrays change. A consumer hook must not silently remove final package enforcement.

## Compatibility

Use options-object calls only. Positional legacy helpers and the removed `editor` surface are not part of the current contract. Do not invent a `payload-editor` package in this scope.
