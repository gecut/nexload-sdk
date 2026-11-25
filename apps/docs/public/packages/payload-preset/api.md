# API Reference & Compatibility

Public preset exports and runtime constraints.

**Topic:** api
**Package:** `@nexload-sdk/payload-preset` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-preset/api/
The inventory is generated from the package source exports.

## Functions

### `nexloadPreset`

```ts
nexloadPreset(options?: NexloadPresetOptions) => Plugin[]
```

**Exported from:** `@nexload-sdk/payload-preset`

Public function exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/index.ts#L23)

### `payloadLoggerPlugin`

```ts
payloadLoggerPlugin() => Plugin
```

**Exported from:** `@nexload-sdk/payload-preset`

Public function exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/logger.ts#L5)

### `persianPlugin`

```ts
persianPlugin() => Plugin
```

**Exported from:** `@nexload-sdk/payload-preset`

Public function exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/persian.ts#L91)

## Types

### `AuditOperation`

```ts
type AuditOperation = "create" | "update" | "delete" | "read" | "auth";
```

**Exported from:** `@nexload-sdk/payload-preset`

Public type exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/audit-plugin.ts#L12)

### `AuditPluginOptions`

```ts
type AuditPluginOptions = {
  collections?: "all" | string[];
  exclude?: string[];
  operations?: AuditOperation[];
  logger?: Pick<Logger, "info">;
};
```

**Exported from:** `@nexload-sdk/payload-preset`

Public type exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/audit-plugin.ts#L14)

### `NexloadPresetOptions`

```ts
type NexloadPresetOptions = {
  persian?: boolean
  fields?: false | PayloadFieldsPluginOptions
  audit?: false | AuditPluginOptions
  logger?: boolean
};
```

**Exported from:** `@nexload-sdk/payload-preset`

Public type exported by @nexload-sdk/payload-preset.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/index.ts#L16)

## Exported Factories Summary

`nexloadPreset(options?: NexloadPresetOptions): Plugin[]` returns the enabled plugins. `persianPlugin()` and `payloadLoggerPlugin()` are also available separately. The package re-exports `AuditOperation` and `AuditPluginOptions`, and exports `NexloadPresetOptions`.

Import `payloadFieldsPlugin` from `@nexload-sdk/payload-fields` and `auditPlugin` from `@nexload-sdk/payload-hooks`. This package is ESM only and intended for Node.js Payload configuration.
