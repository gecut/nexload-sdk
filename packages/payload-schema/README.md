# @nexload-sdk/payload-schema

Define intrinsic field validation and normalization once, then reuse it as ordinary Payload fields and ordinary Zod schemas.

## Install

```bash
pnpm add @nexload-sdk/payload-schema payload zod
```

Requires Node `>=20.9.0`, Payload `>=3.85.0 <4`, and Zod `>=4 <5`. The package is ESM-only and server/config safe.

## Quick start

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    inventory: field.number({ integer: true, safe: true, defaultValue: 0 }),
  },
});

export const Products = {
  slug: "products",
  fields: productEntity.payload.all(),
};
```

Each facade call returns fresh Payload config containers. Canonical normalization also runs for writes through Payload Admin and the Local API.

## Derive schemas

```ts
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "inventory"], {
    optional: ["inventory"],
  }),
);
```

`entity.schema` can return any Zod schema, not only objects or picks:

```ts
export const titleLengthSchema = productEntity.schema(({ fields }) =>
  fields.title.transform((title) => title.length),
);
```

## Native escape hatch

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
- neither option adds Zod `.default()` behavior;
- using both is invalid;
- `payload.defaultValue` is reserved.

## Non-goals

The package does not create collections, infer CRUD schemas, model populated relationship documents, generate persistence types, own access control or hooks, provide a rich-text editor, or implement business workflows.

Payload-generated types remain authoritative for stored documents. See the [canonical documentation](https://gecut.github.io/nexload-sdk/packages/payload-schema/) for architecture, fields, integration, errors, migration, and compatibility.
