---
name: persian
description: "Use when a project handles Persian, Farsi, or Iranian input or output, including mobile numbers, کد ملی (national code), postal codes, landlines, card numbers, Sheba/IBAN, Rial/Toman prices, Jalali/Shamsi dates, relative time, Persian digits, ي/ك normalization, slugs, provinces, or Zod validation of these values."
---

# Persian

## Purpose

Use `@nexload-sdk/persian` for Iranian data and Persian presentation. Check the installed package version and use its public imports.

```bash
pnpm add @nexload-sdk/persian
# For the /zod subpath
pnpm add 'zod@>=4.1.0 <5'
```

The core works in Node.js 20+, Bun, Edge, and browsers. Date conversion uses the runtime's `Intl` timezone data.

## Decision flow

**Normalize on input → store canonical → format on output.**

1. **Input.** Pass user input to the SDK as strings. Use `validate*` for Persian field errors, `normalize*` when `null` is enough, or `/zod` for canonical schema outputs. Let the SDK handle digits, prefixes, and checksums.
2. **Storage.** Persist the successful canonical value from the table below. Preserve leading zeros in identifiers and keep the unit on every monetary amount.
3. **Output.** Use SDK formatters for Persian display. Call `toE164Mobile` at the SMS gateway boundary. Format instants in Tehran for Iranian displays. Choose monetary rounding only when the product defines a policy.
4. **Bank labels.** Validate card and Sheba independently of bank detection. Use detection only as an optional display hint.

## Import map

Prefix each listed subpath with `@nexload-sdk/persian`. The root re-exports every non-Zod row and adds `toInputString`. Types and constants are listed in the [API reference](references/api-contract.md).

| Subpath | Functions |
| --- | --- |
| `/digits` | `toEnglishDigits`, `toPersianDigits`, `parseNumber`, `formatNumber` |
| `/text` | `normalizePersianLetters`, `stripInvisible`, `removeDiacritics`, `normalizePersianText`, `toSearchKey`, `slugify` |
| `/mobile` | `validateIranMobile`, `normalizeIranMobile`, `isValidIranMobile`, `formatIranMobile`, `toE164Mobile` |
| `/identity` | `validateNationalCode`, `normalizeNationalCode`, `isValidNationalCode`, `validateLegalId`, `normalizeLegalId`, `isValidLegalId`, `validatePostalCode`, `normalizePostalCode`, `isValidPostalCode`, `validateIranLandline`, `normalizeIranLandline`, `isValidIranLandline` |
| `/bank` | `validateCardNumber`, `normalizeCardNumber`, `isValidCardNumber`, `formatCardNumber`, `detectBankByCard`, `validateSheba`, `normalizeSheba`, `isValidSheba`, `formatSheba`, `detectBankBySheba`, `getBank` |
| `/money` | `money`, `convertMoney`, `parseMoney`, `formatMoney` |
| `/date` | `toValidDate`, `toJalali`, `fromJalali`, `formatJalali`, `formatJalaliPattern`, `parseJalaliDate`, `startOfJalaliMonth`, `endOfJalaliMonth`, `startOfJalaliYear`, `endOfJalaliYear`, `isJalaliLeapYear`, `jalaliMonthLength`, `isValidJalaliDate`, `jalaliToGregorian`, `gregorianToJalali` |
| `/relative` | `formatRelativeTime` |
| `/geo` | `findProvince` |
| `/zod` | `iranMobileSchema`, `nationalCodeSchema`, `legalIdSchema`, `postalCodeSchema`, `iranLandlineSchema`, `cardNumberSchema`, `shebaSchema`, `jalaliDateSchema`, `moneySchema` |

## Canonical storage

| Field | Store |
| --- | --- |
| Iranian mobile | National ASCII string `09XXXXXXXXX` |
| National code (کد ملی) | 10 ASCII digits as a string |
| Legal ID (شناسه ملی) | 11 ASCII digits as a string |
| Postal code | 10 ASCII digits as a string |
| Iranian landline | `0[1-8]` followed by nine ASCII digits |
| Card number | 16 ASCII digits as a string where persistence is authorized |
| Sheba (Iranian IBAN) | Uppercase `IR` followed by 24 ASCII digits |
| Money | `Money`, a safe integer `amount` with `unit: "IRR"` (Rial) or `"IRT"` (Toman) |
| Timestamp | An instant, such as an ISO string from `Date#toISOString()` |
| Province | `Province.code` from `findProvince` or `IRAN_PROVINCES` |

Storing full card numbers (PAN) is a security and compliance decision; the package validates only.

## Money, timezone, and errors

- **Money.** Ten Rial equal one Toman. Use `parseMoney(text, unit)` for localized amounts and `money(amount, unit)` for known integers. For `money(1250005, "IRR")`, `formatMoney(price, { displayUnit: "IRT" })` produces `۱٬۲۵۰٬۰۰۵ ریال`. A non-divisible amount keeps its source unit when rounding is omitted. If Toman display is required, pass `rounding` explicitly: `floor` produces `۱۲۵٬۰۰۰ تومان` and `round` produces `۱۲۵٬۰۰۱ تومان`. For customer-facing totals, decide the rounding policy with product; never choose silently. `convertMoney` throws on non-divisible conversion by default, as does `formatMoney` with explicit `rounding: "error"`.
- **Timezone.** Use `formatJalali` with `timeZone: "Asia/Tehran"` for Iranian displays, including UTC workers. Tehran is the default. Offset-bearing ISO strings represent instants. ISO date-only strings are wall midnight and offsetless date-times are wall times in the selected zone. `parseJalaliDate` requires a four-digit year, returns an instant and defaults to noon in that zone.
- **Invalid input.** Identifier `normalize*` functions return `null` on invalid input. `validate*` returns `{ ok: true, value }` or `{ ok: false, reason }`. Map the failure reason through its `*_ERROR_MESSAGES_FA` constant. Zod identifier schemas use these messages for invalid strings and transform valid strings to canonical values. `parseMoney`, `parseJalaliDate`, and `formatJalali` can also return `null`.
- **Zod factories.** Every schema export is a factory function. Call it before parsing; see [signatures and FormData type errors](references/api-contract.md#zod).
- **Bank detection.** The directory is researched, best-effort data; unknown or unresolved identifiers return `null`. Merged or dissolved banks resolve to their original id (legacy cards still exist); `getBank(id).mergedInto` gives the successor. `detectBankByCard` returns `BankId | null`, not a bank object. `getBank(id: BankId)` returns the bank object and throws `RangeError("Invalid bank")` for an unknown or unlisted ID at runtime. Accept valid identifiers regardless of the hint; a known hint does not prove validity or ownership.

## Runnable example

Run this TypeScript as `signup.mts` with a TypeScript-capable runner such as Node.js 22.18+. It validates signup fields, keeps money exact, and formats an instant near midnight in Tehran.

```ts
import { strict as assert } from "node:assert";
import { z } from "zod";
import { formatJalali } from "@nexload-sdk/persian/date";
import { toE164Mobile } from "@nexload-sdk/persian/mobile";
import { formatMoney, money } from "@nexload-sdk/persian/money";
import { iranMobileSchema, nationalCodeSchema } from "@nexload-sdk/persian/zod";

const signup = z.object({
  mobile: iranMobileSchema(),
  nationalCode: nationalCodeSchema(),
});

const account = signup.parse({
  mobile: "+۹۸ ۹۱۲ ۳۴۵ ۶۷۸۹",
  nationalCode: "۰۰۸۴۵۷۵۹۴۸",
});
const price = money(1250005, "IRR");
const createdAt = new Date("2024-03-19T21:00:00Z").toISOString();
const record = { ...account, price, createdAt };

assert.equal(record.mobile, "09123456789");
assert.equal(record.nationalCode, "0084575948");
assert.equal(toE164Mobile(record.mobile), "+989123456789");
assert.equal(formatMoney(record.price, { displayUnit: "IRT" }), "۱٬۲۵۰٬۰۰۵ ریال");
assert.equal(
  formatJalali(record.createdAt, { format: "short", timeZone: "Asia/Tehran" }),
  "۱۴۰۳/۰۱/۰۱",
);
```

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Handwritten digit normalization, phone checks, national-code checks, Luhn, Sheba mod-97, or a private BIN table | Use the SDK's validators and normalizers. Use `/digits` for standalone digit conversion and `/bank` for bank hints. |
| Storing mobile in E.164 | Persist `09XXXXXXXXX`. Produce `+98…` via `toE164Mobile` when sending to an SMS gateway. |
| Formatting with the `Intl` Persian calendar | Use `formatJalali` with Tehran timezone, including on UTC hosts. |
| Showing fractional Toman or silently rounding 1,250,005 Rial | Keep explicit-unit `Money`. Keep the source unit for non-exact display conversion until the product specifies rounding. |
| Guessing imports or importing Zod schemas from the root | Use the exact names in the import map. Import schemas from `/zod`. |
| Rejecting a valid card or Sheba when bank detection returns `null` | Determine acceptance from validation and show a bank label only when known. |

## Reference routing

Read the [API reference](references/api-contract.md) for options, error reasons, and return values.
