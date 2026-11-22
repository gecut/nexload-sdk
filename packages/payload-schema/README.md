# @nexload-sdk/payload-schema

Define intrinsic field validation and normalization once, then reuse it as ordinary Payload fields and ordinary Zod schemas.

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-schema/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/payload-schema/api/)

## Install

```bash
pnpm add @nexload-sdk/payload-schema payload zod
```

Requires Node `>=20.9.0` (for `/payload`), Payload `>=3.85.0 <4`, and Zod `>=4.1.0 <5`. The package is ESM-only (root entry is browser-safe; `/payload` is Node/Payload-config only).

## Entry Points

- **`@nexload-sdk/payload-schema` (root):** Pure and browser-safe. Contains `defineEntity`, `field`, `defaultIdSchema`, `PayloadSchemaError`, `isPayloadSchemaError`, and definition types (`BlocksFieldOptions`, `BlockDefinitionOptions`, etc.). An entity exposes `name`, `idSchema`, `fields`, `schema()`, and `inspect()`.
- **`@nexload-sdk/payload-schema/payload`:** Node and Payload config only. Exports `payloadFields(entity)`, which compiles entities into Payload fields carrying `beforeValidate` hooks that throw Payload's `ValidationError`. Rejects non-entities with `PayloadSchemaError` (`code: "INVALID_ENTITY"`).

## Quick Start

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    inventory: field.number({ integer: true, safe: true, defaultValue: 0 }),
    sections: field.blocks({
      blocks: {
        hero: {
          fields: {
            headline: field.text({ required: true }),
          },
        },
      },
      minRows: 1,
    }),
  },
});

// Payload Collection configuration (Node-only)
export const Products = {
  slug: "products",
  fields: payloadFields(productEntity).all(),
};
```

`payloadFields(entity)` provides:
- `.all()`: compiles all entity fields into fresh Payload field definitions.
- `.field(key)`: compiles a single named field.
- `.pick(keys)`: compiles a subset of fields.

Each call returns fresh Payload config containers. Canonical normalization also runs for writes through Payload Admin and the Local API.

## Derive Schemas

```ts
// Using optional: "auto" makes non-required fields optional automatically
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "inventory", "sections"], {
    optional: "auto",
  }),
);
```

- With `{ optional: "auto" }`, keys are optional in the derived schema if and only if `required: true` was not set on the field definition.
- An explicit `required` array (`required: ["inventory"]`) still takes precedence over `optional`.

`entity.schema` can return any Zod schema, not only objects or picks:

```ts
export const titleLengthSchema = productEntity.schema(({ fields }) =>
  fields.title.transform((title) => title.length),
);
```

## Blocks Fields

`field.blocks()` defines discriminated block containers:

```ts
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

The canonical schema parses an array of rows discriminated by `blockType`, accepting Payload-managed `id` (`string`) and `blockName` (`string | null`). Each child field retains its own canonical validation hook.

Child fields inside a block cannot be named `id`, `blockName`, or `blockType` (these are reserved Payload block properties; configuring them throws `PayloadSchemaError` with code `INVALID_FIELD_CONFIGURATION` at definition time).

## Composite Children Optionality

Inside `field.group`, `field.array`, and `field.blocks`, child fields not declared `required: true` are automatically optional and nullable in the canonical schema (`key?: T | null`, wrapped via `child.schema.nullable().optional()`). Stored Payload documents returning `null` for empty fields or omitting optional child keys parse cleanly without requiring explicit `nullable: true` on every child. Required children (`required: true`) remain required and non-nullable.

## Migrating to 3.0

- **Composite child optionality & nullability:** Inside `group`, `array`, and `blocks`, non-required children are optional and nullable (`child.schema.nullable().optional()`), allowing stored documents with `null` or omitted optional child values to parse cleanly.
- **Reserved block child names:** Child fields in `field.blocks()` cannot be named `id`, `blockName`, or `blockType`; configuring them throws `PayloadSchemaError` (`INVALID_FIELD_CONFIGURATION`) at definition time.
- **Payload compilation subpath:** `entity.payload.*` is replaced with `payloadFields(entity).*` imported from `@nexload-sdk/payload-schema/payload`.
- **Zod 4.1+ requirement:** Zod floor is `>=4.1.0` for codec support (`z.encode`/`z.decode`).
- **Null pass-through:** Canonical hooks pass `null` through for all fields; Payload validates required presence.
- **Date acceptance:** Runtime date hook accepts valid `Date` objects and normalizes them to ISO strings.
- **Codec safety:** Built-in normalizations use `.overwrite()`.

## Null Semantics & Date Handling

- **Null pass-through:** Payload stores empty fields as `null`. Canonical `beforeValidate` hooks pass `null` through unchanged for all fields, exactly like `undefined`. Required fields then fail Payload's own required check ("This field is required.") rather than raising a Zod type error.
- **Date acceptance:** In `field.date()`, the runtime Payload hook accepts JavaScript `Date` instances and converts valid dates to ISO strings before canonical validation. The derived and canonical schemas remain strict ISO strings.

## Codec Safety

Built-in field normalizations (`trim`, `lowercase`, `uppercase`, `slug`, `date`) use Zod `.overwrite()` rather than unidirectional `.transform()`. This ensures derived schemas can be encoded with `z.encode` (for example, as typed outputs in `@nexload-sdk/payload-operations`).

Custom transformations supplied via `options.schema(...)` are not codec-safe and will fail during `z.encode`.

## Native Escape Hatch

```ts
import { z } from "zod";

const location = field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
});
```

A native data field without a schema still compiles for Payload but is unavailable to canonical schema derivation. Layout fields remain directly in collection configuration.

## Defaults

- `defaultValue` accepts a static value, validates it during `defineEntity`, and passes the canonical result to Payload.
- `dynamicDefaultValue` accepts a native Payload function and is forwarded opaquely.
- Neither option adds Zod `.default()` behavior to derived schemas.
- Providing both is invalid.
- Direct assignment to `payload.defaultValue` is reserved.

## Known Limitations

- **No inline Admin validation:** Validation is enforced via `beforeValidate` hooks; inline Admin `validate` functions are not generated.
- **Custom `options.schema` transforms not codec-safe:** User transforms in `options.schema(...)` cannot be inverted by `z.encode`. Keep them to `.refine()` or `.overwrite()` if schemas will be used in operation outputs.
- **Default `pick` behavior:** Calling `pick(keys)` without `{ optional: ... }` makes every picked key required in the derived schema by default. Use `{ optional: "auto" }` to respect field-level optionality.

## Non-Goals

The package does not create collections, infer CRUD schemas, model populated relationship documents, generate persistence types, own access control or hooks, provide a rich-text editor, or implement business workflows.

Payload-generated types remain authoritative for stored documents. See the [documentation](https://gecut.github.io/nexload-sdk/packages/payload-schema/) for architecture, field catalogs, and guides.
