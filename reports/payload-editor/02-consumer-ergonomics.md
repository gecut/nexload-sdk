# Consumer ergonomics and extensible public API

## حکم نهایی

`@nexload-sdk/payload-editor` باید مسیر معمول را به یک فراخوانی صریح کاهش دهد، اما Payload را برای مصرف‌کنندهٔ پیشرفته مسدود نکند:

```ts
editor: createEditor({ preset: "structuredContent" })
```

API پیشنهادی این گزارش عمداً از طراحی حداقلی سند اولیه انعطاف‌پذیرتر است. یک engine عمومی دارد، preset را با نام یا تعریف reusable می‌پذیرد، overrideهای semantic را merge می‌کند، و در نهایت یک callback بومی Payload برای append/reorder/replace در اختیار مصرف‌کننده می‌گذارد. در مقابل، registry سراسری، adapterهای داخلی و `buildEditorFeatures` عمومی نمی‌شوند.

تصمیم‌های قابل قفل:

1. فقط `createEditor` مسیر ساخت editor است؛ `createPresetEditor` حذف شود.
2. مصرف‌کننده باید دقیقاً یکی از `preset` یا تعریف کامل `features` را بدهد؛ preset ضمنی وجود نداشته باشد.
3. presetهای built-in با نام‌های `compact`، `standard`، `structuredContent`، `article` و `productDescription` عرضه شوند.
4. preset objectهای built-in export نشوند؛ `EditorPresetName` و `defineEditorPreset` export شوند.
5. merge همواره `preset -> feature overrides -> extendFeatures` باشد.
6. ترتیب featureهای built-in canonical باشد و به ترتیب کلیدهای object وابسته نباشد.
7. `extendFeatures` هم array برای append معمول و هم callback برای کنترل کامل advanced ارائه کند.
8. config نامعتبر هنگام import/sanitize شدن Payload config با `PayloadEditorConfigError` و path دقیق fail شود.
9. ورودی‌ها هرگز mutate نشوند؛ خروجی native Payload نیز freeze نشود.
10. Payload و `@payloadcms/richtext-lexical` peer dependencyهای هم‌نسخه و در بازهٔ Payload 3 باشند؛ CI حداقل و آخرین نسخهٔ پشتیبانی‌شده را تست کند.

## کاربر واقعاً چه می‌خواهد؟

کاربر معمول این پکیج نویسندهٔ Lexical feature نیست. او در حال تعریف یک `richText` field یا editor ریشهٔ Payload است و این پنج کار را می‌خواهد:

1. یک editor شناخته‌شده را با autocomplete انتخاب کند؛
2. یک یا دو feature را بدون بازسازی کل لیست تغییر دهد؛
3. Blocks یا feature پروژه‌ای را با type واقعی Payload اضافه کند؛
4. خطای typo، config متناقض یا duplicate feature را قبل از باز شدن Admin ببیند؛
5. پس از ارتقای پکیج، رفتار preset بدون اطلاع او تغییر نکند.

خود Payload نیز editor را با `lexicalEditor({ features })` در سطح config ریشه یا field تعریف می‌کند و `features` را به‌صورت array یا callback می‌پذیرد. callback به `defaultFeatures` و `rootFeatures` دسترسی دارد. بنابراین شکل آشنای «factory + feature extension callback» با mental model مادر هم‌راستاست و نیاز به یادگیری model دوم را کم می‌کند ([Rich Text Editor overview](https://payloadcms.com/docs/rich-text/overview)، [type منبع در Payload 3.68.5](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts#L60-L109)).

چیزهایی که کاربر دوست دارد:

- یک import و یک call site؛
- presetهای task-oriented، نه لیست featureهای مبهم؛
- autocomplete برای feature slug و option هر feature؛
- `false` برای حذف و object برای تغییر؛
- escape hatch که همان objectهای native Payload را قبول کند؛
- error با path مثل `features.heading.sizes[1]`؛
- docs با مثال‌های root editor، field editor، preset override و Blocks؛
- ثبات preset در یک major version.

چیزهایی که complexity leakage هستند و نباید در مسیر معمول دیده شوند:

- `FeatureProviderServer<any, any, any>` و dependency graph داخلی Payload؛
- `defaultFeatures` و `rootFeatures`؛
- registry/adapter registration سراسری؛
- server/client feature sanitization و import map؛
- ترتیب loader و dependency priority؛
- factoryهای جدا برای preset و custom editor؛
- merge policy متفاوت برای هر adapter؛
- AI transport، theme registry یا client serialization پیش از وجود قرارداد واقعی.

Payload custom featureها server/client boundary، importها، dependencyها و props قابل‌serialize دارند؛ انتقال این مفاهیم به DSL عمومی، abstraction را بی‌اثر می‌کند. این جزئیات باید پشت adapter یا escape hatch native بمانند ([Payload Custom Features](https://payloadcms.com/docs/rich-text/custom-features)).

## Public API پیشنهادی

### Root entry point

```ts
import {
  lexicalEditor,
  type FeatureProviderServer,
  type LexicalEditorProps,
} from "@payloadcms/richtext-lexical";

export type PayloadLexicalFeature = FeatureProviderServer<any, any, any>;

export type EditorPresetName =
  | "compact"
  | "standard"
  | "structuredContent"
  | "article"
  | "productDescription";

export type FeatureOption<TOptions = never> =
  [TOptions] extends [never]
    ? boolean
    : boolean | Readonly<TOptions>;

export type HeadingOptions = {
  sizes?: readonly ("h1" | "h2" | "h3" | "h4" | "h5" | "h6")[];
};

export type CollectionScope<TSlug extends string> =
  | { include: readonly TSlug[]; exclude?: never }
  | { include?: never; exclude: readonly TSlug[] };

export type LinkOptions = {
  collections?: CollectionScope<import("payload").CollectionSlug>;
  autoLink?: boolean;
  maxDepth?: number;
};

export type UploadOptions = {
  collections?: CollectionScope<import("payload").UploadCollectionSlug>;
  maxDepth?: number;
};

export type RelationshipOptions = {
  collections?: CollectionScope<import("payload").CollectionSlug>;
  maxDepth?: number;
};

export type EditorFeatureConfig = {
  paragraph?: FeatureOption;
  bold?: FeatureOption;
  italic?: FeatureOption;
  underline?: FeatureOption;
  strikethrough?: FeatureOption;
  heading?: FeatureOption<HeadingOptions>;
  link?: FeatureOption<LinkOptions>;
  upload?: FeatureOption<UploadOptions>;
  orderedList?: FeatureOption;
  unorderedList?: FeatureOption;
  blockquote?: FeatureOption;
  horizontalRule?: FeatureOption;
  inlineToolbar?: FeatureOption;
  fixedToolbar?: FeatureOption;
  inlineCode?: FeatureOption;
  relationship?: FeatureOption<RelationshipOptions>;
};

declare const presetBrand: unique symbol;

export type EditorPreset = {
  readonly [presetBrand]: true;
  readonly features: Readonly<EditorFeatureConfig>;
};

export type ExtendFeatures =
  | readonly PayloadLexicalFeature[]
  | ((context: {
      readonly features: readonly PayloadLexicalFeature[];
      readonly preset?: EditorPresetName;
    }) => readonly PayloadLexicalFeature[]);

type NativeEditorOptions = Readonly<
  Pick<LexicalEditorProps, "admin" | "lexical">
>;

type CommonEditorOptions = {
  readonly extendFeatures?: ExtendFeatures;
  readonly payload?: NativeEditorOptions;
};

export type CreateEditorOptions = CommonEditorOptions & (
  | {
      readonly preset: EditorPresetName | EditorPreset;
      readonly features?: Readonly<EditorFeatureConfig>;
    }
  | {
      readonly preset?: never;
      readonly features: Readonly<EditorFeatureConfig>;
    }
);

export declare function createEditor(
  options: CreateEditorOptions,
): ReturnType<typeof lexicalEditor>;

export declare function defineEditorPreset(
  definition: { readonly features: Readonly<EditorFeatureConfig> },
): EditorPreset;
```

استفاده از `any` فقط در alias feature native توجیه دارد: خود `FeaturesInput` در Payload 3.68.5 آرایهٔ `FeatureProviderServer<any, any, any>` می‌پذیرد. تلاش برای تبدیل آن به `unknown` می‌تواند providerهای typed را به‌علت variance غیرقابل‌انتساب کند. `any` نباید خارج از همین مرز upstream پخش شود ([Payload source](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts#L60-L109)).

### Advanced entry point

`@nexload-sdk/payload-editor/advanced` فقط برای tooling و تست پکیج‌های دیگر باشد:

```ts
export type ResolvedEditorDefinition = {
  readonly features: readonly PayloadLexicalFeature[];
  readonly preset?: EditorPresetName;
};

export declare function resolveEditorDefinition(
  options: CreateEditorOptions,
): ResolvedEditorDefinition;
```

`buildEditorFeatures`، `FeatureAdapter` و registry export نشوند. آن‌ها implementation detail هستند و export کردنشان سه هزینه دارد: public API بزرگ‌تر، SemVer burden، و وابسته‌شدن مصرف‌کننده به ترتیب/ساختار داخلی. `resolveEditorDefinition` یک seam read-only و هدفمند برای snapshot/tooling می‌دهد بدون اینکه registry قابل‌mutate شود.

### چرا `createPresetEditor` حذف شود؟

دو factory باعث دو workflow در docs، دو مجموعه overload و خطر drift در behavior می‌شود. preset باید فقط source تعریف باشد:

```ts
createEditor({ preset: "article" });
createEditor({ features: { paragraph: true, bold: true } });
```

هر دو باید وارد normalization و resolution واحد شوند.

## Common caller workflows

### ۱. مسیر استاندارد

```ts
import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "structuredContent",
});
```

### ۲. override یک preset

```ts
export const editor = createEditor({
  preset: "article",
  features: {
    heading: { sizes: ["h2", "h3"] },
    relationship: false,
    upload: {
      collections: { include: ["media"] },
      maxDepth: 1,
    },
  },
});
```

`CollectionScope` عمداً discriminated است. `collections: ["media"]` معلوم نمی‌کند allowlist است یا configuration map؛ در حالی‌که Payload برای Link/Upload/Relationship دو حالت انحصاری `enabledCollections` و `disabledCollections` دارد و Upload یک property متفاوت به نام `collections` برای sub-fieldها نیز دارد. DSL پیشنهادی این ambiguity را حذف می‌کند ([Upload source 3.68.5](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/features/upload/server/index.ts)، [Official Features](https://payloadcms.com/docs/rich-text/official-features)). discriminated unionها نیز به TypeScript اجازهٔ narrowing صریح می‌دهند ([TypeScript handbook](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions)).

### ۳. feature بومی Payload

```ts
import { BlocksFeature } from "@payloadcms/richtext-lexical";
import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "article",
  extendFeatures: [
    BlocksFeature({ blocks: [Callout, Gallery] }),
  ],
});
```

Blocks schema پروژه است و نباید adapter عمومی یا preset استاندارد را آلوده کند. Payload نیز Blocks و `CodeBlock` را از feature رسمی می‌سازد ([Blocks docs](https://payloadcms.com/docs/rich-text/blocks)).

### ۴. کنترل کامل ترتیب native

```ts
export const editor = createEditor({
  preset: "standard",
  extendFeatures: ({ features }) => [
    TreeViewFeature(),
    ...features,
    ProjectFeature(),
  ],
});
```

callback escape hatch نهایی است: append، prepend، remove، replace و reorder را ممکن می‌کند. چون callback وارد سطح native شده، مسئولیت dependency و compatibility featureهای custom با مصرف‌کننده است. پکیج فقط duplicate `key`، نتیجهٔ غیرآرایه‌ای و مقدار نامعتبر را بررسی می‌کند.

### ۵. preset سازمانی reusable

```ts
import {
  createEditor,
  defineEditorPreset,
} from "@nexload-sdk/payload-editor";

export const landingContent = defineEditorPreset({
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
  features: { upload: true },
});
```

`defineEditorPreset` باید copy/normalize کند و object branded برگرداند؛ registry سراسری یا `registerPreset("name", ...)` ممنوع است. global registration ترتیب import و تست‌ها را stateful می‌کند و در monorepo/SSR رفتار غیرمحلی می‌سازد.

### ۶. passthrough محدود Payload

```ts
export const editor = createEditor({
  preset: "compact",
  payload: {
    admin: { placeholder: "متن را وارد کنید…" },
    lexical: { namespace: "product-description" },
  },
});
```

Payload در `LexicalEditorProps` علاوه بر `features`، `admin` و `lexical` را می‌پذیرد. حذف این دو، مصرف‌کننده را برای placeholder، gutter یا Lexical config مجبور به bypass کل پکیج می‌کند. قراردادن آن‌ها زیر namespace صریح `payload` نشان می‌دهد semantic DSL نیستند و احتمال collision آینده را کم می‌کند ([Payload source 3.68.5](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/types.ts#L90-L109)، [overview](https://payloadcms.com/docs/rich-text/overview#customize-the-placeholder)). `payload.features` عمداً مجاز نیست؛ تنها مسیر feature native همان `extendFeatures` است.

## Preset naming و defaults

نام‌های `minimal`، `basic` و `content` تفاوت intent را خوب منتقل نمی‌کنند. قبل از 1.0 این نام‌ها قفل شوند:

| نام | قرارداد authoring |
|---|---|
| `compact` | fragment کوتاه، بدون ساختار block سنگین |
| `standard` | محتوای عمومی CMS با list/quote/toolbars |
| `structuredContent` | محتوای ساختاریافته با heading/media/separator |
| `article` | editorial/technical با inline code و relationship؛ code block فقط با extension پروژه |
| `productDescription` | توضیح محصول با دامنهٔ heading و formatting کنترل‌شده |

قواعد defaults:

- `createEditor()` بدون آرگومان ممنوع؛ یک default نامرئی با هدف استانداردسازی تناقض دارد.
- هر preset feature set کامل و صریح دارد؛ از `defaultFeatures` یا `rootFeatures` Payload ارث نمی‌برد.
- adapter defaultها versioned هستند و در docs reference table دارند.
- presetهای built-in object عمومی و قابل spread نیستند؛ کاربر با `features` override می‌کند.
- افزودن یا حذف feature در preset موجود در همان major ممنوع است، حتی اگر از نظر SemVer صرفاً additive به‌نظر برسد؛ این تغییر authoring surface و گاهی node set ذخیره‌شده را تغییر می‌دهد.
- برای رفتار جدید، preset جدید یا major release استفاده شود.

Payload صراحتاً می‌گوید حذف تمام default featureها editor خالی می‌سازد و `defaultFeatures` یک آرایهٔ opinionated است. بنابراین تکیه‌کردن preset Nexload به آن، upgrade Payload را به تغییر silent محصول تبدیل می‌کند ([Rich Text Editor overview](https://payloadcms.com/docs/rich-text/overview#extending-the-lexical-editor-with-features)، [default source 3.68.5](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/default.ts)).

## Merge semantics قفل‌شده

ترتیب merge:

```text
built-in/custom preset
  -> consumer features patch
  -> canonical adapter resolution
  -> extendFeatures array/callback
  -> duplicate/invariant validation
  -> lexicalEditor({ features, admin, lexical })
```

معنای هر state:

| override | نتیجه |
|---|---|
| property غایب یا `undefined` | مقدار base حفظ می‌شود |
| `false` | feature حذف می‌شود |
| `true` | feature با default همان adapter reset/فعال می‌شود |
| object | shallow merge روی config base؛ arrayها replace می‌شوند |
| `null` | خطای config |

چرا shallow merge؟ optionهای public باید تخت و semantic بمانند. deep merge روی array یا objectهای Payload رفتار غیرقابل‌پیش‌بینی می‌سازد و ownership referenceها را مبهم می‌کند. اگر adapter بعداً nested config لازم داشت، policy آن باید در DSL به‌صورت operation صریح طراحی شود، نه deep-merge عمومی.

مثال:

```ts
// preset: heading { sizes: ["h2", "h3", "h4"] }
features: {
  heading: { sizes: ["h2", "h3"] }, // array replacement
}
```

`true` عمداً reset است، نه «همان config preset را نگه دار». برای نگه‌داشتن base، property باید حذف شود. این تمایز امکان بازگشت صریح به adapter defaults را بدون sentinel اضافی فراهم می‌کند.

## Ordering و invariants

ترتیب built-in از object insertion order یا preset authoring order نیاید. یک `BUILT_IN_FEATURE_ORDER` private و test‌شده وجود داشته باشد. ترتیب پیشنهادی:

```text
text formats
-> paragraph/heading
-> lists
-> link/relationship
-> blockquote/upload/horizontalRule
-> toolbars
```

Payload providerها `key`، dependency، soft dependency و priority dependency دارند و loader خود Payload dependencyها را resolve می‌کند؛ Nexload نباید resolver دوم بسازد. canonical order فقط خروجی DSL را deterministic می‌کند و loader Payload همچنان مالک dependency semantics است ([FeatureProviderServer source 3.68.5](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/features/typesServer.ts), [loader source](https://github.com/payloadcms/payload/blob/v3.68.5/packages/richtext-lexical/src/lexical/config/server/loader.ts)).

invariantهای runtime:

- هر feature built-in حداکثر یک‌بار resolve شود؛
- نتیجهٔ نهایی `key` تکراری نداشته باشد؛
- `heading.sizes` non-empty و بدون duplicate باشد؛
- `maxDepth` عدد صحیح نامنفی باشد؛
- `include` و `exclude` هم‌زمان غیرممکن/نامعتبر باشند؛
- collection slugهای duplicate normalize یا reject شوند؛ ترجیح: reject برای آشکارکردن config اشتباه؛
- callback extension باید array جدید یا readonly array برگرداند؛ mutation ورودی از نظر type ممنوع باشد؛
- unknown feature slug در runtime JS reject شود؛
- adapter ناشناخته هرگز silently skip نشود.

## Error UX

خطاهای config، خطای developer هستند؛ انگلیسی، پایدار و machine-readable باشند. خطای author-facing داخل Admin می‌تواند فارسی باشد، اما آن موضوع این engine نیست.

```ts
export class PayloadEditorConfigError extends TypeError {
  readonly code:
    | "PAYLOAD_EDITOR_INVALID_CONFIG"
    | "PAYLOAD_EDITOR_UNKNOWN_PRESET"
    | "PAYLOAD_EDITOR_UNKNOWN_FEATURE"
    | "PAYLOAD_EDITOR_DUPLICATE_FEATURE";
  readonly path: string;
  readonly hint?: string;
}
```

نمونهٔ message:

```text
[PAYLOAD_EDITOR_INVALID_CONFIG] features.heading.sizes[1]:
Expected one of h1..h6; received "title".
```

قواعد:

- fail-fast هنگام اجرای `createEditor` برای validationهای مستقل از Payload config؛
- validationهای نیازمند collection config هنگام sanitize Payload انجام شوند یا به Payload واگذار شوند؛
- message شامل code، path، expected، received امن و hint کوتاه باشد؛
- provider object یا config بزرگ stringify نشود؛ ممکن است function/secret داشته باشد؛
- خطای callback custom wrap نشود مگر با `cause`؛ stack اصلی حفظ شود؛
- no warning-and-continue برای typo، duplicate یا قرارداد ناقص.

الگوی repo نیز invariantهای protected را در factory time رد می‌کند؛ `payload-fields` برای override نام/type ناسازگار throw می‌کند و hookهای مصرف‌کننده را با ترتیب صریح compose می‌کند ([slug factory](../../packages/payload-fields/src/slug/index.ts)، [date factory](../../packages/payload-fields/src/date/index.ts)، [money factory](../../packages/payload-fields/src/money/index.ts)). برای این پکیج error class ساخت‌یافته از `Error`های generic موجود بهتر است چون سطح config بزرگ‌تر و migration-sensitive است.

## TypeScript discoverability

- همهٔ config inputها `readonly` باشند تا caller بتواند `as const` بدهد و mutation ناخواسته در API ممنوع شود. TypeScript استفاده از `readonly` array/tuple را برای ورودی‌های بدون mutation مناسب می‌داند ([TypeScript 3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#improvements-for-readonlyarray-and-readonly-tuples)).
- از index signature در `EditorFeatureConfig` استفاده نشود؛ typo باید excess-property error باشد.
- `CollectionSlug` و `UploadCollectionSlug` Payload استفاده شوند تا generated types پروژه autocomplete بدهند.
- unionهای include/exclude discriminated و mutually exclusive باشند.
- public function return type صریح و بر اساس `ReturnType<typeof lexicalEditor>` باشد؛ type private و export‌نشدهٔ Payload کپی نشود.
- exampleهای docs از `satisfies` برای تعریف reusable config استفاده کنند؛ `satisfies` shape را validate می‌کند ولی inference دقیق expression را نگه می‌دارد ([TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)).
- optionهای feature JSDoc داشته باشند؛ IDE باید default، constraint و mapping معنایی را بدون بازکردن docs نشان دهد.
- overloadهای متعدد، positional argument و boolean دوم ممنوع؛ object parameter برای رشد API پایدارتر است.

نمونه:

```ts
const articleOverrides = {
  heading: { sizes: ["h2", "h3"] },
  relationship: false,
} satisfies EditorFeatureConfig;
```

## Mutability

- `createEditor` و `defineEditorPreset` از config consumer کپی بگیرند؛ هیچ object/array ورودی mutate نشود.
- تعریف preset داخلی immutable و private باشد.
- `defineEditorPreset` snapshot semantic بگیرد تا mutation بعدی caller behavior را عوض نکند.
- deep-freeze روی featureهای native یا خروجی `lexicalEditor` انجام نشود؛ Payload در sanitization providerها را می‌خواند/resolve می‌کند و freeze کردن object متعلق به upstream ریسک compatibility دارد.
- callback extension یک `readonly` view از built-ins بگیرد، اما engine نتیجه را به array تازه تبدیل کند.

`const` به‌تنهایی object را immutable نمی‌کند؛ TypeScript نیز این تفاوت را صریح بیان می‌کند ([Variable declarations](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#const-declarations)).

## Tree-shaking و dependency strategy

### تصمیم package boundary

- root export: `createEditor`، `defineEditorPreset`، error class و public types؛
- `./advanced`: resolver read-only؛
- هیچ `./internal/*` export نشود؛
- `sideEffects: false` فقط در صورتی در `package.json` ثبت شود که package واقعاً import-time side effect و CSS import نداشته باشد؛
- adapters built-in در moduleهای جدا بمانند، اما registry استاندارد به‌طور طبیعی آن‌ها را reference می‌کند؛ ادعای tree-shaking کامل registry صادق نیست.

این engine عمدتاً در Payload server config اجرا می‌شود. client featureها از طریق سازوکار feature/import map خود Payload وارد Admin می‌شوند؛ پکیج نباید componentهای client را از root import کند. custom featureهای Payload نیز server/client provider و props قابل‌serialize دارند ([Custom Features](https://payloadcms.com/docs/rich-text/custom-features#bringing-props-from-the-server-to-the-client)).

### peer dependencies

```json
{
  "peerDependencies": {
    "payload": ">=3.68.5 <4",
    "@payloadcms/richtext-lexical": ">=3.68.5 <4"
  },
  "devDependencies": {
    "payload": "3.68.5",
    "@payloadcms/richtext-lexical": "3.68.5"
  }
}
```

مصرف‌کننده باید نسخه‌های matching از `payload` و `@payloadcms/richtext-lexical` نصب کند، چون خود richtext package در 3.68.5 peer دقیق `payload: 3.68.5` دارد. npm برای plugin/host پیشنهاد می‌کند peer range تا حد امکان broad ولی واقعی باشد؛ اگر API از نسخه‌ای معرفی شده، lower bound همان نسخه و upper bound major بعدی باشد ([npm package.json peerDependencies](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#peerdependencies)). الگوی فعلی repo نیز در `payload-fields` از `>=3.68.5 <4` برای Payload و pin دقیق در dev استفاده می‌کند ([package.json](../../packages/payload-fields/package.json)).

React/ReactDOM نباید peer مستقیم این package باشند تا زمانی که source خود package آن‌ها را import نمی‌کند. peerهای transitively لازم را package مادر اعلام می‌کند. اگر capability client جدید اضافه شد، dependency strategy دوباره بررسی شود.

## Versioning و migration policy

SemVer نیازمند public API دقیق است و تغییر incompatible را major، قابلیت backward-compatible را minor و bug fix را patch می‌داند ([SemVer 2.0.0](https://semver.org/#semantic-versioning-specification-semver)). برای editor، public API فقط type/function نیست؛ preset membership، defaults، merge semantics، feature ordering observable و error codes نیز contract هستند.

قفل release:

| تغییر | release |
|---|---|
| bug در mapping که behavior مستند را restore می‌کند | patch |
| feature slug جدید، preset جدید یا option optional جدید | minor |
| deprecation با مسیر migration | minor |
| حذف/rename feature slug یا preset | major |
| تغییر merge semantics یا canonical ordering | major |
| افزودن/حذف feature از preset موجود | major |
| تغییر default option که authoring/output را عوض می‌کند | major |
| افزایش minimum Payload به‌علت استفاده از API جدید | minor با اعلان compatibility؛ اگر مصرف‌کنندهٔ پشتیبانی‌شده حذف شود، major |

SemVer توصیه می‌کند deprecation پیش از حذف در یک minor منتشر و در docs مشخص شود ([SemVer FAQ](https://semver.org/#how-should-i-handle-deprecating-functionality)). بنابراین هر rename حداقل یک minor alias deprecated، codemod یا migration table و سپس major removal داشته باشد.

Migration guide هر release باید این‌ها را بگوید:

- تغییر preset و feature matrix؛
- تغییر node support و اثر روی دادهٔ ذخیره‌شده؛
- نسخه‌های matching Payload/richtext؛
- before/after code؛
- command یا query audit برای تشخیص documentهای متأثر، اگر feature node حذف می‌شود.

## هم‌راستایی با پکیج‌های نهایی repo

`payload-fields` نشان می‌دهد convention مطلوب repo چیست:

- root API semantic و کوچک است؛ subpathها فقط برای capabilityهای مشخص export می‌شوند ([index](../../packages/payload-fields/src/index.ts)، [exports](../../packages/payload-fields/package.json));
- overrideهای native ممکن‌اند ولی invariantهای protected دوباره در انتهای merge اعمال می‌شوند ([slug factory](../../packages/payload-fields/src/slug/index.ts));
- return typeهای عمومی صریح‌اند و آرایهٔ بدون mutation با readonly tuple مدل شده است؛
- ESM/CJS/type declarations و `files` allowlist تعریف شده‌اند؛
- README quick start، behavior و migration را پوشش می‌دهد ([README](../../packages/payload-fields/README.md));
- Payload به‌عنوان host peer و minimum test‌شده در dev pin می‌شود.

تفاوت لازم: `payload-editor` نباید الگوی generic `overrides?: Partial<PayloadType>` را برای feature DSL تکرار کند. سطح Lexical featureها بزرگ، version-sensitive و دارای unionهای انحصاری است؛ `Partial` complexity Payload را مستقیم leak می‌کند. passthrough باید فقط در `payload.admin`/`payload.lexical` و `extendFeatures` native باشد.

## Docs لازم برای caller

حداقل docs مصرف‌کننده:

1. Install و جدول compatibility نسخه‌های Payload/richtext؛
2. Quick start برای root editor و field editor؛
3. preset matrix با featureهای دقیق و intended use؛
4. feature reference با default و merge behavior هر adapter؛
5. override cookbook؛
6. native extensions با Blocks و custom feature؛
7. error reference بر اساس code/path؛
8. migration/versioning؛
9. advanced resolver و محدودیت‌های آن؛
10. boundary روشن: rendering، content model، Blocks schema و AI provider خارج از package.

هر example باید copy-pasteable و بر اساس export واقعی باشد؛ این همان قاعدهٔ مستندشدهٔ repo در `AGENTS.md` است. API رسمی Payload نیز root و field-level editor و feature extension را جدا نشان می‌دهد؛ docs Nexload باید همین دو workflow را تست کند ([Payload overview](https://payloadcms.com/docs/rich-text/overview)).

## Trade-offs طراحی انعطاف‌پذیر

مزایا:

- مسیر عادی هنوز یک call ساده است؛
- API با mental model Payload هم‌جهت می‌ماند؛
- presetهای سازمانی بدون global state ساخته می‌شوند؛
- هر feature native فعلی/آینده بدون release Nexload قابل استفاده است؛
- passthrough محدود جلوی bypass کل wrapper را می‌گیرد؛
- merge و ordering قابل تست و versioning هستند.

هزینه‌ها:

- callback `extendFeatures` می‌تواند guarantee ترتیب و feature set managed را عمداً بشکند؛ این هزینهٔ escape hatch است و باید در docs «advanced ownership boundary» نامیده شود؛
- public type به `@payloadcms/richtext-lexical` وابسته است و upgradeهای upstream باید با CI matrix کنترل شوند؛
- `defineEditorPreset` یک سطح API بیشتر از طراحی حداقلی است؛ در عوض reuse را بدون export registry داخلی حل می‌کند؛
- `payload.lexical` می‌تواند theme/nodes config را تغییر دهد؛ اما حذف آن مصرف‌کننده را وادار به bypass می‌کند. namespace صریح و عدم پذیرش `features` trade-off را محدود می‌کند؛
- registry built-in به‌طور کامل tree-shake نمی‌شود؛ split engine per feature برای این package complexity بیشتری از منفعت واقعی دارد.

## مواردی که فعلاً نباید قفل شوند

این report فقط consumer surface قابل‌اثبات را قفل می‌کند. موارد زیر تا داشتن contract مستقل وارد `CreateEditorOptions` نشوند:

- AI actions؛ server/client transport و serializability هنوز interface نهایی ندارند؛
- theme capability؛ Payload همین حالا `lexical` theme config دارد و abstraction دوم بدون نیاز مشترک ارزش ندارد؛
- `code` به‌عنوان feature مستقل؛ Payload `InlineCodeFeature` دارد، اما code block از `BlocksFeature({ blocks: [CodeBlock] })` می‌آید ([Official Features](https://payloadcms.com/docs/rich-text/official-features)، [Blocks docs](https://payloadcms.com/docs/rich-text/blocks));
- global custom adapter registry؛ نیاز cross-project اثبات نشده؛
- pass-through کامل `LexicalEditorProps`؛ conflict ownership ایجاد می‌کند.

## Acceptance gates این طراحی

- Type tests برای autocomplete و rejection typo/unionهای متناقض؛
- contract tests برای هر preset و canonical order؛
- table-driven tests برای تمام merge stateها؛
- immutability tests روی config و custom preset؛
- duplicate native key و invalid callback tests؛
- exact return compatibility با `RichTextField["editor"]`؛
- smoke test root editor و field editor روی Payload minimum؛
- CI compatibility روی Payload/richtext minimum و latest matching 3.x؛
- package export smoke برای ESM، CJS و types؛
- tarball inspection برای جلوگیری از انتشار internal/source اضافی؛
- docs examples compile test.

## نتیجه

بهترین ergonomics این نیست که Payload کاملاً پنهان شود؛ بهترین ergonomics این است که ۹۰٪ مصرف‌ها semantic و پایدار باشند و ۱۰٪ نیازهای پروژه‌ای در یک seam واضح، typed و native انجام شوند. طراحی بالا این مرز را قفل می‌کند:

```text
preset/semantic config (Nexload owns)
  -> deterministic resolution (Nexload owns)
  -> native extension callback (consumer owns)
  -> Payload lexicalEditor and dependency loader (Payload owns)
```

این separation باید baseline پلن ساخت باشد.
