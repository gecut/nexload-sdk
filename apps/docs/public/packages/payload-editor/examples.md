# Examples

Complete Payload Editor examples for root, field, preset, and native extension use.

**Topic:** examples
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/examples/
## One default editor for Payload

```ts
import { createEditor } from "@nexload-sdk/payload-editor";
import { buildConfig } from "payload";

export default buildConfig({
  editor: createEditor({ preset: "standard" }),
  collections: [Pages],
});
```

## A stricter field editor

```ts
const productEditor = createEditor({
  preset: "product-description",
  features: {
    heading: { sizes: ["h2"] },
    upload: {
      allowedCollections: ["product-media"],
      maxDepth: 0,
    },
    fixedToolbar: false,
  },
});

const description = {
  name: "description",
  type: "richText",
  editor: productEditor,
} as const;
```

## Native replacement

```ts
import { LinkFeature } from "@payloadcms/richtext-lexical";

createEditor({
  preset: "standard",
  features: { link: false },
  extendFeatures: [
    LinkFeature({
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: "campaign", type: "text" },
      ],
    }),
  ],
});
```

Disabling the managed `link` avoids a duplicate key. Native providers are project-owned: validate their configuration and stored content with Payload's own tooling.

The core editor example is type-checked in CI: [`payload-editor.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/payload-editor.ts).
