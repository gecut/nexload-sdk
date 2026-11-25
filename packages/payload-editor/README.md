# @nexload-sdk/payload-editor

**Semantic, deterministic Payload Lexical editor configuration for Payload 3.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-editor/) · [API reference](https://gecut.github.io/nexload-sdk/packages/payload-editor/api/) — See the canonical documentation for feature mappings, presets, extensions, errors, and migration guidance.

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/payload-editor)](https://www.npmjs.com/package/@nexload-sdk/payload-editor)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM](https://img.shields.io/badge/module-ESM-green.svg)
![Runtime: Node | Payload 3](https://img.shields.io/badge/runtime-Node%20%7C%20Payload%203-lightgrey.svg)

> [!NOTE]
> Version 2.0.0 is pending in `.changeset/payload-editor-2.md` alongside the Payload suite majors, with no public API changes since 1.1.0.

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/payload-editor` wraps `@payloadcms/richtext-lexical` with declarative presets and typed feature toggles. It solves inconsistent Lexical editor toolbars, verbose manual feature imports, and accidental duplicate feature registration across collections. It is for Payload 3 developers configuring rich-text fields in server and config modules.

What it is not:

- Not a React rich-text renderer or frontend presentation layer.
- Not a custom Lexical plugin runtime, AI writing assistant, or theme stylesheet.
- Not a replacement for Payload Blocks; block code is opt-in via native `BlocksFeature`.

## Philosophy

- **No implicit default:** `createEditor` requires an explicit `preset` or `features` map so editor capabilities are always intentional.
- **Deterministic feature order:** Managed features are emitted in a fixed `featureOrder` regardless of object key order.
- **Fail fast on conflicts:** Duplicate native feature keys throw `PayloadEditorConfigError` synchronously at config time rather than failing silently in the Admin UI.
- **Explicit adapter defaults:** Setting a feature to `true` resets it to the adapter defaults (Payload's feature defaults), dropping preset options such as `maxDepth: 1`. `false` disables it; option objects shallow-merge with array replacement.

## Install

```bash
pnpm add @nexload-sdk/payload-editor payload @payloadcms/richtext-lexical
# or
npm install @nexload-sdk/payload-editor payload @payloadcms/richtext-lexical
# or
yarn add @nexload-sdk/payload-editor payload @payloadcms/richtext-lexical
# or
bun add @nexload-sdk/payload-editor payload @payloadcms/richtext-lexical
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `payload` | `>=3.68.5 <4` | Required |
| `@payloadcms/richtext-lexical` | `>=3.68.5 <4` | Required |

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

## Usage

### Choosing a built-in preset

Five versioned presets are available: `compact`, `standard`, `structured-content`, `article`, and `product-description`.

```ts
import { createEditor } from "@nexload-sdk/payload-editor";

export const compactEditor = createEditor({ preset: "compact" });
export const articleEditor = createEditor({ preset: "article" });
```

### Defining a reusable preset

Use `defineEditorPreset` to share a custom feature baseline across multiple collections:

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

### Extending with native Lexical features

Pass native `@payloadcms/richtext-lexical` features through `extendFeatures`. Extensions append after managed features:

```ts
import { BlocksFeature } from "@payloadcms/richtext-lexical";
import { createEditor } from "@nexload-sdk/payload-editor";
import { Callout, Gallery } from "./blocks"; // Your Payload block definitions

export const editor = createEditor({
  preset: "article",
  extendFeatures: [BlocksFeature({ blocks: [Callout, Gallery] })],
});
```

## API

### Root entry (`@nexload-sdk/payload-editor`)

| Export | Kind | Summary |
| --- | --- | --- |
| `createEditor` | `function` | Builds a Payload `lexicalEditor` from a preset, `features`, and `extendFeatures` |
| `defineEditorPreset` | `function` | Creates a validated, reusable `EditorPreset` |
| `PayloadEditorConfigError` | `class` | `TypeError` subclass thrown for invalid config or duplicate feature keys |
| `PayloadEditorConfigErrorCode` | `type` | Error code union for `PayloadEditorConfigError` |
| `CreateEditorOptions` | `type` | Options accepted by `createEditor` |
| `DefineEditorPresetOptions` | `type` | Options accepted by `defineEditorPreset` |
| `EditorFeatureConfig` | `type` | Managed Lexical feature toggle and option map |
| `EditorPreset` | `type` | Frozen preset object returned by `defineEditorPreset` |
| `EditorPresetName` | `type` | `"compact" \| "standard" \| "structured-content" \| "article" \| "product-description"` |
| `FeatureOption` | `type` | `boolean \| TOptions` helper type |
| `HeadingOptions` | `type` | `{ sizes?: readonly HeadingSize[] }` |
| `HeadingSize` | `type` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` |
| `LinkOptions` | `type` | `{ allowedCollections?: ...; maxDepth?: number; autoLink?: boolean }` |
| `RelationshipOptions` | `type` | Relational options for `relationship` feature |
| `UploadOptions` | `type` | Relational options for `upload` feature |
| `NativeEditorFeature` | `type` | `FeatureProviderServer<any, any, any>` |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `EditorPresetName \| EditorPreset` | Required if `features` omitted | Built-in preset name or `defineEditorPreset()` result |
| `features` | `EditorFeatureConfig` | Required if `preset` omitted | Managed feature toggles (`true`/`false`) or option objects |
| `admin` | `LexicalEditorProps["admin"]` | `undefined` | Passed to `lexicalEditor({ admin })` |
| `extendFeatures` | `readonly NativeEditorFeature[]` | `[]` | Native Lexical features appended after managed features |

## Runtime and compatibility

- **Module format:** ESM-only (`type: "module"`).
- **Runtime:** Node.js / Payload 3 server configuration only; no React, Admin UI, CSS, or browser globals.
- **Payload version:** `payload` and `@payloadcms/richtext-lexical` `>=3.68.5 <4`. Keep `payload` and all `@payloadcms/*` packages on the exact same version.

## Caveats

> [!WARNING]
> Duplicate feature keys across `features` and `extendFeatures` fail synchronously with `PayloadEditorConfigError`. Set the managed feature to `false` before supplying a native replacement.

> [!NOTE]
> Relational preset features (`link`, `upload`, `relationship`) default to `maxDepth: 1`. Block-level code highlighting is not a managed feature; use `inlineCode` for inline code or add a native Payload Block via `extendFeatures`.

## Related packages

- [payload-schema](../payload-schema/README.md) — Canonical entity definitions supporting `field.richText()`
- [payload-fields](../payload-fields/README.md) — Semantic Payload field factories and Admin UI components

## License

MIT
