# Production Guides & Recipes

Options, merge rules, ordering, and logging for the Payload preset.

**Topic:** guides
**Package:** `@nexload-sdk/payload-preset` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-preset/guides/
## Options

| Option | Default | Behavior |
| --- | --- | --- |
| `persian` | `true` | Persian admin defaults; set `false` to disable. |
| `logger` | `true` | Bridge SDK options when `config.logger` is unset; set `false` to disable. |
| `fields` | `{}` | Options for `payloadFieldsPlugin`; set `false` to disable. |
| `audit` | `{}` | Options for `auditPlugin`; set `false` to disable. |

`payloadFieldsPlugin` runs at order 900 and `auditPlugin` at 1000. Ordinary host plugins run first, so their collections are available to both. The preset does not add, remove, or change collection fields. Define them with [Payload Schema](/nexload-sdk/packages/payload-schema/) and [Payload Fields](/nexload-sdk/packages/payload-fields/).

## Persian merge rules

The Persian plugin preserves host languages, fallback language, and default timezone. It adds Persian translations if absent, defaults the fallback to `fa`, and adds `Asia/Tehran` to supported timezones. It sets RTL only on existing `fa` locale objects without an explicit RTL value. It never creates localization or adds locales.

## Logger bridge

Call `configureLogger()` before `buildConfig()`. When `config.logger` is unset, the plugin uses the options form from `getPayloadLoggerConfig()`; Payload creates its own Pino logger from those options. Payload writes JSON in development unless `configureLogger({ destination })` supplies a stream. Rebuild the Payload config after forced SDK reconfiguration. See the [logger API](/nexload-sdk/packages/logger/api/).

## Audit boundaries

Audit reads are off by default; auth is on. The implicit default users collection is created after plugins run and is not audited: declare it explicitly. Write events are emitted before transaction commit and may describe rolled-back changes. See [Payload Hooks](/nexload-sdk/packages/payload-hooks/) for options and events.

The `getPayloadLoggerConfig()` bridge maps the SDK `success` threshold to Payload `warn`. Payload’s logger has no `success()` method.
