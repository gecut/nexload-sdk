# @nexload-sdk/persian

Isomorphic Persian and Iranian utilities for digits, text, identifiers, bank details, money, Jalali dates, relative time and provinces. The root exports all modules except Zod; each module also has its own subpath.

```bash
pnpm add @nexload-sdk/persian
# Only for @nexload-sdk/persian/zod:
pnpm add zod
```

Node.js 20+, Bun, Edge and browsers are supported. The core has zero runtime dependencies; `./zod` needs the optional Zod peer `>=4.1.0 <5`. Date timezone conversion requires `Intl` timezone data in the runtime.

## Digits

```ts
import { parseNumber, formatNumber } from "@nexload-sdk/persian/digits";
const amount = parseNumber("۱۲٬۳۴۵"); // 12345
const display = formatNumber(amount); // Persian digits and grouping
```

`formatNumber` accepts finite numbers with absolute value below `1e21`; strings use `parseNumber`. Invalid input throws `RangeError`.

## Text

```ts
import { normalizePersianText, toSearchKey } from "@nexload-sdk/persian/text";
const text = normalizePersianText("كالا ۱۲۳");
const key = toSearchKey(text);
```

## Mobile

```ts
import { validateIranMobile, toE164Mobile } from "@nexload-sdk/persian/mobile";
const result = validateIranMobile("۰۹۱۲۳۴۵۶۷۸۹");
const international = toE164Mobile("۰۹۱۲۳۴۵۶۷۸۹"); // +989123456789
```

## Identity

```ts
import { validateNationalCode, normalizePostalCode } from "@nexload-sdk/persian/identity";
const nationalCode = validateNationalCode("۰۰۸۴۵۷۵۹۴۸");
const postalCode = normalizePostalCode("۱۲۳۴۵۶۷۸۹۰");
```

Legal IDs, postal codes and landlines also have `validate`, `normalize` and `isValid` functions.

## Bank

```ts
import { validateCardNumber, detectBankByCard, validateSheba } from "@nexload-sdk/persian/bank";
const card = validateCardNumber("۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸");
const bank = detectBankByCard("۶۰۳۷۹۹۷۵۱۲۳۴۵۶۷۸");
const sheba = validateSheba("IR820540102680020817909002");
```

Card and Sheba validation checks format and checksum; Sheba check digits must be 02–98. Bank detection is researched, best-effort data from two independent source reviews (card BINs and Sheba codes); unknown or unresolved identifiers return `null`. Merged and dissolved banks keep their original id because legacy cards and Sheba numbers still exist; `getBank(id).mergedInto` names the successor (for example `ghavamin` → `sepah`, `ayandeh` → `melli`). Blu shares Saman BIN `621986` and is detected from digits 7–8 (`18`/`19`).

## Money

```ts
import { money, convertMoney, formatMoney, parseMoney } from "@nexload-sdk/persian/money";
const price = money(12500, "IRR");
const tomans = convertMoney(price, "IRT"); // 1250 IRT
const label = formatMoney(price, { displayUnit: "IRT" });
const parsed = parseMoney("۱۲٬۵۰۰", "IRR");
```

`formatMoney` returns `null` for an invalid amount or unit. Amounts are safe integers with explicit units: 10 IRR = 1 IRT. `parseMoney` rejects decimal text, including zero fractional digits, and unsafe integers. When `displayUnit` conversion is not divisible, `formatMoney` keeps the source unit unless rounding is given. `convertMoney` throws for invalid or non-divisible conversion without rounding.

## Date

```ts
import { parseJalaliDate, formatJalali, jalaliToGregorian } from "@nexload-sdk/persian/date";
const date = parseJalaliDate("۱۴۰۳/۰۱/۰۱");
const label = formatJalali(date, { format: "short", timeZone: "Asia/Tehran" });
const gregorian = jalaliToGregorian(1403, 1, 1);
```

Supported Jalali years are 1–3176. Outside that range, calendar conversion APIs throw `RangeError`; formatters and parsers return `null`. Date formatters and parsers return `null` for bad input or an invalid time zone. ISO date-only strings are wall midnight and offsetless ISO date-time strings are wall time in `options.timeZone`, defaulting to `Asia/Tehran`. Date-times accept `T` or a space and offsets `Z`, `±HH`, `±HHMM`, or `±HH:MM`. ISO fractional seconds accept 1–9 digits and truncate to milliseconds, with or without an offset. Parsing a Jalali date requires a four-digit year and defaults to noon in that zone. Formatting uses deterministic calendar conversion, not the `Intl` Persian calendar; timezone conversion needs `Intl` timezone data.

## Relative time

```ts
import { formatRelativeTime } from "@nexload-sdk/persian/relative";
const label = formatRelativeTime("2024-03-20T12:00:00+03:30", {
  now: "2024-03-20T13:00:00+03:30",
  timeZone: "Asia/Tehran",
});
```

Counts in relative labels are at least one; 45–59 seconds displays one minute.

## Geography

```ts
import { findProvince, IRAN_PROVINCES } from "@nexload-sdk/persian/geo";
const province = findProvince("تهران");
const provinces = IRAN_PROVINCES;
```

Province data is included; there is no city list.

## Zod

Install Zod `>=4.1.0 <5` separately for this optional subpath.

```ts
import { iranMobileSchema, moneySchema } from "@nexload-sdk/persian/zod";
const mobile = iranMobileSchema({ format: "e164" }).safeParse("۰۹۱۲۳۴۵۶۷۸۹");
const price = moneySchema("IRT").safeParse(1250);
```

## Forms: normalize, store, display

```ts
import { validateIranMobile, formatIranMobile } from "@nexload-sdk/persian/mobile";
const input = "۰۹۱۲۳۴۵۶۷۸۹";
const result = validateIranMobile(input);
if (result.ok) {
  const canonicalForStorage = result.value; // store 09123456789
  const display = formatIranMobile(canonicalForStorage);
}
```

Validate and normalize at input, persist the canonical value, then format on output. On failure use the reason and message tables below.

## Canonical forms

| Value | Canonical form |
|---|---|
| Mobile | `09XXXXXXXXX` |
| E.164 mobile | `+989XXXXXXXXX` |
| National code | 10 ASCII digits |
| Postal code | 10 ASCII digits |
| Legal ID | 11 ASCII digits |
| Landline | 11 ASCII digits, `0[1-8]` followed by 9 digits |
| Card | 16 ASCII digits |
| Sheba | `IR` followed by 24 ASCII digits |

## Validation errors

Validation returns `{ ok: true, value }` or `{ ok: false, reason }`. Message constants map each reason to Persian text.

| Validator | Reason | Persian message |
|---|---|---|
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
