# Persian API contract

Use the subpaths in the [import map](../SKILL.md#import-map). The root also exports `InputValue = string | number | null | undefined`, `toInputString`, and `Validation<TValue, TReason>`.

## Digits and text

- `toEnglishDigits` turns Persian and Arabic-Indic digits into ASCII. `toPersianDigits` converts ASCII digits. For mixed input use `toPersianDigits(toEnglishDigits(input))`.
- `parseNumber` reads localized numeric text with grouping and decimal marks into a number or returns `null`. Use it for quantities. Pass identifier fields to their own validators as strings.
- `formatNumber` throws `RangeError` for invalid strings, non-finite numbers, and numbers with absolute value at least `1e21`. Numeric input bypasses `parseNumber`; strings follow its validation. `NumberFormatOptions` includes `digits: "persian" | "latin"`, `grouping`, and `fractionDigits`. Persian digits and grouping are on by default. `fractionDigits` uses the runtime's `Intl.NumberFormat` range (0–100 on current runtimes; older runtimes may limit it to 0–20). Out-of-range values throw `RangeError` for valid input.
- `normalizePersianLetters` maps forms such as `ي` and `ك` to `ی` and `ک`. `stripInvisible` removes directional controls and other selected invisible characters while preserving the zero-width non-joiner. `removeDiacritics` removes Arabic vowel marks.
- `normalizePersianText` normalizes Unicode, letters, whitespace, and repeated zero-width non-joiners. The `digits` option is `"keep"` (default), `"latin"`, or `"persian"`. `toSearchKey` uses Latin digits, removes diacritics, replaces the zero-width non-joiner with a space, and lowercases.
- `slugify` produces a Unicode slug, converting Persian and Arabic-Indic digits to ASCII. Other scripts' digits are retained, subject to Unicode NFKC normalization. Enforce uniqueness in the application and handle an empty result.

## Identifiers and bank hints

The validators return a discriminated union. On `result.ok`, use `result.value`. Otherwise use the matching table at `result.reason`.

| Validator | Exported reason type | Persian message table | Possible reasons |
| --- | --- | --- | --- |
| `validateIranMobile` | `MobileErrorReason` | `MOBILE_ERROR_MESSAGES_FA` | `empty`, `invalid` |
| `validateNationalCode` | `NationalCodeErrorReason` | `NATIONAL_CODE_ERROR_MESSAGES_FA` | `empty`, `invalid_format`, `repeated_digits`, `invalid_checksum` |
| `validateLegalId` | `LegalIdErrorReason` | `LEGAL_ID_ERROR_MESSAGES_FA` | `empty`, `invalid_format`, `invalid_checksum` |
| `validatePostalCode` | `PostalCodeErrorReason` | `POSTAL_CODE_ERROR_MESSAGES_FA` | `empty`, `invalid_format`, `repeated_digits` |
| `validateIranLandline` | `LandlineErrorReason` | `LANDLINE_ERROR_MESSAGES_FA` | `empty`, `invalid` |
| `validateCardNumber` | `CardErrorReason` | `CARD_ERROR_MESSAGES_FA` | `empty`, `invalid_format`, `invalid_checksum` |
| `validateSheba` | `ShebaErrorReason` | `SHEBA_ERROR_MESSAGES_FA` | `empty`, `invalid_format`, `invalid_checksum` |

- `normalize*` on these identifiers returns the canonical string or `null`. The corresponding `isValid*` returns a boolean.
- Mobile accepts national and Iranian international forms, including `+98` and `0098`. The national-code validator left-pads eight- and nine-digit inputs to ten digits before checksum verification. Sheba adds `IR` to a bare 24-digit input and validates the check digits and checksum.
- `formatIranMobile` groups digits as 4–3–4. `formatCardNumber` groups them in fours. Both default to Latin digits and spaces, with `digits` and `separator` options. `formatSheba` returns an uppercase string in space-separated groups of up to four characters. These formatters return `null` for invalid input.
- `detectBankByCard` and `detectBankBySheba` return a `BankId` or `null`. Pass a known ID to `getBank(id: BankId)` for its `id`, `nameFa`, `nameEn`, and optional `mergedInto` (successor id of a merged or dissolved bank); it throws `RangeError("Invalid bank")` for an unknown or unlisted ID at runtime. The bank module also exports `BANK_IDS`, `IRAN_BANKS`, `CARD_BINS`, and `SHEBA_CODES`. Treat this researched directory as best-effort metadata and use the validators to decide acceptance.

## Money

| Export | Contract |
| --- | --- |
| `CurrencyUnit` | `"IRR"` or `"IRT"` |
| `Money` | Readonly `{ amount: number; unit: CurrencyUnit }` with a safe integer amount |
| `money(amount, unit)` | Constructs a frozen `Money`, including signed amounts. Throws `RangeError` for an invalid unit or amount. |
| `parseMoney(input, unit)` | Parses localized integer amounts using a known unit. Returns `null` for invalid input, unsafe integers, and text with a decimal separator, including `"12.0"`. |
| `convertMoney(value, unit, options?)` | Converts at 10 IRR per IRT. `MoneyRounding` is `"error"\| "floor"\| "round"\| "ceil"`. The default `"error"` requires exact conversion. Invalid or overflowing conversions throw `RangeError`. |
| `formatMoney(value, options?)` | Returns `null` unless money has a safe integer amount and an `IRR` or `IRT` unit. Defaults to Persian digits and the unit label from `CURRENCY_LABELS_FA`. `MoneyFormatOptions` includes `digits`, `showUnit`, `displayUnit`, `rounding`, and `zeroLabel`. Omitting rounding preserves the source unit when the requested Toman display would be fractional. |

## Dates and relative time

- `DateInput` is `Date | string | number` (epoch milliseconds for numbers). Prefer ISO strings with `Z` or an offset at service boundaries. `toValidDate` returns `Date | null`. ISO date-only strings are wall midnight in the selected zone; offsetless date-times are wall time. Date-times accept `T` or a space and offsets `Z`, `±HH`, `±HHMM`, or `±HH:MM`. ISO fractional seconds with one to nine digits truncate to milliseconds.
- `ZoneOptions.timeZone` uses a timezone name and defaults to `TEHRAN_TIME_ZONE` in Jalali APIs. `toJalali` returns `JalaliDateTime` with calendar fields, time fields, and a Saturday-based weekday index. `fromJalali` converts `JalaliParts` into a `Date`, with omitted time fields defaulting to midnight. These APIs can throw on invalid values.
- `parseJalaliDate(text, { time, timeZone })` takes slash- or hyphen-separated numeric Jalali fields with a four-digit year. Pass an optional `HH:mm` time in options, for example `parseJalaliDate("1403/01/01", { time: "09:30" })`. Time defaults to noon. A time embedded in the date string returns `null`. Returns `Date | null`.
- `formatJalali` and `formatJalaliPattern` return `string | null`. `formatJalali` accepts `format: "short" | "medium" | "long" | "full"`, `time: "none" | "short" | "medium"`, `digits: "persian" | "latin"`, and `timeZone`. Defaults are medium date, no time, and Persian digits. `formatJalaliPattern` accepts only `digits` and `timeZone` as options. Pattern tokens are `yyyy yy MMMM MM M dd d EEEE HH H mm ss`. Single quotes delimit literals. Month and weekday names are exposed as `JALALI_MONTH_NAMES_FA` and `JALALI_WEEKDAY_NAMES_FA`.

For `date = "2024-03-19T21:00:00Z"` and `timeZone: "Asia/Tehran"`:

| Call | Output |
| --- | --- |
| `formatJalali(date, { timeZone, format: "short" })` | `۱۴۰۳/۰۱/۰۱` |
| `formatJalali(date, { timeZone, format: "short", time: "short" })` | `۱۴۰۳/۰۱/۰۱، ۰۰:۳۰` |
| `formatJalali(date, { timeZone, format: "long" })` | `چهارشنبه ۱ فروردین ۱۴۰۳` |
| `formatJalaliPattern(date, "yyyy-MM-dd HH:mm", { timeZone })` | `۱۴۰۳-۰۱-۰۱ ۰۰:۳۰` |

- `startOfJalaliMonth`, `endOfJalaliMonth`, `startOfJalaliYear`, and `endOfJalaliYear` return boundary instants in the selected timezone. End helpers return the last millisecond of the period.
- `gregorianToJalali` and `jalaliToGregorian` work on numeric year, month, and day and return a `CalendarDate`. Supported Jalali years are 1–3176. Use `isValidJalaliDate` for a boolean check and `isJalaliLeapYear` or `jalaliMonthLength` for calendar rules.
- `formatRelativeTime(date, { now, timeZone, digits })` returns a Persian relative label or `null` on invalid input. Set `now` for reproducible output. Below 45 seconds of elapsed time it displays `همین حالا`. Counts are at least one, including 45–59 seconds. At seven days or more it uses `formatJalali`.

## Geography

`IRAN_PROVINCES` contains `Province` objects with `code`, `nameFa`, and `nameEn`. `PROVINCE_CODES` lists the stable `ProvinceCode` values. `findProvince` matches a normalized Persian name or province code and returns `Province | null`.

## Zod

Install Zod `>=4.1.0 <5` to use the `/zod` subpath.

Every schema export is a factory function; call it before parsing. All options are optional:

| Factory signature | Options |
| --- | --- |
| `iranMobileSchema(options?)` | `message?: string`, `format?: "national" \| "e164"` |
| `nationalCodeSchema(options?)`, `legalIdSchema(options?)`, `postalCodeSchema(options?)` | `message?: string` |
| `iranLandlineSchema(options?)`, `cardNumberSchema(options?)`, `shebaSchema(options?)` | `message?: string` |
| `jalaliDateSchema(options?)` | `message?: string`, `time?: string`, `timeZone?: string` |
| `moneySchema(unit, options?)` | `unit: CurrencyUnit`; `message?: string` |

- `iranMobileSchema`, `nationalCodeSchema`, `legalIdSchema`, `postalCodeSchema`, `iranLandlineSchema`, `cardNumberSchema`, and `shebaSchema` take string input and return canonical strings. Mobile defaults to `format: "national"`. Use `toE164Mobile` on the stored national value for SMS delivery.
- `jalaliDateSchema({ time, timeZone, message })` takes a Jalali string and returns a `Date`. Its parser defaults to Tehran noon.
- `moneySchema(unit, { message })` takes a nonnegative safe integer number and returns `Money`. For localized string input, use `parseMoney` with the intended unit.
- Each factory supports a `message` override for its custom validation issue. `null` and non-string FormData values such as `File` produce Zod's base type error for string schemas, not the Persian validation message; `moneySchema` expects a number and also rejects them with a base type error.
- To treat missing or non-string FormData input as empty for a string schema, use `z.preprocess(v => typeof v === "string" ? v : "", iranMobileSchema())`; this produces the mobile schema's Persian empty-input message. It also treats files as empty, so use it only when that is the intended policy.
