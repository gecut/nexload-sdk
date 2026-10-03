# API Reference & Compatibility

Public API symbol reference, editor functions, and compatibility matrix for Payload Editor.

**Topic:** api
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `createEditor`

```ts
createEditor(options: CreateEditorOptions) => ReturnType<typeof lexicalEditor>
```

**Exported from:** `@nexload-sdk/payload-editor`

Public function exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/create-editor.ts#L54)

### `defineEditorPreset`

```ts
defineEditorPreset(options: DefineEditorPresetOptions) => EditorPreset
```

**Exported from:** `@nexload-sdk/payload-editor`

Public function exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/define-editor-preset.ts#L38)

## Classes

### `PayloadEditorConfigError`

```ts
class PayloadEditorConfigError
```

**Exported from:** `@nexload-sdk/payload-editor`

Public classe exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/errors.ts#L12)

## Interfaces

### `DefineEditorPresetOptions`

```ts
interface DefineEditorPresetOptions { readonly features: Readonly<EditorFeatureConfig> }
```

**Exported from:** `@nexload-sdk/payload-editor`

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L62)

### `EditorFeatureConfig`

```ts
interface EditorFeatureConfig {
  paragraph?: FeatureOption
  heading?: FeatureOption<HeadingOptions>
  bold?: FeatureOption
  italic?: FeatureOption
  underline?: FeatureOption
  strikethrough?: FeatureOption
  inlineCode?: FeatureOption
  link?: FeatureOption<LinkOptions>
  unorderedList?: FeatureOption
  orderedList?: FeatureOption
  blockquote?: FeatureOption
  horizontalRule?: FeatureOption
  upload?: FeatureOption<UploadOptions>
  relationship?: FeatureOption<RelationshipOptions>
  inlineToolbar?: FeatureOption
  fixedToolbar?: FeatureOption
}
```

**Exported from:** `@nexload-sdk/payload-editor`

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L36)

### `EditorPreset`

```ts
interface EditorPreset {
  readonly [editorPresetBrand]: true
  readonly features: Readonly<EditorFeatureConfig>
}
```

**Exported from:** `@nexload-sdk/payload-editor`

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L57)

### `HeadingOptions`

```ts
interface HeadingOptions { sizes?: readonly HeadingSize[] }
```

**Exported from:** `@nexload-sdk/payload-editor`

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L24)

### `LinkOptions`

```ts
interface LinkOptions extends RelationalOptions<CollectionSlug> { autoLink?: boolean }
```

**Exported from:** `@nexload-sdk/payload-editor`

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L31)

## Types

### `CreateEditorOptions`

```ts
type CreateEditorOptions = CommonEditorOptions & (
  | {
    readonly preset: EditorPresetName | EditorPreset
    readonly features?: Readonly<EditorFeatureConfig>
  }
  | {
    readonly preset?: never
    readonly features: Readonly<EditorFeatureConfig>
  }
);
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L69)

### `EditorPresetName`

```ts
type EditorPresetName
  = | "compact"
    | "standard"
    | "structured-content"
    | "article"
    | "product-description";
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L11)

### `FeatureOption`

```ts
type FeatureOption<TOptions = never> = [TOptions] extends [never]
  ? boolean
  : boolean | Readonly<TOptions>;
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L18)

### `HeadingSize`

```ts
type HeadingSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L22)

### `NativeEditorFeature`

```ts
type NativeEditorFeature = FeatureProviderServer<any, any, any>;
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L9)

### `PayloadEditorConfigErrorCode`

```ts
type PayloadEditorConfigErrorCode
  = | "PAYLOAD_EDITOR_DEFINITION_REQUIRED"
    | "PAYLOAD_EDITOR_UNKNOWN_PRESET"
    | "PAYLOAD_EDITOR_UNKNOWN_FEATURE"
    | "PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS"
    | "PAYLOAD_EDITOR_INVALID_HEADING_SIZES"
    | "PAYLOAD_EDITOR_INVALID_COLLECTIONS"
    | "PAYLOAD_EDITOR_INVALID_MAX_DEPTH"
    | "PAYLOAD_EDITOR_INVALID_EXTENSION"
    | "PAYLOAD_EDITOR_DUPLICATE_FEATURE";
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/errors.ts#L1)

### `RelationshipOptions`

```ts
type RelationshipOptions = RelationalOptions<CollectionSlug>;
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L34)

### `UploadOptions`

```ts
type UploadOptions = RelationalOptions<UploadCollectionSlug>;
```

**Exported from:** `@nexload-sdk/payload-editor`

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L33)

***

## Functions Reference

| Function | Return Type | Description |
|---|---|---|
| `createEditor(options)` | `RichTextAdapterProvider` | Compiles an explicit feature definition into Payload's official Lexical editor provider. |
| `defineEditorPreset(options)` | `EditorPreset` | Defines an immutable, reusable editor preset for team-wide policy sharing. |

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload 3.86.0 |
| **`@payloadcms/richtext-lexical`** | `>=3.85.0 <4.0.0` | Verified on Lexical 3.86.0 |
| **Module Format** | ESM only | Server and configuration safe |
| **Side Effects** | `false` | Fully tree-shakeable |
