# Concepts

Understand semantic features, preset merging, native extensions, and runtime ownership.

**Topic:** concepts
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/concepts/
## Semantic feature definitions

The public configuration names intent such as `heading`, `link`, `upload`, and `fixedToolbar`. Internal adapters translate those keys to official Payload feature providers in a stable order. This shields application config from repeated provider assembly without hiding native escape hatches.

## Built-in presets

The package provides `compact`, `standard`, `structured-content`, `article`, and `product-description`. Preset membership and defaults are versioned behavior, not suggestions. Relationship-capable preset features default to `maxDepth: 1`.

## Merge rules

An explicit `features` object overlays the selected preset. Boolean `true` resets that feature to adapter defaults, `false` removes it, and option objects shallow-merge. Arrays such as heading sizes and collection allowlists replace inherited arrays.

`defineEditorPreset` validates and snapshots feature objects and arrays. The returned preset is branded and frozen, so an arbitrary lookalike object is rejected.

## Native extensions

`extendFeatures` appends official Payload feature providers after managed features. Provider keys must be valid and unique. A collision fails instead of silently changing behavior. Disable the managed feature before supplying a native replacement with the same key.

## Non-goals

The package does not provide Blocks as a managed semantic feature, custom React nodes, styles, toolbars, AI integration, serialization, content validation, or migration of stored Lexical JSON. Use native Payload extensions for project-owned capabilities.
