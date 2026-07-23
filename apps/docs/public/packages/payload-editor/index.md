# Payload Editor

Deterministic semantic configuration for Payload's Lexical editor.

**Topic:** overview
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/
**Package:** `@nexload-sdk/payload-editor`

**Current released version:** `1.1.0`

Semantic, deterministic Payload Lexical editor configuration.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-editor) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-editor)

`@nexload-sdk/payload-editor` 1.1.0 turns an explicit semantic feature definition into the official Payload Lexical editor provider. It gives teams named presets, deterministic merge rules, validation, and a safe extension seam without owning editor UI.

Use it when multiple collections need a reviewable editor policy. Use `lexicalEditor` directly when each collection needs unrelated native configuration.

## Boundaries

The package runs in server/config code and is ESM-only. It has no React, CSS, browser-global, theme, AI-provider, or Admin component runtime. Actual editing behavior and persistence remain owned by `@payloadcms/richtext-lexical`.

It does not define Payload fields. Assign the returned provider to a rich-text field or Payload's root `editor` option.

## Learning path

1. [Install matched Payload peers](./installation/).
2. Build an explicit editor in the [quick start](./quick-start/).
3. Learn [feature state, preset, merge, and extension concepts](./concepts/).
4. Apply task-focused [guides](./guides/).
5. Use the [API](./api/) and [troubleshooting](./troubleshooting/) pages as references.

## Source of truth

* [Package source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-editor/src)
* [Tests](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-editor/test)
* [Package manifest](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/package.json)
* [Report an issue](https://github.com/gecut/nexload-sdk/issues)

These pages document the current package version; historical documentation is not hosted.
