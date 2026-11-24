# API Reference & Compatibility

Persian and Iranian utilities.

**Topic:** api
**Package:** `@nexload-sdk/persian` v0.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/persian/api/
The inventory is generated from the root and each subpath. See the [guides](../guides/) for canonical values, validation errors and runtime caveats.

## Functions

### `cardNumberSchema`

```ts
cardNumberSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L72)

### `convertMoney`

```ts
convertMoney(value: Money | null | undefined, to: CurrencyUnit, options?: { rounding?: MoneyRounding; }) => Money
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L17)

### `detectBankByCard`

```ts
detectBankByCard(input: InputValue) => BankId | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L72)

### `detectBankBySheba`

```ts
detectBankBySheba(input: InputValue) => BankId | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L117)

### `endOfJalaliMonth`

```ts
endOfJalaliMonth(date: DateInput, options?: ZoneOptions) => Date
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L287)

### `endOfJalaliYear`

```ts
endOfJalaliYear(date: DateInput, options?: ZoneOptions) => Date
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L303)

### `findProvince`

```ts
findProvince(input: string | number | null | undefined) => Province | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/geo`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/geo/index.ts#L60)

### `formatCardNumber`

```ts
formatCardNumber(input: InputValue, options?: { digits?: "persian" | "latin"; separator?: string; }) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L61)

### `formatIranMobile`

```ts
formatIranMobile(input: InputValue, options?: { digits?: "persian" | "latin"; separator?: string; }) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L39)

### `formatJalali`

```ts
formatJalali(date: DateInput | null | undefined, options?: JalaliFormatOptions) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L230)

### `formatJalaliPattern`

```ts
formatJalaliPattern(date: DateInput | null | undefined, pattern: string, options?: ZoneOptions & { digits?: "persian" | "latin"; }) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L193)

### `formatMoney`

```ts
formatMoney(value: Money | null | undefined, options?: MoneyFormatOptions) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L51)

### `formatNumber`

```ts
formatNumber(value: string | number | null | undefined, options?: NumberFormatOptions) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/digits`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/digits/index.ts#L48)

### `formatRelativeTime`

```ts
formatRelativeTime(date: DateInput | null | undefined, options?: ZoneOptions & { now?: DateInput; digits?: "persian" | "latin"; }) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/relative`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/relative/index.ts#L8)

### `formatSheba`

```ts
formatSheba(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L112)

### `fromJalali`

```ts
fromJalali(parts: JalaliParts | null | undefined, options?: ZoneOptions) => Date
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L154)

### `getBank`

```ts
getBank(id: BankId) => (typeof IRAN_BANKS)[number]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L186)

### `gregorianToJalali`

```ts
gregorianToJalali(year: number, month: number, day: number) => CalendarDate
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L123)

### `iranLandlineSchema`

```ts
iranLandlineSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L69)

### `iranMobileSchema`

```ts
iranMobileSchema(options?: Options & { format?: "national" | "e164"; }) => z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L49)

### `isJalaliLeapYear`

```ts
isJalaliLeapYear(year: number) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L81)

### `isValidCardNumber`

```ts
isValidCardNumber(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L58)

### `isValidIranLandline`

```ts
isValidIranLandline(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L135)

### `isValidIranMobile`

```ts
isValidIranMobile(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L31)

### `isValidJalaliDate`

```ts
isValidJalaliDate(year: number, month: number, day: number) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L93)

### `isValidLegalId`

```ts
isValidLegalId(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L96)

### `isValidNationalCode`

```ts
isValidNationalCode(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L70)

### `isValidPostalCode`

```ts
isValidPostalCode(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L115)

### `isValidSheba`

```ts
isValidSheba(input: InputValue) => boolean
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L109)

### `jalaliDateSchema`

```ts
jalaliDateSchema(options?: Options & { time?: string; timeZone?: string; }) => z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L78)

### `jalaliMonthLength`

```ts
jalaliMonthLength(year: number, month: number) => number
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L86)

### `jalaliToGregorian`

```ts
jalaliToGregorian(year: number, month: number, day: number) => CalendarDate
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L112)

### `legalIdSchema`

```ts
legalIdSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L63)

### `money`

```ts
money(amount: number, unit: CurrencyUnit) => Money
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L12)

### `moneySchema`

```ts
moneySchema(unit: CurrencyUnit, options?: Options) => z.ZodPipe<z.ZodNumber, z.ZodTransform<Readonly<{ amount: number; unit: CurrencyUnit; }>, number>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L96)

### `nationalCodeSchema`

```ts
nationalCodeSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L60)

### `normalizeCardNumber`

```ts
normalizeCardNumber(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L53)

### `normalizeIranLandline`

```ts
normalizeIranLandline(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L130)

### `normalizeIranMobile`

```ts
normalizeIranMobile(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L26)

### `normalizeLegalId`

```ts
normalizeLegalId(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L91)

### `normalizeNationalCode`

```ts
normalizeNationalCode(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L65)

### `normalizePersianLetters`

```ts
normalizePersianLetters(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/index.ts#L3)

### `normalizePersianText`

```ts
normalizePersianText(input: string | number | null | undefined, options?: { digits?: "keep" | "latin" | "persian"; }) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/index.ts#L15)

### `normalizePostalCode`

```ts
normalizePostalCode(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L110)

### `normalizeSheba`

```ts
normalizeSheba(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L104)

### `parseJalaliDate`

```ts
parseJalaliDate(input: string | number | null | undefined, options?: ZoneOptions & { time?: string; }) => Date | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L249)

### `parseMoney`

```ts
parseMoney(input: string | number | null | undefined, unit: CurrencyUnit) => Money | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L33)

### `parseNumber`

```ts
parseNumber(input: string | number | null | undefined) => number | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/digits`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/digits/index.ts#L11)

### `postalCodeSchema`

```ts
postalCodeSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L66)

### `removeDiacritics`

```ts
removeDiacritics(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/index.ts#L12)

### `shebaSchema`

```ts
shebaSchema(options?: Options) => z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>
```

**Exported from:** `@nexload-sdk/persian/zod`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/zod/index.ts#L75)

### `slugify`

```ts
slugify(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/slugify.ts#L2)

### `startOfJalaliMonth`

```ts
startOfJalaliMonth(date: DateInput, options?: ZoneOptions) => Date
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L273)

### `startOfJalaliYear`

```ts
startOfJalaliYear(date: DateInput, options?: ZoneOptions) => Date
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L295)

### `stripInvisible`

```ts
stripInvisible(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/index.ts#L6)

### `toE164Mobile`

```ts
toE164Mobile(input: InputValue) => string | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L34)

### `toEnglishDigits`

```ts
toEnglishDigits(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/digits`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/digits/index.ts#L1)

### `toInputString`

```ts
toInputString(input: InputValue) => string
```

**Exported from:** `@nexload-sdk/persian`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/shared/validation.ts#L5)

### `toJalali`

```ts
toJalali(input: DateInput, options?: ZoneOptions) => JalaliDateTime
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L135)

### `toPersianDigits`

```ts
toPersianDigits(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/digits`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/digits/index.ts#L6)

### `toSearchKey`

```ts
toSearchKey(input: string | number | null | undefined) => string
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/text`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/text/index.ts#L30)

### `toValidDate`

```ts
toValidDate(input: DateInput | null | undefined, options?: ZoneOptions) => Date | null
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L73)

### `validateCardNumber`

```ts
validateCardNumber(input: InputValue) => Validation<string, CardErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L30)

### `validateIranLandline`

```ts
validateIranLandline(input: InputValue) => Validation<string, LandlineErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L118)

### `validateIranMobile`

```ts
validateIranMobile(input: InputValue) => Validation<string, MobileErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L12)

### `validateLegalId`

```ts
validateLegalId(input: InputValue) => Validation<string, LegalIdErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L73)

### `validateNationalCode`

```ts
validateNationalCode(input: InputValue) => Validation<string, NationalCodeErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L47)

### `validatePostalCode`

```ts
validatePostalCode(input: InputValue) => Validation<string, PostalCodeErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L99)

### `validateSheba`

```ts
validateSheba(input: InputValue) => Validation<string, ShebaErrorReason>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public function exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L85)

## Constants

### `BANK_IDS`

```ts
BANK_IDS: readonly ["central-bank", "industry-mine", "mellat", "refah", "maskan", "sepah", "keshavarzi", "melli", "tejarat", "saderat", "export-development", "post-bank", "tosee-taavon", "tosee", "ghavamin", "karafarin", "parsian", "eghtesad-novin", "saman", "blu", "pasargad", "sarmayeh", "sina", "mehr-iran", "shahr", "ayandeh", "ansar", "gardeshgari", "hekmat-iranian", "dey", "iran-zamin", "resalat", "kosar", "melal", "middle-east", "mehr-eghtesad", "noor", "iran-venezuela"]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L25)

### `CARD_BINS`

```ts
CARD_BINS: Readonly<Record<string, "central-bank" | "industry-mine" | "mellat" | "refah" | "maskan" | "sepah" | "keshavarzi" | "melli" | "tejarat" | "saderat" | "export-development" | "post-bank" | "tosee-taavon" | "tosee" | "ghavamin" | "karafarin" | "parsian" | "eghtesad-novin" | "saman" | "blu" | "pasargad" | "sarmayeh" | "sina" | "mehr-iran" | "shahr" | "ayandeh" | "ansar" | "gardeshgari" | "hekmat-iranian" | "dey" | "iran-zamin" | "resalat" | "kosar" | "melal" | "middle-east" | "mehr-eghtesad" | "noor" | "iran-venezuela">>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L194)

### `CARD_ERROR_MESSAGES_FA`

```ts
CARD_ERROR_MESSAGES_FA: Readonly<Record<CardErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L12)

### `CURRENCY_LABELS_FA`

```ts
CURRENCY_LABELS_FA: Readonly<Record<CurrencyUnit, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L5)

### `IRAN_BANKS`

```ts
IRAN_BANKS: readonly { id: BankId; nameFa: string; nameEn: string; mergedInto?: BankId; }[]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L66)

### `IRAN_PROVINCES`

```ts
IRAN_PROVINCES: readonly [{ readonly code: "tehran"; readonly nameFa: "تهران"; readonly nameEn: "Tehran"; }, { readonly code: "alborz"; readonly nameFa: "البرز"; readonly nameEn: "Alborz"; }, { readonly code: "isfahan"; readonly nameFa: "اصفهان"; readonly nameEn: "Isfahan"; }, { readonly code: "fars"; readonly nameFa: "فارس"; readonly nameEn: "Fars"; }, { readonly code: "khorasan-razavi"; readonly nameFa: "خراسان رضوی"; readonly nameEn: "Razavi Khorasan"; }, { readonly code: "east-azerbaijan"; readonly nameFa: "آذربایجان شرقی"; readonly nameEn: "East Azerbaijan"; }, { readonly code: "west-azerbaijan"; readonly nameFa: "آذربایجان غربی"; readonly nameEn: "West Azerbaijan"; }, { readonly code: "ardabil"; readonly nameFa: "اردبیل"; readonly nameEn: "Ardabil"; }, { readonly code: "gilan"; readonly nameFa: "گیلان"; readonly nameEn: "Gilan"; }, { readonly code: "mazandaran"; readonly nameFa: "مازندران"; readonly nameEn: "Mazandaran"; }, { readonly code: "golestan"; readonly nameFa: "گلستان"; readonly nameEn: "Golestan"; }, { readonly code: "qazvin"; readonly nameFa: "قزوین"; readonly nameEn: "Qazvin"; }, { readonly code: "zanjan"; readonly nameFa: "زنجان"; readonly nameEn: "Zanjan"; }, { readonly code: "qom"; readonly nameFa: "قم"; readonly nameEn: "Qom"; }, { readonly code: "markazi"; readonly nameFa: "مرکزی"; readonly nameEn: "Markazi"; }, { readonly code: "hamadan"; readonly nameFa: "همدان"; readonly nameEn: "Hamadan"; }, { readonly code: "kurdistan"; readonly nameFa: "کردستان"; readonly nameEn: "Kurdistan"; }, { readonly code: "kermanshah"; readonly nameFa: "کرمانشاه"; readonly nameEn: "Kermanshah"; }, { readonly code: "ilam"; readonly nameFa: "ایلام"; readonly nameEn: "Ilam"; }, { readonly code: "lorestan"; readonly nameFa: "لرستان"; readonly nameEn: "Lorestan"; }, { readonly code: "khuzestan"; readonly nameFa: "خوزستان"; readonly nameEn: "Khuzestan"; }, { readonly code: "chaharmahal-bakhtiari"; readonly nameFa: "چهارمحال و بختیاری"; readonly nameEn: "Chaharmahal and Bakhtiari"; }, { readonly code: "kohgiluyeh-boyer-ahmad"; readonly nameFa: "کهگیلویه و بویراحمد"; readonly nameEn: "Kohgiluyeh and Boyer-Ahmad"; }, { readonly code: "bushehr"; readonly nameFa: "بوشهر"; readonly nameEn: "Bushehr"; }, { readonly code: "hormozgan"; readonly nameFa: "هرمزگان"; readonly nameEn: "Hormozgan"; }, { readonly code: "kerman"; readonly nameFa: "کرمان"; readonly nameEn: "Kerman"; }, { readonly code: "yazd"; readonly nameFa: "یزد"; readonly nameEn: "Yazd"; }, { readonly code: "semnan"; readonly nameFa: "سمنان"; readonly nameEn: "Semnan"; }, { readonly code: "south-khorasan"; readonly nameFa: "خراسان جنوبی"; readonly nameEn: "South Khorasan"; }, { readonly code: "north-khorasan"; readonly nameFa: "خراسان شمالی"; readonly nameEn: "North Khorasan"; }, { readonly code: "sistan-baluchestan"; readonly nameFa: "سیستان و بلوچستان"; readonly nameEn: "Sistan and Baluchestan"; }]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/geo`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/geo/index.ts#L2)

### `JALALI_MONTH_NAMES_FA`

```ts
JALALI_MONTH_NAMES_FA: readonly ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L11)

### `JALALI_WEEKDAY_NAMES_FA`

```ts
JALALI_WEEKDAY_NAMES_FA: readonly ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L25)

### `LANDLINE_ERROR_MESSAGES_FA`

```ts
LANDLINE_ERROR_MESSAGES_FA: Readonly<Record<LandlineErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L38)

### `LEGAL_ID_ERROR_MESSAGES_FA`

```ts
LEGAL_ID_ERROR_MESSAGES_FA: Readonly<Record<LegalIdErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L24)

### `MOBILE_ERROR_MESSAGES_FA`

```ts
MOBILE_ERROR_MESSAGES_FA: Readonly<Record<MobileErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L9)

### `NATIONAL_CODE_ERROR_MESSAGES_FA`

```ts
NATIONAL_CODE_ERROR_MESSAGES_FA: Readonly<Record<NationalCodeErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L16)

### `POSTAL_CODE_ERROR_MESSAGES_FA`

```ts
POSTAL_CODE_ERROR_MESSAGES_FA: Readonly<Record<PostalCodeErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L31)

### `PROVINCE_CODES`

```ts
PROVINCE_CODES: readonly ("tehran" | "alborz" | "isfahan" | "fars" | "khorasan-razavi" | "east-azerbaijan" | "west-azerbaijan" | "ardabil" | "gilan" | "mazandaran" | "golestan" | "qazvin" | "zanjan" | "qom" | "markazi" | "hamadan" | "kurdistan" | "kermanshah" | "ilam" | "lorestan" | "khuzestan" | "chaharmahal-bakhtiari" | "kohgiluyeh-boyer-ahmad" | "bushehr" | "hormozgan" | "kerman" | "yazd" | "semnan" | "south-khorasan" | "north-khorasan" | "sistan-baluchestan")[]
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/geo`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/geo/index.ts#L57)

### `SHEBA_CODES`

```ts
SHEBA_CODES: Readonly<Record<string, "central-bank" | "industry-mine" | "mellat" | "refah" | "maskan" | "sepah" | "keshavarzi" | "melli" | "tejarat" | "saderat" | "export-development" | "post-bank" | "tosee-taavon" | "tosee" | "ghavamin" | "karafarin" | "parsian" | "eghtesad-novin" | "saman" | "blu" | "pasargad" | "sarmayeh" | "sina" | "mehr-iran" | "shahr" | "ayandeh" | "ansar" | "gardeshgari" | "hekmat-iranian" | "dey" | "iran-zamin" | "resalat" | "kosar" | "melal" | "middle-east" | "mehr-eghtesad" | "noor" | "iran-venezuela">>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L242)

### `SHEBA_ERROR_MESSAGES_FA`

```ts
SHEBA_ERROR_MESSAGES_FA: Readonly<Record<CardErrorReason, string>>
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L18)

### `TEHRAN_TIME_ZONE`

```ts
TEHRAN_TIME_ZONE: "Asia/Tehran"
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public constant exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L10)

## Types

### `BankId`

```ts
type BankId = (typeof BANK_IDS)[number];
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/banks.ts#L65)

### `CalendarDate`

```ts
type CalendarDate = { year: number; month: number; day: number };
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/calendar.ts#L76)

### `CardErrorReason`

```ts
type CardErrorReason = "empty" | "invalid_format" | "invalid_checksum";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L10)

### `CurrencyUnit`

```ts
type CurrencyUnit = "IRR" | "IRT";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L2)

### `DateInput`

```ts
type DateInput = Date | string | number;
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L34)

### `InputValue`

```ts
type InputValue = string | number | null | undefined;
```

**Exported from:** `@nexload-sdk/persian`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/shared/validation.ts#L4)

### `JalaliDateTime`

```ts
type JalaliDateTime = CalendarDate & {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  weekday: number;
};
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L42)

### `JalaliFormat`

```ts
type JalaliFormat = "short" | "medium" | "long" | "full";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L187)

### `JalaliFormatOptions`

```ts
type JalaliFormatOptions = ZoneOptions & {
  format?: JalaliFormat;
  time?: "none" | "short" | "medium";
  digits?: "persian" | "latin";
};
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L188)

### `JalaliParts`

```ts
type JalaliParts = CalendarDate & {
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
};
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L36)

### `LandlineErrorReason`

```ts
type LandlineErrorReason = "empty" | "invalid";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L15)

### `LegalIdErrorReason`

```ts
type LegalIdErrorReason = Common | "invalid_checksum";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L13)

### `MobileErrorReason`

```ts
type MobileErrorReason = "empty" | "invalid";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/mobile`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/mobile/index.ts#L8)

### `Money`

```ts
type Money = Readonly<{ amount: number; unit: CurrencyUnit }>;
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L3)

### `MoneyFormatOptions`

```ts
type MoneyFormatOptions = {
  digits?: "persian" | "latin";
  showUnit?: boolean;
  displayUnit?: CurrencyUnit;
  rounding?: MoneyRounding;
  zeroLabel?: string;
};
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L44)

### `MoneyRounding`

```ts
type MoneyRounding = "error" | "floor" | "round" | "ceil";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/money`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/money/index.ts#L4)

### `NationalCodeErrorReason`

```ts
type NationalCodeErrorReason =
  | Common
  | "repeated_digits"
  | "invalid_checksum";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L9)

### `NumberFormatOptions`

```ts
type NumberFormatOptions = {
  digits?: "persian" | "latin";
  grouping?: boolean;
  fractionDigits?: number;
};
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/digits`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/digits/index.ts#L27)

### `PostalCodeErrorReason`

```ts
type PostalCodeErrorReason = Common | "repeated_digits";
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/identity`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/identity/index.ts#L14)

### `Province`

```ts
type Province = { code: ProvinceCode; nameFa: string; nameEn: string };
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/geo`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/geo/index.ts#L56)

### `ProvinceCode`

```ts
type ProvinceCode = (typeof IRAN_PROVINCES)[number]["code"];
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/geo`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/geo/index.ts#L55)

### `ShebaErrorReason`

```ts
type ShebaErrorReason = CardErrorReason;
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/bank`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/bank/index.ts#L11)

### `Validation`

```ts
type Validation<TValue, TReason extends string> =
  | { ok: true; value: TValue }
  | { ok: false; reason: TReason };
```

**Exported from:** `@nexload-sdk/persian`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/shared/validation.ts#L1)

### `ZoneOptions`

```ts
type ZoneOptions = { timeZone?: string };
```

**Exported from:** `@nexload-sdk/persian`, `@nexload-sdk/persian/date`

Public type exported by @nexload-sdk/persian.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/date/index.ts#L35)
