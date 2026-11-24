# Payload Preset — Execution Plan (self-contained)

> **For agentic workers:** this file is the whole brief. You do not need the conversation that
> produced it. Read "Context" and "Verified facts" first, then do Tasks 1–5 in order.
> Steps use checkbox (`- [ ]`) syntax; tick them as you go.

**Status:** ready to execute (Step 0 gate done on 2026-11-23, see "Step 0 result").
**Spec:** `docs/superpowers/specs/2026-11-23-payload-preset-design.md` (approach C, approved).
Where this plan and the spec disagree, **this plan wins**: it records decisions made after
checking the installed Payload code.

---

## Context (why this exists)

`nexload-sdk` is a pnpm + turbo monorepo of publishable packages (`packages/*`) used to build
recurring Iranian e-commerce sites on Payload CMS 3 + Next.js. Every project re-applies the
same Payload config by hand: Persian admin language, RTL, `Asia/Tehran` timezone, admin
logo, and logging hooks per collection. Copies drift: `fa` is set in 7 of 8 project configs,
RTL + `Asia/Tehran` only in 3; `logOperation` is added by hand in 12 files (one project) and
6 files (another).

Goal: one call, `nexloadPreset()`, that returns plain Payload plugins in a fixed order:

```ts
import { buildConfig } from "payload";
import { nexloadPreset } from "@nexload-sdk/payload-preset";

export default buildConfig({
  // ...db, secret, collections
  plugins: nexloadPreset({
    persian: true,
    admin: { logo: "@/components/Logo#Logo", icon: "@/components/Icon#Icon", titleSuffix: "— فروشگاه" },
    audit: { exclude: ["payload-preferences"] },
    extra: [myCommercePlugin()],
  }),
});
```

### Hard rules (from the spec; do not break)
1. **Our types are Payload's types.** Plugins are typed `Plugin` from `payload`. No wrapper
   around `buildConfig`, no own config type, no registry, no DI.
2. **Preset plugins never touch collection `fields`.** Fields belong to `payload-schema`
   (definitions/validation) and `payload-fields` (components). Every plugin test asserts this.
3. **Merge, never overwrite.** If the host already set a value, keep it.
4. **Audit is log-only** in v1 (no collection writes). `afterRead` auditing is **off by default**
   (it runs once per document in every list request; high-performance goal).
5. **Logging must never break a save.** A failing logger call is swallowed inside the hook.
6. **No speculative options.** Admin brand color and admin font are out of v1 (thin evidence).

### Non-goals for this plan
- `apps/docs` site pages. `@nexload-sdk/payload-hooks` is deliberately listed as out-of-scope
  in `apps/docs/tests/contracts.test.mjs` (the "out-of-scope packages" test). Do not add
  `payload-preset` or `payload-hooks` to the docs site; that is a later decision.
- Persisted audit trail collection, request timing (`durationMs`), font loading, brand color.

---

## Step 0 result (gate, done — re-check only if versions changed)

- [x] Logger API settled: `@nexload-sdk/logger` v5 is committed (`0bc8bcd`). Call shape is
  `logger.info(obj?, msg?)`, so the old assumption `logger.info(event, message)` still fits.
- [x] Builder check of the spec against installed Payload `3.86.0` types (findings below).
- [ ] **Your only Step 0 action:** run `pnpm ls payload --depth 0 -r | grep -m3 payload` and
  confirm the workspace still resolves Payload `3.86.x`. If it is a different minor, re-check
  the four facts marked **(verify)** below before coding.

## Verified facts (from `node_modules/.pnpm/payload@3.86.0_*/node_modules/payload/dist`)

1. **(verify)** `Plugin` type (`config/types.d.ts`):
   `((config: Config) => Config | Promise<Config>) & { options?; order?: number; slug?: string }`.
   `order` and `slug` are marked `@experimental`.
2. **(verify)** `buildConfig` (`config/build.js`) copies `config.plugins`, **stable-sorts them by
   `plugin.order ?? 0`**, then runs them in sequence. Consequence: a plugin with a higher
   `order` runs after all default-order plugins, wherever the host put it in the array.
3. **(verify)** i18n (`config/sanitize.js`): when the host sets no `i18n`, Payload uses
   `supportedLanguages: { en }`, `fallbackLanguage: "en"`. If the host sets `supportedLanguages`,
   it **replaces** the default (so `{ fa }` alone would drop English). `fallbackLanguage` that is
   not a key of `supportedLanguages` silently becomes the first key.
4. **(verify)** Timezones: `admin.timezones = { defaultTimezone?: string; supportedTimezones?:
   Timezone[] | (({ defaultTimezones }) => Timezone[]) }`, `Timezone = { label; value }`.
   **`Asia/Tehran` is not in Payload's `defaultTimezones`.** Setting only `defaultTimezone`
   would point at a value missing from the select list, so the plugin must also make sure the
   supported list contains it.
5. Localization: `localization.locales` is **either `string[]` or `Locale[]`**
   (`Locale = { code; label; rtl?; fallbackLocale? }`). Only the object form can carry `rtl`.
6. Admin keys: `admin.components.graphics.Logo` / `.Icon` (`CustomComponent`, a string path
   such as `"@/components/Logo#Logo"` works), `admin.meta.titleSuffix`, `admin.dateFormat`.
7. Hook args (`collections/config/types.d.ts`):
   - `afterChange({ collection, context, data, doc, operation: "create" | "update", previousDoc, req })` → must return the doc.
   - `afterDelete({ collection, context, doc, id, req })`.
   - `afterRead({ collection, context, doc, findMany?, req })` → must return the doc.
   - `collection.slug` is the slug; `req.user?.id` is the user id when logged in.
8. Translations: `@payloadcms/translations/languages/fa` exports `fa`; `.../languages/en`
   exports `en` (package has `"./languages/*"` export). Installed `3.86.0`.
9. Build tool: `tools/bundler/index.js` `createBundler(entry, outDir, baseDir, esbuildOptions, isCJS)`.
   **Only `dependencies` and `peerDependencies` are marked external**; anything imported at
   runtime that lives only in `devDependencies` gets bundled into `dist/`. Payload 3 is ESM-only.
10. Integration test pattern exists: `packages/payload-operations/tests/integration/sqlite.test.mjs`
    (`@payloadcms/db-sqlite` `3.86.0`, temp dir DB, `buildConfig` + `getPayload`). Copy its setup.

## Decisions taken during the builder check (changes vs. the spec)

| # | Decision | Reason |
|---|---|---|
| D1 | `auditPlugin()` returns a plugin with `order = 1000` and `slug = "nexload-audit"`. | Fact 2: guarantees audit runs last even if the host writes `plugins: [...nexloadPreset(), otherPlugin()]`. Within `nexloadPreset` the array order is also correct, so if Payload drops `order` the preset still works. |
| D2 | Persian plugin **never adds a locale** to `localization`. It only sets `rtl: true` on an existing `fa` locale object whose `rtl` is `undefined`. It never creates `localization`. String-form locales are left untouched. | Adding or enabling a locale changes the DB schema of localized fields. Spec said "add"; that is a silent data-shape change. |
| D3 | Persian plugin ensures `Asia/Tehran` is in `supportedTimezones` (array: append if missing; function: wrap and append if missing; unset: function returning `[...defaultTimezones, TEHRAN]`). Sets `defaultTimezone` only if unset. | Fact 4. |
| D4 | `supportedLanguages` result = `{ ...(host ?? { en }), fa: host.fa ?? fa }`. `fallbackLanguage` set to `options.fallbackLanguage ?? "fa"` only when host has none. | Fact 3: keep English, keep host languages. |
| D5 | `auditPlugin({ collections: [...] })` with a slug that does not exist in the config → **throws at config time** (`Error('auditPlugin: unknown collection "x"')`). Same for `exclude`. | Audit runs last (D1), so every collection exists; a miss is a typo that would silently disable auditing. |
| D6 | Audit log line: level `info`, fields `{ event, collection, operation, id, userId }`, message human text. `event` is `payload.document.created` / `.updated` / `.deleted` / `.read`. No document content. `userId` omitted when there is no user. | Logger skill rule: every line has `event` in `domain.entity.action` form; log ids only, never bodies. |
| D7 | `payload-preset` builds **ESM only** (`isCJS = false`), like `payload-operations`. `payload-hooks` keeps its current ESM+CJS build. | Fact 9: Payload 3 and `@payloadcms/translations` are ESM. `payload-hooks` imports only types from `payload`. |
| D8 | `payload` becomes a **peer dependency** (`>=3.85.0 <4`) in both packages, kept in `devDependencies` as `catalog:`. `@payloadcms/translations` is a peer of `payload-preset` with the same range. | Fact 9 + one Payload instance per app. Moving `payload` to peer in `payload-hooks` is a breaking change → `payload-hooks` 3.0.0. |
| D9 | No `./audit` subpath in `payload-preset`. Audit lives in `@nexload-sdk/payload-hooks`; `payload-preset` re-exports only the **types** `AuditPluginOptions` / `AuditOperation`. | Avoid two import paths for one function. |

---

## Rules for the executing agent

- **Branch:** work directly on `main`. Do not create branches. Do not push.
- **Dirty tree:** the index already holds unrelated staged changes (graphify deletions) and
  unrelated edits in `AGENTS.md`, `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `.gitignore`,
  `package.json`, etc. **Never stage or revert them.** Commit only your paths:
  `git add -- <your paths>` then `git commit -m "<msg>" -- <your paths>` (path-limited commit
  ignores other staged entries). Check with `git show --stat HEAD` after each commit.
- **enola:** use `enola --generate` and `enola check` to grade your change. **Never run
  `enola baseline pin`** — the current baseline is the owner's; re-pinning destroys it. If
  `check` says the baseline is not comparable (exit `3`), report that and continue.
- **Logging:** before writing any log call, read `skills/logger/SKILL.md` and
  `skills/logger/references/level-and-event-rules.md`. Never use `console.*` in `src/`.
- **Tests:** `node --test` `.mjs` files that import from `../dist/...`, so every test script is
  `pnpm build && node --test ...`. Write the failing test first (TDD), see it fail, then implement.
- **Docs:** describe only what is implemented. Package READMEs change in the same task.
- Commit message footer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or your own
  agent's attribution if it differs).

---

### Task 1: `auditPlugin` in `@nexload-sdk/payload-hooks` → v3.0.0

Current state: `packages/payload-hooks` v2.1.0, one export `logOperation(hookType)` in
`src/log-operation.ts`; it logs only `{ collection }` with the hook type as message, and its
README implies more. No tests, no `test` script. `payload` is in `dependencies`.

**Files**
- Create: `packages/payload-hooks/src/audit-plugin.ts`
- Modify: `packages/payload-hooks/src/index.ts` → add `export * from "./audit-plugin";`
- Modify: `packages/payload-hooks/package.json`:
  - `"scripts"`: add `"test": "pnpm build && node --test test/*.test.mjs"`
  - move `payload` from `dependencies` to `peerDependencies: { "payload": ">=3.85.0 <4.0.0" }`;
    add `"payload": "catalog:"` to `devDependencies`. Keep `@nexload-sdk/logger: workspace:^`
    in `dependencies`.
- Create: `packages/payload-hooks/test/audit-plugin.test.mjs`
- Modify: `packages/payload-hooks/README.md`
- Create: `.changeset/payload-hooks-audit-plugin.md` (`"@nexload-sdk/payload-hooks": major`)

**Interface**
```ts
import type { Plugin } from "payload";
import type { Logger } from "@nexload-sdk/logger";

export type AuditOperation = "create" | "update" | "delete" | "read";
export type AuditPluginOptions = {
  collections?: "all" | string[];   // default "all"
  exclude?: string[];               // default []
  operations?: AuditOperation[];    // default ["create", "update", "delete"]
  logger?: Pick<Logger, "info">;    // default: the @nexload-sdk/logger default export
};
export const AUDIT_PLUGIN_ORDER = 1000;
export function auditPlugin(options?: AuditPluginOptions): Plugin;
```

**Behavior**
- Returned function `(config) => ({ ...config, collections: config.collections?.map(...) })`;
  then assign `plugin.order = AUDIT_PLUGIN_ORDER` and `plugin.slug = "nexload-audit"` (D1).
- Validate `collections` (when an array) and `exclude` against `config.collections` slugs (D5).
- For each targeted collection, **append** (never prepend, never replace) to `hooks`:
  - `afterChange` if `create` or `update` is in `operations`; inside, skip when the actual
    `args.operation` is not in `operations`.
  - `afterDelete` if `delete` is in `operations`.
  - `afterRead` only if `read` is in `operations`.
  Keep `collection.hooks` other keys and existing arrays intact. Do not touch `fields` or any
  other collection key.
- Hook body: build `{ event, collection: args.collection.slug, operation, id, userId? }`
  (`id` = `args.doc?.id ?? args.id`; `userId` = `args.req?.user?.id`, omitted if absent), call
  `logger.info(entry, message)` inside `try { } catch { }` (comment why: logging must never
  break a write), then return `args.doc`.
- Messages: `"Payload document created"`, `"... updated"`, `"... deleted"`, `"... read"`.
- `logOperation` stays exported and unchanged.

**Steps**
- [ ] 1. Write `test/audit-plugin.test.mjs` (import from `../dist/index.mjs`; build config objects
  by hand; call `auditPlugin(opts)(config)`; call hooks directly with fake args; use
  `createTestLogger()` from `@nexload-sdk/logger/testing` — add `@nexload-sdk/logger` testing
  usage only in tests). Test names:
  - `adds afterChange and afterDelete to every collection by default`
  - `does not add afterRead unless operations includes "read"`
  - `respects collections list and exclude`
  - `throws on unknown collection slug in collections or exclude`
  - `appends after existing hooks and keeps them` (host `afterChange: [h1]` → `[h1, audit]`)
  - `skips afterChange when the operation is not enabled` (`operations: ["create"]`, call with `operation: "update"` → no entry)
  - `logs event, collection, operation, id and userId` — expect entry with
    `event: "payload.document.updated", collection: "posts", operation: "update", id: 7, userId: 3`
    for `{ operation: "update", doc: { id: 7 }, req: { user: { id: 3 } }, collection: { slug: "posts" } }`
  - `omits userId when there is no user`
  - `returns doc and swallows logger errors` (logger whose `info` throws)
  - `does not touch collection fields` (`deepEqual` before/after)
  - `sets order and slug on the plugin` (`order === 1000`, `slug === "nexload-audit"`)
  - `logOperation is still exported`
- [ ] 2. `pnpm install` (package.json changed), then `pnpm -C packages/payload-hooks test` → FAIL (`auditPlugin` missing).
- [ ] 3. Implement `src/audit-plugin.ts`.
- [ ] 4. `pnpm -C packages/payload-hooks test` → PASS. `pnpm -C packages/payload-hooks lint` → clean.
  `pnpm -C packages/payload-hooks exec tsc --noEmit -p tsconfig.json` → clean.
- [ ] 5. README: document `auditPlugin` (options table, event names, "afterRead off by default",
  "log-only", runtime: Payload config / Node only), keep `logOperation` section but state
  exactly what it logs (`{ collection }` + hook type). Note the peer-dependency change.
- [ ] 6. Changeset (major) text: adds `auditPlugin`; **breaking:** `payload` is now a peer
  dependency `>=3.85.0 <4.0.0`.
- [ ] 7. Commit `feat(payload-hooks)!: add auditPlugin and make payload a peer dependency`.

### Task 2: new package `@nexload-sdk/payload-preset` + `persianPlugin`

**Files**
- Create `packages/payload-preset/` by copying the shape of `packages/payload-hooks`
  (`tsconfig.json`, `eslint.config.mjs` identical). Then:
  - `package.json`: `"name": "@nexload-sdk/payload-preset"`, `"version": "0.0.0"`,
    `"private": false`, `"type": "module"`, `publishConfig.access: "public"`,
    `"files": ["dist", "README.md", "package.json"]`, exports (ESM only, D7):
    ```json
    ".":        { "types": "./dist/index.d.ts",   "import": "./dist/index.js",   "default": "./dist/index.js" },
    "./persian":{ "types": "./dist/persian.d.ts", "import": "./dist/persian.js", "default": "./dist/persian.js" },
    "./admin":  { "types": "./dist/admin.d.ts",   "import": "./dist/admin.js",   "default": "./dist/admin.js" }
    ```
    scripts `build: node esbuild.config.mjs`, `lint: eslint .`,
    `test: pnpm build && node --test test/*.test.mjs`,
    `test:sqlite: pnpm build && node --test 'test/integration/*.test.mjs'`.
    `peerDependencies`: `payload` and `@payloadcms/translations` both `>=3.85.0 <4.0.0`.
    `devDependencies`: `payload: catalog:`, `@payloadcms/translations: 3.86.0`,
    `@payloadcms/db-sqlite: 3.86.0`, plus the same tool deps as `payload-hooks`.
  - `esbuild.config.mjs`:
    ```js
    import { createBundler } from "@nexload-sdk/bundler";
    createBundler(["src/index.ts", "src/persian.ts", "src/admin.ts"], "dist", process.cwd(),
      { platform: "neutral", target: "es2022" }, false)();
    ```
    After the first build, check `ls dist` shows `index.js`, `persian.js`, `admin.js` and the
    `.d.ts` files at those paths; if tsc emits elsewhere, fix `tsconfig.json` `rootDir: "./src"`.
- Create: `src/persian.ts`, `src/index.ts` (temporarily `export * from "./persian";`)
- Create: `test/persian.test.mjs`, `README.md` (stub; filled in Task 5)

**Interface**
```ts
export type PersianPresetOptions = {
  timezone?: string;              // default "Asia/Tehran"
  timezoneLabel?: string;         // default "Tehran"
  dateFormat?: string;            // set admin.dateFormat only if given and host has none
  fallbackLanguage?: "fa" | "en"; // default "fa"; used only when host has none
};
export function persianPlugin(options?: PersianPresetOptions): Plugin;
```

**Behavior** (decisions D2, D3, D4)
- `i18n.supportedLanguages = { ...(host ?? { en }), fa: host?.fa ?? fa }` (import `en`, `fa`
  from `@payloadcms/translations/languages/en|fa`). Keep `i18n.translations` and other keys.
- `i18n.fallbackLanguage`: host value if set, else `options.fallbackLanguage ?? "fa"`.
- `localization`: if `false`/undefined → leave as is. If `locales` are objects and one has
  `code === "fa"` with `rtl === undefined` → set `rtl: true` (new object, new array). Never add
  or remove locales. String-form locales: unchanged.
- `admin.timezones.defaultTimezone`: set to `options.timezone` only if unset.
- `admin.timezones.supportedTimezones`: ensure an entry with `value === timezone` exists (D3).
- `admin.dateFormat`: only if `options.dateFormat` given and host has none.
- Return a new config object; do not mutate the input (tests compare).

**Steps**
- [ ] 1. Tests (`test/persian.test.mjs`, import `../dist/persian.js`):
  - `adds fa and keeps en when host has no i18n`
  - `keeps host languages and host fa object`
  - `does not override host fallbackLanguage`; `sets fallbackLanguage fa when host has none`
  - `does not create localization when host has none`
  - `sets rtl on existing fa locale object, keeps explicit rtl false`
  - `never adds a locale` (localization with `en` only → still only `en`)
  - `leaves string-form locales untouched`
  - `sets default timezone only when host has none`
  - `adds Asia/Tehran to supportedTimezones array; wraps function form; creates function when unset`
    (for the function cases call the result with `{ defaultTimezones: [{ label: "UTC", value: "UTC" }] }`)
  - `does not mutate input config`
  - `does not touch collection fields`
- [ ] 2. `pnpm install`, `pnpm -C packages/payload-preset test` → FAIL.
- [ ] 3. Implement `src/persian.ts`.
- [ ] 4. Test → PASS; `pnpm -C packages/payload-preset lint` → clean.
- [ ] 5. Commit `feat(payload-preset): add persian plugin` (paths: `packages/payload-preset`, `pnpm-lock.yaml`).

### Task 3: `adminBrandingPlugin`

**Files:** create `packages/payload-preset/src/admin.ts`, `test/admin.test.mjs`; add
`export * from "./admin";` to `src/index.ts`.

**Interface**
```ts
export type AdminBrandingOptions = {
  logo?: string;        // component path, e.g. "@/components/Logo#Logo" → admin.components.graphics.Logo
  icon?: string;        // → admin.components.graphics.Icon
  titleSuffix?: string; // → admin.meta.titleSuffix
};
export function adminBrandingPlugin(options: AdminBrandingOptions): Plugin;
```
Each value is set only if given and the host has none. Preserve every other
`admin.components` / `admin.meta` key.

- [ ] 1. Tests: `sets graphics.Logo and graphics.Icon`, `does not override host graphics`,
  `sets meta.titleSuffix only when host has none`, `keeps other admin.components keys`,
  `empty options → deepEqual input`, `does not touch collection fields`.
- [ ] 2. Test → FAIL. 3. Implement. 4. Test → PASS, lint clean.
- [ ] 5. Commit `feat(payload-preset): add admin branding plugin`.

### Task 4: `nexloadPreset` + integration test

**Files:** `packages/payload-preset/src/index.ts`, `package.json` (add dependency
`"@nexload-sdk/payload-hooks": "workspace:^"`), `test/preset.test.mjs`,
`test/integration/sqlite.test.mjs`.

**Interface**
```ts
import type { AuditPluginOptions } from "@nexload-sdk/payload-hooks";
export type { AuditOperation, AuditPluginOptions } from "@nexload-sdk/payload-hooks";
export type NexloadPresetOptions = {
  persian?: boolean | PersianPresetOptions; // default true
  admin?: AdminBrandingOptions;             // default: not applied
  audit?: false | AuditPluginOptions;       // default: auditPlugin() applied
  extra?: Plugin[];                         // host plugins, placed before audit
};
export function nexloadPreset(options?: NexloadPresetOptions): Plugin[];
// order: persian → admin → ...extra → audit
```
`src/index.ts` also re-exports `persianPlugin`, `adminBrandingPlugin` and their option types.

- [ ] 1. Tests (`test/preset.test.mjs`):
  - `returns plugins in order persian, admin, extra, audit` (apply with
    `for (const p of plugins) config = await p(config)`; spy extra plugin records which hooks
    exist when it runs)
  - `persian enabled and audit enabled by default`; `admin omitted when no options`
  - `omits disabled capabilities` (`persian: false, audit: false, extra: [x]` → `[x]`)
  - `audit covers a collection added by an extra plugin`
  - `audit runs last under Payload sorting even when host appends plugins after the preset` —
    emulate `buildConfig`: `[...nexloadPreset(), late].sort((a,b)=>(a.order??0)-(b.order??0))`;
    `late` adds collection `late-posts`; result has the audit hook on `late-posts`.
- [ ] 2. Integration (`test/integration/sqlite.test.mjs`, copy setup from
  `packages/payload-operations/tests/integration/sqlite.test.mjs`): `buildConfig` with
  `plugins: nexloadPreset({ audit: { logger: testLogger }, extra: [addCollection("orders")] })`
  → `payload.create({ collection: "orders", data })` → exactly one entry with
  `event: "payload.document.created", collection: "orders"`; and `config.i18n.supportedLanguages`
  has `fa` and `en`; `admin.timezones.supportedTimezones` contains `Asia/Tehran`
  (this last check proves Payload's `validateTimezones` accepts it). Clean the temp dir and
  `await payload.destroy?.()` in `finally`.
- [ ] 3. Tests → FAIL. 4. Implement `nexloadPreset`.
- [ ] 5. `pnpm -C packages/payload-preset test` and `test:sqlite` → PASS. Repo root
  `pnpm build` and `pnpm lint` → clean (read the output; failures in packages you did not
  touch: report, do not fix).
- [ ] 6. Commit `feat(payload-preset): add nexloadPreset`.

### Task 5: docs, changeset, architecture check

**Files**
- `packages/payload-preset/README.md`: install line
  (`pnpm add @nexload-sdk/payload-preset @nexload-sdk/payload-hooks payload @payloadcms/translations`),
  the `buildConfig` example from "Context", options tables for all three plugins, default
  values, the "never touches fields / never adds locales / merge never overwrite" guarantees,
  the plugin-order note (audit `order = 1000`), runtime: Payload config (Node) only, ESM only.
- `docs/packages/PAYLOAD-SUITE.md`: add `payload-preset` to the package list/ownership table and
  the boundary sentence "preset changes top-level config only; fields belong to
  payload-schema / payload-fields". Add `auditPlugin` under `payload-hooks`.
- `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`: add one line for `payload-preset` in the
  package map. **This file has unrelated uncommitted edits** — commit only your hunk
  (stage with a temporary index or `git apply --cached` of a patch containing only your hunk;
  verify with `git diff --cached -- docs/architecture/PROJECT-KNOWLEDGE-BASE.md`).
- `docs/superpowers/specs/2026-11-23-payload-preset-design.md`: change the `Status:` line to
  `implemented (2026-11-…) — see plan for decisions D1–D9`.
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
1. Host `i18n.supportedLanguages = { en }` → result has both `en` and `fa`. (Task 2)
2. Host without `localization` → still none; host with localization → no locale added. (Task 2)
3. `Asia/Tehran` passes Payload's own timezone validation in a real `buildConfig`. (Task 4)
4. Existing `afterChange` hooks run first and are kept. (Task 1)
5. Collection added by an extra **or a later host plugin** is audited. (Task 4)
6. Logger throwing inside a hook does not fail the write. (Task 1)
7. No collection `fields` changed by any plugin. (all)

## Final report the agent must give
Commits (hashes + titles), test/lint/build commands run with pass/fail, `enola check` exit code
and any unenforced findings, and anything skipped. Do not push.
