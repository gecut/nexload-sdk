# Payload Schema: Production Recipes & Modeling Guides | Nexload SDK

Exhaustive field modeling catalog, static vs dynamic defaults, polymorphic relationships, advanced schema derivation, collection layout integration, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/guides/
## The Complete 14-Field Factory Catalog

`@nexload-sdk/payload-schema` provides 14 specialized factories under the `field` namespace. Every factory configures both the Payload field definition and the corresponding Zod schema.

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

export const catalogEntity = defineEntity({
  name: "CatalogItem",
  fields: {
    // 1. Text: Trimming, case conversion, length constraints, regex pattern
    title: field.text({
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 120,
    }),

    // 2. Slug: Automatic Unicode NFKC normalization and URL hyphen-casing
    slug: field.slug({
      required: true,
      minLength: 3,
      maxLength: 140,
    }),

    // 3. Textarea: Multiline text with max length
    summary: field.textarea({
      required: true,
      trim: true,
      maxLength: 1000,
    }),

    // 4. Number: Integer, safe integer checks, min/max range, step multiples
    stock: field.number({
      integer: true,
      safe: true,
      minimum: 0,
      defaultValue: 0,
    }),

    // 5. Money: Minor-unit integer (cents/rials) with explicit currency metadata
    price: field.money({
      currency: "USD",
      minimum: 0,
      required: true,
    }),

    // 6. Boolean: Checkbox field with boolean casting
    isActive: field.boolean({
      defaultValue: true,
    }),

    // 7. Date: Timezone-aware ISO datetime string with min/max bounds
    publishedAt: field.date({
      minimum: "2024-01-01T00:00:00.000Z",
      nullable: true,
    }),

    // 8. Select: Single or multi-choice enums with custom admin labels
    tier: field.select({
      values: ["standard", "premium", "enterprise"] as const,
      labels: { enterprise: "Enterprise SLA" },
      defaultValue: "standard",
    }),
    badges: field.select({
      hasMany: true,
      values: ["new", "sale", "featured"] as const,
    }),

    // 9. Relationship: Single or multi-target relationships
    category: field.relationship({
      relationTo: "categories",
      required: true,
    }),

    // 10. Polymorphic Relationship: Multiple collections with custom ID schema
    authorOrTeam: field.relationship({
      relationTo: ["authors", "teams"] as const,
      hasMany: false,
      idSchema: z.string().uuid(),
    }),

    // 11. Upload: Media asset relationship
    heroImage: field.upload({
      relationTo: "media",
      required: true,
    }),

    // 12. Group: Nested object schema and Payload named group
    seo: field.group({
      fields: {
        metaTitle: field.text({ maxLength: 70 }),
        metaDesc: field.textarea({ maxLength: 160 }),
      },
    }),

    // 13. Array: Repeatable rows with row count constraints
    variants: field.array({
      minRows: 1,
      maxRows: 10,
      fields: {
        sku: field.text({ required: true, uppercase: true }),
        price: field.money({ currency: "USD", required: true }),
      },
    }),

    // 14. RichText: Requires explicit AST schema validator
    description: field.richText({
      schema: z.record(z.string(), z.unknown()),
    }),

    // 15. Native: Escape hatch for custom/unsupported Payload field types
    coordinates: field.native({
      payload: { type: "point" },
      schema: z.tuple([z.number(), z.number()]),
    }),
  },
});
```

***

## Static Defaults vs. Dynamic Defaults

`@nexload-sdk/payload-schema` separates static values from runtime functions:

```ts
// 1. Static Default: Validated during defineEntity() at startup
field.number({
  defaultValue: 100,
});

// 2. Dynamic Default: Evaluated at runtime by Payload per write request
field.date({
  dynamicDefaultValue: ({ req, user, locale }) => new Date().toISOString(),
});
```

* Providing both `defaultValue` and `dynamicDefaultValue` throws `CONFLICTING_DEFAULT_CONFIGURATION`.
* Direct assignment to `payload.defaultValue` is prohibited and throws `RESERVED_PAYLOAD_OPTION`.
* Note: Defaults do not append `.default()` to derived Zod schemas, keeping API request validation explicit.

***

## Advanced Schema Derivation Patterns

Use `entity.schema()` to generate input schemas for mutations, projections, and forms:

### 1. Picking Fields with Strictness and Optionality

```ts
export const createItemSchema = catalogEntity.schema(({ pick }) =>
  pick(["title", "slug", "price", "stock"], {
    optional: ["stock"],
    strict: true, // Rejects unexpected fields
  })
);
```

### 2. Custom Field Transformations

```ts
export const catalogCardSchema = catalogEntity.schema(({ fields, z }) =>
  z.object({
    title: fields.title,
    slug: fields.slug,
    // Transform minor-unit cents into formatted dollar string
    priceDisplay: fields.price.transform((cents) => `$${(cents / 100).toFixed(2)}`),
  })
);
```

### 3. Cross-Field Refinements

```ts
export const inventoryUpdateSchema = catalogEntity.schema(({ fields, z }) =>
  z
    .object({
      stock: fields.stock,
      isActive: fields.isActive,
    })
    .refine((data) => !(data.stock === 0 && data.isActive), {
      message: "Cannot mark an out-of-stock item as active.",
      path: ["isActive"],
    })
);
```

### 4. Inferring TypeScript Types

```ts
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CatalogCardDTO = z.infer<typeof catalogCardSchema>;
```

***

## Payload Collection Layout Integration

Export fields directly or compose them alongside Payload layout components:

```ts
import type { CollectionConfig } from "payload";
import { catalogEntity } from "./catalog.entity";

// Option A: Direct full export
export const CatalogCollection: CollectionConfig = {
  slug: "catalog",
  fields: catalogEntity.payload.all(),
};

// Option B: Mixed export with tabs and sidebar layout
export const AdvancedCatalogCollection: CollectionConfig = {
  slug: "catalog",
  fields: [
    ...catalogEntity.payload.pick(["title", "slug"]),
    {
      type: "tabs",
      tabs: [
        {
          label: "Pricing & Stock",
          fields: catalogEntity.payload.pick(["price", "stock", "variants"]),
        },
        {
          label: "SEO & Media",
          fields: catalogEntity.payload.pick(["seo", "heroImage", "description"]),
        },
      ],
    },
  ],
};
```

***

## Intrinsic Normalization in Admin & Local API

When writing data through the Payload Admin UI or `payload.create` / `payload.update`, canonical normalization executes automatically before validation:

```ts
// Local API Write:
await payload.create({
  collection: "catalog",
  data: {
    title: "   Vintage Leather Jacket   ", // Normalized to "Vintage Leather Jacket"
    slug: "Vintage Leather Jacket",        // Normalized to "vintage-leather-jacket"
    variants: [
      { sku: "vlj-01", price: 15000 },     // sku normalized to "VLJ-01"
    ],
  },
});
```

***

## Troubleshooting & Diagnostics

### 1. `SCHEMA_UNAVAILABLE`

Occurs when deriving a schema that includes a `field.native()` defined without a `schema` parameter, or a container (`group`, `array`) that includes a schema-less native field.

```ts
// Solution: Provide the schema parameter
field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
});
```

### 2. `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED`

Payload's field validation hooks run synchronously. If a Zod schema contains asynchronous `.refine(async ...)` or `.transform(async ...)`, `defineEntity` throws this error. Move async checks into custom Payload collection hooks or derived API schemas.

### 3. Safe Introspection with `inspect()`

Inspect the runtime structure and field configurations safely without exposing internal state:

```ts
const inspection = catalogEntity.inspect();
console.log(inspection.name); // "CatalogItem"
console.log(inspection.fields.price.currency); // "USD"
```

### 4. Error Handling Helper

Use `isPayloadSchemaError()` to catch and format entity definition failures:

```ts
import { isPayloadSchemaError } from "@nexload-sdk/payload-schema";

try {
  // defineEntity(...)
} catch (error) {
  if (isPayloadSchemaError(error)) {
    console.error(`[${error.code}] in phase ${error.phase}: ${error.message}`);
  }
}
```
