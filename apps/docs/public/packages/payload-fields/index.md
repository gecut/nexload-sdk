# Overview & Quick Start

Semantic Payload field factories for Unicode slugs, Jalali dates, integer money, Iranian contact & identity fields, and addresses.

**Topic:** overview
**Package:** `@nexload-sdk/payload-fields` v4.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/
**Package:** `@nexload-sdk/payload-fields`

**Workspace version:** `4.0.0`

Production-grade semantic field factories and Admin integrations for Payload CMS.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-fields) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-fields)

`@nexload-sdk/payload-fields` provides production-hardened semantic field factories, Admin UI integrations, and validation for Payload CMS 3:

1. **Managed Unicode Slugs**: Collision-resistant (`-2`, `-3`), multi-lingual slug generation with an automatic lock toggle.
2. **Jalali Solar Dates & Ranges**: ISO datetime storage with interactive Persian Solar calendar datepickers and list cells (`Asia/Tehran` noon storage for date-only modes).
3. **Safe-Integer Money Fields**: Floating-point-free financial storage in integer minor units (Rials, Tomans) with formatted Admin UI inputs and currency conversion.
4. **Iranian Identity & Contact**: Checksum-validated national codes, legal IDs, postal codes, landlines, and mobile numbers (national or E.164 format).
5. **Banking & Utility Fields**: Bank card numbers with Luhn validation, Sheba IBANs, forced LTR inputs, and non-negative sort ordering.
6. **Iranian Address Group**: Comprehensive address group with 31 provinces, postal code normalization, and optional recipient details.
7. **Schema Adapter (`./schema`)**: Wrap fields as `field.native()` definitions for `@nexload-sdk/payload-schema`.

***

## 10-Second Code Snippet

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
    // Persian solar calendar datepicker
    jalaliDateField({ name: "birthDate", pickerAppearance: "dayOnly" }),
    // Paired date range with start/end order validation
    jalaliDateRangeField({ start: "startsAt", end: "endsAt" }),
    // Stored as integer minor units (e.g. 150000)
    moneyField({ name: "credit", currency: "IRT", minMinorUnits: 0 }),
    // Normalized to national format (09123456789)
    iranMobileField({ name: "mobile", required: true }),
    // Validated 10-digit national code
    nationalCodeField({ name: "nationalCode" }),
    // Address group with province dropdown and postal code
    iranAddressField({ recipient: false }),
  ],
};
```

***

## Installation & Peer Dependencies

```bash
pnpm add @nexload-sdk/payload-fields payload react react-dom
```

If using the optional `./schema` adapter with `@nexload-sdk/payload-schema` and `zod`:

```bash
pnpm add @nexload-sdk/payload-schema zod
```

### Compatibility Requirements

| Runtime / Dependency | Supported Range | Notes |
|---|---|---|
| **Node.js** | `>=20.9.0` | Required for Payload 3 server |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Core headless CMS |
| **React / React-DOM** | `^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1` | Matches Payload 3 Admin UI runtime |
| **Module Format** | ESM only | Server & Admin Import Map safe |
| **Optional Peers** | `@nexload-sdk/payload-schema` `>=2.0.0 <4.0.0`, `zod` `>=4.1.0 <5.0.0` | Only needed when importing `./schema` |

***

## Storage & Contract Rules

### 1. Slugs & SlugLock

`slugField({ source: "title" })` returns an array of two Payload fields: `[slug, slugLock]`.

* Slugs are unique by default (`unique: true`). Top-level slug collisions automatically receive numeric suffixes (`-2`, `-3`) in the active locale.
* **Scope note:** Slug uniqueness collision resolution only applies to top-level slug fields. Slugs placed inside arrays or groups receive character formatting only.
* `slugLock` defaults to `true`. When locked, changing the source field will not mutate an existing slug, protecting indexed URLs.

### 2. Jalali Dates & Ranges

Dates are stored in the database as **standard ISO 8601 UTC strings** (e.g. `"2026-07-24T08:30:00.000Z"`).

* For `dayOnly` and `monthOnly` appearances, dates store canonical local noon (`12:00:00`) in `timeZone` (default `Asia/Tehran`), preventing date shifting across client timezones.
* `jalaliDateRangeField` groups two dates and validates that `endsAt >= startsAt`.

### 3. Money Values & Plugin Requirement

Money values are stored strictly as **integer minor units** (e.g. `100,000 Tomans` is stored as `100000`).

* **REST / Local API String Inputs:** `payloadFieldsPlugin()` is **REQUIRED** if money values are sent as strings (e.g. `"۱۲۳٬۴۵۶"` or `"123456"`). Payload core parses number-field strings with `parseFloat()` before field hooks run, corrupting Persian digits and thousands separators. The plugin's `beforeOperation` hook converts string values to safe integers before Payload parses them. Raw numbers work without the plugin.

### 4. Bilingual Validation Messages

Validation messages follow the active admin language (`req.i18n.language` or `useTranslation()`):

* Locales starting with `fa` (e.g. `fa`, `fa-IR`) receive Persian error messages.
* All other locales receive English error messages (v3 was always Persian).

### 5. Schema Adapter Scope

The `./schema` subpath exposes `schemaFields` for `@nexload-sdk/payload-schema`. In 4.0, `iranAddressField` and `jalaliDateRangeField` are not included in `./schema` (compound group/row schemas require entity-level composition).

***

## Quick Start: Adding Plugin for Slug Generators & String Money

Register `payloadFieldsPlugin` in your Payload config:

```ts
import { payloadFieldsPlugin, slugField } from "@nexload-sdk/payload-fields";
import { buildConfig } from "payload";

export default buildConfig({
  collections: [
    {
      slug: "products",
      fields: [
        { name: "title", type: "text", required: true },
        ...slugField({ source: "title", generator: "product" }),
      ],
    },
  ],
  plugins: [
    payloadFieldsPlugin({
      slugGenerators: {
        product: async ({ sourceValue }) => {
          return `sku-${sourceValue.toLowerCase().replace(/\s+/g, "-")}`;
        },
      },
    }),
  ],
});
```

***

## Next Steps

* Explore [Production Guides & Recipes](./guides/) for advanced recipes on contact fields, address groups, and troubleshooting.
* Check the [API Reference & Compatibility](./api/) for complete factory options and signatures.

The field factories use [Persian utilities](/nexload-sdk/packages/persian/) for shared normalization and validation.

## Next steps

[Optimization](./optimization/)

[Agent usage](./agents/)
