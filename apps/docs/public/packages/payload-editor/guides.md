# Guides

Select presets, define organization policies, and extend Payload Editor safely.

**Topic:** guides
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/guides/
## Choose a built-in preset

* `compact`: short formatted text with inline tools.
* `standard`: general rich text with lists, blockquote, and fixed toolbar.
* `structured-content`: headings, horizontal rule, uploads, and richer formatting.
* `article`: structured content plus inline code and relationships.
* `product-description`: constrained headings, lists, links, and uploads.

Treat these as contracts. Override only the differences your content model requires.

## Define an organization preset

```ts
import {
  createEditor,
  defineEditorPreset,
} from "@nexload-sdk/payload-editor";

const landingPage = defineEditorPreset({
  features: {
    paragraph: true,
    heading: { sizes: ["h2", "h3"] },
    bold: true,
    link: { autoLink: true, maxDepth: 1 },
    inlineToolbar: true,
  },
});

export const editor = createEditor({ preset: landingPage });
```

## Add native Blocks

```ts
import { BlocksFeature } from "@payloadcms/richtext-lexical";
import { createEditor } from "@nexload-sdk/payload-editor";

createEditor({
  preset: "article",
  extendFeatures: [BlocksFeature({ blocks: [Callout, Gallery] })],
});
```

Extensions append after managed features. If a native provider replaces a managed feature, first set the managed key to `false`.

## Restrict relationships

Set `allowedCollections` and `maxDepth` on `link`, `upload`, or `relationship`. These options constrain editor feature configuration; Payload access control still decides what the user may read or select.
