# @nexload-sdk/persian

**Zero-dependency Persian and Iranian utilities for digits, text, identity, banking, money, Jalali dates, and provinces.**

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/persian)](https://www.npmjs.com/package/@nexload-sdk/persian)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node | Bun | Edge | Browser](https://img.shields.io/badge/runtime-Node%20%7C%20Bun%20%7C%20Edge%20%7C%20Browser-lightgrey.svg)

> [!IMPORTANT]
> Version 1.0.0 is pending initial release in `.changeset/persian-v1.md`. Core utilities have zero runtime dependencies; the optional `./zod` subpath requires Zod `>=4.1.0 <5.0.0`.

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/persian` is an isomorphic toolkit for normalizing, validating, and formatting Persian text and Iranian domain values (digits, mobile and landline numbers, national codes, legal IDs, postal codes, bank cards, Sheba/IBAN, IRR/IRT money, Jalali dates, relative time, and Iranian provinces). It solves recurring localization bugs caused by mixed Persian/Arabic/Latin characters, invisible Unicode marks, floating-point currency math, and browser `Intl` calendar inconsistencies. It is for frontend forms, BFF APIs, and CMS backends serving Iranian users.

What it is not:

- Not a React UI component library or datepicker widget (see `@nexload-sdk/payload-fields` for Payload Admin UI).
- Not a city/county database; `geo` provides the 31 Iranian provinces only.
- Not a live banking or KYC verification service; card and Sheba checks validate format, checksums, and researched BIN/code tables offline.

## Philosophy

- **Normalize, store canonical, format on output:** Validators accept messy user input (Persian/Arabic digits, spaces, dashes, invisible characters) and emit strict ASCII canonical forms for storage.
- **Zero-dependency core:** Every subpath except `./zod` ships with zero runtime dependencies so bundles stay small in browsers and Edge runtimes.
- **Deterministic Jalali math:** Calendar conversions use pure arithmetic rather than `Intl` Persian calendar implementations, avoiding runtime/locale drift.
- **Explicit error reasons:** Validators return `{ ok: true, value } | { ok: false, reason }` paired with Persian message maps instead of throwing on bad user input.

## Install

```bash
pnpm add @nexload-sdk/persian
# or
npm install @nexload-sdk/persian
# or
yarn add @nexload-sdk/persian
# or
bun add @nexload-sdk/persian
```

If you use the `@nexload-sdk/persian/zod` subpath:

```bash
pnpm add zod
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `zod` | `>=4.1.0 <5.0.0` | Optional (required only for `@nexload-sdk/persian/zod`) |

## Quick start

```ts
import { formatIranMobile, validateIranMobile } from "@nexload-sdk/persian/mobile";

const result = validateIranMobile("۰۹۱۲۳۴۵۶۷۸۹");

if (result.ok) {
  const canonical = result.value; // "09123456789"
  const display = formatIranMobile(canonical); // "0912 345 6789"
  console.log(canonical, display);
}
```

## Usage

### Digits and numbers

```ts
import { formatNumber, parseNumber } from "@nexload-sdk/persian/digits";

const amount = parseNumber("۱۲٬۳۴۵"); // 12345
const display = formatNumber(amount); // "۱۲٬۳۴۵"
```

`formatNumber` accepts finite numbers with absolute value below `1e21`; strings are parsed via `parseNumber`. Invalid input throws `RangeError`.

### Text normalization and slugs

```ts
import { normalizePersianText, slugify, toSearchKey } from "@nexload-sdk/persian/text";

const text = normalizePersianText("كالا ۱۲۳"); // "کالا ۱۲۳"
const key = toSearchKey(text); // "کالا 123"
const slug = slugify("کتاب فارسی"); // "کتاب-فارسی"
```

### Mobile and identity

```ts
import { toE164Mobile, validateIranMobile } from "@nexload-sdk/persian/mobile";
import { normalizePostalCode, validateNationalCode } from "@nexload-sdk/persian/identity";

const mobile = validateIranMobile("۰۹۱۲۳۴۵۶۷۸۹"); // { ok: true, value: "09123456789" }
const e164 = toE164Mobile("۰۹۱۲۳۴۵۶۷۸۹"); // "+989123456789"
const nationalCode = validateNationalCode("۰۰۸۴۵۷۵۹۴۸");
const postalCode = normalizePostalCode("۱۲۳۴۵۶۷۸۹۰");
```

### Bank cards and Sheba

```ts
import { detectBankByCard, validateCardNumber, validateSheba } from "@nexload-sdk/persian/bank";

const card = validateCardNumber("۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸");
const bank = detectBankByCard("۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸");
const sheba = validateSheba("IR820540102680020817909002");
```

Sheba check digits must be 02–98. Bank detection is best-effort researched data; `detectBankByCard` and `detectBankBySheba` return `null` for unknown or unresolved identifiers.

Merged and dissolved banks keep their original `BankId` because legacy cards and Sheba numbers remain in circulation; `getBank(id).mergedInto` identifies the successor (for example `ghavamin` -> `sepah`, `ayandeh` -> `melli`). Blu shares Saman BIN `621986` and is detected from digits 7–8 (`18`/`19`).

### Money (IRR and IRT)

```ts
import { convertMoney, formatMoney, money, parseMoney } from "@nexload-sdk/persian/money";

const price = money(12500, "IRR");
const tomans = convertMoney(price, "IRT"); // { amount: 1250, unit: "IRT" }
const label = formatMoney(price, { displayUnit: "IRT" });
const parsed = parseMoney("۱۲٬۵۰۰", "IRR");
```

Amounts are safe integers with explicit units: 10 IRR = 1 IRT. `formatMoney` returns `null` for an invalid amount or unit.

### Jalali dates and relative time

```ts
import { formatJalali, jalaliToGregorian, parseJalaliDate } from "@nexload-sdk/persian/date";
import { formatRelativeTime } from "@nexload-sdk/persian/relative";

const date = parseJalaliDate("۱۴۰۳/۰۱/۰۱");
const label = formatJalali(date, { format: "short", timeZone: "Asia/Tehran" });
const gregorian = jalaliToGregorian(1403, 1, 1);

const relative = formatRelativeTime("2024-03-20T12:00:00+03:30", {
  now: "2024-03-20T13:00:00+03:30",
  timeZone: "Asia/Tehran",
});
```

Under 45 seconds returns `همین حالا`. Counts are at least one, so 45–59 seconds displays one minute. At 7 days or more, the label falls back to `formatJalali`.

### Provinces and Zod schemas

```ts
import { findProvince, IRAN_PROVINCES } from "@nexload-sdk/persian/geo";
import { iranMobileSchema, moneySchema } from "@nexload-sdk/persian/zod";

const tehran = findProvince("تهران");
const mobile = iranMobileSchema({ format: "e164" }).safeParse("۰۹۱۲۳۴۵۶۷۸۹");
const price = moneySchema("IRT").safeParse(1250);
```

### Canonical forms and validation errors

<details>
<summary>Canonical storage formats and Persian error reason mapping</summary>

| Value | Canonical form |
| --- | --- |
| Mobile | `09XXXXXXXXX` |
| E.164 mobile | `+989XXXXXXXXX` |
| National code | 10 ASCII digits |
| Postal code | 10 ASCII digits |
| Legal ID | 11 ASCII digits |
| Landline | 11 ASCII digits, `0[1-8]` followed by 9 digits |
| Card | 16 ASCII digits |
| Sheba | `IR` followed by 24 ASCII digits |

| Validator | Reason | Persian message |
| --- | --- | --- |
| Mobile | `empty` | شماره همراه را وارد کنید. |
| Mobile | `invalid` | شماره همراه معتبر نیست. |
| National code | `empty` | کد ملی را وارد کنید. |
| National code | `invalid_format`, `repeated_digits`, `invalid_checksum` | کد ملی معتبر نیست. |
| Legal ID | `empty` | شناسه ملی را وارد کنید. |
| Legal ID | `invalid_format`, `invalid_checksum` | شناسه ملی معتبر نیست. |
| Postal code | `empty` | کد پستی را وارد کنید. |
| Postal code | `invalid_format`, `repeated_digits` | کد پستی معتبر نیست. |
| Landline | `empty` | شماره تلفن را وارد کنید. |
| Landline | `invalid` | شماره تلفن معتبر نیست. |
| Card | `empty` | شماره کارت را وارد کنید. |
| Card | `invalid_format`, `invalid_checksum` | شماره کارت معتبر نیست. |
| Sheba | `empty` | شماره شبا را وارد کنید. |
| Sheba | `invalid_format`, `invalid_checksum` | شماره شبا معتبر نیست. |

</details>

## API

The root entry `@nexload-sdk/persian` re-exports every module except `./zod`. Each module also has a dedicated subpath:

| Subpath | Key exports | Summary |
| --- | --- | --- |
| `@nexload-sdk/persian` | All non-Zod exports + `Validation`, `InputValue`, `toInputString` | Full core bundle |
| `@nexload-sdk/persian/digits` | `toEnglishDigits`, `toPersianDigits`, `parseNumber`, `formatNumber`, `NumberFormatOptions` | Digit conversion and number formatting |
| `@nexload-sdk/persian/text` | `normalizePersianLetters`, `stripInvisible`, `removeDiacritics`, `normalizePersianText`, `toSearchKey`, `slugify` | Text cleanup, search keys, and Unicode slugs |
| `@nexload-sdk/persian/mobile` | `validateIranMobile`, `normalizeIranMobile`, `isValidIranMobile`, `toE164Mobile`, `formatIranMobile`, `MOBILE_ERROR_MESSAGES_FA` | Iranian mobile validation and formatting |
| `@nexload-sdk/persian/identity` | `validateNationalCode`, `normalizeNationalCode`, `isValidNationalCode`, `validateLegalId`, `normalizeLegalId`, `isValidLegalId`, `validatePostalCode`, `normalizePostalCode`, `isValidPostalCode`, `validateIranLandline`, `normalizeIranLandline`, `isValidIranLandline`, error message constants | National code, legal ID, postal code, and landline utilities |
| `@nexload-sdk/persian/bank` | `validateCardNumber`, `normalizeCardNumber`, `isValidCardNumber`, `formatCardNumber`, `detectBankByCard`, `validateSheba`, `normalizeSheba`, `isValidSheba`, `formatSheba`, `detectBankBySheba`, `BANK_IDS`, `IRAN_BANKS`, `getBank`, `CARD_BINS`, `SHEBA_CODES` | Card Luhn, Sheba ISO 7064, and bank detection |
| `@nexload-sdk/persian/money` | `money`, `convertMoney`, `parseMoney`, `formatMoney`, `CURRENCY_LABELS_FA`, `CurrencyUnit`, `Money`, `MoneyRounding`, `MoneyFormatOptions` | Safe-integer IRR/IRT currency math |
| `@nexload-sdk/persian/date` | `TEHRAN_TIME_ZONE`, `JALALI_MONTH_NAMES_FA`, `JALALI_WEEKDAY_NAMES_FA`, `toValidDate`, `toJalali`, `fromJalali`, `formatJalali`, `formatJalaliPattern`, `parseJalaliDate`, `startOfJalaliMonth`, `endOfJalaliMonth`, `startOfJalaliYear`, `endOfJalaliYear`, `isJalaliLeapYear`, `jalaliMonthLength`, `isValidJalaliDate`, `jalaliToGregorian`, `gregorianToJalali` | Deterministic Jalali calendar and date formatting |
| `@nexload-sdk/persian/relative` | `formatRelativeTime` | Persian relative time labels |
| `@nexload-sdk/persian/geo` | `IRAN_PROVINCES`, `PROVINCE_CODES`, `findProvince`, `Province`, `ProvinceCode` | 31 Iranian provinces lookup |
| `@nexload-sdk/persian/zod` | `iranMobileSchema`, `nationalCodeSchema`, `legalIdSchema`, `postalCodeSchema`, `iranLandlineSchema`, `cardNumberSchema`, `shebaSchema`, `jalaliDateSchema`, `moneySchema` | Zod 4 schemas wrapping core validators |

## Configuration

`@nexload-sdk/persian` has no global configuration. Functions accept per-call options:

| Function | Option | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatNumber` | `digits` | `"persian" \| "latin"` | `"persian"` | Output digit script |
| `formatNumber` | `grouping` | `boolean` | `true` | Enables thousands separators |
| `formatNumber` | `fractionDigits` | `number` | `undefined` | Fixed decimal places |
| `normalizePersianText` | `digits` | `"keep" \| "latin" \| "persian"` | `"keep"` | Controls digit normalization |
| `formatJalali` | `timeZone` | `string` | `"Asia/Tehran"` | IANA zone for wall-time formatting |
| `formatJalali` | `format` | `"short" \| "medium" \| "long" \| "full"` | `"medium"` | Preset format style |
| `convertMoney` | `rounding` | `"error" \| "floor" \| "round" \| "ceil"` | `"error"` | Rounding when converting IRR to IRT |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`) across all 11 entry points.
- **Node.js:** `>=20` (per `engines.node`).
- **Bun, Edge, and Browser:** Supported; `sideEffects: false` enables tree-shaking.
- **Intl dependency:** Timezone conversion in `./date` and `./relative` requires `Intl` timezone data in the host runtime.

## Caveats

> [!WARNING]
> Supported Jalali years are `1–3176`. Calendar conversion APIs (`jalaliToGregorian`, `gregorianToJalali`, `isJalaliLeapYear`, `jalaliMonthLength`) throw `RangeError` outside that range, while formatters and parsers return `null`.

> [!WARNING]
> `parseMoney` rejects decimal strings (including `.0`) and unsafe integers. When `displayUnit` conversion in `formatMoney` is not divisible, `formatMoney` keeps the source unit unless a rounding mode is supplied; `convertMoney` throws `RangeError` without rounding.

> [!NOTE]
> `parseJalaliDate` accepts `yyyy/mm/dd` or `yyyy-mm-dd` Jalali dates with a four-digit year, plus an optional `time` (`HH:MM`, default `12:00`) in `options.timeZone` (`Asia/Tehran` by default).
>
> Gregorian ISO-shaped `DateInput` strings passed to `formatJalali`, `toJalali`, and `formatRelativeTime` follow separate rules: offsetless date-times are wall time in `options.timeZone`, and date-only strings are wall midnight there. Date-times accept `T` or a space and offsets `Z`, `±HH`, `±HHMM`, or `±HH:MM`. Fractional seconds accept 1–9 digits and truncate to milliseconds. Date formatters and parsers return `null` for bad input or an invalid time zone.

## Related packages

- [payload-fields](../payload-fields/README.md) — Payload CMS field factories and Admin UI built on `@nexload-sdk/persian`
- [payload-preset](../payload-preset/README.md) — Uses `TEHRAN_TIME_ZONE` for Payload Admin timezone defaults

## License

MIT
