# @nexload-sdk/payload-editor

Semantic, deterministic Payload Lexical editor configuration for Payload 3.

## Install

```bash
pnpm add @nexload-sdk/payload-editor payload @payloadcms/richtext-lexical
```

Keep `payload` and every `@payloadcms/*` package on the exact same version. Supported peer range: `>=3.68.5 <4`.

## Quick start

```ts
import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "structured-content",
  features: {
    heading: { sizes: ["h2", "h3"] },
    upload: { allowedCollections: ["media"], maxDepth: 1 },
  },
});
```

There is no implicit default. Supply a preset or an explicit `features` definition.

## Reusable preset

```ts
import { createEditor, defineEditorPreset } from "@nexload-sdk/payload-editor";

const landingContent = defineEditorPreset({
  features: {
    paragraph: true,
    heading: { sizes: ["h2", "h3"] },
    bold: true,
    link: true,
    inlineToolbar: true,
  },
});

export const editor = createEditor({ preset: landingContent });
```

## Native extension

```ts
import { BlocksFeature } from "@payloadcms/richtext-lexical";
import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "article",
  extendFeatures: [BlocksFeature({ blocks: [Callout, Gallery] })],
});
```

Extensions append after managed features. Duplicate feature keys fail synchronously. Disable a managed feature before supplying a native replacement.

## Presets

- `compact`
- `standard`
- `structured-content`
- `article`
- `product-description`

Preset membership and defaults are versioned contracts. `true` resets a feature to Nexload adapter defaults, `false` disables it, and option objects shallow-merge with array replacement.

## Runtime

- ESM-only and server/config safe.
- No React, Admin UI, CSS, browser globals, AI provider, or theme runtime.
- Relational preset features default to `maxDepth: 1`.
- Block code is native opt-in through Payload Blocks; `inlineCode` is the managed inline format.

See the canonical documentation for feature mappings, presets, extensions, errors, and migration guidance.
