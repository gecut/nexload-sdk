# API reference

Public exports for Payload Fields 3.1.0.

**Topic:** api
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/api/
## Functions

### `formatJalaliDate`

```ts
formatJalaliDate(value: JalaliDateValue, options?: JalaliDateDisplayOptions) => string | null
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L9)

### `formatMoney`

```ts
formatMoney(value: number | null | undefined, currency: MoneyCurrency, display?: MoneyDisplayOptions) => string | null
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L78)

### `formatSlug`

```ts
formatSlug(value: string) => string
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L45)

### `jalaliDateField`

```ts
jalaliDateField(options: JalaliDateFieldOptions) => DateField
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L21)

### `moneyField`

```ts
moneyField(options: MoneyFieldOptions) => NumberField
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L94)

### `parseMoneyToMinorUnits`

```ts
parseMoneyToMinorUnits(input: string, currency: MoneyCurrency) => number
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L56)

### `payloadFieldsPlugin`

```ts
payloadFieldsPlugin(options?: PayloadFieldsPluginOptions) => Plugin
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L19)

### `resolveCurrency`

```ts
resolveCurrency(currency: MoneyCurrency) => MoneyCurrencyDefinition
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L28)

### `slugField`

```ts
slugField(options?: SlugFieldOptions) => SlugFieldResult
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L16)

### `withJalaliTimestamps`

```ts
withJalaliTimestamps<T extends Field[]>(fields: T, options?: JalaliTimestampsOptions) => Field[]
```

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L53)

## Constants

### `formatSlugHook`

```ts
formatSlugHook(options: SlugHookOptions) => FieldHook
```

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L70)

### `IRR`

```ts
IRR: Readonly<MoneyCurrencyDefinition>
```

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L25)

### `IRT`

```ts
IRT: Readonly<MoneyCurrencyDefinition>
```

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L26)

## Types

### `JalaliDateDisplayOptions`

```ts
type JalaliDateDisplayOptions = {
  dateStyle?: "short" | "medium" | "long" | "full"
  timeStyle?: "short" | "medium"
  digits?: "persian" | "latin"
  timeZone?: string
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L2)

### `JalaliDateFieldOptions`

```ts
type JalaliDateFieldOptions = {
  name: string
  pickerAppearance?: JalaliPickerAppearance
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: Partial<DateField>
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L8)

### `JalaliDateValue`

```ts
type JalaliDateValue = Date | string | number | null | undefined;
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L1)

### `JalaliPickerAppearance`

```ts
type JalaliPickerAppearance
  = | "dayOnly"
    | "dayAndTime"
    | "timeOnly"
    | "monthOnly";
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/picker-types.ts#L1)

### `JalaliTimestampsOptions`

```ts
type JalaliTimestampsOptions = {
  createdAt?: boolean
  updatedAt?: boolean
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: { createdAt?: Partial<TextField>, updatedAt?: Partial<TextField> }
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L14)

### `MoneyCurrency`

```ts
type MoneyCurrency = "IRR" | "IRT" | MoneyCurrencyDefinition;
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L8)

### `MoneyCurrencyDefinition`

```ts
type MoneyCurrencyDefinition = {
  code: string
  label: string
  fractionDigits: number
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L3)

### `MoneyDisplayOptions`

```ts
type MoneyDisplayOptions = {
  locale?: string
  digits?: "persian" | "latin"
  grouping?: boolean
  showCurrency?: boolean
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L9)

### `MoneyFieldOptions`

```ts
type MoneyFieldOptions = {
  name: string
  currency: MoneyCurrency
  minMinorUnits?: number
  maxMinorUnits?: number
  allowNegative?: boolean
  display?: MoneyDisplayOptions
  overrides?: Partial<NumberField>
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L15)

### `PayloadFieldsPluginOptions`

```ts
type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L9)

### `SlugFieldOptions`

```ts
type SlugFieldOptions = {
  name?: string
  lockName?: string
  source?: string
  generator?: string
  regenerateOnSourceChange?: boolean
  overrides?: { slug?: Partial<TextField>, lock?: Partial<CheckboxField> }
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L5)

### `SlugFieldResult`

```ts
type SlugFieldResult = readonly [TextField, CheckboxField];
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L14)

### `SlugGenerationAccess`

```ts
type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L8)

### `SlugGenerator`

```ts
type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L7)

### `SlugGeneratorContext`

```ts
type SlugGeneratorContext = { req: PayloadRequest };
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L6)

### `SlugGeneratorInput`

```ts
type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L5)

### `SlugHookOptions`

```ts
type SlugHookOptions = {
  name: string
  lockName: string
  source: string
  regenerateOnSourceChange: boolean
};
```

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L3)

## Field factories

* `slugField(options?)` returns `[TextField, CheckboxField]`; spread it into `fields`.
* `jalaliDateField(options)` returns one native Payload date field.
* `withJalaliTimestamps(fields, options?)` returns a new field array with virtual Jalali timestamp fields.
* `moneyField(options)` returns one native number field with safe-integer validation.
* `payloadFieldsPlugin(options?)` returns a Payload plugin and adds the slug-generator endpoint.

## Pure helpers and constants

* `formatSlug` and `formatSlugHook` share slug normalization.
* `formatJalaliDate` formats date-like input or returns `null`.
* `parseMoneyToMinorUnits`, `formatMoney`, and `resolveCurrency` own money conversion and presentation.
* `IRR` and `IRT` are frozen zero-fraction currency definitions.

Public option and value types are exported from the root and semantic subpaths. Import Admin components only through the package's declared `./admin/*` subpaths, normally via Payload's Import Map.

## Failure model

Factory configuration errors throw synchronously. Field validation returns Payload validation strings. Pure money parsers throw `TypeError` for malformed input and `RangeError` for precision or safe-integer violations. The plugin endpoint returns structured HTTP failures with codes from `PAYLOAD_FIELDS_UNAUTHENTICATED` through `PAYLOAD_FIELDS_GENERATION_FAILED`.

See the [source entrypoint](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/index.ts) for the current export surface.
