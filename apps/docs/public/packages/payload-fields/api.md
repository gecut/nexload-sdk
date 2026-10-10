# API Reference & Compatibility

Public API symbol reference, factory function signatures, and compatibility matrix for Payload Fields.

**Topic:** api
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `formatJalaliDate`

```ts
formatJalaliDate(value: JalaliDateValue, options?: JalaliDateDisplayOptions) => string | null
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/format-date.ts#L9)

### `formatMoney`

```ts
formatMoney(value: number | null | undefined, currency: MoneyCurrency, display?: MoneyDisplayOptions) => string | null
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L85)

### `formatSlug`

```ts
formatSlug(value: string) => string
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/format-slug.ts#L48)

### `jalaliDateField`

```ts
jalaliDateField(options: JalaliDateFieldOptions) => DateField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/index.ts#L22)

### `moneyField`

```ts
moneyField(options: MoneyFieldOptions) => NumberField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L102)

### `parseMoneyToMinorUnits`

```ts
parseMoneyToMinorUnits(input: string, currency: MoneyCurrency) => number
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L59)

### `payloadFieldsPlugin`

```ts
payloadFieldsPlugin(options?: PayloadFieldsPluginOptions) => Plugin
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L19)

### `resolveCurrency`

```ts
resolveCurrency(currency: MoneyCurrency) => MoneyCurrencyDefinition
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L28)

### `slugField`

```ts
slugField(options?: SlugFieldOptions) => SlugFieldResult
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/index.ts#L16)

### `withJalaliTimestamps`

```ts
withJalaliTimestamps<T extends Field[]>(fields: T, options?: JalaliTimestampsOptions) => Field[]
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/index.ts#L56)

## Constants

### `IRR`

```ts
IRR: Readonly<MoneyCurrencyDefinition>
```

**Exported from:** `@nexload-sdk/payload-fields`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L25)

### `IRT`

```ts
IRT: Readonly<MoneyCurrencyDefinition>
```

**Exported from:** `@nexload-sdk/payload-fields`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L26)

### `formatSlugHook`

```ts
formatSlugHook(options: SlugHookOptions) => FieldHook
```

**Exported from:** `@nexload-sdk/payload-fields`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/format-slug.ts#L73)

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

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/format-date.ts#L2)

### `JalaliDateFieldOptions`

```ts
type JalaliDateFieldOptions = {
  name: string
  pickerAppearance?: JalaliPickerAppearance
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: Partial<DateField>
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/index.ts#L9)

### `JalaliDateValue`

```ts
type JalaliDateValue = Date | string | number | null | undefined;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/format-date.ts#L1)

### `JalaliPickerAppearance`

```ts
type JalaliPickerAppearance
  = | "dayOnly"
    | "dayAndTime"
    | "timeOnly"
    | "monthOnly";
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/picker-types.ts#L1)

### `JalaliTimestampsOptions`

```ts
type JalaliTimestampsOptions = {
  createdAt?: boolean
  updatedAt?: boolean
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: { createdAt?: Partial<TextField>, updatedAt?: Partial<TextField> }
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/date/index.ts#L15)

### `MoneyCurrency`

```ts
type MoneyCurrency = "IRR" | "IRT" | MoneyCurrencyDefinition;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L8)

### `MoneyCurrencyDefinition`

```ts
type MoneyCurrencyDefinition = {
  code: string
  label: string
  fractionDigits: number
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L3)

### `MoneyDisplayOptions`

```ts
type MoneyDisplayOptions = {
  locale?: string
  digits?: "persian" | "latin"
  grouping?: boolean
  showCurrency?: boolean
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L9)

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

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/money/index.ts#L15)

### `PayloadFieldsPluginOptions`

```ts
type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L9)

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

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/index.ts#L5)

### `SlugFieldResult`

```ts
type SlugFieldResult = readonly [TextField, CheckboxField];
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/index.ts#L14)

### `SlugGenerationAccess`

```ts
type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L8)

### `SlugGenerator`

```ts
type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L7)

### `SlugGeneratorContext`

```ts
type SlugGeneratorContext = { req: PayloadRequest };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L6)

### `SlugGeneratorInput`

```ts
type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/plugin.ts#L5)

### `SlugHookOptions`

```ts
type SlugHookOptions = {
  name: string
  lockName: string
  source: string
  regenerateOnSourceChange: boolean
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/refactoring/payload-fields/src/slug/format-slug.ts#L3)

***

## Exported Factories Summary

| Function | Output | Description |
|---|---|---|
| `slugField(options)` | `[Field, Field]` | Returns `[slug, slugLock]` fields configured with Unicode slugifier and sync logic. |
| `jalaliDateField(options)` | `DateField` | Returns a Payload `date` field configured with the Jalali solar calendar Admin component. |
| `moneyField(options)` | `NumberField` | Returns an integer `number` field configured with formatted currency Admin component. |
| `payloadFieldsPlugin(options)` | `Plugin` | Registers custom server-side slug generator REST endpoints. |

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload 3.86.0 |
| **React / React-DOM** | `^19.0.0` | Required for Payload 3 Admin UI |
| **Module Format** | ESM only | Server and Admin Import Map safe |
| **Side Effects** | `false` | Fully tree-shakeable |
