# Payload and Lexical contracts for `@nexload-sdk/payload-editor`

Status: decision-ready research  
Research date: 2026-07-15  
Compatibility baseline inspected: Payload `3.68.5` and `3.86.0`

## Executive decision

`@nexload-sdk/payload-editor` should be a server-side configuration compiler over Payload's public `lexicalEditor()` and official feature factories. It should not reimplement Lexical features, expose Payload's registry internals, inherit Payload's moving defaults, or ship client code until a real Nexload client feature exists.

The deepest useful v1 interface is one root entry point:

```ts
import { createEditor } from '@nexload-sdk/payload-editor'

const editor = createEditor({
  preset: 'article',
  features: {
    heading: { sizes: ['h2', 'h3'] },
    relationship: false,
    upload: { allowedCollections: ['media'], maxDepth: 1 },
  },
})
```

`createEditor()` compiles an explicit Nexload definition to a fresh ordered array of Payload `FeatureProviderServer` values, then calls Payload's `lexicalEditor({ features })`. Presets are immutable data consumed by the same compiler. The registry, adapters, merge function, validation, and compiled feature builder remain private.

This design is intentionally narrower than the draft document:

- do not export `buildEditorFeatures`; it exposes the shallow machinery rather than the useful abstraction;
- do not require `createPresetEditor`; `createEditor({ preset })` covers the same operation without a second execution path;
- do not model `defaultFeatures` or `rootFeatures`; explicit feature sets are the package's stability boundary;
- do not include AI or theme in the core contract until their server/client contracts are defined;
- rename ambiguous `code` to `codeBlock` if it is ever adopted, but keep it out of the stable v1 registry because Payload marks `CodeBlock` experimental and it brings a materially heavier editor implementation.

## Primary-source findings

### 1. The actual editor return type is an async Payload adapter provider

Payload exports:

```ts
function lexicalEditor(args?: LexicalEditorProps): LexicalRichTextAdapterProvider
```

`LexicalEditorProps` contains `admin`, `features`, and `lexical`. `features` is either an array of `FeatureProviderServer` values or a callback receiving `defaultFeatures` and `rootFeatures`. The returned provider is executed during Payload config sanitization and resolves a `Promise<LexicalRichTextAdapter>`, not a Lexical runtime editor instance. See the tagged [`3.68.5` source types](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts) and the [official editor overview](https://payloadcms.com/docs/rich-text/overview).

Consequences:

- the Nexload return type should be `ReturnType<typeof lexicalEditor>`, not a hand-written `LexicalEditor` alias;
- `createEditor()` is synchronous configuration assembly; Payload performs async sanitization later;
- public types should import `FeatureProviderServer`, `LexicalEditorProps`, and factory option types from `@payloadcms/richtext-lexical`, not reproduce their full shapes;
- the package root is a server/config entry point and must not be imported from client components.

### 2. `defaultFeatures` and `rootFeatures` are contextual and moving

Payload calls the features callback with:

- `defaultFeatures`: Payload's opinionated recommended list;
- `rootFeatures`: the features enabled on the root rich-text editor, or an empty list when unavailable/inapplicable.

Payload's documented default list currently includes formatting, paragraph/heading, alignment/indentation, three list modes, links, relationships, uploads, blockquotes, horizontal rules, and the inline toolbar. The official inventory is in [Official Features](https://payloadcms.com/docs/rich-text/official-features); the exact `3.68.5` list is in [`default.ts`](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/default.ts).

Decision: Nexload presets and custom definitions must compile to an explicit array. They must not spread either contextual array. Otherwise the same Nexload preset can change when Payload adds, removes, or changes a default feature, and a field-level editor can silently change with the root config.

### 3. Server/client features have a strict serialization boundary

Payload features are modular server and client halves. The server feature is the entry point; a client feature is registered through its `ClientFeature` import path. Payload requires client feature files to be separate, marked `'use client'`, and imported from `@payloadcms/richtext-lexical/client`, not from the root package. Payload explicitly states that client props must be serializable because they cross the server/client boundary; functions and `Map` values may remain server-side but cannot be sent as `clientFeatureProps`. See [Custom Features: client feature registration and import rules](https://payloadcms.com/docs/rich-text/custom-features) and the [serializability rule](https://payloadcms.com/docs/rich-text/custom-features#adding-a-client-feature-to-the-server-feature).

Decision:

- native Payload feature adapters require no Nexload client entry point;
- a future Nexload UI feature must use a second export, `@nexload-sdk/payload-editor/client`, with `'use client'` and a stable named export;
- the server feature must reference it as an import-map string such as `@nexload-sdk/payload-editor/client#EditorAIFeatureClient`;
- server handlers, credentials, functions, registries, and provider clients must never appear in `clientFeatureProps`; only IDs, labels, flags, and other JSON-safe data may cross;
- AI action execution therefore needs a server endpoint/plugin plus serializable action metadata. An `execute` function in `EditorAICapability.actions` is not a valid client contract.

Payload's import-map generator automatically includes each resolved feature's `ClientFeature` and `componentImports`, plus sub-field components. The authoritative implementation is [`generateImportMap.ts`](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/utilities/generateImportMap.ts). Nexload should supply valid exported component paths and let Payload generate the map; it should not own a parallel import-map mechanism.

### 4. Payload owns dependency sorting; duplicate handling is unsafe for a high-level DSL

Each `FeatureProviderServer` has a stable `key` plus optional:

- `dependencies`: must exist but need not load first;
- `dependenciesPriority`: must exist and load first;
- `dependenciesSoft`: load first when present, but absence is allowed.

Payload topologically sorts these dependencies, detects missing dependencies and cycles, and then resolves features in that order. Its loader also removes duplicate keys before validation with **last feature wins** behavior. See [Custom Features: feature load order](https://payloadcms.com/docs/rich-text/custom-features#feature-load-order), the tagged [`FeatureProviderServer` type](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/features/typesServer.ts), and the tagged [`loader.ts`](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/loader.ts).

Decision and invariant:

1. Nexload compiles registered features in one documented canonical order, independent of object property insertion order.
2. `extendFeatures` retains caller order and is appended after registered features.
3. Before calling Payload, Nexload rejects an extension with a missing/blank key.
4. Before calling Payload, Nexload rejects every duplicate feature key, including built-in vs extension duplicates. Silent last-wins replacement is too surprising for this DSL.
5. To supply an advanced native replacement, consumers disable the registered feature and extend with the native feature:

```ts
createEditor({
  features: { link: false },
  extendFeatures: [
    LinkFeature({
      fields: ({ defaultFields }) => [...defaultFields, customField],
    }),
  ],
})
```

6. Payload may change the final order to satisfy feature dependencies. Nexload guarantees deterministic input and deterministic output for the same matched Payload version, not that the post-sanitization order always equals registry order.
7. The compiler creates a fresh feature array and fresh factory outputs on every `createEditor()` call. Payload's loader mutates the feature array and resolved feature objects, so cached mutable provider instances are unsafe.

### 5. Official feature mappings

The stable direct mappings at both inspected versions are:

| Nexload slug | Payload factory | Stable option mapping |
| --- | --- | --- |
| `paragraph` | `ParagraphFeature()` | none |
| `bold` | `BoldFeature()` | none |
| `italic` | `ItalicFeature()` | none |
| `underline` | `UnderlineFeature()` | none |
| `strikethrough` | `StrikethroughFeature()` | none |
| `inlineCode` | `InlineCodeFeature()` | none |
| `heading` | `HeadingFeature()` | `sizes` -> `enabledHeadingSizes` |
| `link` | `LinkFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth`; `disableAutoLinks` |
| `upload` | `UploadFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth` |
| `relationship` | `RelationshipFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth` |
| `orderedList` | `OrderedListFeature()` | none |
| `unorderedList` | `UnorderedListFeature()` | none |
| `blockquote` | `BlockquoteFeature()` | none |
| `horizontalRule` | `HorizontalRuleFeature()` | none |
| `inlineToolbar` | `InlineToolbarFeature()` | none |
| `fixedToolbar` | `FixedToolbarFeature()` | none |

Important corrections to the draft:

- Payload's heading option is `enabledHeadingSizes`, not `sizes`; `sizes` is a reasonable Nexload semantic name that the adapter translates.
- Link, upload, and relationship collection allowlists are `enabledCollections`. Payload models enabled and disabled collection lists as mutually exclusive. The Nexload surface should expose only the common allowlist as `allowedCollections`; exclusions and other advanced cases use native replacement through `extendFeatures`.
- Payload `UploadFeature({ collections })` does **not** select allowed collections. It is a map of upload collection slugs to extra node sub-fields. Therefore `UploadFeatureOptions.collections?: string[]` in the draft is incorrect and dangerous. Use `allowedCollections` for the Nexload allowlist.
- `LinkFeature` additionally supports custom `fields`; `UploadFeature` supports collection-specific sub-fields; all three relational features support `maxDepth`. Those raw schemas should not be copied into the common DSL. Consumers with advanced schema requirements can replace the feature natively.

The official current option contracts and examples are documented under [Link, Relationship, and Upload features](https://payloadcms.com/docs/rich-text/official-features).

### 6. `code` and `CodeBlock` are different features

`InlineCodeFeature()` is an ordinary inline text format and is included in Payload defaults. Payload has no stable standalone `CodeFeature()` for block code. Its code block is a prebuilt Payload block passed to `BlocksFeature`:

```ts
BlocksFeature({ blocks: [CodeBlock()] })
```

Payload marks `CodeBlock` experimental and warns that the API may change in minor releases. It includes language selection and a code editor, with optional remote TypeScript definition fetching. See [Payload Blocks: CodeBlock](https://payloadcms.com/docs/rich-text/blocks#code-block) and the tagged [`CodeBlock` source](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/features/blocks/premade/CodeBlock/index.ts).

Decision:

- keep `inlineCode` in the stable registry;
- remove ambiguous `code` from the stable v1 contract and presets;
- if product requirements later justify it, add an explicitly named `codeBlock` feature in a minor/major release with isolated compatibility tests and bundle-size measurements;
- until then, consumers opt in natively using `features: { ... }, extendFeatures: [BlocksFeature({ blocks: [CodeBlock()] })]`;
- do not merge a built-in code block with project block arrays implicitly. Project block ownership is application-specific.

### 7. Version compatibility is a matched-family invariant

Registry metadata checked on 2026-07-15 reports `3.86.0` as the latest Payload 3.x. `@payloadcms/richtext-lexical@3.68.5` declares an exact peer on `payload@3.68.5`; `@payloadcms/richtext-lexical@3.86.0` declares an exact peer on `payload@3.86.0`. It also installs exact same-version Payload UI/translations dependencies. The package metadata is published by Payload at [npm: `@payloadcms/richtext-lexical`](https://www.npmjs.com/package/@payloadcms/richtext-lexical) and the current release is [Payload `v3.86.0`](https://github.com/payloadcms/payload/releases/tag/v3.86.0).

Recommended Nexload peer declarations:

```json
{
  "peerDependencies": {
    "@payloadcms/richtext-lexical": ">=3.68.5 <4",
    "payload": ">=3.68.5 <4"
  },
  "devDependencies": {
    "@payloadcms/richtext-lexical": "3.68.5",
    "payload": "3.68.5"
  }
}
```

The broad Nexload range means “the adapter surface is tested across Payload 3,” not that arbitrary mixed versions are supported. Documentation and tests must state this non-negotiable invariant:

> `payload` and all `@payloadcms/*` packages in an application must use the exact same version.

CI should test matched pairs, never a cross-product:

- minimum: `payload@3.68.5` + `@payloadcms/richtext-lexical@3.68.5`;
- latest supported 3.x: resolve one version and install both packages at that exact version;
- optionally add a scheduled latest-3 job so a new Payload minor detects drift before release.

Do not directly depend on `lexical` or `@lexical/*`. Between the inspected versions Payload moved its Lexical target from `0.35.0` to `0.41.0`. Payload recommends its re-exported Lexical subpaths, and its runtime performs dependency-family checks. Direct Lexical dependencies create duplicate/mismatched runtime risk. The upgrade is documented in Payload's [release history](https://github.com/payloadcms/payload/releases).

### 8. Upgrade-risk audit: `3.68.5` to `3.86.0`

The core mappings proposed above remained compatible in the inspected declarations. Relevant drift still occurred:

- Lexical core upgraded from `0.35.0` to `0.41.0`;
- `LinkFeature` gained `internalDocToHref` for Markdown conversion;
- Payload added experimental editor `views`/node maps and a new internal-client export;
- experimental APIs explicitly remain eligible for minor-version breaking changes.

This validates a semantic adapter rather than re-exporting every upstream option. A small Nexload surface stayed stable while Payload's advanced surface grew. Each Payload upgrade should diff these public declarations at minimum:

- root `LexicalEditorProps` and feature exports;
- `FeatureProviderServer` / `ServerFeature`;
- heading, link, upload, and relationship options;
- default feature list and dependency loader;
- package exports and peer dependencies.

## Recommended public interface

The following is the complete recommended stable surface for the Payload-facing core. Exact generated collection slug types can be adopted where the consuming Payload config makes them available; public runtime validation must still accept strings.

```ts
import type {
  FeatureProviderServer,
  LexicalEditorProps,
} from '@payloadcms/richtext-lexical'

export type EditorFeatureOption<TOptions = never> =
  [TOptions] extends [never] ? boolean : boolean | Readonly<TOptions>

export type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingFeatureOptions {
  sizes?: readonly HeadingSize[]
}

export interface RelationalFeatureOptions {
  allowedCollections?: readonly string[]
  maxDepth?: number
}

export interface LinkFeatureOptions extends RelationalFeatureOptions {
  disableAutoLinks?: true | 'creationOnly'
}

export interface EditorFeatureConfig {
  paragraph?: EditorFeatureOption
  bold?: EditorFeatureOption
  italic?: EditorFeatureOption
  underline?: EditorFeatureOption
  strikethrough?: EditorFeatureOption
  inlineCode?: EditorFeatureOption
  heading?: EditorFeatureOption<HeadingFeatureOptions>
  link?: EditorFeatureOption<LinkFeatureOptions>
  upload?: EditorFeatureOption<RelationalFeatureOptions>
  relationship?: EditorFeatureOption<RelationalFeatureOptions>
  unorderedList?: EditorFeatureOption
  orderedList?: EditorFeatureOption
  blockquote?: EditorFeatureOption
  horizontalRule?: EditorFeatureOption
  inlineToolbar?: EditorFeatureOption
  fixedToolbar?: EditorFeatureOption
}

export type EditorPresetName =
  | 'minimal'
  | 'basic'
  | 'content'
  | 'article'
  | 'productDescription'

export interface EditorDefinition {
  features: Readonly<EditorFeatureConfig>
}

interface CreateEditorCommonOptions {
  /** Native Payload escape hatch. Duplicate feature keys are rejected. */
  extendFeatures?: readonly FeatureProviderServer<unknown, unknown, unknown>[]
  /** Narrow pass-through for Payload field authoring UI. */
  admin?: LexicalEditorProps['admin']
}

export type CreateEditorOptions = CreateEditorCommonOptions & (
  | {
      preset: EditorPresetName | EditorDefinition
      /** Overrides the selected preset by feature slug. */
      features?: Readonly<EditorFeatureConfig>
    }
  | {
      preset?: never
      /** Required when no preset is selected. */
      features: Readonly<EditorFeatureConfig>
    }
)

export function createEditor(
  options: CreateEditorOptions,
): ReturnType<typeof import('@payloadcms/richtext-lexical').lexicalEditor>

export const presets: Readonly<Record<EditorPresetName, EditorDefinition>>
```

Notes:

- A `true` option enables the adapter default, `false` disables it, and an options object enables it with options.
- Omitted keys preserve the preset value when a preset exists; without a preset, omitted keys are disabled.
- `features` overrides a preset at the feature-key level. Options objects replace the preset's options object rather than deep-merge it. This avoids stale nested configuration and makes the final definition inspectable. Current stable options are flat, so deep merge adds no value.
- Do not accept `undefined` as an intentional delete marker; normal TypeScript omission semantics are enough.
- Do not expose arbitrary `lexical` config in v1. It leaks Lexical version coupling and can bypass the package's future theme contract. A proven cross-project need can add a narrow option later.
- Export named preset definitions only if consumers need to compose definitions in code. A single frozen `presets` map is the smaller default surface.

## Required invariants and error modes

Validation occurs synchronously in `createEditor()` before calling Payload. Error messages should include the option path and a stable package code for tests/docs.

| Invariant | Error |
| --- | --- |
| No preset and no `features` | `PAYLOAD_EDITOR_DEFINITION_REQUIRED` |
| Unknown runtime preset name | `PAYLOAD_EDITOR_UNKNOWN_PRESET` |
| Unknown feature key from untyped JS | `PAYLOAD_EDITOR_UNKNOWN_FEATURE` |
| Option object supplied to boolean-only feature | `PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS` |
| `heading.sizes` is empty, duplicated, or invalid | `PAYLOAD_EDITOR_INVALID_HEADING_SIZES` |
| `allowedCollections` is empty, duplicated, or contains blank slugs | `PAYLOAD_EDITOR_INVALID_COLLECTIONS` |
| `maxDepth` is negative, fractional, or non-finite | `PAYLOAD_EDITOR_INVALID_MAX_DEPTH` |
| Extension has no non-empty key | `PAYLOAD_EDITOR_INVALID_EXTENSION` |
| Any duplicate compiled/extension feature key | `PAYLOAD_EDITOR_DUPLICATE_FEATURE` |

Canonicalization rules:

- preserve the package's canonical registry order, not caller object order;
- normalize heading sizes to canonical `h1`…`h6` order after rejecting duplicates;
- preserve allowlist order because collection UI order may be meaningful, but reject duplicates;
- preserve extension order;
- never silently drop a feature or allow Payload's last-wins duplicate behavior to decide DSL semantics.

## Hidden implementation

Suggested private structure:

```text
src/
  index.ts                  # public types, createEditor, presets map
  create-editor.ts          # validate -> merge -> compile -> lexicalEditor
  definition/
    merge-definition.ts     # shallow per-feature preset override
    validate-definition.ts
  registry/
    feature-registry.ts     # canonical ordered adapter tuple
    types.ts                # private typed adapter contract
  adapters/
    heading.ts
    link.ts
    upload.ts
    relationship.ts
    ...boolean adapters
  presets/
    definitions.ts          # deeply frozen data only
```

Private adapter shape:

```ts
interface FeatureAdapter<TOptions> {
  readonly slug: keyof EditorFeatureConfig
  build(options: true | Readonly<TOptions>): FeatureProviderServer<unknown, unknown, unknown>
  validate(options: unknown, path: string): asserts options is true | Readonly<TOptions>
}
```

Adapters call only public Payload factories. They do not copy Payload feature implementations, customize import maps, or retain mutable provider instances. The compiler is an internal pure function covered through the public `createEditor()` result and package-level contract tests.

## Performance warnings and defaults

1. **Compile only enabled features.** Each feature can add nodes, plugins, toolbars, converters, hooks, schema generation, and client imports. Explicit presets avoid shipping authoring UI that a surface does not use.
2. **Default relational `maxDepth` conservatively.** Relationship, upload, and internal-link population increase database work and response size with depth. Payload documents that depth directly affects database load and response size in [Depth](https://payloadcms.com/docs/queries/depth). Recommend preset default `maxDepth: 1`; allow `0` for ID-only population and require consumers to opt into larger values.
3. **Do not put relationships/uploads in every preset.** Minimal/basic inputs should omit them. Product descriptions should not gain document relationships unless the product schema needs them.
4. **Treat CodeBlock as a heavy opt-in.** It uses a code editor, language support, and can fetch external type definitions. It should not enter generic presets or the stable v1 registry without measured client bundle and interaction cost.
5. **Keep client boundaries split.** Future client features should import from Payload's `/client` entry, keep providers/plugins narrow, and avoid importing the package root. Externalize Payload, React, and Lexical-family packages in the Nexload build rather than bundling duplicate runtimes.
6. **Avoid `editorConfigFactory.fromEditor` in package internals.** Payload's own source calls it the least efficient extraction route and recommends feature-based config construction. The Nexload compiler already owns the feature array, so it should pass it directly to `lexicalEditor()`.
7. **Do not over-cache configuration objects.** Configuration assembly is cheap and Payload mutates feature structures during sanitization. Fresh providers are safer than shared singleton feature objects.
8. **Measure the Admin bundle, not only server package size.** A small Nexload wrapper can still activate large Payload client features. Add a demo-app production build/bundle comparison for feature additions such as CodeBlock or future AI UI.

## Compatibility and contract-test matrix

Minimum package tests:

- TypeScript compile against the matched `3.68.5` pair;
- scheduled/latest compile against the matched latest Payload 3.x pair;
- `createEditor()` returns a callable adapter provider;
- invoke the provider with a minimal sanitized Payload config fixture and assert enabled feature keys/order;
- one contract test for every adapter's upstream option translation;
- preset snapshot of feature keys only (not unstable internal objects);
- feature object-property order does not affect compiled order;
- all validation/error codes above;
- built-in/extension and extension/extension duplicate keys fail before Payload;
- custom replacement works when the registered slug is explicitly disabled;
- no preset references `defaultEditorFeatures` or `rootFeatures`;
- package tarball exports only documented paths and does not bundle Payload/React/Lexical;
- if a future `/client` export exists, import it in a client build and verify the import-map named export resolves.

Upgrade gate for every Payload minor:

1. install an exact matched Payload package family;
2. run typecheck, tests, and package build;
3. diff upstream feature option declarations and package exports;
4. build the Payload demo Admin and exercise each preset;
5. compare Admin client chunks for regressions;
6. test saved editor content across the old/new Payload versions when node-producing features change;
7. block release on experimental API drift rather than widening local casts.

## Final locked decisions for the parent plan

- Public execution surface: one function, `createEditor`; one root entry point in v1.
- Public data: a frozen preset map and semantic configuration types.
- Hidden: build compiler, registry, adapters, validation, merge implementation.
- Explicit feature sets only; no Payload default/root inheritance.
- Canonical registry order plus Payload dependency sorting.
- Duplicate feature keys are errors, not last-wins overrides.
- `allowedCollections` maps to Payload `enabledCollections`; Upload `collections` is reserved for native sub-field configuration and is not copied into the semantic DSL.
- Relationship/link/upload expose `maxDepth`, with preset default `1` where enabled.
- `inlineCode` is stable; `code`/CodeBlock is excluded from stable v1 and remains a native opt-in.
- `payload` and `@payloadcms/*` versions must match exactly; Nexload tests matched `3.68.5` and latest 3.x pairs.
- No direct Lexical dependencies; use Payload factories/types and Payload proxy exports where unavoidable.
- No `/client` entry until a Nexload client feature exists. When it does, client props are JSON-safe metadata only and Payload owns import-map generation.

## Sources

- [Payload Rich Text Editor overview](https://payloadcms.com/docs/rich-text/overview)
- [Payload Official Features](https://payloadcms.com/docs/rich-text/official-features)
- [Payload Custom Features](https://payloadcms.com/docs/rich-text/custom-features)
- [Payload Rich Text Blocks and CodeBlock](https://payloadcms.com/docs/rich-text/blocks)
- [Payload query depth and performance](https://payloadcms.com/docs/queries/depth)
- [Payload `v3.68.5` richtext-lexical types](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts)
- [Payload `v3.68.5` default feature list](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/default.ts)
- [Payload `v3.68.5` feature loader](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/loader.ts)
- [Payload `v3.68.5` server feature types](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/features/typesServer.ts)
- [Payload `v3.86.0` richtext-lexical types](https://github.com/payloadcms/payload/blob/v3.86.0/packages/richtext-lexical/src/types.ts)
- [Payload `v3.86.0` release](https://github.com/payloadcms/payload/releases/tag/v3.86.0)
- [npm package metadata for `@payloadcms/richtext-lexical`](https://www.npmjs.com/package/@payloadcms/richtext-lexical)

Context7 was not callable in this environment. Research therefore used only Payload's official documentation, tagged official source/types, release history, and npm-published package metadata.
