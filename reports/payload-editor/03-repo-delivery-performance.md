# تحلیل قواعد تحویل و performance برای `@nexload-sdk/payload-editor`

## نتیجهٔ اجرایی

الگوی نهایی‌شدهٔ این monorepo دو قاعدهٔ مهم دارد:

1. `payload-fields` نشان می‌دهد یک package وابسته به Payload باید root سروری و قابل استفاده در config داشته باشد و هر UI مربوط به Admin را در exportهای جدا نگه دارد.
2. خانوادهٔ `healthcheck` نشان می‌دهد core باید سبک بماند و integrationهای runtime/framework به package یا entry point جدا منتقل شوند.

برای `payload-editor` نتیجه این است:

- v1 باید یک package کوچک و config-time باشد؛ نه یک UI framework و نه wrapper کامل تمام APIهای Lexical.
- API اصلی باید common case را با `createEditor()` حل کند و custom case را بدون engine دوم پشتیبانی کند.
- root نباید React component، `@payloadcms/ui`، CSS، provider SDK یا code مربوط به browser را import کند.
- `payload` و `@payloadcms/richtext-lexical` باید peer dependency و external باشند؛ dev dependencyها باید نسخهٔ دقیق baseline را نصب کنند.
- ESM، CJS و declaration فقط وقتی قابل انتشارند که tarball consumer smoke هر سه را ثابت کند. اگر upstream Lexical در CJS قابل require نباشد، CJS نباید با bundle کردن Payload «درست‌نمایی» شود؛ در آن حالت package باید ESM-only شود.
- docs، catalog، LLM indexes، skills/evals، Changeset، tarball inspection و consumer fixture جزو Definition of Done هستند، نه follow-up.

## منابع primary داخل repo

- bundler مشترک dependency و peer dependencyها را external می‌کند، ESM و CJS می‌سازد و سپس declarationها را با TypeScript تولید می‌کند: [`tools/bundler/index.js`](../../tools/bundler/index.js#L36-L106).
- `payload-fields` برای root، server subpathها و Admin subpathها export map صریح دارد و فقط `dist`، README و manifest را publish می‌کند: [`packages/payload-fields/package.json`](../../packages/payload-fields/package.json#L19-L68).
- هر subpath قابل import باید entry واقعی bundler داشته باشد: [`packages/payload-fields/esbuild.config.mjs`](../../packages/payload-fields/esbuild.config.mjs#L3-L13).
- تست‌های `payload-fields` از output ساخته‌شده import می‌کنند و وجود server subpathها را تست می‌کنند: [`packages/payload-fields/test/contracts.test.mjs`](../../packages/payload-fields/test/contracts.test.mjs#L4-L16).
- healthcheck root عمداً integrationهایی مثل Payload و Next را import نمی‌کند: [`packages/healthcheck/core/README.md`](../../packages/healthcheck/core/README.md#L19-L24).
- integration Payload در package جداست و Payload را optional peer نگه می‌دارد: [`packages/healthcheck/payload/package.json`](../../packages/healthcheck/payload/package.json#L35-L48).
- هر package عمومی باید وارد catalog شود: [`scripts/validate-docs.mjs`](../../scripts/validate-docs.mjs#L83-L96).
- symbolهای public منتخب باید در source و MDX canonical پوشش داده شوند: [`scripts/validate-docs.mjs`](../../scripts/validate-docs.mjs#L16-L45) و [`scripts/validate-docs.mjs`](../../scripts/validate-docs.mjs#L73-L81).
- build docs ابتدا LLM indexes و content validation را اجرا می‌کند، سپس Astro و link validation را: [`apps/docs/package.json`](../../apps/docs/package.json#L6-L13).
- skillها قرارداد سخت برای sectionها، حداقل پنج eval category، دقیقاً ۲۰ trigger eval و حداقل سه reference دارند: [`scripts/validate-skills.mjs`](../../scripts/validate-skills.mjs#L5-L26)، [`scripts/validate-skills.mjs`](../../scripts/validate-skills.mjs#L103-L166) و [`scripts/validate-skills.mjs`](../../scripts/validate-skills.mjs#L168-L214).
- workflow فعلی docs فقط تغییرات healthcheck و payload-fields را watch می‌کند؛ package جدید خودکار trigger نمی‌شود: [`.github/workflows/docs.yml`](../../.github/workflows/docs.yml#L3-L13).

## interface پیشنهادی نهایی

### تصمیم

یک engine و یک creator عمومی کافی است. `createPresetEditor` API تکراری ایجاد می‌کند و common caller را مجبور می‌کند بین دو مسیر بی‌دلیل انتخاب کند. presetها data هستند و `createEditor` باید آن‌ها را resolve کند.

```ts
import type {
  FeatureProviderServer,
  LexicalEditorConfig,
} from "@payloadcms/richtext-lexical";

export type EditorPresetName =
  | "minimal"
  | "basic"
  | "content"
  | "article"
  | "productDescription";

export interface CreateEditorOptions {
  /** Default: "basic". Use null for an exact feature-only definition. */
  preset?: EditorPresetName | EditorPreset | null
  /** Overrides the selected preset; exact set when preset is null. */
  features?: EditorFeatureConfig
  /** Native Payload features appended after managed features. */
  extendFeatures?: readonly FeatureProviderServer[]
}

export function createEditor(
  options?: CreateEditorOptions
): LexicalEditorConfig;
```

نام‌های `FeatureProviderServer` و `LexicalEditorConfig` در این snippet نمایندهٔ typeهای upstream هستند؛ نام و import واقعی آن‌ها باید توسط تحقیق Payload و typecheck روی نسخهٔ baseline قفل شود و نباید از روی این snippet حدس زده شود.

Usage:

```ts
// Trivial safe default: explicit, versioned basicPreset.
editor: createEditor()

// Common long-form case.
editor: createEditor({ preset: "content" })

// Preset customization.
editor: createEditor({
  preset: "content",
  features: {
    heading: { sizes: ["h2", "h3"] },
    upload: false,
  },
})

// Exact custom set; no hidden preset inheritance.
editor: createEditor({
  preset: null,
  features: {
    paragraph: true,
    bold: true,
    inlineToolbar: true,
  },
})
```

`basicPreset` برای default انتخاب شود چون یک editor عمومی قابل استفاده می‌دهد، اما upload، relationship، code و heading policy را بی‌اجازه وارد schema نمی‌کند. `createEditor({ preset: null })` بدون feature باید خطا بدهد؛ editor خالی معمولاً خطای مصرف‌کننده است.

### API عمومی

Root:

- `createEditor`
- preset data: `minimalPreset`, `basicPreset`, `contentPreset`, `articlePreset`, `productDescriptionPreset`
- public config/result types مورد نیاز caller
- `PayloadEditorConfigError` و `PayloadEditorConfigErrorCode`

Advanced subpath در صورت نیاز واقعی:

- `@nexload-sdk/payload-editor/engine`: `buildEditorFeatures`

`buildEditorFeatures` برای common caller مناسب نیست. نگهداری آن در subpath advanced از بزرگ شدن root و وابستگی کاربران به implementation detail جلوگیری می‌کند. registry، adapterها، canonical order و normalize/merge helperها public نشوند.

در v1 هیچ `./admin/*` entry لازم نیست مگر اینکه package واقعاً component سفارشی بسازد. feature factoryهای رسمی Payload باید استفاده شوند. AI/theme تا وقتی قرارداد واقعی ندارند نباید entry یا dependency ساختگی ایجاد کنند.

### invariants قفل‌شده

1. `createEditor()` همیشه معادل `createEditor({ preset: "basic" })` در همان major version است.
2. `preset: null` یعنی فقط featureهای داده‌شده؛ هیچ Payload default یا Nexload preset پنهانی اضافه نمی‌شود.
3. feature resolution فقط بر اساس canonical registry order است، نه insertion order object مصرف‌کننده.
4. `false` حذف می‌کند؛ `true` adapter default را از نو انتخاب می‌کند؛ object به‌صورت deterministic normalize می‌شود.
5. merge objectها shallow است و arrayها replace می‌شوند. deep merge قراردادی شکننده و دشوار برای پیش‌بینی است.
6. `extendFeatures` پس از managed features و با همان ترتیب ورودی append می‌شود.
7. engine روی `extendFeatures` introspection یا dedupe شکننده انجام نمی‌دهد؛ collision و compatibility native extension مسئول caller است.
8. factory sync، pure و بدون I/O، network، global registry mutation یا cache سراسری است.
9. config ورودی mutation نمی‌شود؛ presetهای exportشده readonly/frozen هستند.
10. package هرگز `defaultFeatures` Payload را به‌عنوان baseline پنهان مصرف نمی‌کند.
11. optionهای public semantic می‌مانند و type کامل upstream را mirror نمی‌کنند.
12. خروجی و error code برای input یکسان در یک package version ثابت است.

### ordering

ترتیب باید در یک tuple داخلی ثابت تعریف شود و تست contract داشته باشد. پیشنهاد:

```ts
const FEATURE_ORDER = [
  "paragraph",
  "heading",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "inlineCode",
  "link",
  "orderedList",
  "unorderedList",
  "blockquote",
  "horizontalRule",
  "upload",
  "relationship",
  "code",
  "inlineToolbar",
  "fixedToolbar",
] as const;
```

ترتیب دقیق featureهایی که upstream dependency/order requirement دارند باید پس از تحقیق Payload نهایی شود؛ ولی پس از انتخاب، source of truth فقط همین tuple باشد. presetها نباید order جدا داشته باشند.

### errors

خطاها synchronous و fail-fast باشند:

```ts
type PayloadEditorConfigErrorCode =
  | "EMPTY_EXACT_EDITOR"
  | "UNKNOWN_PRESET"
  | "INVALID_FEATURE_CONFIG"
  | "INVALID_HEADING_SIZE"
  | "EMPTY_COLLECTION_SCOPE"
  | "UNSUPPORTED_CAPABILITY";
```

Error باید `name = "PayloadEditorConfigError"`، `code` پایدار، `feature?` و message انگلیسی مناسب developer داشته باشد. خطای user-facing در این package وجود ندارد. config غلط نباید silently ignore شود و warning با `console` نیز مناسب نیست؛ ESLint مشترک `no-console` دارد.

### hidden implementation

```text
src/
  index.ts                    # root exports only
  create-editor.ts            # lexicalEditor composition
  errors.ts
  types.ts
  engine/
    build-editor-features.ts
    feature-order.ts
    merge-definition.ts
    normalize-feature.ts
    registry.ts               # private readonly map
    adapters/*.ts             # one semantic adapter per feature/family
  presets/
    index.ts
    minimal.ts
    basic.ts
    content.ts
    article.ts
    product-description.ts
```

Adapterها thin translation layer باشند. project collection، block schema، SEO rule، AI provider و frontend rendering وارد آن‌ها نشود.

## dependency و export strategy

### manifest پیشنهادی

- `peerDependencies`:
  - `payload: ">=3.68.5 <4"`
  - `@payloadcms/richtext-lexical: ">=3.68.5 <4"`
- `devDependencies`: هر دو با نسخهٔ دقیق baseline (`3.68.5`) به‌اضافهٔ bundler، eslint config و TypeScript config workspace.
- `dependencies`: در v1 خالی. dependency runtime جدید فقط اگر source واقعاً آن را اجرا می‌کند.
- React، React DOM و `@payloadcms/ui` تا وقتی custom Admin component نداریم peer مستقیم این package نشوند.
- `files`: فقط `dist`, `README.md`, `package.json`.
- `publishConfig.access`: `public`؛ config Changesets در سطح repo `restricted` است و بدون override package اشتباه خواهد بود.
- `sideEffects: false` فقط تا وقتی تمام moduleها pure و بدون CSS side effect هستند. اگر Admin CSS اضافه شد، pattern آن باید در `sideEffects` allowlist شود.
- `type: "module"`, `main`, `module`, `types` و conditional `exports` مطابق healthcheck برای compatibility ابزارها.

پیشنهاد export map:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs",
    "default": "./dist/index.mjs"
  },
  "./engine": {
    "types": "./dist/engine/index.d.ts",
    "import": "./dist/engine/index.mjs",
    "require": "./dist/engine/index.cjs",
    "default": "./dist/engine/index.mjs"
  },
  "./package.json": "./package.json"
}
```

`./engine` فقط اگر `buildEditorFeatures` واقعاً public بماند. export بدون entry واقعی ممنوع است؛ `payload-fields` قبلاً این failure را با build کردن subpathهای مستندش پوشش داده است.

### CJS stop gate

bundler مشترک dependencyها را external می‌کند. بنابراین CJS output شامل `require("@payloadcms/richtext-lexical")` خواهد شد. قبل از قفل کردن CJS باید consumer fixture ثابت کند upstream این مسیر را پشتیبانی می‌کند.

- اگر pass شد: ESM/CJS/d.ts مطابق repo ship شود.
- اگر fail شد: package ESM-only شود و `require`/`main` حذف گردد.
- راه مردود: bundle کردن Payload/Lexical داخل CJS؛ این کار duplicate runtime، version skew و bundle بسیار بزرگ ایجاد می‌کند.

## best-performance و هشدارها

### runtime/config time

- `createEditor` هنگام load شدن Payload config اجرا می‌شود؛ hot-path درخواست نیست. بهینه‌سازی اصلی کم کردن dependency graph و side effect است، نه memoization.
- global memoization ممنوع باشد؛ feature objectها ممکن است closure/config project داشته باشند و cache باعث leak یا cross-config contamination شود.
- registry یک readonly constant باشد و resolution یک pass روی `FEATURE_ORDER`: زمان `O(F)` و حافظه `O(F)` با F کوچک و ثابت.
- validation فقط روی featureهای فعال انجام شود؛ serialization/deep clone عمومی لازم نیست.
- presetها module constants باشند؛ در هر call object graph بزرگ ساخته نشود.

### server bundle

- root فقط config-time/server code داشته باشد. static smoke باید نبودن `react/jsx-runtime`, `@payloadcms/ui`, CSS, `document` و `window` را در `dist/index.*` بررسی کند.
- Payload و Lexical external بمانند. bundler مشترک فقط dependency و peer dependencyهای manifest را external می‌کند؛ dependency اعلام‌نشده ممکن است ناخواسته bundle شود.
- importها از upstream type-only باشند هرجا runtime import لازم نیست.
- تعداد entry pointها حداقل باشد. bundler فعلی برای چند entry splitting فعال نمی‌کند و shared code ممکن است در هر output تکرار شود.
- source map طبق convention فعلی داخل `dist` ship می‌شود؛ tarball budget باید mapها را جداگانه گزارش کند.
- banner فعلی bundler timestamp دارد و build byte-for-byte reproducible نیست. این debt repo است؛ size/hash test نباید hash دقیق artifact را contract کند. برای reproducible publish باید bundler در تغییر جدا اصلاح شود، نه در source package hack شود.

### client/Admin bundle

- v1 بدون custom Admin UI باید عملاً custom client bundle صفر داشته باشد.
- هر قابلیت AI/theme آینده باید `./admin/*` entry جدا، `"use client"` مناسب و Import Map path صریح داشته باشد؛ root نباید آن را import کند.
- provider SDK، prompt engine و credential code هرگز client dependency نشوند.
- toolbar actionها lazy/on-demand باشند؛ editor اولیه نباید provider یا endpoint implementation را load کند.
- CSS global یا icon library بزرگ برای یک toolbar ممنوع؛ در صورت نیاز asset کوچک و scoped استفاده شود.
- bundle budget پیشنهادی برای v1: root JS هر format حداکثر 50 KiB uncompressed و بدون bundled copy از Payload/Lexical. مهم‌تر از عدد مطلق، CI باید افزایش بیش از 10% نسبت به baseline را review-required کند.

## tests و consumer verification

### package tests

تست‌ها باید از `dist` اجرا شوند تا export/build واقعاً سنجیده شود، اما command باید ابتدا build کند؛ script فعلی packageهای نمونه `test` را مستقل از build تعریف کرده و ممکن است artifact stale را بخواند. برای package جدید یکی از این دو را قفل کنید:

```json
{
  "scripts": {
    "build": "node esbuild.config.mjs",
    "test": "pnpm build && node --test test/*.test.mjs"
  }
}
```

یا CI همیشه `build` سپس `test` اجرا کند و `test` standalone ممنوع/مستند شود. گزینهٔ اول robustتر است.

Test suites:

- `engine.test.mjs`: boolean/object normalization، preset merge، array replacement، immutability، exact mode.
- `ordering.test.mjs`: canonical order مستقل از object insertion order و append order extensionها.
- `presets.test.mjs`: exact feature contract هر پنج preset و عدم وابستگی به Payload defaults.
- `errors.test.mjs`: همهٔ error codeها و invalid boundaryها.
- `exports.test.mjs`: ESM root، CJS root، advanced subpath و declaration path existence.
- `root-safety.test.mjs`: نبودن client/UI/CSS markers در root bundles.
- `payload-contract.test.mjs`: خروجی قابل قبول برای `richText({ editor: createEditor(...) })` یا equivalent واقعی version baseline.

از snapshot کامل objectهای Payload که function و implementation detail دارند پرهیز شود. contract semantic مثل feature key/order/options assertion شود.

### tarball و fixture واقعی مصرف‌کننده

workspace resolution می‌تواند missing dependency، missing export یا missing file را پنهان کند. release gate باید tarball واقعی بسازد:

1. `pnpm -C packages/payload-editor build`
2. `pnpm -C packages/payload-editor pack --pack-destination <temp-dir>`
3. inspect tarball؛ فقط manifest، README و dist و همهٔ targetهای export موجود باشند.
4. یک temp consumer خارج از workspace بسازید و tarball + peerهای exact را نصب کنید.
5. ESM import و CJS require را جدا اجرا کنید.
6. یک TypeScript config با `moduleResolution: Bundler` compile کنید.
7. یک minimal Payload config با `richText` field و `createEditor()` load/build کنید.
8. اگر Admin entry وجود دارد، Payload Import Map generation/Admin build smoke اجرا شود؛ plain Node import برای CSS-bearing Admin module معیار مناسبی نیست.

Fixtureها بهتر است زیر `packages/payload-editor/test/fixtures/consumer-*` فقط source ثابت داشته باشند و install/temp output در `/tmp` یا temp dir ساخته شود؛ `node_modules` و tarball commit نشوند.

## docs، LLM و skills

### فایل‌های دقیق docs

ایجاد:

- `apps/docs/src/content/docs/packages/payload-editor/index.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/quick-start.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/features.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/presets.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/extensions.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/reference-api.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/migration.mdx`

فقط اگر capability واقعاً ship شد:

- `apps/docs/src/content/docs/packages/payload-editor/ai-and-security.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/theme.mdx`

ویرایش:

- `apps/docs/src/lib/package-catalog.ts`: import manifest، entry family=`payload`، source/docs path، runtimes و skills.
- `scripts/validate-docs.mjs`: canonical root و inventory symbolهای public.
- `apps/docs/astro.config.mjs`: sidebar group و redirectهای legacy در صورت وجود.
- `apps/docs/src/content/docs/start/introduction.mdx`
- `apps/docs/src/content/docs/start/choose-a-package.mdx`
- `apps/docs/src/content/docs/packages/index.mdx` فقط اگر catalog rendering نیاز به تغییر دارد.
- `apps/docs/src/content/docs/agents/index.mdx` و `agents/install.mdx` برای skillهای جدید.
- `.github/workflows/docs.yml`: افزودن `packages/payload-editor/**` و هر validator جدید به path filter.

تولید، نه ویرایش دستی:

- `apps/docs/public/llms.txt`
- `apps/docs/public/llms-full.txt`

### skills پیشنهادی

namespace: `skills/payload-editor/`

- `core`: انتخاب editor، feature DSL، invariants و migration.
- `presets`: انتخاب/customize preset و جلوگیری از over-capability.
- `extensions`: native Payload feature، Blocks و boundaryهای custom feature.

AI/theme تا قبل از implementation skill نگیرند. هر skill دقیقاً نیاز دارد:

- `SKILL.md` با ۱۱ section الزامی و کمتر از ۲۰۰ line.
- `references/` با حداقل سه فایل Markdown، هر کدام کمتر از ۲۰۰ line و همگی linked.
- `evals/evals.json` با حداقل پنج scenario و پوشش هر پنج category.
- `evals/trigger-evals.json` با دقیقاً ۲۰ query: ده positive و ده negative.

ویرایش scripts:

- root `package.json`: افزودن `skills:payload-editor:validate`.
- `apps/docs/src/lib/package-catalog.ts`: skill nameها.
- docs agent install/index surfaces.

## Changeset و release

فایل‌ها/گام‌ها:

- `packages/payload-editor/package.json` با version اولیه، public publish config و files allowlist.
- `packages/payload-editor/README.md` هم‌زمان با API؛ quick start copy-pasteable و runtime/peer caveat صریح.
- `pnpm-lock.yaml` پس از install معمولی؛ frozen-lockfile gate باید pass شود.
- `.changeset/<slug>.md` برای معرفی package و contract واقعی. featureهای AI/theme پیاده‌نشده در متن changeset ادعا نشوند.
- version/changelog/publish توسط agent فقط با دستور صریح user انجام شود.

هشدار: `.changeset/config.json` access پیش‌فرض `restricted` دارد، در حالی که packageهای نهایی `publishConfig.access = public` دارند. حذف publishConfig باعث publish policy اشتباه می‌شود.

## delivery checklist

### A. package skeleton

- [ ] `packages/payload-editor/package.json`
- [ ] `README.md`
- [ ] `src/index.ts` و source structure بالا
- [ ] `esbuild.config.mjs` با entryهای دقیقاً متناظر exports
- [ ] `tsconfig.json` بر پایهٔ `@nexload-sdk/typescript-config/node.json`؛ React preset فقط اگر JSX واقعی اضافه شد
- [ ] `eslint.config.mjs` با import صحیح `@nexload-sdk/eslint-config/base.js`
- [ ] `test/*.test.mjs` و fixture sourceها
- [ ] peer ranges و exact dev versions
- [ ] `files`, `publishConfig`, `exports`, `main/module/types`, `sideEffects`

### B. contract implementation

- [ ] common default، exact mode و preset customization
- [ ] private readonly registry و canonical order
- [ ] shallow merge + array replacement
- [ ] immutable input/presets
- [ ] synchronous coded errors
- [ ] native extension append semantics
- [ ] no Payload defaults inheritance
- [ ] no project business rules/Blocks/provider code

### C. performance/package boundary

- [ ] Payload/Lexical external در output
- [ ] root فاقد React UI/CSS/browser global
- [ ] no global cache/I/O
- [ ] baseline root bundle size ثبت شده
- [ ] no unnecessary Admin entry
- [ ] CJS compatibility stop gate pass یا CJS حذف شده

### D. docs/skills

- [ ] هفت MDX canonical پایه
- [ ] catalog، validator inventory، sidebar، start pages
- [ ] LLM indexes regenerated
- [ ] سه skill namespace بالا یا scope کمتر با توجیه روشن
- [ ] eval/trigger/reference contract کامل
- [ ] docs workflow path filter package جدید را watch می‌کند

### E. release

- [ ] lockfile synced
- [ ] Changeset دقیق
- [ ] package local checks pass
- [ ] tarball inspect pass
- [ ] isolated ESM/CJS/TS/Payload consumer pass
- [ ] docs/skills/root validation pass
- [ ] `git diff --check`
- [ ] هیچ `dist`, temp consumer, tarball یا `node_modules` ناخواسته stage نشده
- [ ] publish فقط با approval صریح

## validation matrix

| Gate | Command / روش | اثبات | Stop condition |
|---|---|---|---|
| Install integrity | `pnpm install --frozen-lockfile` | manifest/lockfile هماهنگ | `ERR_PNPM_OUTDATED_LOCKFILE` |
| Package lint | `pnpm -C packages/payload-editor lint` | strict repo style/type-aware lint | هر error؛ خصوصاً config root export اشتباه |
| Build | `pnpm -C packages/payload-editor build` | ESM/CJS/d.ts و entryها ساخته می‌شوند | missing declaration/export یا upstream CJS failure |
| Unit/contract tests | `pnpm -C packages/payload-editor test` | merge/order/preset/error contracts | هر behavior drift |
| ESM smoke | `node --input-type=module -e 'import("@nexload-sdk/payload-editor")'` در fixture tarball | conditional import واقعی | resolution/runtime error |
| CJS smoke | `node -e 'require("@nexload-sdk/payload-editor")'` در fixture tarball | require واقعی با upstream external | اگر fail شد CJS ship نشود |
| Type consumer | `pnpm exec tsc -p test/fixtures/... --noEmit` | declaration و public types قابل مصرف | leaked private path/missing peer type |
| Export coverage | compare `package.json.exports` targets با tar listing | هیچ export phantom نیست | target غایب |
| Root safety | scan `dist/index.mjs/cjs` برای UI/CSS/browser markers | server config graph سبک | React UI/CSS/provider در root |
| Payload config | minimal config/collection با `richText({ editor: createEditor() })` | قرارداد package مادر واقعی | config load/type/runtime failure |
| Import Map/Admin | Payload generate import map/Admin build فقط اگر Admin entry هست | client path واقعی | CSS/plain-node false positive معیار نباشد |
| Bundle budget | `wc -c dist/index.mjs dist/index.cjs` + dependency scan | root زیر 50 KiB و بدون bundled upstream | >10% regression بدون review یا Payload copy |
| Pack | `pnpm -C packages/payload-editor pack --pack-destination <tmp>` | files allowlist و publish artifact | source/test/temp/missing README/dist |
| Package catalog | `pnpm --filter docs content:check` | catalog + API coverage | public package/symbol غایب |
| Docs full | `pnpm --filter docs build` | LLM generation، MDX/Astro/link checks | broken link/frontmatter/API drift |
| Skills namespace | `node scripts/validate-skills.mjs payload-editor` | structure/evals/triggers/references | هر validator error |
| Skills validator tests | `pnpm skills:test` | validator regression ندارد | test failure |
| Workspace build | `pnpm build` | Turbo graph کامل | package integration failure |
| Workspace lint | `pnpm lint` | repo-wide compatibility | failure؛ اگر baseline unrelated است دقیق report شود |
| Diff hygiene | `git diff --check` و `git status --short` | whitespace و artifact hygiene | generated/temp/unrelated changes |

## failure modeهای شناخته‌شده و پیشگیری

| Failure | علت | پیشگیری |
|---|---|---|
| `ERR_PACKAGE_PATH_NOT_EXPORTED` در ESLint | import کردن root config به‌جای subpath | `@nexload-sdk/eslint-config/base.js` |
| docs دربارهٔ subpathی حرف می‌زند که runtime ندارد | export map یا bundler entry جا افتاده | export/tarball smoke برای همهٔ subpathها |
| test pass با artifact stale | تست مستقیم `dist` بدون build | build-before-test و clean dist |
| workspace pass، consumer fail | workspace linking dependency/export نقص را پنهان می‌کند | نصب tarball خارج workspace |
| Admin plain Node smoke با CSS fail می‌شود | client module در runtime نامناسب import شده | Admin/import-map build smoke، نه Node import |
| root client bundle را می‌کشد | barrel root، Admin module/CSS را re-export می‌کند | root safety scan و subpath separation |
| package Payload/Lexical را bundle می‌کند | dependency manifest نشده و bundler آن را external نمی‌بیند | direct peer declaration + output scan |
| duplicate Payload/Lexical runtime | حل CJS با bundle کردن upstream | CJS compatibility gate یا ESM-only |
| docs deploy برای package جدید اجرا نمی‌شود | workflow path filter قدیمی است | افزودن `packages/payload-editor/**` |
| docs validation package را رد می‌کند | catalog/inventory/canonical root به‌روز نیست | docs plumbing در همان change |
| skill validation fail | کمبود section/reference/eval/trigger balance | ساخت طبق validator، سپس namespace validation |
| publish restricted | Changesets default `restricted` است | `publishConfig.access = public` |
| frozen lockfile CI fail | manifest تغییر کرده ولی lockfile نه | install و frozen install gate |
| build غیر reproducible | timestamp banner مشترک | hash exact را contract نکن؛ bundler debt جداگانه |
| preset behavior با Payload update drift می‌کند | استفاده از `defaultFeatures` | feature set explicit + minimum/latest peer matrix |

## تصمیم‌های delivery که اکنون قابل قفل شدن‌اند

- یک public creator؛ `createPresetEditor` حذف شود.
- `createEditor()` default مستند `basic` داشته باشد؛ custom exact با `preset: null`.
- root server/config-only؛ Admin/AI/theme فقط subpath جدا در صورت implementation واقعی.
- registry/adapters private؛ extension فقط native append seam.
- deterministic canonical order؛ shallow object merge و array replacement.
- Payload/Lexical direct peers و externals؛ dependency runtime اضافی صفر در v1.
- ESM/CJS/d.ts هدف repo است، ولی CJS upstream compatibility یک stop gate غیرقابل مذاکره است.
- package تنها با docs + catalog + validators + LLM + skills/evals + Changeset + tarball consumer کامل محسوب می‌شود.

مواردی که باید گزارش Payload-contract قفل کند و این گزارش عمداً حدس نزده است: نام typeهای واقعی upstream، factory mapping هر feature، dependency/order الزام‌شده توسط Payload، code block semantics و امکان واقعی require در نسخهٔ baseline.
