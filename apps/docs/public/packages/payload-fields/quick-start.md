# Quick start

Add managed slug, Jalali date, and money fields to one Payload collection.

**Topic:** quick-start
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/quick-start/
Create ordinary Payload fields and spread the two-field slug result:

```ts
import {
  jalaliDateField,
  moneyField,
  slugField,
} from "@nexload-sdk/payload-fields";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  fields: [
    { name: "title", type: "text", required: true },
    ...slugField({ source: "title" }),
    jalaliDateField({
      name: "availableAt",
      pickerAppearance: "dayAndTime",
    }),
    moneyField({
      name: "price",
      currency: "IRT",
      minMinorUnits: 0,
      overrides: { required: true },
    }),
  ],
};
```

The generated Payload document stores:

```ts
{
  title: "New Product",
  slug: "new-product",
  slugLock: true,
  availableAt: "2026-07-24T08:30:00.000Z",
  price: 125000
}
```

`price` is already the stored integer value. Only the Admin field treats typed text as a formatted major-unit input. REST, GraphQL, Local API, hooks, and jobs must send integer minor units.

In Payload Admin, verify that the slug is generated from the title and can be
locked, the date uses the Jalali picker, and the money control formats the
typed major-unit value. If the stored values are correct but these controls do
not appear, regenerate the Payload Import Map and use
[Troubleshooting](./troubleshooting/).

## Add a custom slug generator

Only add the plugin when a field declares `generator`:

```ts
import { payloadFieldsPlugin, slugField } from "@nexload-sdk/payload-fields";
import { buildConfig } from "payload";

const fields = [
  ...slugField({ source: "title", generator: "product" }),
];

export default buildConfig({
  collections: [{ slug: "products", fields }],
  plugins: [
    payloadFieldsPlugin({
      slugGenerators: {
        product: async ({ sourceValue }) => sourceValue,
      },
    }),
  ],
});
```

The endpoint requires `req.user`; add `generateSlugAccess` when authentication alone is not enough.

Next, read [Concepts](./concepts/) for storage and ownership rules, or
[Guides](./guides/) for field-specific configuration.
