# Overview & Quick Start

Define canonical field validation and normalization once, then reuse it across Payload CMS fields and Zod schemas.

**Topic:** overview
**Package:** `@nexload-sdk/payload-schema` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/
**Package:** `@nexload-sdk/payload-schema`

**Workspace version:** `3.0.0`

Canonical Payload field definitions with reusable Zod schemas.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-schema) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-schema)

`@nexload-sdk/payload-schema` eliminates double-declaration of data validation rules in Payload CMS applications. Define intrinsic validation and normalization once, compile it into ordinary Payload collection fields, and expose the identical Zod schemas to client forms, server actions, and API boundaries.

***

## 10-Second Code Snippet

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";
import { z } from "zod";

// 1. Define intrinsic fields once (pure & browser-safe)
export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true, minLength: 3 }),
    slug: field.slug({ required: true }),
    price: field.money({ currency: "USD", required: true }),
    stock: field.number({ integer: true, safe: true, defaultValue: 0 }),
  },
});

// 2. Export directly to Payload Collection (Node-only)
export const Products = {
  slug: "products",
  fields: payloadFields(productEntity).all(),
};

// 3. Derive Zod schemas for forms, Next.js server actions, or RPC
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "price", "stock"], { optional: "auto" })
);
export type CreateProductInput = z.infer<typeof createProductSchema>;
```

***

## What You Get

* **Single Source of Truth**: Eliminate discrepancies between frontend Zod validation schemas and backend Payload collection rules.
* **Pure Browser-Safe Root**: The root `@nexload-sdk/payload-schema` has zero Payload runtime imports and bundles cleanly in client applications and edge runtimes.
* **Dedicated Payload Subpath**: Payload compilation lives in `@nexload-sdk/payload-schema/payload`, importing Payload's `ValidationError` exclusively in Node.
* **15 Built-In Field Factories**: Native factories for `text`, `textarea`, `slug`, `number`, `money`, `boolean`, `date`, `select`, `relationship`, `upload`, `group`, `array`, `blocks`, `richText`, and `native`.
* **Automatic Payload Normalization**: Injected `beforeValidate` hooks guarantee that string trimming, case conversions, and slug formats execute even on writes through the Payload Admin UI and Local API.
* **Codec Safety**: Built-in string and date normalizations use `.overwrite()`, allowing derived entity schemas to round-trip through `z.encode` (such as in `@nexload-sdk/payload-operations` outputs).
* **Flexible Schema Derivation**: Extract custom DTOs (`pick` with `{ optional: "auto" }`), add custom transformations (`.transform()`), and perform cross-field validations (`.refine()`).
* **Compile-Time Immutability**: All entity definitions and compiled field definitions are frozen to guarantee deterministic runtime behavior.

***

## Installation & Requirements

```bash
pnpm add @nexload-sdk/payload-schema payload zod
```

With alternative package managers:

```bash
# npm
npm install @nexload-sdk/payload-schema payload zod

# bun
bun add @nexload-sdk/payload-schema payload zod
```

### Compatibility Requirements

| Package / Runtime | Supported Range | Notes |
|---|---|---|
| **Node.js** | `>=20.9.0` | Required for `@nexload-sdk/payload-schema/payload` |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Collection fields engine |
| **Zod** | `>=4.1.0 <5.0.0` | Codec-safe schema engine |
| **Module Format** | ESM only | Root entry is browser-safe; `/payload` is Node/Payload-config only |

***

## Core Concepts & Invariants

### 1. One Intrinsic Contract

A field definition owns only the rules intrinsic to that field's value (e.g. "a product title must be 3-120 characters and trimmed"). Application-specific workflow rules (e.g. "is this field optional during draft creation?") belong in derived schemas, not in the core entity definition.

### 2. Dual Boundary Compilation

* Root `@nexload-sdk/payload-schema` is pure and browser-safe (`field`, `defineEntity`, `defaultIdSchema`, `PayloadSchemaError`). Entities expose `name`, `idSchema`, `fields`, `schema()`, and `inspect()`.
* `payloadFields(entity)` from `@nexload-sdk/payload-schema/payload` compiles standard Payload fields with canonical normalization appended to `beforeValidate`. Rejects non-entities with `PayloadSchemaError` (`code: "INVALID_ENTITY"`).
* `entity.schema()` produces pure Zod schemas reflecting the exact same constraints.

### 3. Synchronous Canonical Schemas

Canonical schemas must execute synchronously. If a schema is async, `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED` is raised during canonical parsing: at `defineEntity` time only when validating a static `defaultValue`, otherwise when the Payload hook parses a value.

### 4. Non-Goals

The package does not create collections, own access control, replace Payload-generated types, or manage database migrations. Payload remains authoritative for persistence types and database schema.

***

## Quick Start: Building a Complete Entity

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

export const articleEntity = defineEntity({
  name: "Article",
  fields: {
    title: field.text({ required: true, trim: true, minLength: 5 }),
    slug: field.slug({ required: true }),
    content: field.textarea({ required: true, maxLength: 10_000 }),
    status: field.select({
      values: ["draft", "published", "archived"] as const,
      defaultValue: "draft",
    }),
    author: field.relationship({
      relationTo: "users",
      required: true,
    }),
    sections: field.blocks({
      blocks: {
        hero: {
          fields: {
            title: field.text({ required: true }),
          },
        },
      },
      minRows: 1,
    }),
  },
});

// Use in Payload Collection (Node-only)
export const ArticlesCollection = {
  slug: "articles",
  fields: payloadFields(articleEntity).all(),
};

// Derive input validation schema (Pure Zod)
export const createArticleSchema = articleEntity.schema(({ pick }) =>
  pick(["title", "slug", "content", "author", "sections"], { optional: "auto" })
);
```

***

## Next Steps

* Explore [Production Recipes & Modeling Guides](./guides/) for the full 15-field catalog, polymorphic relationships, static vs dynamic defaults, error diagnostics, and the 3.0 migration guide.
* View the complete [API Reference & Field Catalog](./api/) for all factory options and signatures.

## Next steps

[Optimization](./optimization/)

[Agent usage](./agents/)

[Playground](./playground/)
