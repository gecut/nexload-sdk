# @nexload-sdk/payload-schema

**Define Payload CMS field validation and normalization once, then compile to Payload fields and Zod 4 schemas.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-schema/) · [API reference](https://gecut.github.io/nexload-sdk/packages/payload-schema/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/payload-schema)](https://www.npmjs.com/package/@nexload-sdk/payload-schema)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM](https://img.shields.io/badge/module-ESM-green.svg)
![Runtime: Node | Edge | Browser | Payload 3](https://img.shields.io/badge/runtime-Node%20%7C%20Edge%20%7C%20Browser%20%7C%20Payload%203-lightgrey.svg)

> [!IMPORTANT]
> Version 3.0.0 is pending in `.changeset/payload-schema-3.md`: `entity.payload.*` moves to `payloadFields(entity).*` from `@nexload-sdk/payload-schema/payload`, Zod `>=4.1.0 <5.0.0` is required, `field.blocks()` and `pick(..., { optional: "auto" })` are added, and built-in normalizations use `.overwrite()` for `z.encode` safety.

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

`@nexload-sdk/payload-schema` is a single-source-of-truth schema layer for Payload 3 and Zod 4. You define an entity's intrinsic fields once with `defineEntity` and `field` in the browser-safe root entry, derive Zod schemas for forms and APIs via `entity.schema()`, and compile Payload collection fields with `beforeValidate` hooks via `@nexload-sdk/payload-schema/payload` on the server. It is for full-stack TypeScript teams who want forms, RPC contracts, and CMS persistence to share identical validation rules.

What it is not:

- Not a collection or access-control builder; collections, hooks, and persistence types stay in Payload.
- Not a CRUD DTO generator or populated-relationship modeler.
- Not an inline Admin UI `validate` generator; server enforcement runs in `beforeValidate`.

## Philosophy

- **Single source of truth:** Intrinsic validation and normalization live in one `defineEntity` definition instead of drifting between frontend Zod schemas and Payload fields.
- **Browser-safe root, Node-only compiler:** Separating `@nexload-sdk/payload-schema` from `@nexload-sdk/payload-schema/payload` keeps Payload server code out of client bundles.
- **Codec-safe normalizations:** Built-in normalizations (`trim`, `lowercase`, `uppercase`, `slug`, `date`) use `.overwrite()` so derived schemas work with `z.encode`.
- **Payload types remain authoritative:** The package compiles fields and Zod schemas without replacing `payload-types.ts`.

## Install

```bash
pnpm add @nexload-sdk/payload-schema payload zod
# or
npm install @nexload-sdk/payload-schema payload zod
# or
yarn add @nexload-sdk/payload-schema payload zod
# or
bun add @nexload-sdk/payload-schema payload zod
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `payload` | `>=3.85.0 <4.0.0` | Required |
| `zod` | `>=4.1.0 <5.0.0` | Required |

## Quick start

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    inventory: field.number({ integer: true, safe: true, defaultValue: 0 }),
  },
});

// Node / Payload config only:
export const Products = {
  slug: "products",
  fields: payloadFields(productEntity).all(),
};

// Browser or server Zod schema:
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "inventory"], { optional: "auto" }),
);
```

## Usage

### Deriving Zod schemas

`entity.schema(({ pick, fields, z }) => ...)` can return any Zod schema:

```ts
export const titleLengthSchema = productEntity.schema(({ fields }) =>
  fields.title.transform((title) => title.length),
);
```

With `{ optional: "auto" }`, `pick()` marks fields without `required: true` as optional; an explicit `required` array still takes precedence.

### Blocks, groups, and arrays

`field.blocks()` defines discriminated block containers with per-block schemas and child validation hooks:

```ts
import { field } from "@nexload-sdk/payload-schema";

const content = field.blocks({
  blocks: {
    hero: {
      fields: {
        heading: field.text({ required: true }),
        subheading: field.text({ nullable: true }),
      },
    },
    quote: {
      fields: {
        text: field.textarea({ required: true }),
        author: field.text({ required: true }),
      },
    },
  },
  minRows: 1,
  maxRows: 10,
});
```

Block rows form an array discriminated by `blockType`; they also accept Payload-managed `id` (string) and `blockName` (string or null).

Inside `field.group`, `field.array`, and `field.blocks`, non-required child fields are automatically `nullable().optional()` in the canonical schema so stored documents with `null` or omitted optional keys parse cleanly. Required children remain required and non-nullable.

### Native escape hatch

```ts
import { field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

const location = field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
});
```

A native data field without a schema compiles for Payload but cannot be used in canonical schema derivation. Keep layout fields directly in collection configuration.

### Compiling subsets in Payload

`payloadFields(entity)` exposes `.all()`, `.field(key)`, and `.pick(keys)`, each returning fresh Payload field containers.

The compiler rejects non-entities with `PayloadSchemaError` (`INVALID_ENTITY`). Hooks throw Payload `ValidationError` and normalize Payload Admin and Local API writes.

## API

### Root entry (`@nexload-sdk/payload-schema`)

| Export | Kind | Summary |
| --- | --- | --- |
| `defineEntity` | `function` | Creates an entity definition with `name`, `idSchema`, `fields`, `schema()`, and `inspect()` |
| `field` | `const` | Frozen factory object: `text`, `textarea`, `slug`, `number`, `money`, `boolean`, `date`, `select`, `relationship`, `upload`, `group`, `array`, `blocks`, `richText`, `native` |
| `defaultIdSchema` | `const` | Default ID schema used for relationships |
| `PayloadSchemaError` | `class` | Structured error with `code`, `phase`, and `data` |
| `isPayloadSchemaError` | `function` | Type guard for `PayloadSchemaError` |
| `EntityDefinition`, `*FieldOptions`, `PayloadSchemaError*` | `type` | Entity, field option, and error types |

### Payload subpath (`@nexload-sdk/payload-schema/payload`)

| Export | Kind | Summary |
| --- | --- | --- |
| `payloadFields` | `function` | Compiles an `EntityDefinition` into Payload fields with `beforeValidate` hooks (Node-only) |
| `EntityPayloadFacade` | `type` | Return interface (`all()`, `field(key)`, `pick(keys)`) |

## Configuration

Field factories accept options including `required`, `nullable`, `defaultValue`, `dynamicDefaultValue`, and `payload` (extra Payload field properties). `text`, `textarea`, `slug`, `number`, `money`, `boolean`, and `date` accept a `schema: (schema) => schema` customizer. `select`, `relationship`, `upload`, and composite fields (`group`, `array`, `blocks`) do not take `schema`. `richText` requires a Zod `schema`; `native` takes an optional Zod `schema` and has no `required` or `nullable` option. `defaultValue` validates at `defineEntity` time; neither `defaultValue` nor `dynamicDefaultValue` adds Zod `.default()` to derived schemas, and providing both is invalid. The canonical `defaultValue` result is passed to Payload; `dynamicDefaultValue` is forwarded opaquely as a native Payload function. Direct `payload.defaultValue` is reserved.

## Runtime and compatibility

- **Module format:** ESM-only (`type: "module"`).
- **Root entry:** Universal (Browser, Edge, Bun, Node.js).
- **Payload subpath (`./payload`):** Node.js `>=20.9.0` / Payload config only.
- **Peers:** `payload >=3.85.0 <4.0.0`, `zod >=4.1.0 <5.0.0`.

## Caveats

> [!WARNING]
> Calling `pick(keys)` without an `optional` option makes every picked key required in the derived schema by default.

> [!WARNING]
> Child fields inside `field.blocks()` cannot be named `id`, `blockName`, or `blockType`; configuring them throws `PayloadSchemaError` (`INVALID_FIELD_CONFIGURATION`) at definition time.

> [!NOTE]
> Canonical `beforeValidate` hooks pass `null` and `undefined` through unchanged so Payload's required check handles missing required fields. Required fields then fail with Payload's "This field is required." message instead of a Zod type error. Custom transforms inside `options.schema(...)` are not codec-safe for `z.encode`; use `.refine()` or `.overwrite()` when schemas are used in `@nexload-sdk/payload-operations` outputs.

## Migration

### From 2.x to 3.0

- Replace `entity.payload.*` with `payloadFields(entity).*` imported from `@nexload-sdk/payload-schema/payload`.
- Upgrade `zod` to `>=4.1.0 <5.0.0`.
- Review `group`, `array`, and `blocks` schemas: non-required children are now `nullable().optional()`.
- Rename any block child fields named `id`, `blockName`, or `blockType`.
- The runtime `field.date()` hook accepts valid `Date` instances and normalizes them to ISO 8601 strings. Derived and canonical schemas remain strict ISO strings and reject `Date` objects. `null` passes through hooks unchanged.

## Related packages

- [payload-fields](../payload-fields/README.md) — Exposes `./schema` (`schemaFields`) built on `field.native()`
- [payload-operations](../payload-operations/README.md) — Uses codec-safe Zod schemas for typed RPC contracts
- [payload-editor](../payload-editor/README.md) — Lexical editor presets for `field.richText()`

## License

MIT
