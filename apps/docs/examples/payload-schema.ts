import {
  defineEntity,
  field,
  isPayloadSchemaError,
  PayloadSchemaError,
} from "@nexload-sdk/payload-schema";
import { z } from "zod";

export interface CollectionConfig {
  slug: string;
  admin?: {
    useAsTitle?: string;
    defaultColumns?: string[];
  };
  fields: unknown[];
}


// ============================================================================
// 1. Full Entity Definition Covering All 14 Field Types
// ============================================================================

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    // 1. Text field with sanitization & length bounds
    title: field.text({
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 120,
    }),

    // 2. Slug field with automatic NFKC normalization & URL formatting
    slug: field.slug({
      required: true,
      minLength: 3,
      maxLength: 140,
    }),

    // 3. Multiline textarea field
    description: field.textarea({
      required: true,
      trim: true,
      maxLength: 2_000,
    }),

    // 4. Safe integer number field with static default value
    stock: field.number({
      defaultValue: 0,
      integer: true,
      minimum: 0,
      safe: true,
    }),

    // 5. Minor-unit integer money field with explicit ISO currency
    price: field.money({
      currency: "USD",
      minimum: 0,
      required: true,
    }),

    // 6. Boolean checkbox field
    isFeatured: field.boolean({
      defaultValue: false,
    }),

    // 7. ISO datetime field with timezone validation & minimum bound
    releaseDate: field.date({
      minimum: "2024-01-01T00:00:00.000Z",
      nullable: true,
    }),

    // 8. Single & multi enum select fields with labels
    status: field.select({
      defaultValue: "draft",
      labels: {
        archived: "Archived",
        draft: "Draft Item",
        published: "Live in Catalog",
      },
      values: ["draft", "published", "archived"] as const,
    }),

    tags: field.select({
      hasMany: true,
      values: ["sale", "new", "eco", "limited"] as const,
    }),

    // 9. Single relationship field
    category: field.relationship({
      relationTo: "categories",
      required: true,
    }),

    // 10. Polymorphic relationship field with custom id schema
    authorOrBrand: field.relationship({
      hasMany: false,
      idSchema: z.string().uuid(),
      relationTo: ["authors", "brands"] as const,
    }),

    // 11. Upload asset relationship field
    thumbnail: field.upload({
      relationTo: "media",
      required: true,
    }),

    // 12. Nested group field container
    seo: field.group({
      fields: {
        metaTitle: field.text({ maxLength: 70, trim: true }),
        metaDescription: field.textarea({ maxLength: 160, trim: true }),
        noIndex: field.boolean({ defaultValue: false }),
      },
    }),

    // 13. Repeatable array field container with row constraints
    variants: field.array({
      maxRows: 20,
      minRows: 1,
      fields: {
        sku: field.text({ required: true, uppercase: true, trim: true }),
        size: field.select({ values: ["S", "M", "L", "XL"] as const }),
        variantPrice: field.money({ currency: "USD", required: true }),
        barcode: field.text({ nullable: true }),
      },
    }),

    // 14. Rich text field with AST schema validation
    richContent: field.richText({
      nullable: true,
      schema: z.record(z.string(), z.unknown()),
    }),

    // 15. Native escape hatch for custom Payload field types
    geoCoordinates: field.native({
      payload: {
        type: "point",
        required: false,
      },
      schema: z.tuple([z.number(), z.number()]),
    }),
  },
});

// ============================================================================
// 2. Schema Derivation Patterns (DTOs, Forms, Projections)
// ============================================================================

// Derive a strict creation DTO with optional fields
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(
    ["title", "slug", "description", "price", "stock", "category", "thumbnail"],
    {
      optional: ["stock"],
      strict: true,
    },
  ),
);

// Derive a catalog card projection schema with custom transformations
export const productCardSchema = productEntity.schema(({ fields, z }) =>
  z.object({
    title: fields.title,
    slug: fields.slug,
    priceInDollars: fields.price.transform((cents) => (cents / 100).toFixed(2)),
    status: fields.status,
  }),
);

// Derive a cross-field validated inventory update schema
export const updateInventorySchema = productEntity.schema(({ fields, z }) =>
  z
    .object({
      stock: fields.stock,
      price: fields.price,
      isFeatured: fields.isFeatured,
    })
    .refine((data) => !(data.stock === 0 && data.isFeatured), {
      message: "Out of stock products cannot be featured.",
      path: ["isFeatured"],
    }),
);

// TypeScript Inferred Types from derived schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductCardDTO = z.infer<typeof productCardSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

// ============================================================================
// 3. Payload CMS Collection Integration
// ============================================================================

export const ProductsCollection: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "price", "stock"],
  },
  // Export all compiled Payload fields directly
  fields: productEntity.payload.all(),
};

// Example of mixing selected entity fields with custom layout tabs
export const CustomLayoutProducts: CollectionConfig = {
  slug: "custom-products",
  fields: [
    ...productEntity.payload.pick(["title", "slug", "price", "category"]),
    {
      type: "tabs",
      tabs: [
        {
          label: "Inventory & Variants",
          fields: productEntity.payload.pick(["stock", "variants"]),
        },
        {
          label: "SEO & Content",
          fields: productEntity.payload.pick(["seo", "richContent"]),
        },
      ],
    },
  ],
};

// ============================================================================
// 4. Introspection & Runtime Error Handling
// ============================================================================

export function inspectProductEntity() {
  const inspection = productEntity.inspect();
  return {
    entityName: inspection.name,
    totalFields: Object.keys(inspection.fields).length,
    fieldMetadata: inspection.fields,
  };
}

export function handleSchemaError(error: unknown): string {
  if (isPayloadSchemaError(error)) {
    return `[${error.code}] ${error.message} (Phase: ${error.phase})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown schema failure.";
}
