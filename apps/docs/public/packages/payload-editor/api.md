# API reference

Public exports for Payload Editor 1.1.0.

**Topic:** api
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/api/
## Functions

### `createEditor`

```ts
createEditor(options: CreateEditorOptions) => ReturnType<typeof lexicalEditor>
```

Public function exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/create-editor.ts#L54)

### `defineEditorPreset`

```ts
defineEditorPreset(options: DefineEditorPresetOptions) => EditorPreset
```

Public function exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/define-editor-preset.ts#L38)

## Classes

### `PayloadEditorConfigError`

```ts
class PayloadEditorConfigError
```

Public classe exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/errors.ts#L12)

## Interfaces

### `DefineEditorPresetOptions`

```ts
interface DefineEditorPresetOptions { readonly features: Readonly<EditorFeatureConfig> }
```

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

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L36)

### `EditorPreset`

```ts
interface EditorPreset {
  readonly [editorPresetBrand]: true
  readonly features: Readonly<EditorFeatureConfig>
}
```

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L57)

### `HeadingOptions`

```ts
interface HeadingOptions { sizes?: readonly HeadingSize[] }
```

Public interface exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L24)

### `LinkOptions`

```ts
interface LinkOptions extends RelationalOptions<CollectionSlug> { autoLink?: boolean }
```

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

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L11)

### `FeatureOption`

```ts
type FeatureOption<TOptions = never> = [TOptions] extends [never]
  ? boolean
  : boolean | Readonly<TOptions>;
```

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L18)

### `HeadingSize`

```ts
type HeadingSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
```

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L22)

### `NativeEditorFeature`

```ts
type NativeEditorFeature = FeatureProviderServer<any, any, any>;
```

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

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/errors.ts#L1)

### `RelationshipOptions`

```ts
type RelationshipOptions = RelationalOptions<CollectionSlug>;
```

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L34)

### `UploadOptions`

```ts
type UploadOptions = RelationalOptions<UploadCollectionSlug>;
```

Public type exported by @nexload-sdk/payload-editor.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/types.ts#L33)

## Runtime exports

`createEditor(options)` validates and merges one definition, creates managed feature providers in deterministic order, appends native extensions, and returns Payload's Lexical editor provider.

`defineEditorPreset(options)` validates and snapshots a reusable feature definition. Only presets created by this function or built-in preset names are accepted.

`PayloadEditorConfigError` extends `TypeError` with stable `code`, exact `path`, and optional `hint`.

## Type exports

The root exports the option, preset, feature, heading, link, upload, relationship, and native-provider types. `EditorPresetName` is the five-name built-in union. `FeatureOption<T>` represents `boolean | options`.

## Error codes

* `PAYLOAD_EDITOR_DEFINITION_REQUIRED`
* `PAYLOAD_EDITOR_UNKNOWN_PRESET`
* `PAYLOAD_EDITOR_UNKNOWN_FEATURE`
* `PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS`
* `PAYLOAD_EDITOR_INVALID_HEADING_SIZES`
* `PAYLOAD_EDITOR_INVALID_COLLECTIONS`
* `PAYLOAD_EDITOR_INVALID_MAX_DEPTH`
* `PAYLOAD_EDITOR_INVALID_EXTENSION`
* `PAYLOAD_EDITOR_DUPLICATE_FEATURE`

All are configuration-time errors. Do not expose their messages directly as end-user content.

See the [root entrypoint](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/index.ts) for the live export surface.
