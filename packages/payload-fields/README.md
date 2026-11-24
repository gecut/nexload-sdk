# @nexload-sdk/payload-fields

Semantic Payload CMS field factories, Admin UI integrations, and validation for Unicode slugs, Jalali dates & ranges, safe-integer money, Iranian identity & contact fields, addresses, and optional `payload-schema` integration.

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-fields/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/payload-fields/api/)

## Install

```bash
pnpm add @nexload-sdk/payload-fields
```

To use the optional `./schema` adapter with `@nexload-sdk/payload-schema` and `zod`:

```bash
pnpm add @nexload-sdk/payload-schema zod
```

### Peer Dependencies

- `payload` and `@payloadcms/ui` `>=3.85.0 <4.0.0`
- `react` and `react-dom` `^19.0.1 || ^19.1.2 || ^19.2.1`
- Optional: `@nexload-sdk/payload-schema` `>=2.0.0 <4.0.0`, `zod` `>=4.1.0 <5.0.0`

## Field Catalog

| Factory | Stored Type | Canonical Format / Value | Admin Component & UI |
|---|---|---|---|
| `slugField(options)` | `text` (slug) + `checkbox` (lock) | URL-safe Unicode slug (`"کتاب"`, `"کتاب-2"`) | `SlugFieldComponent` (sidebar lock toggle & generator) |
| `jalaliDateField(options)` | `date` | ISO 8601 UTC instant (noon in `timeZone` for `dayOnly`/`monthOnly`) | `JalaliDateFieldComponent` + `JalaliDateCell` |
| `jalaliDateRangeField(options)` | `row` (`startsAt`, `endsAt` dates) | Two ISO 8601 UTC instants; validates `endsAt >= startsAt` | `JalaliDateFieldComponent` + `JalaliDateCell` |
| `withJalaliTimestamps(fields, options)` | adds virtual `text` fields to a `Field[]` | Virtual read-only formatted Jalali dates (`createdAtJalali`, `updatedAtJalali`) | Standard read-only input |
| `moneyField(options)` | `number` | Integer minor units (e.g. `123456` Tomans/Rials) | `MoneyFieldComponent` + `MoneyCell` (formatted input & cell) |
| `iranMobileField(options)` | `text` | National `09XXXXXXXXX` (default) or E.164 `+989XXXXXXXXX` | `ValidatedTextFieldComponent` (`inputMode="tel"`) + `FormattedCell` |
| `iranLandlineField(options)` | `text` | National landline `0XXXXXXXXXX` | `ValidatedTextFieldComponent` (`inputMode="tel"`) + `FormattedCell` |
| `nationalCodeField(options)` | `text` | 10-digit Iranian national code with checksum validation | `ValidatedTextFieldComponent` (`inputMode="numeric"`) + `FormattedCell` |
| `legalIdField(options)` | `text` | 11-digit Iranian legal entity ID with checksum validation | `ValidatedTextFieldComponent` (`inputMode="numeric"`) + `FormattedCell` |
| `postalCodeField(options)` | `text` | 10-digit Iranian postal code | `ValidatedTextFieldComponent` (`inputMode="numeric"`) + `FormattedCell` |
| `bankCardField(options)` | `text` | 16-digit bank card number with Luhn checksum validation | `ValidatedTextFieldComponent` (`inputMode="numeric"`) + `FormattedCell` |
| `shebaField(options)` | `text` | 26-character Iranian IBAN (`IR...`) with ISO 7064 validation | `ValidatedTextFieldComponent` + `FormattedCell` |
| `ltrTextField(options)` | `text` | Raw text with forced LTR direction and optional monospace styling | Standard text input with `nexload-ltr` class |
| `sortOrderField(options)` | `number` | Non-negative integer order (default `0`, indexed, sidebar position) | Sidebar number input |
| `iranAddressField(options)` | `group` | Province (select), city, line (textarea), postalCode, recipient | Native group with rows and 31 Iranian provinces |
| `payloadFieldsPlugin(options)` | `Plugin` | Server slug generator endpoint + REST/Local API string money normalization | N/A |

## Usage

```ts
import {
  iranAddressField,
  iranMobileField,
  jalaliDateField,
  jalaliDateRangeField,
  moneyField,
  nationalCodeField,
  slugField,
} from "@nexload-sdk/payload-fields";
import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  fields: [
    { name: "name", type: "text", required: true },
    // Spreads slug and slugLock fields
    ...slugField({ source: "name" }),
    // Jalali Solar calendar datepicker
    jalaliDateField({ name: "birthDate", pickerAppearance: "dayOnly" }),
    // Date range with start/end order validation
    jalaliDateRangeField({ start: "subscriptionStart", end: "subscriptionEnd" }),
    // Stored as integer minor units in Tomans
    moneyField({ name: "credit", currency: "IRT", minMinorUnits: 0 }),
    // Iranian mobile number normalized to national format (09XXXXXXXXX)
    iranMobileField({ name: "mobile", required: true }),
    // Iranian national code with checksum validation
    nationalCodeField({ name: "nationalCode" }),
    // Comprehensive Iranian address group
    iranAddressField({ recipient: false }),
  ],
};
```

## Schema Adapter (`@nexload-sdk/payload-fields/schema`)

The `./schema` subpath exposes `schemaFields` to define entities with `@nexload-sdk/payload-schema` and compile both Payload fields and Zod schemas:

```ts
import { defineEntity } from "@nexload-sdk/payload-schema";
import { schemaFields } from "@nexload-sdk/payload-fields/schema";

export const customerEntity = defineEntity({
  name: "Customer",
  fields: {
    mobile: schemaFields.iranMobile(),
    nationalCode: schemaFields.nationalCode(),
    price: schemaFields.money({ currency: "IRT" }),
    birthDate: schemaFields.jalaliDate({ nullable: true }),
    ...schemaFields.slug({ source: "name" }),
  },
});
```

> **Note on `./schema` in 4.0:** `iranAddressField` (group) and `jalaliDateRangeField` (row) are not included in `./schema` in 4.0 because compound field groups/rows require entity-level schema composition.

## Critical Invariants & Architecture Decisions

1. **`payloadFieldsPlugin()` requirement for money strings:** `payloadFieldsPlugin()` is **REQUIRED** when money values are sent through REST or Local API as strings (e.g. `"۱۲۳٬۴۵۶"` or `"123456"`). Payload's core runs `parseFloat()` on number fields before field hooks run, stripping or corrupting Persian digits and thousands separators. The plugin registers a `beforeOperation` hook on collections and globals that normalizes string values to safe integers before Payload processes them. Numeric values (e.g. `123456`) work without the plugin. The plugin resolves collections, globals and blocks referenced by slug from `config.blocks`, but only sees collections present when it runs: list `payloadFieldsPlugin()` **after** any plugin that adds collections or globals with money fields.
2. **Slug uniqueness scope:** Slugs are unique by default (`unique: true`). Uniqueness collision resolution (numeric suffixes `-2`, `-3`, etc.) only applies to **top-level** slug fields. Slugs placed inside arrays or groups receive character formatting and normalization only; they do not query the database for uniqueness. A slug factory cannot know its placement: for a slug nested in a named tab, group or array, pass `unique: false` (the field otherwise keeps `unique`/`index` and relies on database unique errors instead of `-2` suffixes).
3. **Admin language-aware validation messages:** Validation error messages automatically follow the active admin language (`req.i18n.language` or `useTranslation()`): locales starting with `fa` receive Persian messages, while all other locales receive English messages (v3 always returned Persian messages).
4. **Jalali timezone stability:** `jalaliDateField` with `dayOnly` or `monthOnly` appearance stores canonical noon (`12:00:00`) in `timeZone` (defaults to `Asia/Tehran`). This prevents date shifting when users view or edit dates from different browser timezones.
5. **Runtime boundaries:** Field factories run in Node / Payload configuration. Admin components are client components (`"use client"`) isolated behind `./admin/*` subpaths. Regenerate the Payload Import Map (`pnpm payload generate:importmap`) after upgrading.

## Migration from 3.x

- **ESM-only & Payload baseline:** Package is now strictly ESM-only and requires `payload` and `@payloadcms/ui` `>=3.85.0 <4.0.0` (React 19).
- **New monorepo location:** Moved from `packages/refactoring/payload-fields` to `packages/payload-fields`.
- **Slugs unique by default:** `slugField` now creates unique database indexes and queries for collision suffixes (`-2`, `-3`). If upgrading an existing database with duplicate slugs, resolve duplicates first or explicitly pass `unique: false`.
- **Jalali date storage:** `dayOnly` and `monthOnly` dates now reliably store canonical noon in `timeZone` (Tehran) rather than relying on browser local midnight.
- **Bilingual validation messages:** Validation errors now display in Persian for `fa` locales and English for all other locales.
- **Money strings need the plugin:** add `payloadFieldsPlugin()` when REST or Local API clients send money as strings (Persian digits or grouping). Payload converts number-field strings with `parseFloat()` before field hooks run; the plugin converts them first. Plain numbers work without it. List the plugin after plugins that add collections with money fields.
- **Payload Import Map:** Run `pnpm payload generate:importmap` to update component import paths.
