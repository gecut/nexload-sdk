# API Reference & Compatibility

Public API symbol reference, factory function signatures, and compatibility matrix for Payload Fields.

**Topic:** api
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `bankCardField`

```ts
bankCardField(options?: BankCardFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/bank/index.ts#L16)

### `formatJalaliDate`

```ts
formatJalaliDate(value: JalaliDateValue, options?: JalaliDateDisplayOptions) => string | null
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L11)

### `formatMoney`

```ts
formatMoney(value: number | null | undefined, currency: MoneyCurrency, display?: MoneyDisplayOptions) => string | null
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L82)

### `iranAddressField`

```ts
iranAddressField(options?: IranAddressFieldOptions) => GroupField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/address/index.ts#L17)

### `iranLandlineField`

```ts
iranLandlineField(options?: IranLandlineFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/contact/index.ts#L32)

### `iranMobileField`

```ts
iranMobileField(options?: IranMobileFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/contact/index.ts#L14)

### `jalaliDateField`

```ts
jalaliDateField(options: JalaliDateFieldOptions) => DateField
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L48)

### `jalaliDateRangeField`

```ts
jalaliDateRangeField(options?: { start?: string; end?: string; pickerAppearance?: JalaliPickerAppearance; timeZone?: string; required?: boolean; labels?: { start?: { fa: string; en: string; }; end?: { fa: string; en: string; }; }; }) => RowField
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L109)

### `legalIdField`

```ts
legalIdField(options?: LegalIdFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L34)

### `ltrTextField`

```ts
ltrTextField(options: LtrTextFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/common/index.ts#L28)

### `moneyField`

```ts
moneyField(options: MoneyFieldOptions) => NumberField
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L98)

### `nationalCodeField`

```ts
nationalCodeField(options?: NationalCodeFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L18)

### `parseMoneyToMinorUnits`

```ts
parseMoneyToMinorUnits(input: string, currency: MoneyCurrency) => number
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L56)

### `payloadFieldsPlugin`

```ts
payloadFieldsPlugin(options?: PayloadFieldsPluginOptions) => Plugin
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L89)

### `postalCodeField`

```ts
postalCodeField(options?: PostalCodeFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L50)

### `resolveCurrency`

```ts
resolveCurrency(currency: MoneyCurrency) => MoneyCurrencyDefinition
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L38)

### `shebaField`

```ts
shebaField(options?: ShebaFieldOptions) => TextField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/bank/index.ts#L32)

### `slugField`

```ts
slugField(options?: SlugFieldOptions) => SlugFieldResult
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L20)

### `sortOrderField`

```ts
sortOrderField(options?: SortOrderFieldOptions) => NumberField
```

**Exported from:** `@nexload-sdk/payload-fields`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/common/index.ts#L63)

### `toStoredJalaliInstant`

```ts
toStoredJalaliInstant(picked: { year: number; month: number; day: number; hour?: number; minute?: number; }, appearance: JalaliPickerAppearance, timeZone?: string) => string
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L32)

### `withJalaliTimestamps`

```ts
withJalaliTimestamps<T extends Field[]>(fields: T, options?: JalaliTimestampsOptions) => Field[]
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public function exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L145)

## Constants

### `IRR`

```ts
IRR: Readonly<MoneyCurrencyDefinition>
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L35)

### `IRT`

```ts
IRT: Readonly<MoneyCurrencyDefinition>
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L36)

### `formatSlug`

```ts
formatSlug(value: string) => string
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L37)

### `formatSlugHook`

```ts
formatSlugHook(options: SlugHookOptions) => FieldHook
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L39)

### `schemaFields`

```ts
schemaFields: SchemaFields
```

**Exported from:** `@nexload-sdk/payload-fields/schema`

Public constant exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/schema/index.ts#L137)

## Types

### `BankCardFieldOptions`

```ts
type BankCardFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/bank/index.ts#L14)

### `FieldOptions`

```ts
type FieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  required?: boolean;
  unique?: boolean;
  overrides?: Partial<TextField>;
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/common/index.ts#L9)

### `IranAddressFieldOptions`

```ts
type IranAddressFieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  required?: boolean;
  recipient?: boolean;
  overrides?: Partial<GroupField>;
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/address/index.ts#L9)

### `IranLandlineFieldOptions`

```ts
type IranLandlineFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/contact/index.ts#L30)

### `IranMobileFieldOptions`

```ts
type IranMobileFieldOptions = FieldOptions & {
  storage?: "national" | "e164";
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/contact/index.ts#L10)

### `JalaliDateDisplayOptions`

```ts
type JalaliDateDisplayOptions = {
  dateStyle?: "short" | "medium" | "long" | "full"
  timeStyle?: "short" | "medium"
  digits?: "persian" | "latin"
  timeZone?: string
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L4)

### `JalaliDateFieldOptions`

```ts
type JalaliDateFieldOptions = {
  name: string
  pickerAppearance?: JalaliPickerAppearance
  display?: JalaliDateDisplayOptions
  timeZone?: string
  min?: string
  max?: string
  label?: { fa: string, en: string }
  required?: boolean
  overrides?: Partial<DateField>
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L14)

### `JalaliDateValue`

```ts
type JalaliDateValue = Date | string | number | null | undefined;
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/format-date.ts#L3)

### `JalaliPickerAppearance`

```ts
type JalaliPickerAppearance
  = | "dayOnly"
    | "dayAndTime"
    | "timeOnly"
    | "monthOnly";
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/picker-types.ts#L1)

### `JalaliTimestampsOptions`

```ts
type JalaliTimestampsOptions = {
  createdAt?: boolean
  updatedAt?: boolean
  display?: JalaliDateDisplayOptions
  overrides?: { createdAt?: Partial<TextField>, updatedAt?: Partial<TextField> }
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/date`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/date/index.ts#L25)

### `LegalIdFieldOptions`

```ts
type LegalIdFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L32)

### `LtrTextFieldOptions`

```ts
type LtrTextFieldOptions = {
  name: string;
  label?: { fa: string; en: string };
  required?: boolean;
  unique?: boolean;
  monospace?: boolean;
  minLength?: number;
  maxLength?: number;
  overrides?: Partial<TextField>;
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/common/index.ts#L17)

### `MoneyCurrency`

```ts
type MoneyCurrency = "IRR" | "IRT" | MoneyCurrencyDefinition;
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L15)

### `MoneyCurrencyDefinition`

```ts
type MoneyCurrencyDefinition = {
  code: string
  label: string
  fractionDigits: number
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L10)

### `MoneyDisplayOptions`

```ts
type MoneyDisplayOptions = {
  locale?: string
  digits?: "persian" | "latin"
  grouping?: boolean
  showCurrency?: boolean
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L16)

### `MoneyFieldOptions`

```ts
type MoneyFieldOptions = {
  name: string
  currency: MoneyCurrency
  minMinorUnits?: number
  maxMinorUnits?: number
  allowNegative?: boolean
  display?: MoneyDisplayOptions
  displayCurrency?: "IRR" | "IRT"
  label?: { fa: string, en: string }
  required?: boolean
  overrides?: Partial<NumberField>
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/money`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/money/index.ts#L22)

### `NationalCodeFieldOptions`

```ts
type NationalCodeFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L16)

### `PayloadFieldsPluginOptions`

```ts
type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L12)

### `PostalCodeFieldOptions`

```ts
type PostalCodeFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/identity/index.ts#L48)

### `ShebaFieldOptions`

```ts
type ShebaFieldOptions = FieldOptions;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/bank/index.ts#L30)

### `SlugFieldOptions`

```ts
type SlugFieldOptions = {
  unique?: boolean
  name?: string
  lockName?: string
  source?: string
  generator?: string
  regenerateOnSourceChange?: boolean
  overrides?: { slug?: Partial<TextField>, lock?: Partial<CheckboxField> }
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L8)

### `SlugFieldResult`

```ts
type SlugFieldResult = readonly [TextField, CheckboxField];
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/index.ts#L18)

### `SlugGenerationAccess`

```ts
type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L11)

### `SlugGenerator`

```ts
type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L10)

### `SlugGeneratorContext`

```ts
type SlugGeneratorContext = { req: PayloadRequest };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L9)

### `SlugGeneratorInput`

```ts
type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/plugin.ts#L8)

### `SlugHookOptions`

```ts
type SlugHookOptions = {
  name: string
  lockName: string
  source: string
  regenerateOnSourceChange: boolean
};
```

**Exported from:** `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-fields/slug`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/slug/format-slug.ts#L5)

### `SortOrderFieldOptions`

```ts
type SortOrderFieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  overrides?: Partial<NumberField>;
};
```

**Exported from:** `@nexload-sdk/payload-fields`

Public type exported by @nexload-sdk/payload-fields.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/common/index.ts#L57)

***

## Exported Factories Summary

| Function | Output | Description |
|---|---|---|
| `slugField(options)` | `[TextField, CheckboxField]` | Returns `[slug, slugLock]` fields with Unicode slugifier, collision suffixing (`-2`, `-3`), and sync logic. |
| `jalaliDateField(options)` | `DateField` | Returns a Payload `date` field configured with the Jalali solar calendar Admin component and timezone stability. |
| `jalaliDateRangeField(options)` | `RowField` | Returns a paired row containing `startsAt` and `endsAt` Jalali date fields with order validation. |
| `withJalaliTimestamps(fields, options)` | `Field[]` | Appends virtual read-only `createdAtJalali` and `updatedAtJalali` fields to an existing field array. |
| `moneyField(options)` | `NumberField` | Returns an integer `number` field configured with formatted currency Admin component and cell. |
| `iranMobileField(options)` | `TextField` | Returns a `text` field validating Iranian mobile numbers (`09XXXXXXXXX` or `+989...`). |
| `iranLandlineField(options)` | `TextField` | Returns a `text` field validating Iranian landlines with province area codes. |
| `nationalCodeField(options)` | `TextField` | Returns a `text` field with Iranian national code checksum validation. |
| `legalIdField(options)` | `TextField` | Returns a `text` field with Iranian legal entity ID checksum validation. |
| `postalCodeField(options)` | `TextField` | Returns a `text` field validating 10-digit Iranian postal codes. |
| `bankCardField(options)` | `TextField` | Returns a `text` field with 16-digit bank card Luhn checksum validation. |
| `shebaField(options)` | `TextField` | Returns a `text` field with Iranian IBAN (Sheba) ISO 7064 checksum validation. |
| `ltrTextField(options)` | `TextField` | Returns a `text` field with forced LTR direction and optional monospace styling. |
| `sortOrderField(options)` | `NumberField` | Returns an indexed non-negative integer `number` field in the sidebar for sorting. |
| `iranAddressField(options)` | `GroupField` | Returns a `group` field containing province (31 Iranian provinces), city, line, postal code, and optional recipient. |
| `payloadFieldsPlugin(options)` | `Plugin` | Registers server slug generator endpoints and `beforeOperation` string money normalization. |

***

## Schema Adapter (`@nexload-sdk/payload-fields/schema`)

`schemaFields` wraps field factories into `field.native(...)` definitions for `@nexload-sdk/payload-schema`:

| Method | Target Factory | Zod Schema |
|---|---|---|
| `schemaFields.iranMobile(options)` | `iranMobileField` | `iranMobileSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.iranLandline(options)` | `iranLandlineField` | `iranLandlineSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.nationalCode(options)` | `nationalCodeField` | `nationalCodeSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.legalId(options)` | `legalIdField` | `legalIdSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.postalCode(options)` | `postalCodeField` | `postalCodeSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.bankCard(options)` | `bankCardField` | `cardNumberSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.sheba(options)` | `shebaField` | `shebaSchema` from `@nexload-sdk/persian/zod` |
| `schemaFields.ltrText(options)` | `ltrTextField` | `z.string()` with optional min/max lengths |
| `schemaFields.sortOrder(options)` | `sortOrderField` | `z.number().int().nonnegative()` |
| `schemaFields.money(options)` | `moneyField` | `z.number().int().safe()` (non-negative by default) |
| `schemaFields.jalaliDate(options)` | `jalaliDateField` | `z.iso.datetime({ offset: true })` |
| `schemaFields.slug(options)` | `slugField` | `{ slug: z.string(), slugLock: z.boolean() }` |

> Note: `iranAddressField` and `jalaliDateRangeField` are not included in `./schema` in 4.0.

***

## Compatibility Helpers

| Helper | Type | Description |
|---|---|---|
| `formatSlug` | `(value: string) => string` | Canonical slugifier alias of `slugify` from `@nexload-sdk/persian/text`. |
| `formatJalaliDate` | `(value, options) => string \| null` | Formats an ISO datetime or Date into a Jalali string. |
| `toStoredJalaliInstant` | `(picked, appearance, timeZone?) => string` | Converts picked Jalali components to an ISO instant (noon for date-only modes). |
| `formatMoney` | `(value, currency, display?) => string \| null` | Formats integer minor units into currency strings. |
| `parseMoneyToMinorUnits` | `(input, currency) => number` | Parses string or major-unit text into safe integer minor units. |
| `IRR` | `MoneyCurrencyDefinition` | Iranian Rial currency definition. |
| `IRT` | `MoneyCurrencyDefinition` | Iranian Toman currency definition. |
| `resolveCurrency` | `(currency: MoneyCurrency) => MoneyCurrencyDefinition` | Resolves string or object currency to canonical definition. |

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload 3.86.0 |
| **React / React-DOM** | `^19.0.0` | Required for Payload 3 Admin UI |
| **Module Format** | ESM only | Server and Admin Import Map safe |
| **Side Effects** | `false` | Fully tree-shakeable |
