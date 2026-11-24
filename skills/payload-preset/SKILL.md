---
name: payload-preset
description: "Use when configuring or reviewing Payload CMS configuration with @nexload-sdk/payload-preset, composing Persian admin defaults, logger bridge, field hooks, or collection audit logging with auditPlugin. Decides between preset and standalone plugins, validates options and defaults, verifies plugin order and non-interference with collection fields, or migrates from deprecated logOperation. Do not use for field schema definitions (use payload-schema) or single field customizations (use payload-fields)."
---

# Payload Preset

## Purpose

Compose top-level Payload CMS configuration—Persian admin defaults, `@nexload-sdk/logger` bridge, semantic field hooks, and structured collection audit logging—safely, cohesively, and non-invasively.

## Trigger boundary

- Use when configuring or reviewing `payload.config.ts` using `nexloadPreset()`.
- Use when deciding between `nexloadPreset()` and individual standalone plugins (`persianPlugin`, `payloadLoggerPlugin`, `payloadFieldsPlugin`, `auditPlugin`).
- Use when tuning preset options (`persian`, `logger`, `fields`, `audit`) or configuring audit targeting (`collections`, `exclude`, `operations`).
- Use when auditing collection lifecycle events (create, update, delete, auth, read) with `auditPlugin`.
- Use when migrating from deprecated per-collection `logOperation` hooks to `auditPlugin`.
- Do not use for defining canonical field schemas and Zod contracts (use `payload-schema`).
- Do not use for implementing single semantic field factories such as integer money or Jalali datepickers (use `payload-fields`).
- Do not use for custom REST/SDK operation endpoints (use `payload-operations`).
- Do not use for general application logging outside Payload configuration (use `logger`).

## Source of truth

Treat package implementations as authoritative:
- `packages/payload-preset/src/index.ts`: `nexloadPreset`, options, defaults.
- `packages/payload-preset/src/persian.ts`: Persian language, RTL, Tehran timezone resolution.
- `packages/payload-preset/src/logger.ts`: Payload logger bridge attachment.
- `packages/payload-hooks/src/audit-plugin.ts`: Collection lifecycle auditing, event schemas, plugin order 1000.
- `packages/logger/src/config.ts`: `getPayloadLoggerConfig()`, pino bridge options.

## Required inspection

1. Read `packages/payload-preset/README.md` and `packages/payload-preset/src/index.ts`.
2. Read `packages/payload-hooks/README.md` and `packages/payload-hooks/src/audit-plugin.ts`.
3. Inspect the consuming `payload.config.ts`, specifically `plugins`, `collections`, `i18n`, `localization`, and `admin.timezones`.

## Decision flow

```
1. Setup Scope?
   ├── Standard Nexload Payload app   ──► Use nexloadPreset(options)
   └── Targeted / custom composition  ──► Use individual standalone plugins:
                                          - persianPlugin()
                                          - payloadLoggerPlugin()
                                          - payloadFieldsPlugin(options)
                                          - auditPlugin(options)

2. Preset Options & Defaults:
   ├── persian: true (default)         ──► fa translations, fallbackLanguage: "fa", rtl on fa locale, Asia/Tehran
   ├── logger: true (default)          ──► Bridges @nexload-sdk/logger options if config.logger unset
   ├── fields: {} (default)            ──► Runs payloadFieldsPlugin (order: 900)
   └── audit: {} (default)             ──► Runs auditPlugin (order: 1000)

3. Audit Operations Selection:
   ├── Default: ["create", "update", "delete", "auth"]
   ├── Read auditing ("read"): OFF by default. Enable only when strict read compliance required.
   └── Auth auditing ("auth"): ON by default. Audits login, password reset, and reset requests on auth collections.

4. Plugin Placement:
   └── Host plugins may be listed ANYWHERE in plugins array (before or after preset).
       Preset plugins run at order 900 and 1000; host plugins run earlier (default order 0).
```

## Invariants and Guarantees

- **Never touches collection fields:** `nexloadPreset` and `auditPlugin` modify top-level configuration and collection hooks only. They never add, remove, or modify collection `fields`. Field definitions belong strictly to `payload-schema` and `payload-fields`.
- **Never adds locales / creates localization:** `persianPlugin` only modifies existing localization if the host application already configured `config.localization`. It never creates a localization config or adds a locale code when unset.
- **Merge, never overwrite:** Host configuration is respected. Existing `i18n.supportedLanguages` are preserved; existing `fallbackLanguage` is preserved; existing `admin.timezones.defaultTimezone` is kept; host `config.logger` is kept if already set.
- **Audit log-only:** Audit hooks record structured events and swallow logging errors. They never alter documents, mutate input arguments, break operations, or throw exceptions.
- **Reads off by default:** Read operations (`find`, `findByID`) are disabled by default. When enabled, `find` logs a single summary with document `count` once per request, never individual documents or IDs.
- **Auth on by default:** Login, password reset, and password reset requests are audited on auth collections by default.
- **Zero credential or payload leakage:** Audit hooks never log request bodies, passwords, tokens, API keys, or user emails (even on password reset requests).

## Caveats

- **Implicit default `users` collection is not audited:** Payload automatically generates a fallback `users` collection if no users collection is declared in `config.collections`. `auditPlugin` iterates over declared `config.collections`. If a collection is not explicitly in `config.collections`, it will not receive audit hooks. Always declare the `users` collection explicitly.
- **Write events emitted before transaction commit:** `afterChange` and `afterDelete` hooks run inside Payload's database transaction before final commit. If the surrounding database transaction later rolls back, the audit log event will already have been emitted.
- **`configureLogger()` timing:** `configureLogger()` must be called at application startup before `buildConfig()` runs, so the logger options are set when Payload initializes.
- **Logger bridge behavior:** Uses the options form `getPayloadLoggerConfig()`. Payload constructs its own Pino 9 logger instance; it has no `success()` method (the SDK `success` threshold maps to `warn`). In development, Payload writes JSON unless an explicit `destination` stream is provided in `configureLogger()`.
- **Runtime constraints:** ESM only, Node.js / Payload configuration runtime only.

## Review checklist for consumer payload.config.ts

1. Is `configureLogger()` called at startup before `buildConfig()`?
2. Is `nexloadPreset()` added to `plugins`?
3. Are all collections that need auditing (including the auth `users` collection) explicitly listed in `collections`?
4. Are collection `fields` untouched by presets and plugins, and managed by semantic factories or schema compilations?
5. Is read auditing kept off unless specifically required by compliance mandates?
6. Are deprecated `logOperation` hooks removed and replaced by `auditPlugin`?

## Migration Note: logOperation to auditPlugin

`logOperation` is `@deprecated`.

### Before (manual per-collection hooks)
```ts
// DEPRECATED:
import { logOperation } from "@nexload-sdk/payload-hooks";

export const Posts = {
  slug: "posts",
  hooks: {
    afterChange: [logOperation("afterChange")],
    afterDelete: [logOperation("afterDelete")],
  },
  fields: [...],
};
```

### After (declarative top-level plugin)
```ts
import { nexloadPreset } from "@nexload-sdk/payload-preset";

export default buildConfig({
  collections: [Posts, Users],
  plugins: [
    ...nexloadPreset(), // automatically attaches afterChange, afterDelete, and auth afterOperation hooks
  ],
});
```

## Reference routing

- Read [API contract](references/api-contract.md) for exported signatures from `payload-preset`, `payload-hooks`, and the logger bridge.
- Read [Audit events](references/audit-events.md) for event names, log levels, entry schemas, and redaction rules.

## Verification

Run the test suite across affected packages:
```bash
pnpm -C packages/payload-hooks test && pnpm -C packages/payload-hooks lint
pnpm -C packages/payload-preset test && pnpm -C packages/payload-preset lint
pnpm -C packages/payload-preset exec tsc --noEmit -p tsconfig.json
```
