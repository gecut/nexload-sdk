# `@nexload-sdk/payload-fields` v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `@nexload-sdk/payload-fields` as v4.0.0: a library of write-once, Payload-native custom fields (Jalali dates, money, slug, Iranian identity/contact fields, address), built on `@nexload-sdk/persian`, with an optional `./schema` adapter for `@nexload-sdk/payload-schema`.

**Architecture:** Every factory returns a plain Payload `Field` with a native storage type (`text`, `number`, `date`, `group`, `row`) so REST, GraphQL, filters and other plugins keep working. Pure logic (normalize, validate, format, Jalali) comes from `@nexload-sdk/persian`; this package adds only Payload wiring, Admin components and messages. A separate subpath `./schema` wraps the same fields as `field.native(...)` definitions for `payload-schema` users.

**Tech Stack:** TypeScript 5.9, Payload 3 (`payload`, `@payloadcms/ui`, React 19), `react-day-picker` (Persian picker UI), `@nexload-sdk/persian`, optional `@nexload-sdk/payload-schema` + `zod`, `node --test`, `@payloadcms/db-sqlite` for integration tests.

**Spec:** No separate spec file. The design was decided in conversation on 2026-11-23 and is recorded in **Design decisions** below; this plan is the source of truth. Related: `docs/superpowers/specs/2026-11-23-persian-package-design.md`.

## Precondition

`@nexload-sdk/persian` must exist in `packages/persian` and build (plan: `docs/superpowers/plans/2026-11-23-persian-v1.md`). If `pnpm -C packages/persian build` fails or the directory is missing, **stop and report**; do not re-implement its functions here.

## Context for an agent with no history

- Repo: pnpm + turbo monorepo `nexload-sdk`. Read `AGENTS.md` and `docs/architecture/PROJECT-KNOWLEDGE-BASE.md` first.
- Current package: `packages/refactoring/payload-fields`, v3.1.0. It has `slugField`, `jalaliDateField`, `withJalaliTimestamps`, `moneyField`, `payloadFieldsPlugin` (server slug-generator endpoint), Admin components under `src/admin/*`, and only two test files. Read all of `src/` (≈900 lines) before Task 1.
- Problems found in review (2026-11-23):
  - The Jalali picker builds times in the **browser's** timezone, not `Asia/Tehran`.
  - Jalali and money components show no validation error. Money has no list Cell (raw integers in lists).
  - Slug is not unique and has no collision handling.
  - Persian strings are hard-coded. Digit normalization exists in three copies (slug, money, and an app).
  - The package is not on the stable-major baseline the other Payload packages use (ESM-only, Payload `>=3.85`).
- Survey of 8 local Payload projects (2026-11-23):
  - nexload-e-commerce wrote ~300 lines of glue (`~/Codes/nexload-e-commerce/packages/schema/src/semantic-fields.ts`) to wrap these fields into `payload-schema` and add mobile, postal-code and LTR fields. Read it as the reference for Task 9.
  - rasad-srm wrote its own typed Jalali input (`~/Codes/rasad-srm/apps/cms/src/components/JalaliDateField.tsx`).
  - Mobile appears in 6 projects, address (free-text province/city) in 4, start/end dates in 4, national code in 8, sort order in 2–3.

## Design decisions (owner-approved in conversation)

| # | Decision |
|---|---|
| D1 | Purpose: write each custom field once and reuse it everywhere, compatible with the Payload ecosystem. |
| D2 | Factories return plain Payload `Field`s with native types. Components load through import-map paths under `./admin/*`. Consumers may override any Payload key except `name`, `type` and the package's component paths (existing "protected" rule, keep it). |
| D3 | Approach A for schema: `./schema` subpath exposes the same fields as `payload-schema` `field.native()` definitions. `@nexload-sdk/payload-schema` and `zod` are **optional** peers; the root import never loads them. |
| D4 | Pure logic comes from `@nexload-sdk/persian` (a regular `dependency`). No local copies of digit, mobile, checksum or Jalali logic. |
| D5 | Messages and default labels live in a package dictionary `{ fa, en }`. Server code picks the language from `req.i18n.language`; client code from `useTranslation()` (`@payloadcms/ui`). `fa*` → Persian, anything else → English. Default labels are `{ fa, en }` objects. |
| D6 | Every field shows Payload-native label, description and error (`FieldLabel`, `FieldDescription`, `FieldError` from `@payloadcms/ui`) and has a list Cell where raw values are unreadable (money, Jalali, mobile, card, Sheba). |
| D7 | Mobile storage default is national `09XXXXXXXXX` (`storage: "e164"` option stores `+989…`). |
| D8 | Package moves to `packages/payload-fields`, builds **ESM-only**, peers `payload` and `@payloadcms/ui` `>=3.85.0 <4.0.0`, React 19. Release `4.0.0` (major). |
| D9 | v4.0 fields: rebuilt `jalaliDateField`, `moneyField`, `slugField`; kept `withJalaliTimestamps`; new `jalaliDateRangeField`, `iranMobileField`, `nationalCodeField`, `postalCodeField`, `legalIdField`, `iranLandlineField`, `bankCardField`, `shebaField`, `ltrTextField`, `sortOrderField`, `iranAddressField`. Deferred: measure (value+unit), percent, amount-in-words, color, map point. |
| D10 | Values written through any API are normalized server-side by a `beforeValidate` hook (e.g. `"+98 912 345 6789"` is stored as `"09123456789"`), then validated. |

## Global Constraints

- Package name stays `@nexload-sdk/payload-fields`; new path `packages/payload-fields`; Changeset `major` → `4.0.0`.
- `dependencies`: `@nexload-sdk/persian: "workspace:^"`, `react-day-picker: "^9.12.0"`. `peerDependencies`: `payload` and `@payloadcms/ui` `">=3.85.0 <4.0.0"`, `react`/`react-dom` `"^19.0.1 || ^19.1.2 || ^19.2.1"` (unchanged), `@nexload-sdk/payload-schema: ">=2.0.0 <4.0.0"` and `zod: ">=4.1.0 <5.0.0"` both marked optional in `peerDependenciesMeta`. devDependencies pin `payload`, `@payloadcms/ui`, `@payloadcms/db-sqlite` to `3.86.0`, `zod` `4.4.3`, `@nexload-sdk/payload-schema: "workspace:*"`.
- Build: `createBundler(entries, "dist", process.cwd(), {}, false)` (ESM only, `.js` output). Exports point at `./dist/**/*.js` + `.d.ts`; no `require` conditions.
- Root `src/index.ts` must not import `@nexload-sdk/payload-schema`, `zod`, React or `@payloadcms/ui`. Admin files start with `"use client"` and are reached only via `./admin/*` subpaths.
- No `console.*` in `src/`. Edit `src/`, never `dist/`.
- Keep compat exports used by apps: `formatSlug` (alias of `slugify` from persian), `formatJalaliDate`, `formatMoney`, `parseMoneyToMinorUnits`, `IRR`, `IRT`, `resolveCurrency`.
- Tests: `node --test` on `dist/`. `test: pnpm build && node --test test/*.test.mjs`; `test:sqlite: pnpm build && node --test 'test/integration/*.test.mjs'`.
- Git: work on `main`; commit only your paths (`git commit -m "<msg>" -- <paths>`); the index holds unrelated staged changes, never stage or revert them; no push, no publish. Footer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- enola: never `enola baseline pin`; finish with `enola --generate` + `enola check` and report the exit code.

## Review Focus

1. **API writes bypass the Admin UI** (REST/Local API with `"۰۹۱۲ ۳۴۵ ۶۷۸۹"`, `"+989…"`, Persian digits in money as a string). Stored value must be canonical, or the write rejected with a 400. Task 10 integration test.
2. **Localized slug collisions**: two docs with the same title in the same locale get `x` and `x-2`; the same slug in a different locale is allowed. Task 7 + Task 10.
3. **Admin browser not in Tehran**: picking "1404/07/02" stores `2025-09-24T08:30:00.000Z` (noon Tehran) for `dayOnly`, whatever the browser zone. Task 5 tests the pure conversion helper used by the component.
4. **Optional peers missing**: importing the root or any `./admin/*` path works without `zod` / `payload-schema` installed. Task 9 test greps `dist/index.js` and admin outputs.
5. **Existing data**: stored v3 values (ISO dates, integer money, slugs) read back unchanged; v4 only changes how new input is normalized. Task 10 inserts v3-shaped values directly and reads them.

---

## File Structure (after Task 2)

```
packages/payload-fields/
  src/
    index.ts                        root factories + plugin + compat exports
    i18n/messages.ts                dictionary { fa, en }, resolveLanguage(), t()
    internal/validated-text.ts      createValidatedTextField() shared by identity/contact fields
    internal/protect.ts             assertProtected() (name/type/component guards, moved from factories)
    slug/index.ts                   slugField + unique-suffix hook
    date/index.ts                   jalaliDateField, jalaliDateRangeField, withJalaliTimestamps, toStoredJalaliInstant()
    money/index.ts                  moneyField + compat helpers
    contact/index.ts                iranMobileField, iranLandlineField
    identity/index.ts               nationalCodeField, legalIdField, postalCodeField
    bank/index.ts                   bankCardField, shebaField
    common/index.ts                 ltrTextField, sortOrderField
    address/index.ts                iranAddressField
    schema/index.ts                 ./schema adapter (payload-schema + zod)
    plugin.ts                       payloadFieldsPlugin (slug generators)
    admin/slug-field.tsx, admin/jalali-date-field.tsx, admin/jalali-date-cell.tsx,
    admin/money-field.tsx, admin/money-cell.tsx, admin/validated-text-field.tsx, admin/formatted-cell.tsx
  test/*.test.mjs, test/integration/sqlite.test.mjs
```

---

### Task 1: Discover `@nexload-sdk/persian` and adopt it (behavior unchanged)

**Files:**
- Modify: `packages/refactoring/payload-fields/package.json` (add dependency), `src/slug/format-slug.ts`, `src/money/index.ts`, `src/date/format-date.ts`, `src/admin/jalali-picker-value.ts`
- Test: existing `test/contracts.test.mjs`, `test/jalali-picker.test.mjs` (must stay green), new `test/persian-adoption.test.mjs`

**Interfaces:**
- Consumes from `@nexload-sdk/persian` (verify each name exists before use): `slugify` (`./text`), `toEnglishDigits`, `parseNumber`, `formatNumber` (`./digits`), `formatJalali`, `startOfJalaliMonth`, `fromJalali`, `toJalali`, `gregorianToJalali`, `TEHRAN_TIME_ZONE` (`./date`).
- Produces: no API change in this task.

- [ ] **Step 1: Discover.** Read `packages/persian/package.json` (`exports`), `packages/persian/src/index.ts`, `packages/persian/README.md`. Run `pnpm -C packages/persian build && pnpm -C packages/persian test` → PASS. Fill this table in your task report (edit names if the real ones differ, and use the real ones everywhere below):

  | payload-fields code today | replace with persian |
  |---|---|
  | `formatSlug` pipeline in `src/slug/format-slug.ts` | `slugify` from `@nexload-sdk/persian/text` (`formatSlug` becomes `export const formatSlug = slugify`) |
  | `normalizeDigits` (slug) and `normalizedNumber` digit mapping (money) | `toEnglishDigits` / `parseNumber` from `./digits` |
  | `formatJalaliDate` (Intl-based) | thin wrapper over `formatJalali` from `./date` (map `dateStyle` short→`short`, medium→`medium`, long/full→`long`; `timeStyle` → `time`; `digits` and `timeZone` pass through, default `TEHRAN_TIME_ZONE`) |
  | `canonicalizeJalaliPickerDate` (react-day-picker date lib + local `setHours`) | `toStoredJalaliInstant()` (Task 5) — in this task keep the function but leave its behavior unchanged |
  | Persian digit grouping in `formatMoney` (Intl) | `formatNumber` from `./digits` |

- [ ] **Step 2: Failing test** `test/persian-adoption.test.mjs`:
  ```js
  test("formatSlug is persian slugify", async () => {
    const { slugify } = await import("@nexload-sdk/persian/text");
    for (const s of ["  كِتاب_جدید 😀 ۱۲ ", "Hello  World!!", "يى--ك"]) assert.equal(formatSlug(s), slugify(s));
  });
  test("money helpers keep v3 output", () => {
    assert.equal(parseMoneyToMinorUnits("۱۲۳٬۴۵۶", IRT), 123456);
    assert.equal(formatMoney(123456, IRT), "۱۲۳٬۴۵۶ تومان");
  });
  test("formatJalaliDate formats in Tehran", () => {
    assert.equal(formatJalaliDate("2025-09-24T10:30:00Z", { dateStyle: "short", digits: "latin" }), "1404/07/02");
  });
  test("no local digit tables remain", () => {
    for (const f of ["../dist/index.mjs"]) assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), /۰۱۲۳۴۵۶۷۸۹/);
  });
  ```
  Add `"@nexload-sdk/persian": "workspace:^"` to `dependencies`, run `pnpm install`, then `pnpm -C packages/refactoring/payload-fields test` → FAIL.
- [ ] **Step 3: Replace** the code listed in the table. Do not change any exported signature.
- [ ] **Step 4: Run** `pnpm -C packages/refactoring/payload-fields test` → all old and new tests PASS; lint clean. Note: v3 `formatJalaliDate` output may differ in spacing from the `Intl` version; if an existing test asserts Intl's exact string, update that assertion to the persian output and say so in the commit body.
- [ ] **Step 5: Commit** `refactor(payload-fields): use @nexload-sdk/persian for slug, digits and Jalali formatting`.

### Task 2: Move to `packages/payload-fields`, ESM-only, Payload 3.86 baseline

**Files:**
- Move: `packages/refactoring/payload-fields` → `packages/payload-fields` (`git mv`)
- Modify: `package.json` (peers/devDeps/exports per Global Constraints), `esbuild.config.mjs` (ESM only), every reference to the old path: `.github/workflows/docs.yml` (2 lines), `apps/docs/scripts/api-packages.mjs`, `apps/docs/examples/tsconfig.json`, `apps/docs/src/lib/package-catalog.ts`, `docs/packages/OVERVIEW.md`, `docs/packages/PAYLOAD-SUITE.md`, `docs/packages/CORE-PRIMITIVES.md` (remove the "refactoring directory" note), `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `skills/payload-fields/**` (path mentions). Do not edit `CHANGELOG.md` or `docs/research/**`.
- Test: existing tests, with import paths changed from `.mjs` to `.js`

- [ ] **Step 1:** `git mv packages/refactoring/payload-fields packages/payload-fields`; remove the empty `packages/refactoring` directory if nothing else is in it.
- [ ] **Step 2:** Apply Global Constraints to `package.json`: `"type": "module"`, exports for `.`, `./slug`, `./date`, `./money` and each `./admin/*` entry as `{ "types": "./dist/<p>.d.ts", "import": "./dist/<p>.js", "default": "./dist/<p>.js" }`; `esbuild.config.mjs` passes `false` as the 5th `createBundler` argument. Update tests to import `../dist/**/*.js`. Run `pnpm install`.
- [ ] **Step 3:** `grep -rn "refactoring/payload-fields" --exclude-dir=node_modules --exclude-dir=dist . | grep -v -e CHANGELOG -e docs/research -e docs/superpowers` → update every hit; rerun → no output.
- [ ] **Step 4: Verify** `pnpm -C packages/payload-fields test` → PASS; `pnpm -C packages/payload-fields exec tsc --noEmit -p tsconfig.json` → clean (fix type errors from the 3.68 → 3.86 bump, without behavior changes); `pnpm -C apps/docs content:api:write && pnpm -C apps/docs content:examples` → exit 0.
- [ ] **Step 5: Commit** `refactor(payload-fields)!: move to packages/payload-fields, ESM only, Payload >=3.85` (paths: both directories, `pnpm-lock.yaml`, every edited reference).

### Task 3: Messages, shared validated-text builder, generic Admin components

**Files:**
- Create: `src/i18n/messages.ts`, `src/internal/protect.ts`, `src/internal/validated-text.ts`, `src/admin/validated-text-field.tsx`, `src/admin/formatted-cell.tsx`
- Modify: `esbuild.config.mjs` + `package.json` exports (`./admin/validated-text-field`, `./admin/formatted-cell`)
- Test: `test/validated-text.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  // i18n/messages.ts
  export type Language = "fa" | "en";
  export function resolveLanguage(language: string | undefined): Language;   // startsWith("fa") → "fa", else "en"
  export const messages: { fa: Record<MessageKey, string>; en: Record<MessageKey, string> };
  export type MessageKey = "required" | "mobile.invalid" | "landline.invalid" | "nationalCode.invalid_format" | "nationalCode.repeated_digits"
    | "nationalCode.invalid_checksum" | "legalId.invalid_format" | "legalId.invalid_checksum" | "postalCode.invalid_format"
    | "postalCode.repeated_digits" | "card.invalid_format" | "card.invalid_checksum" | "sheba.invalid_format" | "sheba.invalid_checksum"
    | "money.integer" | "money.negative" | "money.min" | "money.max" | "date.invalid" | "date.min" | "date.max" | "dateRange.order"
    | "slug.taken" | "slug.unauthenticated" | "slug.forbidden" | "slug.invalidInput" | "slug.notFound" | "slug.failed"
    | "sortOrder.integer" | "ui.clear" | "ui.generateSlug" | "ui.lock" | "ui.edit";
  export function t(language: string | undefined, key: MessageKey): string;
  // fa values for identity/contact/bank keys: reuse the persian *_ERROR_MESSAGES_FA maps; slug.* fa values: the strings currently hard-coded in src/plugin.ts and src/admin/slug-field.tsx.

  // internal/validated-text.ts
  export type ValidatedTextKind = "mobile" | "landline" | "nationalCode" | "legalId" | "postalCode" | "card" | "sheba" | "ltr";
  export type ValidatedTextOptions = {
    name: string; kind: ValidatedTextKind; label: { fa: string; en: string };
    normalize: (input: string) => string | null;
    validate: (input: string) => { ok: true; value: string } | { ok: false; reason: string };
    messagePrefix: string;                       // e.g. "mobile" → messages key `${prefix}.${reason}`
    unique?: boolean; required?: boolean; overrides?: Partial<TextField>;
  };
  export function createValidatedTextField(options: ValidatedTextOptions): TextField;
  ```
- `createValidatedTextField` output: `type: "text"`, `index: true` when `unique`, `admin.rtl: false`, `admin.components.Field = { path: "@nexload-sdk/payload-fields/admin/validated-text-field#ValidatedTextFieldComponent", clientProps: { kind } }`, `admin.components.Cell = { path: ".../admin/formatted-cell#FormattedCell", clientProps: { kind } }`, `hooks.beforeValidate` = consumer hooks then a hook that replaces a string value with `normalize(value) ?? value` (keep the raw value when invalid so `validate` can report it), `validate` = required check, then the kind's `validate` with `t(req.i18n.language, …)`, then the consumer's `validate`. `custom.nexload.text = { kind }`.
- `ValidatedTextFieldComponent`: `TextInput` from `@payloadcms/ui` with `dir="ltr"`, `inputMode` `tel` for mobile/landline and `numeric` for nationalCode/legalId/postalCode/card, plus `FieldLabel`/`FieldDescription`/`FieldError` (verify these names in `node_modules/@payloadcms/ui/dist/exports/client/index.d.ts`; use the real exports). `FormattedCell`: formats by `kind` with `formatIranMobile`, `formatCardNumber`, `formatSheba`, otherwise the raw value; `—` for empty.

- [ ] **Step 1: Failing tests** (`test/validated-text.test.mjs`, build a mobile-like field through `createValidatedTextField` via a tiny exported test seam or via `iranMobileField` once it exists — here use the internal module path `../dist/internal/validated-text.js`, so also add `src/internal/validated-text.ts` to esbuild entries but **not** to package exports):
  ```js
  test("normalizes in beforeValidate and keeps invalid raw", async () => {
    const field = createValidatedTextField({ name: "phone", kind: "mobile", label: { fa: "همراه", en: "Mobile" },
      normalize: normalizeIranMobile, validate: validateIranMobile, messagePrefix: "mobile" });
    const hook = field.hooks.beforeValidate.at(-1);
    assert.equal(await hook({ value: "+98 912 345 6789" }), "09123456789");
    assert.equal(await hook({ value: "abc" }), "abc");
    assert.equal(field.validate("abc", { req: { i18n: { language: "fa" } } }), "شماره همراه معتبر نیست.");
    assert.equal(field.validate("abc", { req: { i18n: { language: "en" } } }), messages.en["mobile.invalid"]);
    assert.equal(field.validate("09123456789", { req: { i18n: { language: "fa" } } }), true);
    assert.equal(field.admin.rtl, false);
  });
  test("protected keys", () => {
    assert.throws(() => createValidatedTextField({ /* ... */ overrides: { name: "other" } }));
    assert.throws(() => createValidatedTextField({ /* ... */ overrides: { type: "number" } }));
  });
  test("resolveLanguage", () => {
    assert.equal(resolveLanguage("fa-IR"), "fa"); assert.equal(resolveLanguage(undefined), "en"); assert.equal(resolveLanguage("de"), "en");
  });
  ```
- [ ] **Step 2–4:** run → FAIL, implement, run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields): add message dictionary and validated text field builder`.

### Task 4: Identity, contact, bank and common fields

**Files:** Create `src/contact/index.ts`, `src/identity/index.ts`, `src/bank/index.ts`, `src/common/index.ts`; export from `src/index.ts`; Test `test/identity-fields.test.mjs`.

**Interfaces:**
- Consumes: `createValidatedTextField` (Task 3); persian `./mobile`, `./identity`, `./bank`.
- Produces (all return `TextField` unless noted; common option type `FieldOptions = { name?: string; label?: { fa: string; en: string }; required?: boolean; unique?: boolean; overrides?: Partial<TextField> }`):
  ```ts
  export function iranMobileField(options?: FieldOptions & { storage?: "national" | "e164" }): TextField;     // default name "mobile"
  export function iranLandlineField(options?: FieldOptions): TextField;                                       // "landline"
  export function nationalCodeField(options?: FieldOptions): TextField;                                       // "nationalCode"
  export function legalIdField(options?: FieldOptions): TextField;                                            // "legalId"
  export function postalCodeField(options?: FieldOptions): TextField;                                         // "postalCode"
  export function bankCardField(options?: FieldOptions): TextField;                                           // "cardNumber"
  export function shebaField(options?: FieldOptions): TextField;                                              // "sheba"
  export function ltrTextField(options: { name: string; label?; required?; unique?; monospace?: boolean; minLength?: number; maxLength?: number; overrides? }): TextField;
  export function sortOrderField(options?: { name?: string; label?; overrides?: Partial<NumberField> }): NumberField; // "sortOrder", defaultValue 0, min 0, index true, admin.position "sidebar", integer validation
  ```
  Default labels (fa / en): همراه / Mobile; تلفن ثابت / Landline; کد ملی / National code; شناسه ملی / Legal ID; کد پستی / Postal code; شماره کارت / Card number; شماره شبا / Sheba (IBAN); ترتیب نمایش / Sort order. `storage: "e164"` uses `toE164Mobile` as `normalize`. `ltrTextField` adds `admin.className: "nexload-ltr"` (+ `" nexload-ltr--mono"` when `monospace`) and no custom component (plain Payload text input with `rtl: false`).

- [ ] **Step 1: Failing tests:** for each factory assert default `name`, `type`, `admin.rtl === false` (text kinds), that the last `beforeValidate` hook normalizes one valid sample from the persian plan's tests (`"۰۴۹۹-۳۷۰-۸۹۹"` → `"0499370899"`, `"ir20 0170 0000 0000 0123 4567 89"` → `"IR200170000000000123456789"`, `"۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۳"` → `"6037991234567893"`, `"021-88776655"` → `"02188776655"`, `"۱۹۹۱۹-۱۳۵۴۱"` → `"1991913541"`), that `validate` returns the Persian message for one invalid sample, `iranMobileField({ storage: "e164" })` stores `"+989123456789"`, `unique: true` sets `unique` and `index`, and `sortOrderField().validate(1.5, {...})` returns `messages.fa["sortOrder.integer"]`.
- [ ] **Step 2–4:** run → FAIL, implement, run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields): add Iranian identity, contact, bank and common fields`.

### Task 5: Jalali date rebuild, date range, timestamps

**Files:** Modify `src/date/index.ts`, `src/admin/jalali-date-field.tsx`, `src/admin/jalali-date-cell.tsx`; delete `src/admin/jalali-picker-value.ts` (replaced); Test `test/jalali.test.mjs` (replace `test/jalali-picker.test.mjs`).

**Interfaces:**
- Consumes: persian `./date` (`parseJalaliDate`, `formatJalali`, `formatJalaliPattern`, `fromJalali`, `gregorianToJalali`, `toJalali`, `TEHRAN_TIME_ZONE`).
- Produces:
  ```ts
  export type JalaliDateFieldOptions = {
    name: string; pickerAppearance?: JalaliPickerAppearance; display?: JalaliDateDisplayOptions;
    timeZone?: string;               // default "Asia/Tehran"
    min?: string; max?: string;      // ISO instants, inclusive, checked server-side
    label?: { fa: string; en: string }; required?: boolean; overrides?: Partial<DateField>;
  };
  export function jalaliDateField(options: JalaliDateFieldOptions): DateField;
  export function toStoredJalaliInstant(picked: { year: number; month: number; day: number; hour?: number; minute?: number },
    appearance: JalaliPickerAppearance, timeZone?: string): string; // ISO; dayOnly → 12:00, monthOnly → day 1 at 12:00, in timeZone
  export function jalaliDateRangeField(options: { start?: string; end?: string; pickerAppearance?: JalaliPickerAppearance; timeZone?: string;
    required?: boolean; labels?: { start?: { fa: string; en: string }; end?: { fa: string; en: string } } }): RowField; // defaults "startsAt"/"endsAt"
  export function withJalaliTimestamps<T extends Field[]>(fields: T, options?: JalaliTimestampsOptions): Field[]; // unchanged API, formats via persian
  ```
  The component receives `{ appearance, display, timeZone }` as client props, shows a text input that accepts typed Jalali (`۱۴۰۴/۰۷/۰۲`, plus `HH:mm` when the appearance has time) **and** the `react-day-picker/persian` calendar. A picked calendar day is read as its local Gregorian Y/M/D (`getFullYear/getMonth/getDate`), converted with `gregorianToJalali`, then stored with `toStoredJalaliInstant(…, timeZone)` — never `date.toISOString()` of the picker's local midnight. It renders `FieldError` for server errors and an inline error for unparsable typed input (`t(lang, "date.invalid")`). The end field of a range validates `end >= start` via `siblingData` (`"dateRange.order"`).

- [ ] **Step 1: Failing tests:**
  ```js
  test("toStoredJalaliInstant is zone-stable", () => {
    assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2 }, "dayOnly"), "2025-09-24T08:30:00.000Z");
    assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 20 }, "monthOnly"), "2025-09-23T08:30:00.000Z");
    assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2, hour: 14, minute: 0 }, "dayAndTime"), "2025-09-24T10:30:00.000Z");
    assert.equal(toStoredJalaliInstant({ year: 1404, month: 7, day: 2 }, "dayOnly", "UTC"), "2025-09-24T12:00:00.000Z");
  });
  test("min/max validation", () => {
    const f = jalaliDateField({ name: "d", min: "2025-01-01T00:00:00.000Z" });
    assert.equal(f.validate("2024-12-31T00:00:00.000Z", { req: { i18n: { language: "fa" } } }), messages.fa["date.min"]);
    assert.equal(f.validate("2025-02-01T00:00:00.000Z", { req: { i18n: { language: "fa" } } }), true);
  });
  test("range", () => {
    const row = jalaliDateRangeField();
    assert.equal(row.type, "row");
    assert.deepEqual(row.fields.map((x) => x.name), ["startsAt", "endsAt"]);
    const end = row.fields[1];
    assert.equal(end.validate("2025-01-01T00:00:00.000Z", { siblingData: { startsAt: "2025-02-01T00:00:00.000Z" }, req: { i18n: { language: "fa" } } }), messages.fa["dateRange.order"]);
  });
  test("protected keys and component paths", () => { /* keep the v3 assertions: name/type protected, Field and Cell paths */ });
  ```
  Run them also with `TZ=America/New_York node --test test/jalali.test.mjs` (add script `test:tz`).
- [ ] **Step 2–4:** run → FAIL, implement, run `test` + `test:tz` → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields)!: rebuild Jalali date field on persian with Tehran-stable storage and add date range`.

### Task 6: Money rebuild

**Files:** Modify `src/money/index.ts`, `src/admin/money-field.tsx`; Create `src/admin/money-cell.tsx` (+ export `./admin/money-cell`); Test `test/money.test.mjs`.

**Interfaces:**
- Consumes: persian `parseNumber`, `formatNumber`, `convertMoney`, `money`, `CURRENCY_LABELS_FA`.
- Produces: `moneyField(options: MoneyFieldOptions & { displayCurrency?: "IRR" | "IRT"; label?: { fa; en }; required?: boolean }): NumberField` — v3 options kept (`currency`, `minMinorUnits`, `maxMinorUnits`, `allowNegative`, `display`, `overrides`). `displayCurrency` is allowed only when `currency` is `"IRR"` or `"IRT"` and differs from it (else `Error("Invalid money display currency.")`); the Admin input and Cell show/accept the display unit and convert exactly to the stored unit (IRT→IRR ×10; IRR stored, IRT shown: display uses `rounding: "round"`, input converts ×10). Validation messages come from `t()`. A `beforeValidate` hook converts a numeric **string** (Persian digits allowed) to an integer in the stored unit; anything else is left for `validate`. `Cell` = `@nexload-sdk/payload-fields/admin/money-cell#MoneyCell` with `{ currency, display, displayCurrency }`.

- [ ] **Step 1: Failing tests:** v3 money tests still pass; add
  ```js
  test("string input is normalized server-side", async () => {
    const f = moneyField({ name: "price", currency: "IRT" });
    assert.equal(await f.hooks.beforeValidate.at(-1)({ value: "۱۲۳٬۴۵۶" }), 123456);
  });
  test("displayCurrency rules", () => {
    assert.throws(() => moneyField({ name: "p", currency: "IRT", displayCurrency: "IRT" }));
    const f = moneyField({ name: "p", currency: "IRR", displayCurrency: "IRT" });
    assert.equal(f.admin.components.Field.clientProps.displayCurrency, "IRT");
    assert.equal(f.admin.components.Cell.path, "@nexload-sdk/payload-fields/admin/money-cell#MoneyCell");
  });
  test("English messages", () => {
    assert.equal(moneyField({ name: "p", currency: "IRT" }).validate(-1, { req: { i18n: { language: "en" } } }), messages.en["money.negative"]);
  });
  ```
- [ ] **Step 2–4:** run → FAIL, implement (component shows `FieldError` and the unit label), run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields)!: rebuild money field with display currency, cell and messages`.

### Task 7: Slug rebuild (unique + collision suffix)

**Files:** Modify `src/slug/index.ts`, `src/slug/format-slug.ts`, `src/plugin.ts`, `src/admin/slug-field.tsx`; Test `test/slug.test.mjs`.

**Interfaces:**
- Produces: `slugField(options?: SlugFieldOptions & { unique?: boolean })` (default `unique: true`) → same tuple `[TextField, CheckboxField]`. When `unique`, the slug field gets `unique: true` + `index: true`, and its package `beforeValidate` hook (after formatting) runs:
  ```ts
  // only when req?.payload && collection?.slug && value is a non-empty string
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const found = await req.payload.find({ collection: collection.slug, where: { and: [{ [path]: { equals: candidate } }, ...(id ? [{ id: { not_equals: id } }] : [])] },
      limit: 1, depth: 0, pagination: false, locale: req.locale ?? undefined, req, overrideAccess: true });
    if (found.docs.length === 0) return candidate;
  }
  throw new ValidationError(...) // or return the base and let the unique index reject it with t(lang, "slug.taken")
  ```
  `path` = the slug field name (top-level slugs only; inside arrays/groups skip the uniqueness query and rely on formatting only — document this). Plugin endpoint messages use `t(req.i18n?.language, "slug.*")`; component button labels use `t()`.

- [ ] **Step 1: Failing tests** with a fake `req.payload.find` that returns a doc for `"ketab"` and `"ketab-2"`:
  ```js
  test("suffixes collisions", async () => {
    const [slug] = slugField({ source: "title" });
    const hook = slug.hooks.beforeValidate.at(-1);
    const taken = new Set(["ketab", "ketab-2"]);
    const req = { locale: "fa", i18n: { language: "fa" }, payload: { find: async ({ where }) => ({ docs: taken.has(where.and[0].slug.equals) ? [{}] : [] }) } };
    assert.equal(await hook({ operation: "create", data: { title: "ketab" }, siblingData: {}, value: undefined, req, collection: { slug: "posts" } }), "ketab-3");
  });
  test("unique false skips the query", async () => { /* find must not be called */ });
  test("v3 lock and source behavior unchanged", () => { /* port the v3 slug assertions from contracts.test.mjs */ });
  ```
- [ ] **Step 2–4:** run → FAIL, implement, run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields)!: make slugs unique with collision suffixes`.

### Task 8: Iranian address field

**Files:** Create `src/address/index.ts`; export from root; Test `test/address.test.mjs`.

**Interfaces:**
- Consumes: persian `IRAN_PROVINCES`; Task 4 `postalCodeField`, `iranMobileField`.
- Produces:
  ```ts
  export function iranAddressField(options?: { name?: string; label?: { fa: string; en: string }; required?: boolean;
    recipient?: boolean;                 // default true: adds recipientName (text) and recipientMobile (iranMobileField)
    overrides?: Partial<GroupField> }): GroupField;   // default name "address"
  ```
  Sub-fields in order: `province` (select, options `IRAN_PROVINCES.map(p => ({ value: p.code, label: { fa: p.nameFa, en: p.nameEn } }))`), `city` (text), `line` (textarea, label نشانی / Address line), `postalCode` (`postalCodeField`), then `recipientName`, `recipientMobile` when `recipient`. `required` applies to province, city, line, postalCode (and recipient fields when present). Layout: province+city in a `row`, recipient fields in a `row`.

- [ ] **Step 1: Failing tests:** group name/type; 31 province options with `{ fa, en }` labels; `recipient: false` removes both recipient fields; `postalCode` sub-field normalizes like Task 4; protected `name`/`type`.
- [ ] **Step 2–4:** run → FAIL, implement, run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields): add Iranian address field`.

### Task 9: `./schema` adapter for `payload-schema`

**Files:** Create `src/schema/index.ts`; add entry + export `./schema`; Test `test/schema.test.mjs`.

**Interfaces:**
- Consumes: `field.native` from `@nexload-sdk/payload-schema` (`NativeFieldOptions`: `{ payload: Omit<Field, "name" | "defaultValue">, schema?, defaultValue? }`), persian `./zod` schemas, the factories of Tasks 4–8.
- Produces `schemaFields` with one function per factory, each returning a `payload-schema` field definition whose Payload part is the factory's output minus `name`/`defaultValue` (the entity key becomes the name):
  ```ts
  export const schemaFields: {
    iranMobile(options?: Omit<Parameters<typeof iranMobileField>[0], "name"> & { nullable?: boolean }): /* FieldDefinition */;
    iranLandline, nationalCode, legalId, postalCode, bankCard, sheba, ltrText, sortOrder, // same pattern
    money(options: Omit<MoneyFieldOptions, "name"> & { nullable?: boolean }),   // zod: safe integer (non-negative unless allowNegative)
    jalaliDate(options?: Omit<JalaliDateFieldOptions, "name"> & { nullable?: boolean }), // zod: z.iso.datetime({ offset: true })
    slug(options?: Omit<SlugFieldOptions, "name">): { slug: FieldDefinition; slugLock: FieldDefinition };
  };
  ```
  Zod schemas: text kinds use the persian `./zod` schema (canonical output); `required` follows `!nullable` as in the e-commerce reference (`~/Codes/nexload-e-commerce/packages/schema/src/semantic-fields.ts`, functions `canonicalMoney`, `canonicalJalaliDate`, `canonicalSlug`, `withoutReserved`). Address and date range are **not** in `./schema` v4.0 (group/row need payload-schema `field.group`; leave a README note).

- [ ] **Step 1: Failing tests:**
  ```js
  test("schema adapter builds entity fields", async () => {
    const { defineEntity } = await import("@nexload-sdk/payload-schema");
    const { payloadFields } = await import("@nexload-sdk/payload-schema/payload");
    const entity = defineEntity({ name: "Customer", fields: { mobile: schemaFields.iranMobile(), price: schemaFields.money({ currency: "IRT" }), ...schemaFields.slug() } });
    const fields = payloadFields(entity).all();
    assert.deepEqual(fields.map((f) => f.name), ["mobile", "price", "slug", "slugLock"]);
    assert.equal(entity.schema(({ pick }) => pick(["mobile"])).parse({ mobile: "+989123456789" }).mobile, "09123456789");
  });
  test("root and admin outputs never import optional peers", () => {
    for (const f of ["../dist/index.js", "../dist/admin/validated-text-field.js", "../dist/admin/jalali-date-field.js", "../dist/admin/money-field.js"])
      assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), /from ["'](zod|@nexload-sdk\/payload-schema)/, f);
  });
  ```
  Adjust the `pick`/`parse` call to the real `payload-schema` API (read `packages/payload-schema/README.md`); keep the assertion values.
- [ ] **Step 2–4:** run → FAIL, implement, run → PASS; lint + tsc clean.
- [ ] **Step 5: Commit** `feat(payload-fields): add payload-schema adapter subpath`.

### Task 10: SQLite integration test

**Files:** Create `test/integration/sqlite.test.mjs`; add `test:sqlite` script.

- [ ] **Step 1: Write the test** by copying the setup of `packages/payload-operations/tests/integration/sqlite.test.mjs` (temp dir, `sqliteAdapter`, `buildConfig`, `getPayload`, cleanup in `finally`). Config: `localization: { locales: ["fa", "en"], defaultLocale: "fa" }`, plugin `payloadFieldsPlugin()`, collection `customers` with `title` (text), `...slugField({ source: "title", overrides: { slug: { localized: true }, lock: { localized: true } } })`, `iranMobileField()`, `nationalCodeField()`, `moneyField({ name: "credit", currency: "IRT" })`, `jalaliDateField({ name: "birthDate" })`, `iranAddressField({ recipient: false })`, `sortOrderField()`. Assertions:
  - create with `mobile: "+98 912 345 6789"`, `nationalCode: "۰۴۹۹-۳۷۰-۸۹۹"`, `credit: "۱۲۳٬۴۵۶"`, `address.postalCode: "۱۹۹۱۹-۱۳۵۴۱"` → stored `"09123456789"`, `"0499370899"`, `123456`, `"1991913541"`;
  - create with `nationalCode: "1111111111"` rejects with a `ValidationError` mentioning `nationalCode`;
  - two creates with title `"کتاب"` in locale `fa` → slugs `"کتاب"` and `"کتاب-2"`; a third in locale `en` with the same title → `"کتاب"`;
  - v3-shaped data written directly (`birthDate: "2025-09-24T08:30:00.000Z"`, `credit: 5000`) reads back unchanged.
- [ ] **Step 2: Run** `pnpm -C packages/payload-fields test:sqlite` → PASS. If a failure shows a real bug in Tasks 4–8, fix it in that module and say so in the commit body.
- [ ] **Step 3: Commit** `test(payload-fields): add SQLite integration coverage`.

### Task 11: Docs, skills, Changeset

**Files:** Modify `packages/payload-fields/README.md`, `docs/packages/PAYLOAD-SUITE.md` (section D), `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `docs/packages/OVERVIEW.md` (add `--> Persian` edge from PayloadFields in the mermaid graph), `apps/docs/src/content/docs/packages/payload-fields/{index,guides,api}.mdx`, `apps/docs/examples/payload-fields.ts`, `skills/payload-fields/**/SKILL.md` and `references/*.md`; Create `.changeset/payload-fields-v4.md`.

- [ ] **Step 1: README:** install (`pnpm add @nexload-sdk/payload-fields`; optional `@nexload-sdk/payload-schema zod` for `./schema`), field catalog table (factory, stored type, canonical value, Admin component), usage example with 5–6 fields, `./schema` example, i18n note (D5), runtime constraints (factories: Payload config / Node; `./admin/*`: Admin client only; regenerate the import map after upgrading), **Migration from 3.x**: ESM-only; Payload `>=3.85`; slugs unique by default (existing duplicates must be fixed before the unique index is created, or pass `unique: false`); Jalali `dayOnly`/`monthOnly` now store noon in `timeZone` (default Tehran) instead of the browser's zone; messages follow the admin language; new package path. Describe only what is implemented.
- [ ] **Step 2: Repo docs and docs site:** update the listed files to the v4 field list and path; `examples/payload-fields.ts` uses at least `iranMobileField`, `jalaliDateRangeField`, `iranAddressField` and `schemaFields.iranMobile`. Add `"@nexload-sdk/payload-fields/schema"` path mapping in `apps/docs/examples/tsconfig.json` if the wildcard does not cover it, and add the `./schema` and `./slug|./date|./money` entries to `apps/docs/scripts/api-packages.mjs` (`entries` form, as payload-schema does).
- [ ] **Step 3: Skills:** update paths (`packages/payload-fields`), the factory list and the invariants in `skills/payload-fields/core/SKILL.md`; add one line per new field to `references/factory-contracts.md`. Do not create new skills.
- [ ] **Step 4: Changeset** `.changeset/payload-fields-v4.md`: `"@nexload-sdk/payload-fields": major` with a migration summary (the five points from Step 1).
- [ ] **Step 5: Verify:**
  ```bash
  pnpm -C apps/docs content:api:write
  pnpm -C apps/docs content:llms:write
  pnpm -C apps/docs content:examples
  pnpm -C apps/docs test
  pnpm -C apps/docs build
  git diff --check
  ```
  Expected: all exit 0, no diff-check output.
- [ ] **Step 6: Commit** `docs(payload-fields): document v4 fields, schema adapter and migration`.

### Task 12: Final verification

- [ ] **Step 1:** `pnpm -C packages/payload-fields build && pnpm -C packages/payload-fields test && pnpm -C packages/payload-fields test:tz && pnpm -C packages/payload-fields test:sqlite && pnpm -C packages/payload-fields lint` → all pass.
- [ ] **Step 2:** Root `pnpm build && pnpm lint && pnpm test` → exit 0 (report unrelated pre-existing failures without fixing them).
- [ ] **Step 3:** `enola --generate` then `enola check` → report exit code and findings; expect a new edge `payload-fields → persian` (intended). Do not pin, do not change `--fail-on`.
- [ ] **Step 4:** Report: commits, test counts, what could not be verified automatically (Admin components were not rendered in a browser; the owner should open a Payload admin with the integration config and check the Jalali picker, money input and validated text inputs in `fa` and `en`). Do not publish.
