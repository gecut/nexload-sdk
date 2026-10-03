# Payload Fields: Overview & Quick Start | Nexload SDK

Semantic Payload field factories for Unicode slugs, Jalali dates, and integer minor-unit money values.

**Topic:** overview
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/
**Package:** `@nexload-sdk/payload-fields`

**Current released version:** `3.1.0`

Production-grade semantic field factories and Admin integrations for Payload CMS.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-fields) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/refactoring/payload-fields)

`@nexload-sdk/payload-fields` provides three production-hardened semantic field families for Payload CMS 3:

1. **Managed Unicode Slugs**: Collision-resistant, multi-lingual (Persian, Arabic, English) slug generation with an automatic lock toggle.
2. **Jalali Solar Dates**: ISO datetime storage with interactive Persian Solar calendar datepickers in the Payload Admin UI.
3. **Safe-Integer Money Fields**: Floating-point-free financial storage in integer minor units (Rials, Cents) with formatted major-unit Admin UI inputs.

***

## 10-Second Code Snippet

```ts
import { jalaliDateField, moneyField, slugField } from "@nexload-sdk/payload-fields";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  fields: [
    { name: "title", type: "text", required: true },
    // Spreads slug and slugLock fields
    ...slugField({ source: "title" }),
    // Persian solar calendar datepicker
    jalaliDateField({ name: "publishedAt", pickerAppearance: "dayAndTime" }),
    // Stored as integer minor units (e.g. 150000)
    moneyField({ name: "price", currency: "IRT", minMinorUnits: 0, overrides: { required: true } }),
  ],
};
```

***

## Installation & Peer Dependencies

```bash
pnpm add @nexload-sdk/payload-fields payload react react-dom
```

With alternative package managers:

```bash
# npm
npm install @nexload-sdk/payload-fields payload react react-dom

# bun
bun add @nexload-sdk/payload-fields payload react react-dom
```

### Compatibility Requirements

| Runtime / Dependency | Supported Range | Notes |
|---|---|---|
| **Node.js** | `>=20.9.0` | Required for Payload 3 server |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Core headless CMS |
| **React / React-DOM** | `^19.0.0` | Matches Payload 3 Admin UI runtime |
| **Module Format** | ESM only | Server & Admin Import Map safe |

***

## Storage & Contract Rules

### 1. Slugs & SlugLock

`slugField({ source: "title" })` returns an array of two Payload fields:

* `slug`: Text field containing the URL-safe slug string.
* `slugLock`: Checkbox field. When `true`, editing the source field will not mutate an existing slug, preventing broken URLs in production.

### 2. Jalali Dates

Dates are stored in the database as **standard ISO 8601 UTC strings** (e.g. `"2026-07-24T08:30:00.000Z"`). The Persian Solar calendar is an Admin UI presentation layer, guaranteeing complete interoperability with existing MongoDB, Postgres, or GraphQL queries.

### 3. Money Values

Stored strictly as **integer minor units** (e.g. `$10.50` is stored as `1050`; `100,000 Tomans` is stored as `100000`). Floating-point arithmetic errors are completely prevented at the persistence boundary.

***

## Quick Start: Adding Custom Slug Generator Plugin

When custom server-side slug computation is needed:

```ts
import { payloadFieldsPlugin, slugField } from "@nexload-sdk/payload-fields";
import { buildConfig } from "payload";

const fields = [
  { name: "title", type: "text", required: true },
  ...slugField({ source: "title", generator: "product" }),
];

export default buildConfig({
  collections: [{ slug: "products", fields }],
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

* Explore [Production Guides & Customization](./guides/) for advanced slug formatting, Jalali date range queries, and Admin UI integration.
* Check the [API Reference & Signatures](./api/) for all factory parameters.
