# Examples

Complete Payload Schema examples for Local API normalization, nested fields, and relationships.

**Topic:** examples
**Package:** `@nexload-sdk/payload-schema` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/examples/
## Local API normalization

```ts
const customerEntity = defineEntity({
  name: "Customer",
  fields: {
    email: field.text({ trim: true, lowercase: true, required: true }),
  },
});

export const Customers = {
  slug: "customers",
  fields: customerEntity.payload.all(),
};

await payload.create({
  collection: "customers",
  data: { email: " USER@EXAMPLE.COM " },
});
```

Payload lifecycle stores `user@example.com`; the same canonical transform is available at `customerEntity.fields.email.schema`.

## Nested array

```ts
const gallery = field.array({
  minRows: 1,
  fields: {
    asset: field.upload({ relationTo: "media", required: true }),
    alt: field.text({ trim: true, minLength: 3 }),
  },
});
```

The consumer schema accepts `{ asset, alt }` rows and rejects Payload's internal row `id`. Payload compilation preserves row IDs during writes.

## Polymorphic relationship

```ts
const target = field.relationship({
  relationTo: ["pages", "posts"] as const,
  hasMany: true,
});

target.schema.parse([
  { relationTo: "pages", value: "home" },
  { relationTo: "posts", value: 42 },
]);
```

Do not pass populated documents to this schema. Create a separate output schema for read projections.

## Safe inspection

```ts
console.log(productEntity.inspect());
```

Inspection reports field kind, Payload type, required/nullability, schema availability, relation metadata, currency, and nested blocking paths without exposing consumer values or functions.

The entity composition example is type-checked in CI: [`payload-schema.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/payload-schema.ts).
