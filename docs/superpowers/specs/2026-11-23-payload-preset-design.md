# Payload preset: plugins + thin preset (design)

Status: **approved approach, ready to execute.** Logger dependency met (v5, `0bc8bcd`). Builder check done: see decisions D1–D9 in `docs/superpowers/plans/2026-11-23-payload-preset.md` (they override this spec where they differ).
Date: 2026-11-23. Source discussion: brainstorming session on the recurring-pattern research
(`docs/research/recurring-patterns/SYNTHESIS.md`).

## Intent

We build e-commerce sites with a repeated shape by composing code modules on top of Payload.
Every project re-applies the same Payload config tweaks by hand (Persian admin, RTL, Tehran
timezone, admin branding, logging hooks). Copy-paste drifts: `fa` is set in 7 of 8 project
configs, but RTL + `Asia/Tehran` only in 3. The goal is one place that applies these defaults
correctly, in the right order, while staying cheap to maintain across Payload major versions.

## Goals
- Apply the Persian admin preset, admin branding and audit logging with one call.
- Guarantee plugin order (audit logging last, so it sees collections added by other plugins).
- Each capability stays usable on its own as a normal Payload plugin.

## Non-goals
- No new configuration system on top of Payload. No wrapper around `buildConfig`.
- No plugin registry, dependency resolution, lifecycle or DI.
- No theme engine for the admin panel.
- No field definitions or validation (owned by `payload-schema` / `payload-fields`).
- No persisted audit trail collection in v1 (see Audit plugin).

## Anti-goals (would be a failure even if it works)
- Every Payload major forces a rewrite of our layer. Keep our types = Payload's types.
- Logging that slows list/read endpoints (conflicts with the high-performance goal).
- The preset silently changing collection fields and clashing with `payload-schema`.

## Constraints
- Payload `Plugin` is `(config: Config) => Config | Promise<Config>`. We build only on that.
- Admin React components must be referenced through package subpath exports + import map,
  same as `payload-fields` already does (`./admin/*`).
- Rule of three: only add to the preset what at least 2–3 projects already repeat.

## Approaches considered
| | Approach | Trade-off | Decision |
|---|---|---|---|
| A | Thick wrapper `defineNexloadConfig()` replacing `buildConfig` | One entry point, but a second composition system and its own types; doubles the cost of each Payload major (we are on `feat/payload-stable-major` right now) | Rejected |
| B | Plain plugins only | Simplest; but order and defaults are re-done by hand in each project | Acceptable fallback |
| C | One plugin per capability + thin `nexloadPreset()` returning `Plugin[]` in fixed order | ~50 lines of glue; fixes ordering once; each plugin still standalone | **Chosen** |

## Design

### Shape
```ts
export default buildConfig({
  collections: [...],
  plugins: nexloadPreset({
    persian: true,                  // or PersianPresetOptions
    admin: { logo, icon, brandColor },
    audit: { collections: "all" },  // always applied last
    extra: [myCommercePlugin()],    // host plugins, placed before audit
  }),
});
```
`nexloadPreset(options): Plugin[]`. Order: `persian` → `admin` → `extra[]` → `audit`.
It returns plain plugins; no custom config type.

### Package
One package, working name `@nexload-sdk/payload-preset`, with subpath exports:
`.` (`nexloadPreset`), `./persian`, `./admin`, `./audit`. Split into separate packages only
when one is consumed alone in real projects (avoid versioning overhead).

### Persian plugin (`./persian`)
Config-level only: `i18n.supportedLanguages.fa` (and fallback), localization locale `fa` with
`rtl: true` when localization is enabled, admin timezone default `Asia/Tehran`, admin date
display format, admin font via CSS. Evidence: meetal.app, gecut/nexload, choobinooo,
hr-collector configs. Must merge with, not overwrite, host i18n/localization.

### Admin plugin (`./admin`)
Minimal options: logo, icon, brand color, `meta` title suffix. Evidence is thin (graphics in
2/8 configs: rasad-srm, persianpartshop), so keep it small until more projects ask.

### Audit plugin (`./audit`)
Evolves `@nexload-sdk/payload-hooks` (v3), instead of a new package. Today `logOperation`
is added by hand per collection (choobinooo: 12 files, persianpartshop: 6) and logs only
collection + hook type, while its docs claim timing, user and doc id.
- `auditPlugin({ collections: "all" | string[], operations, exclude })` appends hooks to
  every matching collection at config time.
- Logs: collection, operation, doc id, user id, duration where measurable. Redaction via logger.
- `afterRead` **off by default** (runs per document in every list).
- Log-only in v1. Event shape chosen so it can later also be written to a collection.
- Keep `logOperation` exported for compatibility.

### Boundary with schema / fields
**Preset plugins never touch collection fields.** `payload-schema` owns field definitions and
validation; `payload-fields` owns field components (Jalali, slug, money). The preset only
changes top-level config (i18n, localization, admin, hooks). A plugin that needs to add fields
does not belong in the preset.

## Dependencies
1. **Logger first.** `@nexload-sdk/logger` (still under `packages/refactoring/`) is the base of
   the audit plugin. Research found its docs describe Pino while the implementation is
   renderer-based. Settle the logger API (structured events, redaction, child bindings) before
   building `./audit`.
2. `env` is also under `packages/refactoring/`; not needed by the preset itself.

## Left to the builder
- Exact Payload config keys per version (verify against the installed Payload 3.x types).
- Font loading mechanism in admin (CSS import vs component).
- Measuring duration across before/after hooks (request context vs `afterOperation`).

## Open questions (for later)
- Should audit events ever be persisted (who changed a price)? If yes, a later `auditCollection` option.
- Package name: `payload-preset` vs `payload-kit`.
- Builder check not run yet; run it when this work is resumed.
