# `@nexload-sdk/persian` — design

Status: **approach approved (A), design ready for planning.**
Date: 2026-11-23. Source: brainstorming session on Persian/Iranian utilities, after the
`payload-fields` review. Plan: `docs/superpowers/plans/2026-11-23-persian-v1.md`.
Follow-up consumer: `docs/superpowers/plans/2026-11-23-payload-fields-v4.md`.

## Intent

Every Iranian project on the owner's machine re-implements the same small helpers:
Persian digits, mobile normalization, Toman formatting, Jalali dates, national code.
The copies disagree with each other and several are wrong. The owner wants one
runtime-agnostic package that does these once, correctly, and is used by
`payload-fields` and by the planned `payment`, `sms` and `otp` modules.

The package **must not depend on Payload CMS** (owner requirement).

## Evidence (survey of 46 local projects, 2026-11-23)

| Pattern | Projects | Finding |
|---|---|---|
| Mobile normalize/validate | 9+ (cloud-app ×3 copies, hr-collector, mechatron, kartbook, persianpartshop, choobinooo, faralist, nexload-e-commerce) | Storage format split: `09…` in 6, `+98…` in 2. hr-collector returns invalid input unchanged. choobinooo only strips `+98`. |
| Persian→ASCII / ASCII→Persian digits | 10+ | Each project has its own `toPersianDigits` / `toEnglishDigits`. |
| Number/price formatting | 14 | Thousands separator differs: `.` (choobinooo web), `,` (persianpartshop), `٬` (others). Toman vs Rial vs "thousand Toman" all stored somewhere. |
| Jalali formatting | 9 | All use `Intl` `fa-IR-u-ca-persian`. persianpartshop and cloud-app omit `timeZone`, so server timezone leaks into output. |
| Jalali → Date parsing | 2 (rasad-srm via `@internationalized/date`, cloud-app hand-written 615-line file) | Needed by every Jalali input. |
| Relative time ("۵ دقیقه پیش") | 7 | Hand-written each time. |
| National code | 8 | Only 1 (form.amirghadir) validates the checksum. |
| Arabic ي/ك → Persian ی/ک | 4 (zarbit, choobinooo, persianpartshop, rasad-srm) | zarbit `packages/domain/src/normalize.ts` is the best version. |
| Bank card BIN → bank | kartbook `packages/banks` | 25 BINs + Saman/Blu sub-BIN split. No Luhn check anywhere. No Sheba check anywhere. |
| Province list | choobinooo (incomplete city list) | Address forms in 4 projects use free-text province/city. |
| Zod | 72 package.json files | The ecosystem validates with Zod 4. |

Third-party Persian libs are rare (`moment-jalaali` ×2, `date-fns-jalali` ×2,
`@internationalized/date` ×1). `Intl` is the de-facto engine.

## Goals

- One package, `@nexload-sdk/persian`, with tree-shakable subpath modules.
- Zero runtime dependencies. Works in Node ≥20, Bun, Edge and browsers.
- Deterministic output across runtimes (no dependence on server timezone or on
  differences between browser `Intl` data for the Persian calendar).
- Every validator has three forms: `normalizeX` (→ canonical value or `null`),
  `isValidX` (→ boolean) and `validateX` (→ result with a machine-readable reason).
- Optional Zod 4 schemas under `./zod` (Zod is an optional peer).
- Persian error messages shipped as data, so `payload-fields` and apps reuse them.

## Non-goals (v1)

- No Payload, React or DOM code. No admin components.
- No amount-in-words (no project does it today).
- No mobile operator detection (number portability makes prefix → operator unreliable).
- No complete city list (an incomplete list rejects real cities). Provinces only.
- No license plates, no economic-code validation (no reliable public checksum).
- No timezone database; we rely on the runtime's `Intl` timezone data.
- No date arithmetic library (add/diff). Only start/end of Jalali month/year.

## Anti-goals (failure even if it works)

- A function that silently returns its input when the input is invalid.
- A money value without an explicit unit, or an implicit Rial↔Toman rounding.
- Jalali output that changes with the server's `TZ` env var.
- A dependency that bloats browser bundles for one function.

## Approaches considered

| | Approach | Trade-off | Decision |
|---|---|---|---|
| A | One package, subpaths, zero deps, own Jalali engine, `zod` optional peer under `./zod` | Smallest bundle, one version; Jalali engine needs careful tests | **Chosen** |
| B | Same, but `@internationalized/date` for Jalali | Less date code; heavy dependency on every page for one function | Rejected |
| C | Several packages (`persian-date`, `persian-bank`, …) | Versioning overhead; repo rule says split only when consumed alone | Rejected |

## Design

### Package

- Path `packages/persian`, name `@nexload-sdk/persian`, first published version `1.0.0`.
- ESM + CJS (`createBundler(..., isCJS = true)`), `platform: "neutral"`, like `logger`
  and `healthcheck` (non-Payload packages ship both formats).
- `sideEffects: false`. No `dependencies`. `zod` in `peerDependencies` (`>=4.1.0 <5.0.0`)
  with `peerDependenciesMeta.zod.optional = true`.

### Subpaths

| Subpath | Module | Depends on |
|---|---|---|
| `.` | re-exports every module except `./zod` | — |
| `./digits` | digit conversion, number parse/format | — |
| `./text` | letter normalization, invisible chars, search key, Unicode slug | digits |
| `./mobile` | Iranian mobile numbers | digits |
| `./identity` | national code, legal ID, postal code, landline | digits |
| `./bank` | card number, Sheba, bank directory | digits |
| `./money` | Rial/Toman money values | digits |
| `./date` | Jalali calendar engine, parse, format, month/year bounds | digits |
| `./relative` | Persian relative time | date, digits |
| `./geo` | 31 provinces | text |
| `./zod` | Zod 4 schemas for the validators | all above + `zod` |

### Shared result type

```ts
export type Validation<TValue, TReason extends string> =
  | { ok: true; value: TValue }
  | { ok: false; reason: TReason };
```

Each module exports its reasons as a string-literal union plus a Persian message map,
e.g. `MOBILE_ERROR_MESSAGES_FA: Record<MobileErrorReason, string>`.
All functions accept `string | null | undefined` input where a user could pass empty data;
empty input yields `null` / `false` / `{ ok: false, reason: "empty" }`.

### `./digits`

- `toEnglishDigits(input: string): string` — Persian `۰-۹` and Arabic-Indic `٠-٩` → `0-9`. Other characters untouched.
- `toPersianDigits(input: string | number): string` — `0-9` → `۰-۹`.
- `parseNumber(input: string): number | null` — accepts Persian/Arabic digits, grouping
  `٬` `,` and spaces, decimal `٫` or `.`, a leading `-`. Returns `null` for anything else or
  a non-finite result.
- `formatNumber(value: number, options?: { digits?: "persian" | "latin"; grouping?: boolean; fractionDigits?: number }): string`
  — own implementation (not `Intl`) for determinism. Grouping separator is always `٬`
  (U+066C) with Persian digits and `,` with Latin digits; decimal separator `٫` / `.`.
  Default: Persian digits, grouping on, fraction digits as given by the value (max 20).
  Throws `RangeError` for non-finite input.

### `./text`

- `normalizePersianLetters(input)` — `ي ى` → `ی`, `ك ڪ` → `ک`.
- `stripInvisible(input)` — removes LRM, RLM, ALM, bidi embeds/isolates, BOM, ZWSP, ZWJ.
  **Keeps ZWNJ (U+200C).**
- `removeDiacritics(input)` — removes U+064B–U+065F and U+0670.
- `normalizePersianText(input, options?: { digits?: "keep" | "latin" | "persian" })` —
  NFKC → stripInvisible → letters → exotic spaces to ASCII space → collapse space runs →
  collapse repeated ZWNJ → trim → optional digit conversion. Default `digits: "keep"`.
- `toSearchKey(input)` — `normalizePersianText(digits: "latin")` + `removeDiacritics` +
  ZWNJ → space + lowercase. For DB search columns and fuzzy matching.
- `slugify(input)` — Unicode slug. **Behavior must equal today's
  `formatSlug` in `packages/refactoring/payload-fields/src/slug/format-slug.ts` on every input**
  (same test: `"  كِتاب_جدید 😀 ۱۲ "` → `"کتاب-جدید-12"`), so `payload-fields` can switch to it
  without changing any stored slug. It is therefore its own copy of that pipeline (NFKC →
  digits → `يى`→`ی`, `ك`→`ک` → strip U+064B–U+065F/U+0670 → `[\s_]+`→`-` → drop
  `[^\p{L}\p{N}-]` → collapse/trim `-`), **not** built on `normalizePersianText`
  (decided after builder check: exact equivalence beats sharing).

### `./mobile`

Canonical storage form is **national `09XXXXXXXXX`** (6 of 8 projects store it).
- `normalizeIranMobile(input): string | null` — accepts Persian/Arabic digits, spaces, `-`,
  `(`, `)`, `.`, and prefixes `+98`, `0098`, `98`, `0`, or bare `9XXXXXXXXX`.
  Valid result matches `/^09\d{9}$/`. Anything else → `null`.
- `toE164Mobile(input): string | null` — `+989XXXXXXXXX`.
- `isValidIranMobile(input): boolean`.
- `validateIranMobile(input): Validation<string, "empty" | "invalid">` (value = national form).
- `formatIranMobile(input, options?: { digits?: "persian" | "latin"; separator?: string }): string | null`
  — `0912 345 6789` (default separator `" "`, default Latin digits, because mobile numbers are
  shown LTR and copied into dialers).

### `./identity`

- National code (کد ملی): `normalizeNationalCode` (digits only, strips spaces/dashes, left-pads
  8–9 digit input with zeros to 10), `isValidNationalCode`, `validateNationalCode` with reasons
  `"empty" | "invalid_format" | "repeated_digits" | "invalid_checksum"`. Checksum: weights 10..2
  over the first 9 digits, `r = sum % 11`, valid if `r < 2 ? check === r : check === 11 - r`.
  All-same-digit codes are rejected.
- Legal ID (شناسه ملی اشخاص حقوقی, 11 digits): `normalizeLegalId`, `isValidLegalId`,
  `validateLegalId` with reasons `"empty" | "invalid_format" | "invalid_checksum"`. Checksum:
  `d = digit[9] + 2`, weights `[29,27,23,19,17,29,27,23,19,17]`, `s = Σ (digit[i] + d) × w[i]`
  for i 0..9, `r = s % 11`, `r === 10 → 0`, valid if `r === digit[10]`.
- Postal code: `normalizePostalCode` (10 digits, strips spaces and `-`), `isValidPostalCode`,
  `validatePostalCode` with `"empty" | "invalid_format" | "repeated_digits"`. Rule is the one
  already in production in nexload-e-commerce (10 digits, not all the same digit); no stricter
  regional rule in v1 (false negatives would block real addresses).
- Landline: `normalizeIranLandline` → `0` + area code + number, 11 digits matching
  `/^0[1-8]\d{9}$/`; accepts `+98` / `0098` prefixes. `isValidIranLandline`, `validateIranLandline`
  with `"empty" | "invalid"`.

### `./bank`

- `BankId` union and `IRAN_BANKS: readonly { id: BankId; nameFa: string; nameEn: string }[]`.
- Card: `normalizeCardNumber` (16 digits), `isValidCardNumber` (Luhn), `validateCardNumber`
  (`"empty" | "invalid_format" | "invalid_checksum"`), `formatCardNumber` (`6037 9911 2345 6789`),
  `detectBankByCard(input): BankId | null` using the BIN table from kartbook
  (`_gh-mirror/gecut_kartbook/packages/banks/src/banks.ts`, copied into the plan). `621986` is
  Saman, except sub-BIN `18`/`19` → Blu (**my call:** kartbook returns `null` for other Saman
  sub-BINs; we return `saman`).
- Sheba: `normalizeSheba` (uppercase, strips spaces, adds `IR` to 24 bare digits) → `IR` + 24 digits,
  `isValidSheba` (ISO 13616 mod-97 = 1), `validateSheba` (`"empty" | "invalid_format" | "invalid_checksum"`),
  `formatSheba` (`IR12 3456 …` groups of 4), `detectBankBySheba(input): BankId | null` from the
  3-digit bank code at positions 5–7 (table in the plan; **owner must review it before publish**).

### `./money`

- `type CurrencyUnit = "IRR" | "IRT"`; `type Money = Readonly<{ amount: number; unit: CurrencyUnit }>`.
- `money(amount, unit): Money` — throws `RangeError` unless `Number.isSafeInteger(amount)`.
- `convertMoney(value: Money, to: CurrencyUnit, options?: { rounding?: "error" | "floor" | "round" | "ceil" }): Money`
  — IRT→IRR ×10 (throws if the result is unsafe); IRR→IRT ÷10; default `rounding: "error"`
  throws `RangeError` when the Rial amount is not divisible by 10.
- `parseMoney(input: string, unit: CurrencyUnit): Money | null` — integer only (both units have
  no minor unit); uses `parseNumber`.
- `formatMoney(value: Money, options?: { digits?; showUnit?: boolean; displayUnit?: CurrencyUnit; rounding?; zeroLabel?: string }): string`
  — `۱۲۳٬۴۵۶ تومان`. `displayUnit` converts for display only. `zeroLabel` (e.g. `"رایگان"`) is
  returned for amount 0 when set.
- `CURRENCY_LABELS_FA = { IRR: "ریال", IRT: "تومان" }`.

### `./date`

**One engine for both directions.** Gregorian↔Jalali conversion uses the jalaali-js
(MIT) arithmetic (break-year table), implemented in our source with attribution. `Intl` is
used **only** to read the wall-clock Gregorian parts of an instant in a timezone
(`Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", … }).formatToParts`). Formatting
uses our own month/weekday tables, not `Intl`'s Persian calendar, so output is identical in
every runtime.

- `TEHRAN_TIME_ZONE = "Asia/Tehran"`; every function that takes an instant accepts
  `options.timeZone` (default Tehran).
- Instant inputs are `type DateInput = Date | string | number` (ISO string or epoch ms, as
  stored by Payload and databases). Invalid instants → `null` from formatters, `RangeError`
  from `toJalali`. (Builder-check call: widening later is non-breaking, but consumers
  such as `payload-fields` already hold ISO strings.)
- Pure calendar: `gregorianToJalali(gy, gm, gd)`, `jalaliToGregorian(jy, jm, jd)` →
  `{ year, month, day }`; `isJalaliLeapYear(jy)`; `jalaliMonthLength(jy, jm)`;
  `isValidJalaliDate(jy, jm, jd)`. Supported range: Jalali years −61 … 3177 (engine limit);
  outside → `RangeError`.
- Instant ↔ parts: `toJalali(date, options?) → JalaliDateTime` (`year, month, day, hour, minute,
  second, weekday` where weekday 0 = شنبه); `fromJalali(parts, options?) → Date` (wall time in the
  zone → instant; non-existent wall times from historic DST move forward; ambiguous ones take
  the earlier instant). Invalid parts → `RangeError`.
- `parseJalaliDate(input: string, options?: { time?: string; timeZone? }): Date | null` —
  accepts `۱۴۰۴/۰۷/۰۲`, `1404-7-2`, Persian/Arabic digits, optional `HH:mm` time; default time
  **12:00** (canonical noon, same as `payload-fields` `dayOnly`).
- `formatJalali(date, options?: { format?: "short" | "medium" | "long" | "full"; time?: "none" | "short" | "medium"; digits?; timeZone? }): string | null`
  - short `۱۴۰۴/۰۷/۰۲`, medium `۲ مهر ۱۴۰۴`, long `۲ مهر ۱۴۰۴` with weekday prefix
    (`چهارشنبه ۲ مهر ۱۴۰۴`), full = long; time short `۱۴:۳۰`, medium `۱۴:۳۰:۰۵`, joined with `، `.
  - Invalid date → `null`. Default: medium, no time, Persian digits.
- `formatJalaliPattern(date, pattern, options?)` — tokens `yyyy yy MMMM MM M dd d EEEE HH H mm ss`;
  text in `'quotes'` is literal.
- Bounds: `startOfJalaliMonth`, `endOfJalaliMonth`, `startOfJalaliYear`, `endOfJalaliYear`
  (in the zone; end = last millisecond).
- Tables: `JALALI_MONTH_NAMES_FA` (فروردین…اسفند), `JALALI_WEEKDAY_NAMES_FA` (شنبه…جمعه).

### `./relative`

`formatRelativeTime(date, options?: { now?: Date; digits?; timeZone? }): string | null` —
past: <45 s `همین حالا`; <60 min `N دقیقه پیش`; <24 h `N ساعت پیش`; <7 d `N روز پیش`;
otherwise `formatJalali(date, { format: "medium" })`. Future mirrors with `دیگر`
(`N دقیقه دیگر`). Own strings, not `Intl.RelativeTimeFormat` (deterministic).

### `./geo`

`IRAN_PROVINCES: readonly { code: ProvinceCode; nameFa: string; nameEn: string }[]` — all 31
provinces, stable kebab-case codes (`tehran`, `east-azerbaijan`, …; **my call**: not ISO
3166-2 codes, to avoid encoding a code list we cannot verify offline).
`findProvince(input): Province | null` matches by code or by `toSearchKey(nameFa)`.

### `./zod`

Zod 4 schemas built on the validators, each accepting `{ message?: string }` (default: Persian
message from the module map): `iranMobileSchema({ format?: "national" | "e164" })`,
`nationalCodeSchema()`, `legalIdSchema()`, `postalCodeSchema()`, `iranLandlineSchema()`,
`cardNumberSchema()`, `shebaSchema()`, `jalaliDateSchema()` (string → `Date`),
`moneySchema(unit)` (non-negative safe integer → `Money`). String schemas output the canonical
normalized value.

## Constraints

- Repo rules (`AGENTS.md`): edit `src/` only, README + `docs/packages/` in the same change,
  no `console.*`, enola check after structural changes, no publishing.
- Tests use `node --test` on `dist/` (`pnpm build && node --test test/*.test.mjs`), as in `logger`.
- Docs site (`apps/docs`) lists only stable packages; adding the package requires catalog,
  sidebar, API generator, examples, generated Markdown and contract-test updates.

## Calls made after the builder check

- **Docs site is in v1** (owner asked for it). The package is listed with the existing
  `stable` / `released` catalog status; the owner publishes via Changesets before the docs
  deploy from `main`. No new catalog status.
- **No agent skill in v1** (`skills: []` in the docs catalog). A `skills/persian` skill can follow.
- `slugify` exact-equivalence and `DateInput` widening: see the module sections above.
- Number inputs: identity, mobile and bank normalizers also accept `number` (converted with
  `String()`); national code left-pads, so `84575948` → `0084575948`.

## Left to the builder

- Internal file layout inside each module.
- Exact wording of Persian error messages (keep them short and polite).
- Formatter caching strategy.

## Open items for the owner

1. Review the Sheba bank-code table before the first publish.
2. Legal-ID checksum is the widely published algorithm; confirm with one real company ID.
3. Should `docs/research/` and this spec be committed (repo has unrelated staged changes)?
