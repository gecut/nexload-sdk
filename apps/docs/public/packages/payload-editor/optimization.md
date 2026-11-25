# payload-editor — Optimization

Production choices for @nexload-sdk/payload-editor.

**Topic:** optimization
**Package:** `@nexload-sdk/payload-editor` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/optimization/
## Replace managed features explicitly

Disable a managed feature before adding its native replacement. Duplicate keys across features and extendFeatures fail during configuration.

## Keep relational depth bounded

Relational preset features default to a maximum depth of one. Account for this when choosing link, upload or relationship features.

## Keep Payload versions aligned

Use matching versions of `payload` and all `@payloadcms/*` packages. The supported Payload and Lexical peer range is `>=3.68.5 <4`.

## Configure on the server

The package is ESM-only and intended for Node.js Payload configuration. Add a native Payload Block via `extendFeatures` when block-level code highlighting is needed.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/core/SKILL.md).
