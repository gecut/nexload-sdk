# Payload Editor: locked specification and implementation plan

Status: implementation-ready proposal  
Date: 2026-07-15  
Implementation status: not started

## 1. Outcome

`@nexload-sdk/payload-editor` will be a deep, server-side configuration module that compiles a small semantic editor definition into Payload's native Lexical editor adapter.

It solves one recurring consumer problem:

> Define a consistent Payload editor by authoring intent, without rebuilding and re-learning Payload's feature list in every project.

The package owns:

- semantic feature definitions;
- explicit and versioned presets;
- deterministic feature resolution;
- Nexload defaults and validation;
- translation to official Payload feature factories;
- one controlled native extension seam;
- compatibility, documentation, migration, and release contracts.

The package does not own:

- `richText` field factories;
- application content models or Payload Blocks schemas;
- frontend Lexical rendering or converters;
- Payload's feature dependency loader;
- AI providers, prompts, credentials, or model policy;
- general application theming;
- project-specific authoring rules.

## 2. Research inputs

This decision combines three independent investigations:

1. [Payload contracts](./01-payload-contracts.md): official Payload docs, tagged source/types, npm metadata, feature mappings, server/client serialization, dependency loading, and compatibility.
2. [Consumer ergonomics](./02-consumer-ergonomics.md): common caller workflows, TypeScript discoverability, merge semantics, error UX, extension behavior, and versioning.
3. [Repo delivery and performance](./03-repo-delivery-performance.md): finalized package conventions, bundling, exports, docs, skills, Changesets, tarball verification, and performance gates.

The Payload sources that define the upstream contract are:

- [Rich Text Editor overview](https://payloadcms.com/docs/rich-text/overview)
- [Official Features](https://payloadcms.com/docs/rich-text/official-features)
- [Custom Features](https://payloadcms.com/docs/rich-text/custom-features)
- [Blocks and CodeBlock](https://payloadcms.com/docs/rich-text/blocks)
- [`v3.68.5` Lexical types](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts)
- [`v3.68.5` feature loader](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/loader.ts)

## 3. Designs considered

### Design A: minimal interface

One `createEditor` entry point, a private compiler/registry, explicit preset names, array-only native extensions, and no advanced engine export.

Strengths:

- highest depth and smallest interface;
- strongest deterministic guarantees;
- lowest SemVer and maintenance burden;
- least leakage of Payload internals.

Weakness:

- reusable organization-specific presets need a small additional mechanism.

### Design B: maximum flexibility

`createEditor`, custom preset definitions, native extension arrays or callbacks, limited Payload passthrough, and a read-only advanced resolver.

Strengths:

- supports nearly every advanced consumer without bypassing the package;
- strong TypeScript ergonomics;
- good organizational reuse.

Weaknesses:

- extension callbacks can invalidate canonical order and managed guarantees;
- an advanced resolver creates a public test/tooling surface before a real caller exists;
- more upstream types become part of the public interface.

### Design C: trivial default

`createEditor()` implicitly selects a general-purpose preset, exports preset data, and optionally exposes an engine subpath.

Strength:

- shortest possible call site.

Weaknesses:

- intent is invisible at the call site;
- a preset change can silently change an editor that appears unconfigured;
- it conflicts with the package's explicit-feature-set principle.

### Recommended hybrid

Adopt Design A and add only `defineEditorPreset` from Design B.

The stable root has two behavioral entry points:

- `createEditor`
- `defineEditorPreset`

There is no zero-argument default, no native extension callback, no public engine resolver, and no public registry/adapter registration.

This maximizes leverage while keeping the seam narrow:

```text
semantic definition and preset       Nexload owns
  -> validation and deterministic compiler   Nexload owns
  -> native extension array                   consumer owns
  -> feature dependency resolution            Payload owns
```

## 4. Locked public interface

The exact upstream return type is `ReturnType<typeof lexicalEditor>`. The draft's hand-written `LexicalEditor` and `LexicalFeature` aliases must not be used.

```ts
import type {
  FeatureProviderServer,
  LexicalEditorProps,
} from "@payloadcms/richtext-lexical";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type {
  CollectionSlug,
  UploadCollectionSlug,
} from "payload";

export type NativeEditorFeature =
  FeatureProviderServer<any, any, any>;

export type EditorPresetName =
  | "compact"
  | "standard"
  | "structured-content"
  | "article"
  | "product-description";

export type FeatureOption<TOptions = never> =
  [TOptions] extends [never]
    ? boolean
    : boolean | Readonly<TOptions>;

export type HeadingSize =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

export interface HeadingOptions {
  sizes?: readonly HeadingSize[]
}

export interface RelationalOptions<TSlug extends string> {
  allowedCollections?: readonly TSlug[]
  maxDepth?: number
}

export interface LinkOptions
  extends RelationalOptions<CollectionSlug> {
  autoLink?: boolean
}

export type UploadOptions =
  RelationalOptions<UploadCollectionSlug>;

export type RelationshipOptions =
  RelationalOptions<CollectionSlug>;

export interface EditorFeatureConfig {
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

declare const editorPresetBrand: unique symbol;

export interface EditorPreset {
  readonly [editorPresetBrand]: true
  readonly features: Readonly<EditorFeatureConfig>
}

export interface DefineEditorPresetOptions {
  readonly features: Readonly<EditorFeatureConfig>
}

interface CommonEditorOptions {
  readonly admin?: LexicalEditorProps["admin"]
  readonly extendFeatures?: readonly NativeEditorFeature[]
}

export type CreateEditorOptions = CommonEditorOptions & (
  | {
      readonly preset: EditorPresetName | EditorPreset
      readonly features?: Readonly<EditorFeatureConfig>
    }
  | {
      readonly preset?: never
      readonly features: Readonly<EditorFeatureConfig>
    }
);

export function defineEditorPreset(
  options: DefineEditorPresetOptions,
): EditorPreset;

export function createEditor(
  options: CreateEditorOptions,
): ReturnType<typeof lexicalEditor>;
```

The confined `any` in `NativeEditorFeature` mirrors Payload's own `FeaturesInput` contract. It must not spread into other public or internal types.

### Usage

```ts
import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "structured-content",
  features: {
    heading: { sizes: ["h2", "h3"] },
    upload: {
      allowedCollections: ["media"],
      maxDepth: 1,
    },
  },
});
```

Custom exact editor:

```ts
export const editor = createEditor({
  features: {
    paragraph: true,
    bold: true,
    inlineToolbar: true,
  },
});
```

Reusable organization preset:

```ts
import {
  createEditor,
  defineEditorPreset,
} from "@nexload-sdk/payload-editor";

const landingContent = defineEditorPreset({
  features: {
    paragraph: true,
    heading: { sizes: ["h2", "h3"] },
    bold: true,
    link: true,
    inlineToolbar: true,
  },
});

export const editor = createEditor({
  preset: landingContent,
  features: { upload: false },
});
```

Native project feature:

```ts
import { BlocksFeature } from "@payloadcms/richtext-lexical";

export const editor = createEditor({
  preset: "article",
  extendFeatures: [
    BlocksFeature({ blocks: [Callout, Gallery] }),
  ],
});
```

## 5. Locked semantic rules

### Definition requirement

- `createEditor()` is invalid.
- A caller supplies either `preset` or a complete custom `features` definition.
- There is no implicit Payload default, root inheritance, or Nexload preset.

### Merge

Merge order is:

```text
built-in/custom preset
  -> consumer feature overrides
  -> canonical adapter resolution
  -> native extension append
  -> duplicate and invariant validation
  -> Payload lexicalEditor
```

Feature override states:

| Input | Result |
| --- | --- |
| absent/`undefined` | inherit preset; disabled without a preset |
| `false` | disable feature |
| `true` | enable/reset to Nexload adapter defaults |
| object | shallow merge onto preset feature options |
| array inside object | replace the preset array |
| `null` | configuration error |

There is no generic deep merge. Public option objects remain flat and semantic.

### Order

The private canonical order is:

```text
paragraph
heading
bold
italic
underline
strikethrough
inlineCode
link
unorderedList
orderedList
blockquote
horizontalRule
upload
relationship
inlineToolbar
fixedToolbar
```

- Caller object insertion order never changes output.
- Native extensions retain input order and append after managed features.
- Payload remains the owner of dependency/priority sorting during sanitization.
- Nexload guarantees deterministic input and same-version behavior, not that Payload will preserve the exact pre-sanitization order.

### Duplicate behavior

Payload's loader uses last-wins behavior for duplicate feature keys. The Nexload compiler must reject duplicates before Payload:

- built-in vs native extension;
- native extension vs native extension;
- blank/missing native feature key.

To replace a managed feature, disable it and append the native replacement.

### Mutability

- Consumer inputs are never mutated.
- `defineEditorPreset` validates and snapshots its definition.
- Built-in preset definitions are private and immutable.
- Native feature provider objects and Payload's returned adapter are not frozen.
- Every call creates a fresh feature array and fresh official feature providers.

## 6. Locked feature mappings

| Nexload feature | Payload factory | Translation |
| --- | --- | --- |
| `paragraph` | `ParagraphFeature()` | none |
| `heading` | `HeadingFeature()` | `sizes` -> `enabledHeadingSizes` |
| `bold` | `BoldFeature()` | none |
| `italic` | `ItalicFeature()` | none |
| `underline` | `UnderlineFeature()` | none |
| `strikethrough` | `StrikethroughFeature()` | none |
| `inlineCode` | `InlineCodeFeature()` | none |
| `link` | `LinkFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth`; `autoLink` -> inverse `disableAutoLinks` |
| `unorderedList` | `UnorderedListFeature()` | none |
| `orderedList` | `OrderedListFeature()` | none |
| `blockquote` | `BlockquoteFeature()` | none |
| `horizontalRule` | `HorizontalRuleFeature()` | none |
| `upload` | `UploadFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth` |
| `relationship` | `RelationshipFeature()` | `allowedCollections` -> `enabledCollections`; `maxDepth` |
| `inlineToolbar` | `InlineToolbarFeature()` | none |
| `fixedToolbar` | `FixedToolbarFeature()` | none |

`UploadFeatureOptions.collections?: string[]` from the draft is rejected. Payload's `UploadFeature.collections` is a map of collection slugs to extra sub-fields, not an allowlist.

Exclusion lists, custom link fields, upload sub-fields, and other advanced upstream options use native replacement rather than expanding the semantic interface.

## 7. Locked presets

Preset names are task-oriented and are behavioral contracts for a major version.

### `compact`

- paragraph
- bold
- italic
- link (`maxDepth: 1`)
- inline toolbar

### `standard`

- paragraph
- bold
- italic
- underline
- link (`maxDepth: 1`)
- unordered list
- ordered list
- blockquote
- inline toolbar
- fixed toolbar

### `structured-content`

- paragraph
- heading (`h2`, `h3`, `h4`)
- bold
- italic
- underline
- strikethrough
- link (`maxDepth: 1`)
- unordered list
- ordered list
- blockquote
- horizontal rule
- upload (`maxDepth: 1`)
- inline toolbar
- fixed toolbar

### `article`

The `structured-content` set, plus:

- heading sizes become `h2`, `h3`, `h4`, `h5`;
- inline code;
- relationship (`maxDepth: 1`).

### `product-description`

- paragraph
- heading (`h2`, `h3`)
- bold
- italic
- link (`maxDepth: 1`)
- unordered list
- ordered list
- upload (`maxDepth: 1`)
- inline toolbar
- fixed toolbar

Changing feature membership, feature defaults, canonical order, or heading policy of an existing preset is a major release.

## 8. Rejected or deferred capabilities

### Block code

- `inlineCode` is stable and included.
- Ambiguous `code` is removed.
- Payload code blocks use `BlocksFeature({ blocks: [CodeBlock()] })`.
- `CodeBlock` is experimental and materially heavier.
- Project Blocks ownership also makes implicit merging unsafe.

Consumers opt in natively. A future measured feature must be named `codeBlock`, never `code`.

### AI

AI is not part of the core or first stable release.

The draft's `execute` function cannot cross Payload's server/client serialization seam. A future AI integration requires a separate approved contract covering:

- plugin/endpoint ownership;
- auth and access control;
- serializable action metadata;
- request/response/error schema;
- selection limits, timeout, cancellation, and rate limiting;
- a separate client export and Payload import-map path;
- zero provider SDK or credentials in client code.

When justified, AI should be an optional feature/plugin adapter, not a generic `capabilities` bag in the core.

### Theme

Theme is not part of the stable interface.

There is currently no second concrete theme/adapter and no shared styling contract. A `name?: string` placeholder is a hypothetical seam with no leverage. Add a theme interface only after at least two real variants or one concrete cross-project styling contract exists.

### Advanced engine

`buildEditorFeatures`, registry, adapters, canonical order, and merge/validation helpers remain private. No `./advanced`, `./engine`, or `./internal` export ships in v1.

## 9. Errors

All independent configuration errors are synchronous and fail during `createEditor`/`defineEditorPreset`.

```ts
export type PayloadEditorConfigErrorCode =
  | "PAYLOAD_EDITOR_DEFINITION_REQUIRED"
  | "PAYLOAD_EDITOR_UNKNOWN_PRESET"
  | "PAYLOAD_EDITOR_UNKNOWN_FEATURE"
  | "PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS"
  | "PAYLOAD_EDITOR_INVALID_HEADING_SIZES"
  | "PAYLOAD_EDITOR_INVALID_COLLECTIONS"
  | "PAYLOAD_EDITOR_INVALID_MAX_DEPTH"
  | "PAYLOAD_EDITOR_INVALID_EXTENSION"
  | "PAYLOAD_EDITOR_DUPLICATE_FEATURE";

export class PayloadEditorConfigError extends TypeError {
  readonly code: PayloadEditorConfigErrorCode
  readonly path: string
  readonly hint?: string
}
```

Rules:

- messages are stable, concise English developer messages;
- every error includes code and exact path;
- invalid values are reported safely without serializing entire provider/config objects;
- no warning-and-continue behavior;
- extension factory errors preserve their original stack/cause;
- no user-facing Admin errors are introduced in the core package.

## 10. Payload compatibility

Direct peers:

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

Non-negotiable consumer invariant:

> `payload` and every installed `@payloadcms/*` package use the exact same version.

The Nexload range states that the adapter surface is tested across Payload 3; it does not support arbitrary mixed versions.

Compatibility jobs use matched pairs only:

- minimum: `3.68.5` + `3.68.5`;
- current latest at research time: `3.86.0` + `3.86.0`;
- scheduled job: latest Payload 3.x matched family.

Do not depend directly on `lexical` or `@lexical/*`. Payload moved from Lexical `0.35.0` to `0.41.0` between the inspected versions and owns the compatible proxy exports.

## 11. Package and export contract

The package is ESM-only in v1.

Reason:

- `@payloadcms/richtext-lexical` publishes an ESM import/default surface, not a native CJS `require` surface;
- bundling Payload/Lexical into a CJS artifact would create duplicate runtimes and version skew;
- modern Payload config is ESM-native;
- a fake CJS wrapper is worse than an explicit ESM constraint.

Manifest essentials:

```json
{
  "name": "@nexload-sdk/payload-editor",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist", "README.md", "package.json"],
  "publishConfig": { "access": "public" }
}
```

Runtime dependencies are empty. Payload and richtext-lexical are peers/externals. React, ReactDOM, `@payloadcms/ui`, and provider SDKs are not direct peers or dependencies because v1 imports none of them.

The bundler must build ESM plus declarations only. If the shared bundler cannot express this cleanly, adjust package configuration through its existing `isCJS` option; do not fork or copy the bundler.

## 12. Performance contract

### Config/server

- Compilation is synchronous, pure, and `O(F)` for a small fixed feature count.
- No I/O, network, global mutation, or process-wide cache.
- Validate and build only enabled features.
- Always create fresh provider values because Payload sanitization mutates/resolves feature structures.
- Root imports no React UI, CSS, browser global, provider SDK, or project module.
- Payload/Lexical stay external and are never bundled.

### Payload/data

- Relational preset features default to `maxDepth: 1`.
- `0` remains valid for ID-only population.
- Values above `1` are explicit consumer choices.
- Compact/standard presets do not enable upload or relationship.
- CodeBlock and future AI UI are not in generic presets.

### Admin/client

- v1 owns zero custom client JavaScript.
- Future client features use separate `'use client'` exports and JSON-safe props only.
- Payload owns import-map generation.
- A future optional client feature must be measured in the demo Admin production build.

### Budgets

- Root ESM bundle must be at most 50 KiB uncompressed.
- Output must contain no bundled Payload/Lexical implementation.
- A bundle increase above 10% from the recorded baseline is review-required.
- Exact artifact hashes are not a contract because the shared bundler currently adds a timestamp banner.

## 13. Required file layout

```text
packages/payload-editor/
  package.json
  README.md
  esbuild.config.mjs
  eslint.config.mjs
  tsconfig.json
  src/
    index.ts
    create-editor.ts
    define-editor-preset.ts
    errors.ts
    types.ts
    definition/
      merge-definition.ts
      validate-definition.ts
    registry/
      feature-order.ts
      feature-registry.ts
      types.ts
    adapters/
      boolean.ts
      heading.ts
      link.ts
      upload.ts
      relationship.ts
    presets/
      definitions.ts
  test/
    contracts.test.mjs
    errors.test.mjs
    immutability.test.mjs
    ordering.test.mjs
    payload-compat.test.mjs
    package.test.mjs
```

Use `@nexload-sdk/typescript-config/node.json`; do not use the React config until JSX exists. ESLint must import `@nexload-sdk/eslint-config/base.js`.

## 14. Documentation and skills

Create canonical MDX:

```text
apps/docs/src/content/docs/packages/payload-editor/
  index.mdx
  quick-start.mdx
  features.mdx
  presets.mdx
  extensions.mdx
  reference-api.mdx
  migration.mdx
```

Update:

- `apps/docs/src/lib/package-catalog.ts`
- `scripts/validate-docs.mjs`
- `apps/docs/astro.config.mjs`
- start/package catalog docs where selection guidance changes
- agent install/index docs
- `.github/workflows/docs.yml` path filters

Generate rather than hand-edit:

- `apps/docs/public/llms.txt`
- `apps/docs/public/llms-full.txt`

Create skills:

```text
skills/payload-editor/
  core/
  presets/
  extensions/
```

Each skill must satisfy the existing validator:

- required `SKILL.md` sections;
- at least three linked references;
- at least five evals covering all categories;
- exactly twenty trigger evals split 10 positive/10 negative.

Add `skills:payload-editor:validate` to the root scripts.

AI/theme docs and skills are forbidden until those capabilities actually ship.

## 15. Test and validation matrix

| Gate | Evidence | Stop condition |
| --- | --- | --- |
| frozen install | `pnpm install --frozen-lockfile` | lockfile drift |
| package lint | `pnpm -C packages/payload-editor lint` | any package error |
| package build | `pnpm -C packages/payload-editor build` | missing ESM/declarations/export |
| package tests | `pnpm -C packages/payload-editor test` | semantic contract drift |
| type tests | positive/negative TS fixtures | typo or invalid union accepted; valid call rejected |
| minimum Payload | exact matched `3.68.5` fixture | compile/config/sanitize failure |
| latest Payload | exact matched latest 3.x fixture | upstream drift |
| preset contracts | exact feature key/options assertions | feature/default/order drift |
| duplicate contracts | built-in/native/native collisions | silent last-wins behavior |
| immutability | caller config/preset unchanged | input mutation |
| ESM consumer | install packed tarball outside workspace | resolution/runtime failure |
| Payload config | minimal real root and field editors | parent contract failure |
| root safety | scan output graph/markers | UI/CSS/browser/provider leakage |
| bundle budget | size and dependency scan | >50 KiB or bundled upstream |
| pack | tar listing and export target check | missing/extra published files |
| docs content | `pnpm --filter docs content:check` | missing catalog/API coverage |
| docs full | `pnpm --filter docs build` | MDX/Astro/link/LLM failure |
| skills | `node scripts/validate-skills.mjs payload-editor` | structure/eval/reference failure |
| skill validator | `pnpm skills:test` | validator regression |
| workspace build | `pnpm build` | integration failure |
| workspace lint | `pnpm lint` | new failure; unrelated baseline reported exactly |
| hygiene | `git diff --check`, `git status --short` | temp/generated/unrelated artifacts |

Tests import built `dist`, but the test script must build first to prevent stale artifact success.

Release verification must pack and install the tarball outside the workspace; workspace linking is not sufficient evidence.

## 16. Implementation plan

### Phase 0: approve and replace the draft contract

Actions:

- treat this file as the implementation baseline;
- update the original package specification or copy the final contract into repo-owned docs;
- record the exclusions of AI, theme, code block, public engine, Payload defaults, and CJS.

Gate:

- no unresolved interface, merge, preset, ordering, compatibility, or export decision remains.

### Phase 1: package skeleton and upstream proof

Create:

- manifest, README placeholder, TypeScript/ESLint/bundler config;
- ESM root entry;
- minimum and latest matched Payload fixtures;
- packed-tarball ESM consumer smoke.

Gate:

- exact upstream types compile;
- ESM import works outside workspace;
- Payload/Lexical remain external;
- no source behavior is implemented before this compatibility proof.

### Phase 2: pure definition module

Implement test-first:

- public readonly types;
- error class/codes;
- definition validation;
- merge semantics;
- `defineEditorPreset` snapshot/immutability;
- private preset definitions.

Gate:

- all merge states, invalid paths, no-mutation rules, and exact preset definitions pass without calling Payload factories.

### Phase 3: feature registry and adapters

Implement:

- private canonical registry tuple;
- boolean adapters;
- heading, link, upload, and relationship translations;
- feature option validation;
- duplicate extension detection;
- fresh provider creation.

Gate:

- every mapping is asserted against the real Payload feature provider contract;
- caller key order cannot affect compiled order;
- duplicate features fail before Payload.

### Phase 4: editor composition

Implement:

- `createEditor` pipeline;
- `admin` passthrough only;
- official `lexicalEditor({ features })` composition;
- root and field-level real Payload fixtures.

Gate:

- return type and runtime value satisfy Payload's `richText` editor contract on minimum/latest matched pairs;
- no use of `defaultFeatures` or `rootFeatures` exists.

### Phase 5: performance and package hardening

Implement/verify:

- ESM-only export map;
- root safety scan;
- bundle size baseline;
- tarball allowlist and export-target inspection;
- external dependency scan;
- build-before-test behavior;
- isolated consumer installation.

Gate:

- all package/performance/consumer gates pass before docs claim the package works.

### Phase 6: docs and skills

Implement:

- README with install, explicit preset quick start, native extension, compatibility, and non-goals;
- seven canonical MDX pages;
- package catalog/sidebar/validator/workflow integration;
- generated LLM indexes;
- core, presets, and extensions skills with references/evals.

Gate:

- docs build, link validation, package symbol coverage, skills namespace validation, and validator tests pass.

### Phase 7: release readiness

Implement:

- lockfile reconciliation;
- accurate Changeset;
- migration/versioning policy;
- final package and workspace checks;
- staged-set artifact review.

Gate:

- no publish until the user explicitly authorizes publishing;
- first stable `1.0.0` is cut only after minimum/latest Payload, tarball consumer, docs, skills, and performance gates all pass.

## 17. Definition of Done

The package is complete only when:

- common callers use one explicit `createEditor` call;
- custom organization presets require no global registry;
- Payload internals remain behind the module interface;
- every preset and merge rule is a versioned tested contract;
- minimum and latest Payload 3 matched families pass;
- root is ESM-only, server-safe, and owns no client bundle;
- packed artifact works outside the workspace;
- README, canonical docs, LLM indexes, skills, evals, and Changeset match the real exports;
- AI/theme/code block are neither implemented nor advertised;
- all validation gates pass with unrelated repo debt reported separately;
- publishing remains a separate explicitly authorized action.
