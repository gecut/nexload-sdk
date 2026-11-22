# Production Guides & Recipes

Exhaustive field modeling catalog, static vs dynamic defaults, polymorphic relationships, advanced schema derivation, collection layout integration, troubleshooting, and 3.0 migration.

**Topic:** guides
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/guides/
## The Complete 15-Field Factory Catalog

`@nexload-sdk/payload-schema` provides 15 specialized factories under the `field` namespace. Every factory configures both the Payload field definition and the corresponding Zod schema.

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

    // 7. Date: Timezone-aware ISO datetime string with min/max bounds (hook accepts JS Date)
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

    // 9. Relationship: Single or polymorphic relationships
    category: field.relationship({
      relationTo: "categories",
      required: true,
    }),
    authorOrTeam: field.relationship({
      relationTo: ["authors", "teams"] as const,
      hasMany: false,
      idSchema: z.string().uuid(),
    }),

    // 10. Upload: Media asset relationship
    heroImage: field.upload({
      relationTo: "media",
      required: true,
    }),

    // 11. Group: Nested object schema and Payload named group
    seo: field.group({
      fields: {
        metaTitle: field.text({ maxLength: 70 }),
        metaDesc: field.textarea({ maxLength: 160 }),
      },
    }),

    // 12. Array: Repeatable rows with row count constraints
    variants: field.array({
      minRows: 1,
      maxRows: 10,
      fields: {
        sku: field.text({ required: true, uppercase: true }),
        price: field.money({ currency: "USD", required: true }),
      },
    }),

    // 13. Blocks: Discriminated polymorphic blocks with child validation
    layout: field.blocks({
      minRows: 1,
      maxRows: 10,
      blocks: {
        hero: {
          fields: {
            headline: field.text({ required: true }),
            subheading: field.text({ nullable: true }),
          },
        },
        quote: {
          fields: {
            quoteText: field.textarea({ required: true }),
            author: field.text({ required: true }),
          },
        },
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
* Defaults do not append `.default()` to derived Zod schemas, keeping API request validation explicit.

***

## Advanced Schema Derivation Patterns

Use `entity.schema()` to generate input schemas for mutations, projections, and forms:

### 1. Picking Fields with Strictness and `optional: "auto"`

```ts
export const createItemSchema = catalogEntity.schema(({ pick }) =>
  pick(["title", "slug", "price", "stock", "layout"], {
    optional: "auto", // Automatically marks non-required fields optional
    strict: true,     // Rejects unexpected fields
  })
);
```

* With `{ optional: "auto" }`, any field whose definition does not have `required: true` becomes `.optional()`.
* An explicit `required` array (e.g. `required: ["stock"]`) takes precedence and forces listed keys to be required.

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

Payload field compilation is decoupled from the core entity and imported from `@nexload-sdk/payload-schema/payload` (Node-only):

```ts
import type { CollectionConfig } from "payload";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";
import { catalogEntity } from "./catalog.entity";

// Option A: Direct full export
export const CatalogCollection: CollectionConfig = {
  slug: "catalog",
  fields: payloadFields(catalogEntity).all(),
};

// Option B: Mixed export with tabs and sidebar layout
export const AdvancedCatalogCollection: CollectionConfig = {
  slug: "catalog",
  fields: [
    ...payloadFields(catalogEntity).pick(["title", "slug"]),
    {
      type: "tabs",
      tabs: [
        {
          label: "Pricing & Stock",
          fields: payloadFields(catalogEntity).pick(["price", "stock", "variants"]),
        },
        {
          label: "SEO & Media",
          fields: payloadFields(catalogEntity).pick(["seo", "heroImage", "description", "layout"]),
        },
      ],
    },
  ],
};
```

***

## Intrinsic Normalization & Runtime Semantics

### Normalization on Writes

When writing data through the Payload Admin UI or `payload.create` / `payload.update`, canonical normalization executes automatically in `beforeValidate`:

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

### Null Semantics

Payload CMS represents empty or cleared fields as `null`. Canonical `beforeValidate` hooks pass `null` through unchanged for all field kinds (including nested children in groups, arrays, and blocks), matching `undefined` semantics:

* Clearing optional fields with `null` succeeds without raising Zod type errors.
* Required fields without a value fail Payload's built-in validation ("This field is required."), reporting the exact path and field label.

### Date Objects

In `field.date()`, the runtime Payload hook accepts JavaScript `Date` instances and normalizes valid dates to ISO 8601 strings. Canonical and derived Zod schemas continue to expect ISO strings.

### Codec Safety

Built-in field normalizations (`trim`, `lowercase`, `uppercase`, `slug`, `date`) are implemented using Zod `.overwrite()` instead of unidirectional `.transform()`. This preserves codec reversibility so derived schemas can be encoded with `z.encode` (e.g., in `@nexload-sdk/payload-operations` outputs).

***

## Known Limitations

* **No inline Admin validation:** Validation is enforced via `beforeValidate` hooks. The package does not generate inline Admin `validate` functions.
* **Custom `options.schema` transforms are not codec-safe:** Custom transformations passed to `options.schema(...)` cannot be inverted by `z.encode`. Use `.refine()` or `.overwrite()` if schemas are used in operation responses.
* **Strict pick default:** Calling `pick(keys)` without `{ optional: ... }` makes every key strictly required. Use `{ optional: "auto" }` to inherit field-level optionality.

***

## Troubleshooting & Diagnostics

### 1. `SCHEMA_UNAVAILABLE`

Occurs when deriving a schema that includes a `field.native()` defined without a `schema` parameter, or a container (`group`, `array`, `blocks`) that includes a schema-less native field.

```ts
// Solution: Provide the schema parameter
field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
});
```

### 2. `INVALID_ENTITY`

Thrown when passing a non-entity value to `payloadFields()`:

```ts
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

// Throws PayloadSchemaError: INVALID_ENTITY
// @ts-expect-error - intentional misuse with non-entity
payloadFields({ name: "NotAnEntity" });
```

### 3. `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED`

Payload's field validation hooks run synchronously. Canonical parsing raises `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED` when a schema is async (e.g., contains `.refine(async ...)` or `.transform(async ...)`): at `defineEntity` time only when validating a static `defaultValue`, otherwise when the Payload hook parses a value during writes. Move async checks into custom Payload collection hooks or derived API schemas.

### 4. Safe Introspection with `inspect()`

Inspect the runtime structure and field configurations safely without exposing internal state:

```ts
const inspection = catalogEntity.inspect();
console.log(inspection.name); // "CatalogItem"
console.log(inspection.fields.price.currency); // "USD"
```

### 5. Error Handling Helper

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

***

## Migrating to 3.0

Version 3.0 brings browser safety, codec compatibility, blocks fields, and predictable null handling.

### New in 3.0

* **`field.blocks()`**: Discriminated polymorphic block containers with per-block schemas and child validation hooks.
* **`pick(..., { optional: "auto" })`**: Automatically marks fields without `required: true` as optional in derived schemas while preserving explicit required overrides.
* **`Date` accepted by the date hook**: The runtime `field.date()` hook accepts JavaScript `Date` instances and normalizes valid dates to ISO 8601 strings.
* **Composite child optionality & nullability**: Inside `group`, `array`, and `blocks`, non-required child fields are automatically optional and accept `null` (`key?: T | null`), so stored Payload documents with empty fields or rows omitting optional children parse cleanly.
* **Reserved block child names**: Block child fields cannot be named `id`, `blockName`, or `blockType`; doing so throws `PayloadSchemaError` (`INVALID_FIELD_CONFIGURATION`) at definition time.

### Breaking Changes

Below are the before and after patterns for each breaking change.

### 1. Payload Compilation Moved to `/payload` Subpath

Entity definitions no longer carry a `.payload` facade on the entity object. Payload compilation is now imported from `@nexload-sdk/payload-schema/payload` (Node-only), making the root entry browser-safe.

**Before (2.0):**

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";

export const articleEntity = defineEntity({ /* ... */ });

export const Articles = {
  slug: "articles",
  // In 2.0, compiled fields were accessed via property on the entity:
  fields: articleEntity["payload"]["all"](),
};
```

**After (3.0):**

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

export const articleEntity = defineEntity({
  name: "Article",
  fields: {
    title: field.text({ required: true }),
  },
});

export const Articles = {
  slug: "articles",
  fields: payloadFields(articleEntity).all(),
};
```

### 2. Zod Peer Dependency Floor Raised to 4.1

Zod 4.1.0 or higher is required to support Zod codec methods (`z.encode` / `z.decode`).

**Before (2.0):**

```json
{
  "peerDependencies": {
    "zod": ">=4.0.0 <5.0.0"
  }
}
```

**After (3.0):**

```json
{
  "peerDependencies": {
    "zod": ">=4.1.0 <5.0.0"
  }
}
```

### 3. Null Passes Canonical Validation Hooks

In 2.0, clearing an optional field by passing `null` caused Zod to throw a `ValidationError` unless the field was explicitly declared `nullable: true`. In 3.0, `null` passes through canonical hooks unchanged (like `undefined`), allowing empty optional fields to clear cleanly.

**Before (2.0):**

```ts
// Required nullable: true to allow clearing optional fields in database writes:
subtitle: field.text({ nullable: true }),

// Clearing without nullable: true threw ValidationError:
// "Expected string, received null"
await payload.update({
  collection: "articles",
  id: "1",
  data: { subtitle: null },
});
```

**After (3.0):**

```ts
// Optional fields without nullable: true allow null to pass through:
subtitle: field.text(),

// Clears field cleanly; required fields fail Payload's "This field is required." check:
await payload.update({
  collection: "articles",
  id: "1",
  data: { subtitle: null },
});
```

### 4. Date Objects Accepted by Date Hook

In 2.0, passing JavaScript `Date` instances to Payload writes failed canonical validation because the hook strictly required ISO strings. In 3.0, the runtime hook accepts valid `Date` objects and converts them to ISO strings.

**Before (2.0):**

```ts
// Threw ValidationError: "Expected string, received object"
await payload.create({
  collection: "events",
  data: {
    eventDate: new Date(),
  },
});
```

**After (3.0):**

```ts
// Accepted and normalized to ISO string by runtime hook:
await payload.create({
  collection: "events",
  data: {
    eventDate: new Date(),
  },
});
```

### 5. Built-in Normalizations Are Codec-Safe (`.overwrite`)

In 2.0, text transformations like `trim: true` and `lowercase: true` used unidirectional `.transform()`, which causes `z.encode` to fail. In 3.0, normalizations use `.overwrite()`, making derived schemas compatible with codec encoding.

**Before (2.0):**

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ trim: true }),
  },
});

const productSchema = productEntity.schema(({ fields }) => fields.title);
// Failed: unidirectional transform cannot be encoded
z.encode(productSchema, "  widget  ");
```

**After (3.0):**

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ trim: true }),
  },
});

const productSchema = productEntity.schema(({ fields }) => fields.title);
// Succeeds: .overwrite() produces codec-safe schemas for operation outputs
const encoded = z.encode(productSchema, "  widget  ");
```

### 6. Composite Children Without `required: true` Are Optional and Nullable

In 2.0, composite containers (`group`, `array`, `blocks`) constructed their canonical object schemas directly from child schemas, causing stored documents with `null` (Payload's empty field representation) or rows omitting optional children to fail validation. In 3.0, any child field not declared `required: true` inside a composite container is automatically optional and nullable (`child.schema.nullable().optional()`).

**Before (2.0):**

```ts
const userEntity = defineEntity({
  name: "User",
  fields: {
    meta: field.group({
      fields: {
        tag: field.text({ required: true }),
        note: field.text(), // In 2.0, note was required in canonical schema
      },
    }),
  },
});

// Stored Payload document with empty note failed canonical parse:
// "Invalid input: expected string, received null"
userEntity.fields.meta.schema.parse({ tag: "vip", note: null });
```

**After (3.0):**

```ts
const userEntity = defineEntity({
  name: "User",
  fields: {
    meta: field.group({
      fields: {
        tag: field.text({ required: true }),
        note: field.text(), // In 3.0, non-required child is optional and nullable (key?: string | null)
      },
    }),
  },
});

// Parses cleanly for both null and omitted values:
userEntity.fields.meta.schema.parse({ tag: "vip", note: null }); // { tag: "vip", note: null }
userEntity.fields.meta.schema.parse({ tag: "vip" });             // { tag: "vip" }
```

### 7. Reserved Child Field Names in Blocks

In 3.0, block definitions reject child fields named `id`, `blockName`, or `blockType` at definition time with `PayloadSchemaError` (`INVALID_FIELD_CONFIGURATION`), as these names are reserved by Payload blocks runtime metadata.

**Before (2.0):**
Blocks were not supported in 2.0.

**After (3.0):**

```ts
// Throws PayloadSchemaError (code: "INVALID_FIELD_CONFIGURATION"):
field.blocks({
  blocks: {
    hero: {
      fields: {
        id: field.text(), // Reserved name: throws at definition time
      },
    },
  },
});
```
