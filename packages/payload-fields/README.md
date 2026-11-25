# @nexload-sdk/payload-fields

**Semantic Payload CMS field factories and Admin UI components for Unicode slugs, Jalali dates, integer money, and Iranian identity fields.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-fields/) · [API reference](https://gecut.github.io/nexload-sdk/packages/payload-fields/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/payload-fields)](https://www.npmjs.com/package/@nexload-sdk/payload-fields)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM](https://img.shields.io/badge/module-ESM-green.svg)
![Runtime: Node | Payload 3 | React 19](https://img.shields.io/badge/runtime-Node%20%7C%20Payload%203%20%7C%20React%2019-lightgrey.svg)

> [!IMPORTANT]
> Version 4.0.0 is pending in `.changeset/`: the package is now ESM-only targeting Payload `>=3.85.0 <4.0.0` (React 19), slugs are unique by default, validation messages adapt to `fa` vs other locales, and `./schema` adds `@nexload-sdk/payload-schema` integration.

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Migration](#migration)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/payload-fields` provides production-ready Payload CMS field factories, `beforeValidate` normalization hooks, and React 19 Admin UI components tailored for Persian and Iranian applications. It solves percent-encoded Unicode slugs, Gregorian-only admin datepickers, floating-point currency rounding, and repeated validation logic for Iranian mobile numbers, national codes, bank cards, Sheba/IBANs, and addresses. It is for Payload 3 teams building Persian or bilingual admin panels.

What it is not:

- Not a general schema compiler (pair with `@nexload-sdk/payload-schema` via `./schema` for Zod projection).
- Not a Lexical editor preset (use `@nexload-sdk/payload-editor`).
- Not an admin localization or logger preset (use `@nexload-sdk/payload-preset`).

## Philosophy

- **Canonical storage, localized display:** Slugs, phone numbers, national codes, and money are normalized to clean canonical values on write and formatted for humans in the Admin UI.
- **Integer-only money:** `moneyField` stores safe integer minor units (`IRR`, `IRT`, or a custom `{ code, label, fractionDigits }` currency definition) to eliminate floating-point drift.
- **Timezone-stable Jalali dates:** `dayOnly` and `monthOnly` dates store canonical noon (`12:00:00`) in `timeZone` (`Asia/Tehran` by default) so dates do not shift across browser timezones.
- **Explicit server/client isolation:** Field factories run in Node/Payload config while `"use client"` Admin components live behind `./admin/*` subpaths.

## Install

```bash
pnpm add @nexload-sdk/payload-fields
# or
npm install @nexload-sdk/payload-fields
# or
yarn add @nexload-sdk/payload-fields
# or
bun add @nexload-sdk/payload-fields
```

For optional `@nexload-sdk/payload-fields/schema` support:

```bash
pnpm add @nexload-sdk/payload-schema zod
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `payload` | `>=3.85.0 <4.0.0` | Required |
| `@payloadcms/ui` | `>=3.85.0 <4.0.0` | Required |
| `react` | `^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1` | Required |
| `react-dom` | `^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1` | Required |
| `@nexload-sdk/payload-schema` | `>=2.0.0 <4.0.0` | Optional (for `./schema`) |
| `zod` | `>=4.1.0 <5.0.0` | Optional (for `./schema`) |

## Quick start

```ts
import {
  iranAddressField,
  iranMobileField,
  jalaliDateField,
  jalaliDateRangeField,
  moneyField,
  nationalCodeField,
  payloadFieldsPlugin,
  slugField,
} from "@nexload-sdk/payload-fields";
import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  fields: [
    { name: "name", type: "text", required: true },
    ...slugField({ source: "name" }),
    jalaliDateField({ name: "birthDate", pickerAppearance: "dayOnly" }),
    jalaliDateRangeField({ start: "subscriptionStart", end: "subscriptionEnd" }),
    moneyField({ name: "credit", currency: "IRT", minMinorUnits: 0 }),
    iranMobileField({ name: "mobile", required: true }),
    nationalCodeField({ name: "nationalCode" }),
    iranAddressField({ recipient: false }),
  ],
};
```

Register `payloadFieldsPlugin()` in `payload.config.ts` if clients submit money as formatted strings or use custom slug generators.

## Usage

### Field catalog

| Factory | Stored Type | Canonical Value | Admin Component |
| --- | --- | --- | --- |
| `slugField(options)` | `text` + `checkbox` | URL-safe Unicode slug (`"کتاب"`, `"کتاب-2"`) | `SlugFieldComponent` |
| `jalaliDateField(options)` | `date` | ISO 8601 UTC instant | `JalaliDateFieldComponent` + `JalaliDateCell` |
| `jalaliDateRangeField(options)` | `row` (`startsAt`, `endsAt`) | Two ISO 8601 instants (`endsAt >= startsAt`) | `JalaliDateFieldComponent` + `JalaliDateCell` |
| `withJalaliTimestamps(fields, options)` | adds virtual `text` fields | Virtual `createdAtJalali` / `updatedAtJalali` | Standard read-only input |
| `moneyField(options)` | `number` | Safe integer minor units | `MoneyFieldComponent` + `MoneyCell` |
| `iranMobileField(options)` | `text` | `09XXXXXXXXX` (default) or `+989XXXXXXXXX` with `storage: "e164"` | `ValidatedTextFieldComponent` + `FormattedCell` |
| `iranLandlineField(options)` | `text` | `0XXXXXXXXXX` | `ValidatedTextFieldComponent` + `FormattedCell` |
| `nationalCodeField(options)` | `text` | 10-digit national code with checksum validation | `ValidatedTextFieldComponent` + `FormattedCell` |
| `legalIdField(options)` | `text` | 11-digit legal entity ID with checksum validation | `ValidatedTextFieldComponent` + `FormattedCell` |
| `postalCodeField(options)` | `text` | 10-digit postal code | `ValidatedTextFieldComponent` + `FormattedCell` |
| `bankCardField(options)` | `text` | 16-digit Luhn-checked card | `ValidatedTextFieldComponent` + `FormattedCell` |
| `shebaField(options)` | `text` | 26-char IBAN (`IR...`) with ISO 7064 validation | `ValidatedTextFieldComponent` + `FormattedCell` |
| `ltrTextField(options)` | `text` | Raw text with `nexload-ltr` class and optional `monospace` styling | Standard LTR text input |
| `sortOrderField(options)` | `number` | Non-negative integer (default `0`) | Sidebar number input |
| `iranAddressField(options)` | `group` | Province, city, line, postalCode, recipient | Native group with 31 provinces |

### Schema adapter (`@nexload-sdk/payload-fields/schema`)

Use `schemaFields` to define entities with `@nexload-sdk/payload-schema` and derive both Payload fields and Zod schemas:

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

## API

| Subpath | Key exports | Summary |
| --- | --- | --- |
| `@nexload-sdk/payload-fields` | All field factories, `withJalaliTimestamps`, `payloadFieldsPlugin`, `PAYLOAD_FIELDS_PLUGIN_ORDER`, `IRR`, `IRT`, `resolveCurrency`, `parseMoneyToMinorUnits`, `formatMoney`, `formatJalaliDate`, `toStoredJalaliInstant`, and option types | Main server/config entry |
| `@nexload-sdk/payload-fields/slug` | `slugField`, `formatSlug`, `SlugFieldOptions`, `SlugFieldResult` | Standalone slug factory & formatter |
| `@nexload-sdk/payload-fields/date` | `jalaliDateField`, `jalaliDateRangeField`, `withJalaliTimestamps`, `toStoredJalaliInstant`, `formatJalaliDate` | Standalone Jalali date utilities |
| `@nexload-sdk/payload-fields/money` | `moneyField`, `IRR`, `IRT`, `resolveCurrency`, `parseMoneyToMinorUnits`, `formatMoney` | Standalone money field & helpers |
| `@nexload-sdk/payload-fields/schema` | `schemaFields` | `@nexload-sdk/payload-schema` adapter |
| `@nexload-sdk/payload-fields/admin/slug-field` | `SlugFieldComponent` | Admin slug field UI |
| `@nexload-sdk/payload-fields/admin/jalali-date-field` | `JalaliDateFieldComponent` | Admin Jalali datepicker UI |
| `@nexload-sdk/payload-fields/admin/jalali-date-cell` | `JalaliDateCell` | List cell for Jalali dates |
| `@nexload-sdk/payload-fields/admin/money-field` | `MoneyFieldComponent` | Admin formatted money input |
| `@nexload-sdk/payload-fields/admin/money-cell` | `MoneyCell` | List cell for money values |
| `@nexload-sdk/payload-fields/admin/validated-text-field` | `ValidatedTextFieldComponent` | Admin input for Iranian text fields |
| `@nexload-sdk/payload-fields/admin/formatted-cell` | `FormattedCell` | List cell for Iranian text fields |

## Configuration

`payloadFieldsPlugin(options)` accepts:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `slugGenerators` | `Record<string, SlugGenerator>` | `undefined` | Named async slug generators invoked by the plugin's slug endpoint |
| `generateSlugAccess` | `SlugGenerationAccess` | `undefined` | Access predicate `{ req } => boolean \| Promise<boolean>` for slug generation |

The plugin sets `slug: "nexload-fields"` and `order: 900` (`PAYLOAD_FIELDS_PLUGIN_ORDER`).

## Runtime and compatibility

- **Module format:** ESM-only (`type: "module"`).
- **Runtime:** Field factories and `payloadFieldsPlugin` run in Node.js / Payload config. Admin components under `./admin/*` are React 19 `"use client"` components.
- **Payload version:** `payload` and `@payloadcms/ui` `>=3.85.0 <4.0.0` with React 19.
- **Bilingual validation:** Errors follow `req.i18n.language` / `useTranslation()` (`fa*` receives Persian; all other locales receive English).

## Caveats

> [!CAUTION]
> `payloadFieldsPlugin()` is **required** when money values are submitted via REST or Local API as strings (such as `"۱۲۳٬۴۵۶"` or `"123456"`). Payload core runs `parseFloat()` on number fields before field hooks run, which strips or corrupts Persian digits and separators; the plugin's `beforeOperation` hook normalizes strings to safe integers first. Plain numeric values work without the plugin. The hook is registered on collections and globals and normalizes money fields in blocks referenced by slug from `config.blocks`.

> [!WARNING]
> `slugField` is unique by default (`unique: true`), but automatic collision suffixing (`-2`, `-3`) only runs for top-level slug fields. For slugs nested inside arrays, groups, or named tabs, pass `unique: false` (otherwise database unique errors apply instead of suffixes).

> [!NOTE]
> `iranAddressField` and `jalaliDateRangeField` are not included in `@nexload-sdk/payload-fields/schema` in 4.0. Also, the plugin only sees collections and globals that exist when it runs. If another plugin with `order >= 900` adds money fields, place it before `payloadFieldsPlugin()` when it uses order 900, or give it an order below 900.

## Migration

### From 3.x to 4.0

1. **ESM-only & Payload 3.85+:** Package is strictly ESM-only and requires `payload` / `@payloadcms/ui` `>=3.85.0 <4.0.0` and React 19.
2. **Monorepo path:** Moved from `packages/refactoring/payload-fields` to `packages/payload-fields`.
3. **Unique slugs:** Resolve existing duplicate top-level slugs in your database before migrating, or pass `unique: false`.
4. **Jalali storage:** `dayOnly` and `monthOnly` dates store canonical noon in `timeZone` (`Asia/Tehran` by default).
5. **Bilingual messages:** Non-`fa` admin locales now receive English validation messages instead of Persian.
6. **Money strings:** Add `payloadFieldsPlugin()` if clients send money as strings.
7. **Import map:** Run `pnpm payload generate:importmap` after upgrading to refresh Admin component paths.

## Related packages

- [persian](../persian/README.md) — Core Persian/Iranian normalization and validation primitives
- [payload-schema](../payload-schema/README.md) — Canonical entity definitions used by `./schema`
- [payload-preset](../payload-preset/README.md) — Composed preset that includes `payloadFieldsPlugin()`

## License

MIT
