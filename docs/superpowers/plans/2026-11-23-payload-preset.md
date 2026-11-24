# Payload Preset — Execution Plan (self-contained, revision 2)

> **For agentic workers:** this file is the whole brief. You do not need the conversation that
> produced it. Read "Context", "Verified facts" and "Decisions" first, then do Step 0 and Tasks 1–5 in order.
> Steps use checkbox (`- [ ]`) syntax; tick them as you go.

**Status:** revision 2 (2026-11-24), ready to execute after Step 0.
**Spec:** `docs/superpowers/specs/2026-11-23-payload-preset-design.md` (approach C, revision 2).
Where this plan and the spec disagree, **this plan wins**: it records decisions made after
checking the installed code.

**Revision 2 summary:** admin branding, the `extra` option, Persian options and subpaths are removed.
`payloadFieldsPlugin` registration, a logger bridge and audit `auth` events are added. Audit reads move
to `afterOperation`. Ordering moves into each plugin's `order`. See the spec's "Revision 2 changes".

---

## Context (why this exists)

`nexload-sdk` is a pnpm + turbo monorepo of publishable packages (`packages/*`) used to build
recurring Iranian e-commerce sites on Payload CMS 3 + Next.js. Every project re-applies the
same Payload config by hand: Persian admin language, RTL, `Asia/Tehran` timezone and logging hooks
per collection. Copies drift: `fa` is set in 7 of 8 project configs, RTL + `Asia/Tehran` only in 3;
`logOperation` is added by hand in 12 files (one project) and 6 files (another). Hosts that use
`moneyField()` must also remember `payloadFieldsPlugin()`.

Goal: one call, `nexloadPreset()`, that returns plain Payload plugins:

```ts
import { buildConfig } from "payload";
import { configureLogger } from "@nexload-sdk/logger";
import { nexloadPreset } from "@nexload-sdk/payload-preset";

configureLogger({ service: "shop-cms" }); // before buildConfig, so the logger bridge sees it

export default buildConfig({
  // ...db, secret, collections
  plugins: [
    ...nexloadPreset({ audit: { exclude: ["payload-preferences"] } }),
    myCommercePlugin(), // may add collections; still audited and still gets field hooks
  ],
});
```

### Hard rules (from the spec; do not break)
1. **Our types are Payload's types.** Plugins are typed `Plugin` from `payload`. No wrapper
   around `buildConfig`, no own config type, no registry, no DI.
2. **Preset plugins never touch collection `fields`.** Every plugin test asserts this.
3. **Merge, never overwrite.** If the host already set a value, keep it.
4. **Never change the DB schema.** No locale is ever added.
5. **Audit is log-only** in v1. Read auditing is **off by default** and logs once per request.
6. **Logging must never break an operation.** A failing logger call is swallowed inside the hook.
7. **Never log document bodies, emails, passwords or tokens.** Ids and counts only.
8. **No speculative options.** If no project repeats it, it is not an option.

### Non-goals for this plan
- `apps/docs` site pages. `@nexload-sdk/payload-hooks` is deliberately listed as out-of-scope
  in `apps/docs/tests/contracts.test.mjs` (the "out-of-scope packages" test). Do not add
  `payload-preset` or `payload-hooks` to the docs site; that is a later decision.
- Persisted audit trail, `durationMs`, failed-login auditing, admin branding, admin font.

---

## Step 0 (gate — do this before Task 1)

- [ ] 0.1 `pnpm ls payload --depth 0 -r | grep -m3 payload` → workspace still resolves Payload `3.86.x`.
  If a different minor, re-check facts marked **(verify)** before coding.
- [ ] 0.2 **Logger bridge type check (decides D12).** In a scratch file outside `src/` (e.g. the
  session scratchpad, not committed), with `packages/logger` built:
  ```ts
  import type { Config } from "payload";
  import type pino from "pino"; // resolve from packages/logger (pino 10)
  declare const ours: pino.Logger<"success">;
  const a: Config["logger"] = ours;                                   // instance form
  declare const opts: pino.LoggerOptions<"success">;
  const b: Config["logger"] = { options: opts };                      // options form
  ```
  Run `tsc --noEmit` on it from a package that has both `payload` and `pino` resolvable.
  Record which forms type-check. Pick per D12. Delete the scratch file.

## Verified facts (Payload `3.86.0`, `node_modules/.pnpm/payload@3.86.0_*/node_modules/payload/dist`)

1. **(verify)** `Plugin` type (`config/types.d.ts`):
   `((config: Config) => Config | Promise<Config>) & { options?; order?: number; slug?: string }`.
   `order` and `slug` are marked `@experimental`.
2. **(verify)** `buildConfig` (`config/build.js`) copies `config.plugins`, **stable-sorts them by
   `plugin.order ?? 0`**, then runs them in sequence.
3. **(verify)** i18n (`config/sanitize.js`): with no host `i18n`, Payload uses
   `supportedLanguages: { en }`, `fallbackLanguage: "en"`. A host `supportedLanguages` **replaces**
   the default. A `fallbackLanguage` that is not a key silently becomes the first key.
4. **(verify)** Timezones: `admin.timezones = { defaultTimezone?; supportedTimezones?: Timezone[] |
   (({ defaultTimezones }) => Timezone[]) }`, `Timezone = { label; value }`.
   **`Asia/Tehran` is not in Payload's `defaultTimezones`.**
5. Localization: `localization.locales` is `string[]` or `Locale[]` (`{ code; label; rtl?; fallbackLocale? }`).
   Only the object form can carry `rtl`.
6. Collection hooks (`collections/config/types.d.ts`):
   - `afterChange({ collection, context, data, doc, operation: "create" | "update", previousDoc, req })` → return doc.
   - `afterDelete({ collection, context, doc, id, req })`.
   - `afterOperation({ collection, req, operation, args, result, overrideAccess? })` → **must return `result`**.
     `operation` values seen: `count`, `countVersions`, `create`, `delete`, `deleteByID`, `find`,
     `findByID`, `findDistinct`, `findVersionByID`, `findVersions`, `forgotPassword`, `login`,
     `read` (deprecated alias), `readDistinct`, `refresh`, `resetPassword`, `restoreVersion`, `unlock`,
     `update`, `updateByID`.
   - `find.js` calls it with `operation: "find"`, `findByID.js` with `"findByID"`, `auth/operations/login.js`
     with `"login"`. `forgotPassword.js`, `resetPassword.js` also call it. A failed login throws before it.
   - Bulk `update` / `delete` call `afterOperation` once; `afterChange` / `afterDelete` run per document.
7. `config.logger?: 'sync' | { destination?: DestinationStream; options: LoggerOptions } | PayloadLogger`,
   where `PayloadLogger = pino.Logger` from **`pino 9.14.0`** (pinned in Payload's `package.json`).
   `@nexload-sdk/logger` uses **`pino ^10.4.0`** (`10.4.0` installed). Two pino copies exist.
8. `@nexload-sdk/logger` (`packages/logger/src/config.ts`): `buildPinoOptions(options)` (not exported)
   builds redact, serializers, `mixin: getLogContext`, timestamp; `getActiveLogger()` (exported from
   `config.ts`, **not** from `index.ts`) returns the configured pino instance or a fallback. The public
   `Logger` interface (`types.ts`) is narrower than pino's and is **not** a `PayloadLogger`.
9. `@nexload-sdk/payload-fields` `payloadFieldsPlugin(options)` (`src/plugin.ts:130`) walks
   `config.collections` (money `beforeOperation` normalization, slug endpoint) and sets **no `order`**.
   Collections added by a plugin that runs later miss its hooks.
10. `@nexload-sdk/persian` exports `TEHRAN_TIME_ZONE = "Asia/Tehran"` from `./date`.
11. Translations: `@payloadcms/translations/languages/fa` exports `fa`; `.../languages/en` exports `en`.
12. Build tool: `tools/bundler/index.js` `createBundler(entry, outDir, baseDir, esbuildOptions, isCJS)`.
    Only `dependencies` and `peerDependencies` are external. Payload 3 is ESM-only.
13. Integration test pattern: `packages/payload-operations/tests/integration/sqlite.test.mjs`
    (`@payloadcms/db-sqlite` `3.86.0`, temp dir DB, `buildConfig` + `getPayload`).
14. Test helper: `createTestLogger()` from `@nexload-sdk/logger/testing`.

## Decisions

| # | Decision | Reason |
|---|---|---|
| D1 | `auditPlugin()` returns a plugin with `order = 1000`, `slug = "nexload-audit"`. | Fact 2: audit runs last wherever the host puts it. |
| D2 | Persian plugin **never adds a locale** and never creates `localization`. It only sets `rtl: true` on an existing `fa` locale object whose `rtl` is `undefined`. String-form locales untouched. | Adding a locale changes the DB schema of localized fields. |
| D3 | Persian plugin ensures `TEHRAN_TIME_ZONE` is in `supportedTimezones` (array: append if missing; function: wrap and append if missing; unset: function returning `[...defaultTimezones, TEHRAN]`). Label `"تهران"`. Sets `defaultTimezone` only if unset. | Fact 4. |
| D4 | `supportedLanguages = { ...(host ?? { en }), fa: host?.fa ?? fa }`. `fallbackLanguage = "fa"` only when host has none. | Fact 3. |
| D5 | `auditPlugin({ collections: [...] })` or `exclude` with an unknown slug → **throws at config time** (`Error('auditPlugin: unknown collection "x"')`). | Audit runs last (D1); a miss is a typo that silently disables auditing. |
| D6 | Write events: level `info`, `{ event, collection, operation, id, userId? }`; `event` = `payload.document.created` / `.updated` / `.deleted`. From `afterChange` / `afterDelete`, one line per document. | Logger skill: `event` in `domain.entity.action` form; ids only. Bulk writes stay per-id (fact 6). |
| D7 | `payload-preset` builds **ESM only** (`isCJS = false`). `payload-hooks` keeps ESM+CJS. | Fact 12. |
| D8 | `payload` becomes a **peer dependency** (`>=3.85.0 <4.0.0`) in `payload-hooks` (breaking → 3.0.0) and `payload-preset`; kept in `devDependencies` as `catalog:`. `@payloadcms/translations` is a peer of `payload-preset`. | One Payload instance per app. |
| D9 | Audit lives only in `@nexload-sdk/payload-hooks`; `payload-preset` re-exports only the **types** `AuditPluginOptions` / `AuditOperation`. | One import path per function. |
| D10 | **Removed:** admin branding plugin, `extra` option, Persian options, `./persian` and `./admin` subpaths. `payload-preset` has a single `.` export. | Revision 2; see spec. |
| D11 | Read events come from `afterOperation`: `find` → `payload.documents.listed` with `{ collection, operation: "find", count }`; `findByID` → `payload.document.read` with `{ collection, operation: "findByID", id }`. The deprecated `read` alias is ignored. Off unless `operations` includes `"read"`. | Once per request instead of once per document (fact 6). |
| D12 | Logger bridge: if Step 0.2 shows the **instance form** type-checks, `@nexload-sdk/logger` exports `getPinoLogger()` (= `getActiveLogger`) and the bridge passes the instance. Else if the **options form** type-checks, logger exports `getPinoOptions()` (= `buildPinoOptions(active options)`) and the bridge passes `{ options }`. Else drop the bridge from v1 and note it in the report. Never use a cast to force it. | Fact 7: two pino majors. |
| D13 | Auth events from `afterOperation` on collections with `auth` set: `login` → `payload.auth.logged_in` (`userId` from `result.user?.id`); `forgotPassword` → `payload.auth.password_reset_requested` (no user id, no email); `resetPassword` → `payload.auth.password_reset` (`userId` from `result.user?.id` if present). On by default via operation `"auth"`. | Security-relevant, low volume. Failed logins out of v1 (fact 6). |
| D14 | `payloadFieldsPlugin` gets `order = 900`, `slug = "nexload-fields"` in `payload-fields` (minor). | Fact 9: same ordering bug as audit. |
| D15 | `logOperation` gets a `@deprecated` JSDoc pointing to `auditPlugin`; behaviour unchanged. | It logs only `{ collection }` and returns `null` when there is no doc. Removal in the next major. |

---

## Rules for the executing agent

- **Branch:** work directly on `main`. Do not create branches. Do not push.
- **Dirty tree:** the tree may hold unrelated changes. **Never stage or revert them.** Commit only your
  paths: `git add -- <paths>` then `git commit -m "<msg>" -- <paths>`. Check `git show --stat HEAD`.
- **enola:** use `enola --generate` and `enola check`. **Never run `enola baseline pin`** — the current
  baseline is the owner's. If `check` exits `3` (not comparable), report it and continue.
- **Logging:** before writing any log call, read `skills/logger/SKILL.md` and
  `skills/logger/references/level-and-event-rules.md`. Never use `console.*` in `src/`.
- **Tests:** `node --test` `.mjs` files import from `../dist/...`, so every test script is
  `pnpm build && node --test ...`. Write the failing test first (TDD), see it fail, then implement.
- **Docs:** describe only what is implemented. Package READMEs change in the same task.
- Commit message footer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or your own
  agent's attribution if it differs).

---

### Task 1: `auditPlugin` in `@nexload-sdk/payload-hooks` → v3.0.0

Current state: `packages/payload-hooks` v2.1.0, one export `logOperation(hookType)` in
`src/log-operation.ts`. No tests, no `test` script. `payload` is in `dependencies`.

**Files**
- Create: `packages/payload-hooks/src/audit-plugin.ts`
- Modify: `packages/payload-hooks/src/index.ts` → add `export * from "./audit-plugin";`
- Modify: `packages/payload-hooks/src/log-operation.ts` → `@deprecated` JSDoc only (D15)
- Modify: `packages/payload-hooks/package.json`: add `"test": "pnpm build && node --test test/*.test.mjs"`;
  move `payload` to `peerDependencies: { "payload": ">=3.85.0 <4.0.0" }`, add `"payload": "catalog:"`
  to `devDependencies`. Keep `@nexload-sdk/logger: workspace:^` in `dependencies`.
- Create: `packages/payload-hooks/test/audit-plugin.test.mjs`
- Modify: `packages/payload-hooks/README.md`
- Create: `.changeset/payload-hooks-audit-plugin.md` (`"@nexload-sdk/payload-hooks": major`)

**Interface**
```ts
import type { Plugin } from "payload";
import type { Logger } from "@nexload-sdk/logger";

export type AuditOperation = "create" | "update" | "delete" | "read" | "auth";
export type AuditPluginOptions = {
  collections?: "all" | string[];   // default "all"
  exclude?: string[];               // default []
  operations?: AuditOperation[];    // default ["create", "update", "delete", "auth"]
  logger?: Pick<Logger, "info">;    // default: the @nexload-sdk/logger default export
};
export const AUDIT_PLUGIN_ORDER = 1000;
export function auditPlugin(options?: AuditPluginOptions): Plugin;
```

**Behavior**
- Returned function `(config) => ({ ...config, collections: config.collections?.map(...) })`;
  then `plugin.order = AUDIT_PLUGIN_ORDER`, `plugin.slug = "nexload-audit"` (D1).
- Validate `collections` (when an array) and `exclude` against `config.collections` slugs (D5).
- For each targeted collection, **append** (never prepend, never replace) to `hooks`:
  - `afterChange` if `create` or `update` enabled; skip when `args.operation` is not enabled (D6).
  - `afterDelete` if `delete` enabled (D6).
  - `afterOperation` if `read` is enabled, or `auth` is enabled and `collection.auth` is truthy.
    Inside, dispatch on `args.operation` per D11 / D13; ignore every other operation.
    **Always return `args.result`.**
  Keep other `hooks` keys and existing arrays intact. Do not touch `fields` or any other key.
- Write hook body: `{ event, collection: args.collection.slug, operation, id, userId? }`
  (`id` = `args.doc?.id ?? args.id`; `userId` = `args.req?.user?.id`, omitted if absent), call
  `logger.info(entry, message)` inside `try { } catch { }` (comment why: logging must never break a
  write), then return `args.doc`.
- Messages: `"Payload document created" | "… updated" | "… deleted" | "… read"`,
  `"Payload documents listed"`, `"Payload user logged in"`, `"Payload password reset requested"`,
  `"Payload password reset"`.

**Steps**
- [ ] 1. Write `test/audit-plugin.test.mjs` (import `../dist/index.mjs`; build configs by hand; call
  `auditPlugin(opts)(config)`; call hooks directly with fake args; `createTestLogger()` in tests only):
  - `adds afterChange and afterDelete to every collection by default`
  - `does not add read auditing unless operations includes "read"`
  - `adds afterOperation only to auth collections when only "auth" is enabled`
  - `respects collections list and exclude`
  - `throws on unknown collection slug in collections or exclude`
  - `appends after existing hooks and keeps them` (host `afterChange: [h1]` → `[h1, audit]`)
  - `skips afterChange when the operation is not enabled` (`operations: ["create"]`, call with `operation: "update"` → no entry)
  - `logs event, collection, operation, id and userId` — expect
    `{ event: "payload.document.updated", collection: "posts", operation: "update", id: 7, userId: 3 }`
    for `{ operation: "update", doc: { id: 7 }, req: { user: { id: 3 } }, collection: { slug: "posts" } }`
  - `omits userId when there is no user`
  - `logs one listed event per find with count, not ids` (`result: { docs: [{id:1},{id:2}] }` → one entry, `count: 2`, no `id`)
  - `logs read event for findByID`
  - `logs logged_in with userId from result.user`
  - `logs password_reset_requested without email` (args contain `data.email`; entry has no email anywhere)
  - `afterOperation returns result unchanged for every operation, including ignored ones`
  - `returns doc and swallows logger errors` (logger whose `info` throws; also for afterOperation)
  - `does not touch collection fields` (`deepEqual` before/after)
  - `sets order and slug on the plugin`
  - `logOperation is still exported`
- [ ] 2. `pnpm install`, then `pnpm -C packages/payload-hooks test` → FAIL (`auditPlugin` missing).
- [ ] 3. Implement `src/audit-plugin.ts`; add the `@deprecated` JSDoc to `logOperation`.
- [ ] 4. Test → PASS. `pnpm -C packages/payload-hooks lint` → clean.
  `pnpm -C packages/payload-hooks exec tsc --noEmit -p tsconfig.json` → clean.
- [ ] 5. README: `auditPlugin` (options table, all event names, "reads off by default, once per
  request", "auth on by default, failed logins not logged", "log-only", runtime: Payload config / Node),
  `logOperation` marked deprecated with exactly what it logs. Note the peer-dependency change.
- [ ] 6. Changeset (major): adds `auditPlugin`; deprecates `logOperation`; **breaking:** `payload` is now
  a peer dependency `>=3.85.0 <4.0.0`.
- [ ] 7. Commit `feat(payload-hooks)!: add auditPlugin and make payload a peer dependency`.

### Task 2: `order` and `slug` on `payloadFieldsPlugin` (D14)

**Files:** `packages/payload-fields/src/plugin.ts`, a test in `packages/payload-fields/test/`
(add to an existing plugin-related test file or create `plugin-order.test.mjs`),
`packages/payload-fields/README.md`, `.changeset/payload-fields-plugin-order.md`
(`"@nexload-sdk/payload-fields": minor`).

- [ ] 1. Tests: `payloadFieldsPlugin sets order 900 and slug nexload-fields`;
  `collection added by a default-order plugin listed after payloadFieldsPlugin gets money hooks`
  (emulate `buildConfig`: sort `[payloadFieldsPlugin(), late]` by `order ?? 0`, apply in sequence,
  `late` adds a collection with a `moneyField`; assert its `hooks.beforeOperation` is set).
- [ ] 2. Test → FAIL. 3. Export `PAYLOAD_FIELDS_PLUGIN_ORDER = 900`; set `order` / `slug` on the returned plugin.
- [ ] 4. `pnpm -C packages/payload-fields test` and `test:sqlite` → PASS; lint clean.
- [ ] 5. README: one sentence on ordering. Changeset text.
- [ ] 6. Commit `feat(payload-fields): order payloadFieldsPlugin after collection-adding plugins`.

### Task 3: logger bridge export in `@nexload-sdk/logger` (D12; skip if Step 0.2 failed both forms)

**Files:** `packages/logger/src/config.ts`, `packages/logger/src/index.ts`, a test in
`packages/logger/test/`, `packages/logger/README.md`, `.changeset/logger-payload-bridge.md`
(`"@nexload-sdk/logger": minor`).

- [ ] 1. Test (per the form chosen in Step 0.2):
  - instance form: `getPinoLogger returns the configured pino instance` (after `configureLogger`,
    `getPinoLogger().info` writes through the configured destination with redaction);
  - options form: `getPinoOptions returns redact paths, serializers and mixin of the active config`.
- [ ] 2. Test → FAIL. 3. Implement the one chosen export. Do not export both.
- [ ] 4. `pnpm -C packages/logger test` → PASS; lint clean.
- [ ] 5. README: the export, the "call `configureLogger()` before use" constraint. Changeset text.
- [ ] 6. Commit `feat(logger): expose pino bridge for Payload config.logger`.

### Task 4: new package `@nexload-sdk/payload-preset`

**Files**
- Create `packages/payload-preset/` by copying the shape of `packages/payload-hooks`
  (`tsconfig.json`, `eslint.config.mjs` identical). Then:
  - `package.json`: `"name": "@nexload-sdk/payload-preset"`, `"version": "0.0.0"`, `"private": false`,
    `"type": "module"`, `publishConfig.access: "public"`, `"files": ["dist", "README.md", "package.json"]`,
    exports (ESM only, D7, D10):
    ```json
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "default": "./dist/index.js" }
    ```
    scripts `build: node esbuild.config.mjs`, `lint: eslint .`,
    `test: pnpm build && node --test test/*.test.mjs`,
    `test:sqlite: pnpm build && node --test 'test/integration/*.test.mjs'`.
    `dependencies`: `@nexload-sdk/payload-hooks`, `@nexload-sdk/payload-fields`, `@nexload-sdk/logger`,
    `@nexload-sdk/persian` (all `workspace:^`).
    `peerDependencies`: `payload` and `@payloadcms/translations` both `>=3.85.0 <4.0.0`.
    `devDependencies`: `payload: catalog:`, `@payloadcms/translations: 3.86.0`,
    `@payloadcms/db-sqlite: 3.86.0`, plus the same tool deps as `payload-hooks`.
  - `esbuild.config.mjs`:
    ```js
    import { createBundler } from "@nexload-sdk/bundler";
    createBundler(["src/index.ts"], "dist", process.cwd(), { platform: "neutral", target: "es2022" }, false)();
    ```
- Create: `src/persian.ts`, `src/logger.ts` (only if Task 3 ran), `src/index.ts`,
  `test/persian.test.mjs`, `test/logger.test.mjs`, `test/preset.test.mjs`,
  `test/integration/sqlite.test.mjs`, `README.md`.

**Interfaces**
```ts
export function persianPlugin(): Plugin;
export function payloadLoggerPlugin(): Plugin;          // only if Task 3 ran
export type { AuditOperation, AuditPluginOptions } from "@nexload-sdk/payload-hooks";
export type NexloadPresetOptions = {
  persian?: boolean;                             // default true
  fields?: false | PayloadFieldsPluginOptions;   // default {}
  audit?: false | AuditPluginOptions;            // default {}
  logger?: boolean;                              // default true (absent if Task 3 skipped)
};
export function nexloadPreset(options?: NexloadPresetOptions): Plugin[];
```

**Behavior**
- `persianPlugin` (D2, D3, D4): i18n merge with `en`/`fa` from `@payloadcms/translations`; `fa` locale
  `rtl`; timezones with `TEHRAN_TIME_ZONE` and label `"تهران"`. Keep every other key. Return a new
  object; never mutate input.
- `payloadLoggerPlugin`: when `config.logger` is unset, set it per D12 at plugin run time; otherwise
  return config unchanged.
- `nexloadPreset`: returns `[persianPlugin(), payloadLoggerPlugin(), payloadFieldsPlugin(fields), auditPlugin(audit)]`,
  dropping disabled entries. Ordering relies on `order` (D1, D14), not on array position.

**Steps**
- [ ] 1. Tests `test/persian.test.mjs` (import `../dist/index.js`):
  - `adds fa and keeps en when host has no i18n`; `keeps host languages and host fa object`
  - `does not override host fallbackLanguage`; `sets fallbackLanguage fa when host has none`
  - `does not create localization when host has none`; `never adds a locale`
  - `sets rtl on existing fa locale object, keeps explicit rtl false`; `leaves string-form locales untouched`
  - `sets default timezone only when host has none`
  - `adds Asia/Tehran to supportedTimezones array; wraps function form; creates function when unset`
    (call function results with `{ defaultTimezones: [{ label: "UTC", value: "UTC" }] }`)
  - `does not mutate input config`; `does not touch collection fields`
- [ ] 2. Tests `test/logger.test.mjs`: `sets config.logger when unset`; `keeps host config.logger`.
- [ ] 3. Tests `test/preset.test.mjs`:
  - `enables persian, logger, fields and audit by default`
  - `omits disabled capabilities` (`{ persian: false, fields: false, audit: false, logger: false }` → `[]`)
  - `passes fields and audit options through`
  - `collection added by a host plugin listed after the preset gets audit and field hooks` — emulate
    `buildConfig`: `[...nexloadPreset(), late].sort((a,b)=>(a.order??0)-(b.order??0))`, apply in
    sequence; `late` adds `late-posts` with a `moneyField`; assert audit `afterChange` and fields
    `beforeOperation` exist on `late-posts`.
- [ ] 4. Integration `test/integration/sqlite.test.mjs` (copy setup from
  `packages/payload-operations/tests/integration/sqlite.test.mjs`): `buildConfig` with
  `plugins: [...nexloadPreset({ audit: { logger: testLogger } }), addCollection("orders")]` →
  `payload.create({ collection: "orders", data })` → exactly one entry
  `event: "payload.document.created", collection: "orders"`; `config.i18n.supportedLanguages` has
  `fa` and `en`; `admin.timezones.supportedTimezones` contains `Asia/Tehran` (proves Payload's
  `validateTimezones` accepts it); `payload.find({ collection: "orders" })` with `operations` including
  `"read"` in a second config → exactly one `payload.documents.listed` entry. Clean the temp dir and
  `await payload.destroy?.()` in `finally`.
- [ ] 5. `pnpm install`, tests → FAIL. 6. Implement. 7. `pnpm -C packages/payload-preset test` and
  `test:sqlite` → PASS; lint clean. Repo root `pnpm build` and `pnpm lint` → clean (failures in
  packages you did not touch: report, do not fix).
- [ ] 8. Commit `feat(payload-preset): add persian plugin, logger bridge and nexloadPreset`
  (paths: `packages/payload-preset`, `pnpm-lock.yaml`).

### Task 5: docs, changeset, architecture check

**Files**
- `packages/payload-preset/README.md`: install line
  (`pnpm add @nexload-sdk/payload-preset payload @payloadcms/translations`), the `buildConfig` example
  from "Context", options table and defaults, the guarantees (never touches fields, never adds
  locales, merge never overwrite, never logs bodies/emails/tokens), the ordering table
  (fields `900`, audit `1000`), the `configureLogger()`-before-`buildConfig` constraint, runtime:
  Payload config (Node) only, ESM only. Admin branding and admin font as short "do it yourself"
  recipes (plain Payload keys / `app/(payload)/layout.tsx`), clearly marked as not provided.
- `docs/packages/PAYLOAD-SUITE.md`: add `payload-preset` to the package list/ownership table and the
  boundary sentence "preset changes top-level config only; fields belong to payload-schema /
  payload-fields". Add `auditPlugin` under `payload-hooks`; plugin order under `payload-fields`.
- `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`: one line for `payload-preset` in the package map.
  If the file has unrelated uncommitted edits, commit only your hunk.
- `docs/superpowers/specs/2026-11-23-payload-preset-design.md`: `Status:` →
  `implemented (2026-11-…) — see plan for decisions D1–D15`.
- `.changeset/payload-preset-initial.md`: `"@nexload-sdk/payload-preset": minor` (0.0.0 → 0.1.0).

**Steps**
- [ ] 1. Write docs above.
- [ ] 2. `pnpm lint` → clean.
- [ ] 3. `enola --generate`, then `enola check`. Exit `0`: fine. Exit `1`: fix layer/cycle
  regressions you introduced. Findings nobody enforced: list them in your report, do not revert.
  Exit `3`: report "baseline not comparable", do **not** re-pin.
- [ ] 4. Commit `docs(payload-preset): document preset and ownership boundary`.

---

## Review focus (what a reviewer must check)
1. Host `i18n.supportedLanguages = { en }` → result has both `en` and `fa`. (Task 4)
2. Host without `localization` → still none; host with localization → no locale added. (Task 4)
3. `Asia/Tehran` passes Payload's own timezone validation in a real `buildConfig`. (Task 4)
4. Existing hooks run first and are kept. (Task 1)
5. A collection added by a host plugin listed after the preset gets audit **and** field hooks. (Tasks 2, 4)
6. Logger throwing inside any hook does not fail the operation; `afterOperation` always returns `result`. (Task 1)
7. A `find` of N documents logs one line, not N. (Tasks 1, 4)
8. No email, password, token or document body in any audit entry. (Task 1)
9. No collection `fields` changed by any plugin. (all)
10. Logger bridge uses no type cast. (Tasks 3, 4)

## Final report the agent must give
Commits (hashes + titles), Step 0.2 result and the D12 form chosen, test/lint/build commands run
with pass/fail, `enola check` exit code and any unenforced findings, and anything skipped. Do not push.
