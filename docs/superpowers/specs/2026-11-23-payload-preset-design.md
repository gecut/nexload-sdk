# Payload preset: plugins + thin preset (design)

Status: implemented (2026-11-24) — see plan for decisions D1–D15; logger bridge uses the options form (getPayloadLoggerConfig).
Date: 2026-11-23, revised 2026-11-24. Source discussion: brainstorming session on the recurring-pattern
research (`docs/research/recurring-patterns/SYNTHESIS.md`).

## Intent

We build e-commerce sites with a repeated shape by composing code modules on top of Payload.
Every project re-applies the same Payload config tweaks by hand (Persian admin, RTL, Tehran
timezone, logging hooks) and has to remember to register SDK plugins. Copy-paste drifts: `fa` is set
in 7 of 8 project configs, but RTL + `Asia/Tehran` only in 3.

The value of the preset is **preventing silent mistakes**, not saving lines:
- a plugin that walks `config.collections` but runs before another plugin adds collections;
- `supportedLanguages: { fa }` silently dropping English;
- `defaultTimezone: "Asia/Tehran"` pointing at a value missing from Payload's timezone list;
- `moneyField()` used without `payloadFieldsPlugin()` registered, so money input is never normalized;
- Payload's own logs bypassing `@nexload-sdk/logger` redaction.

## Goals
- Apply Persian admin defaults, `payload-fields` runtime, audit logging and the logger bridge with one call.
- Every plugin that walks collections runs after the plugins that add them, wherever the host puts it.
- Each capability stays usable on its own as a normal Payload plugin.

## Non-goals
- No new configuration system on top of Payload. No wrapper around `buildConfig`.
- No plugin registry, dependency resolution, lifecycle or DI.
- No theme engine, admin branding or admin font (see "Removed in revision 2").
- No field definitions or validation (owned by `payload-schema` / `payload-fields`).
- No persisted audit trail collection in v1.

## Anti-goals (would be a failure even if it works)
- Every Payload major forces a rewrite of our layer. Keep our types = Payload's types.
- Logging that slows list/read endpoints (conflicts with the high-performance goal).
- The preset silently changing collection fields or the DB schema.

## Constraints
- Payload `Plugin` is `(config: Config) => Config | Promise<Config>` with experimental `order` / `slug`.
  `buildConfig` stable-sorts plugins by `order ?? 0`. We build only on that.
- Rule of three: only add to the preset what at least 2–3 projects already repeat.

## Approaches considered
| | Approach | Trade-off | Decision |
|---|---|---|---|
| A | Thick wrapper `defineNexloadConfig()` replacing `buildConfig` | One entry point, but a second composition system and its own types; doubles the cost of each Payload major | Rejected |
| B | Plain plugins only | Simplest; but defaults and plugin selection are re-done by hand in each project | Acceptable fallback |
| C | One plugin per capability, each owning its own `order`, + thin `nexloadPreset()` returning `Plugin[]` | Ordering lives in each plugin, so it also holds outside the preset; preset only bundles defaults | **Chosen** |

## Design

### Shape
```ts
export default buildConfig({
  collections: [...],
  plugins: [
    ...nexloadPreset(),          // persian + fields + audit + logger, all on by default
    myCommercePlugin(),          // host plugins go anywhere; ordering is handled by `order`
  ],
});
```
```ts
type NexloadPresetOptions = {
  persian?: boolean;                             // default true
  fields?: false | PayloadFieldsPluginOptions;   // default {}
  audit?: false | AuditPluginOptions;            // default {}
  logger?: boolean;                              // default true
};
```
`nexloadPreset(options): Plugin[]`. It returns plain plugins; no custom config type, no `extra` option.

### Ordering (owned by each plugin, not by the preset)
| Plugin | `order` | Why |
|---|---|---|
| `persianPlugin`, `payloadLoggerPlugin` | default (`0`) | top-level config only; position irrelevant |
| host plugins | default (`0`) | may add collections |
| `payloadFieldsPlugin` (in `payload-fields`) | `900` | walks `config.collections` to add money/slug hooks |
| `auditPlugin` (in `payload-hooks`) | `1000` | walks `config.collections`; must see every collection |

### Package
One package, working name `@nexload-sdk/payload-preset`, **single `.` export** (Node / Payload config
only; no subpaths needed). Depends on `@nexload-sdk/payload-hooks`, `@nexload-sdk/payload-fields`,
`@nexload-sdk/logger`, `@nexload-sdk/persian`.

### Persian plugin
Config-level only, no options:
- `i18n.supportedLanguages` gains `fa`, keeps host languages, keeps `en` when the host set none.
- `i18n.fallbackLanguage = "fa"` only when the host set none.
- An existing `fa` locale object gets `rtl: true` when `rtl` is unset. Never adds a locale (DB schema).
- `admin.timezones`: `defaultTimezone = TEHRAN_TIME_ZONE` (from `@nexload-sdk/persian`) when unset; the
  supported list always contains it, labelled `"تهران"`.

A host that wants another timezone or fallback language sets it in its own config; merge keeps it.

### Fields runtime (`payloadFieldsPlugin`)
Already exists in `@nexload-sdk/payload-fields`. The preset registers it by default. `payload-fields`
gains `order = 900` and `slug = "nexload-fields"` on the returned plugin.

### Audit plugin (in `@nexload-sdk/payload-hooks`)
Evolves `payload-hooks` instead of a new package. Log-only in v1.
- **Writes** (`create`, `update`, `delete`): `afterChange` / `afterDelete`, one line per document
  (bulk updates stay per-id).
- **Reads** (`read`, off by default): `afterOperation` for `find` / `findByID`, **one line per request**,
  not per document. Lists log `count`, never ids or bodies.
- **Auth** (`auth`, on by default): `afterOperation` for `login`, `forgotPassword`, `resetPassword` on
  auth collections. Never logs email, password or token. Failed logins throw before `afterOperation`
  runs, so they are out of v1 (later: `hooks.afterError`).
- Logging never breaks an operation: logger errors are swallowed inside the hook.
- `logOperation` stays exported but is marked `@deprecated` (it logs only `{ collection }`).

### Logger bridge (`payloadLoggerPlugin`)
Sets `config.logger` so Payload's own logs (errors, startup) go through `@nexload-sdk/logger`
formatting and redaction. Only when the host set no `config.logger`.
Payload pins `pino 9.14.0`; `@nexload-sdk/logger` uses `pino ^10.4.0`. The plan gates the mechanism:
pass our pino instance if it type-checks as `PayloadLogger`, else pass `{ options }` built from our
pino options, else drop the bridge from v1.
Constraint for hosts: call `configureLogger()` before `buildConfig()` runs.

### Boundary with schema / fields
**Preset plugins never touch collection fields.** `payload-schema` owns field definitions and
validation; `payload-fields` owns field components and their runtime hooks. The preset only changes
top-level config (i18n, localization, admin timezones, logger) and adds hooks.

## Revision 2 changes (vs. the 2026-11-23 spec)
### Removed
- **Admin branding plugin and `./admin` subpath.** Evidence 2 of 8 projects; it only renamed three
  Payload keys (`admin.components.graphics.Logo/Icon`, `admin.meta.titleSuffix`). Write them directly.
- **`extra` option.** With `order` on each collection-walking plugin, host plugins can sit anywhere in
  the array. `extra` was a second way to do the same thing.
- **Persian options** `timezone`, `timezoneLabel`, `dateFormat`, `fallbackLanguage`. Speculative; the
  host's own config wins under merge. `admin.dateFormat` is Gregorian date-fns; Jalali display belongs
  to `payload-fields` `admin/jalali-date-field`.
- **`./persian` subpath.** Node-only config package; one entry point is enough.
- **Admin font.** Not reachable from config (it lives in `app/(payload)/layout.tsx` / `custom.scss`).
  Documented as a README recipe, not a feature.

### Added
- `payloadFieldsPlugin` registered by the preset, with `order = 900` in `payload-fields`.
- Logger bridge (`config.logger`).
- Audit `auth` operation group.

### Changed
- Audit reads use `afterOperation` (once per request) instead of `afterRead` (once per document).
- Ordering moved from preset array position into each plugin's `order`.
- Persian timezone constant comes from `@nexload-sdk/persian`; label is Persian.
- `logOperation` deprecated instead of only kept.

## Open questions (for later)
- Should audit events ever be persisted (who changed a price)? If yes, a later `auditCollection` option.
- Package name: `payload-preset` vs `payload-kit` (`payload-editor` already uses "presets" for Lexical).
- Failed-login auditing via `hooks.afterError`.
- `durationMs` via `beforeOperation` + `req.context`.
