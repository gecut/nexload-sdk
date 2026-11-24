# API Contract

## `@nexload-sdk/payload-preset`

```ts
import type { Plugin } from "payload";
import type { PayloadFieldsPluginOptions } from "@nexload-sdk/payload-fields";
import type { AuditOperation, AuditPluginOptions } from "@nexload-sdk/payload-hooks";

export type { AuditOperation, AuditPluginOptions } from "@nexload-sdk/payload-hooks";

export type NexloadPresetOptions = {
  persian?: boolean;
  fields?: false | PayloadFieldsPluginOptions;
  audit?: false | AuditPluginOptions;
  logger?: boolean;
};

export function nexloadPreset(options?: NexloadPresetOptions): Plugin[];
export function persianPlugin(): Plugin;
export function payloadLoggerPlugin(): Plugin;
```

### Preset Plugins and Execution Order

| Plugin | Origin | Order | Slug | Description |
| --- | --- | --- | --- | --- |
| `persianPlugin()` | `@nexload-sdk/payload-preset` | Default (0) | unset | Injects Persian i18n, fallback language `fa`, RTL on `fa` locale objects, Tehran timezone defaults. |
| `payloadLoggerPlugin()` | `@nexload-sdk/payload-preset` | Default (0) | unset | Bridges `@nexload-sdk/logger` config to Payload if `config.logger` is unset. |
| `payloadFieldsPlugin(options)` | `@nexload-sdk/payload-fields` | 900 (`PAYLOAD_FIELDS_PLUGIN_ORDER`) | `nexload-fields` | Registers string-money conversion in `beforeOperation` and slug generator endpoints. |
| `auditPlugin(options)` | `@nexload-sdk/payload-hooks` | 1000 (`AUDIT_PLUGIN_ORDER`) | `nexload-audit` | Attaches `afterChange`, `afterDelete`, and `afterOperation` audit logging hooks. |

Because `payloadFieldsPlugin` runs at order 900 and `auditPlugin` runs at order 1000, collections registered by host plugins (which run at default order 0 or earlier) are always present and processed, regardless of where host plugins appear in Payload's `plugins` array.

---

## `@nexload-sdk/payload-hooks`

```ts
import type { Plugin } from "payload";
import type { Logger } from "@nexload-sdk/logger";

export type AuditOperation = "create" | "update" | "delete" | "read" | "auth";

export type AuditPluginOptions = {
  collections?: "all" | string[];
  exclude?: string[];
  operations?: AuditOperation[];
  logger?: Pick<Logger, "info">;
};

export const AUDIT_PLUGIN_ORDER: 1000;

export function auditPlugin(options?: AuditPluginOptions): Plugin;

type HookType = "beforeChange" | "afterChange" | "afterDelete" | "afterRead";

type HookReturnType<T extends HookType> =
  T extends "beforeChange" ? CollectionBeforeChangeHook :
  T extends "afterChange" ? CollectionAfterChangeHook :
  T extends "afterDelete" ? CollectionAfterDeleteHook :
  T extends "afterRead" ? CollectionAfterReadHook :
  never;

/** @deprecated Use auditPlugin instead. */
export const logOperation: <
  THookType extends HookType,
  TReturn extends HookReturnType<THookType>
>(
  hookType: THookType
) => TReturn;
```

---

## Logger Bridge (`@nexload-sdk/logger`)

```ts
import type pino from "pino";

type PayloadLoggerConfig = {
  options: pino.LoggerOptions;
  destination?: { write(line: string): void };
};

export function getPayloadLoggerConfig(): PayloadLoggerConfig;
export function configureLogger(options: LoggerOptions): Logger;
```

- Call `configureLogger()` before `buildConfig()`.
- If `config.logger` is unset, `payloadLoggerPlugin()` sets `config.logger = getPayloadLoggerConfig()`.
- Payload creates its own Pino 9 logger from `options` and `destination`.
- The bridge maps SDK `success` log level threshold to Pino `warn` (Pino has no native `success` level).
- Output is JSON in development unless an explicit `destination` stream is supplied in `configureLogger()`.
