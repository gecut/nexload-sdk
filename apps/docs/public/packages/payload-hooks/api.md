# API Reference & Compatibility

Public audit plugin and legacy hook exports.

**Topic:** api
**Package:** `@nexload-sdk/payload-hooks` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-hooks/api/
The inventory is generated from the package source exports.

## Functions

### `auditPlugin`

```ts
auditPlugin(options?: AuditPluginOptions) => Plugin
```

**Exported from:** `@nexload-sdk/payload-hooks`

Public function exported by @nexload-sdk/payload-hooks.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/audit-plugin.ts#L298)

## Constants

### `AUDIT_PLUGIN_ORDER`

```ts
AUDIT_PLUGIN_ORDER: 1000
```

**Exported from:** `@nexload-sdk/payload-hooks`

Public constant exported by @nexload-sdk/payload-hooks.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/audit-plugin.ts#L21)

### `logOperation`

```ts
logOperation<THookType extends HookType, TReturn extends HookReturnType<THookType>>(hookType: THookType) => TReturn
```

**Exported from:** `@nexload-sdk/payload-hooks`

Public constant exported by @nexload-sdk/payload-hooks.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/log-operation.ts#L23)

## Types

### `AuditOperation`

```ts
type AuditOperation = "create" | "update" | "delete" | "read" | "auth";
```

**Exported from:** `@nexload-sdk/payload-hooks`

Public type exported by @nexload-sdk/payload-hooks.

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

**Exported from:** `@nexload-sdk/payload-hooks`

Public type exported by @nexload-sdk/payload-hooks.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/audit-plugin.ts#L14)

## Exported Factories Summary

`auditPlugin(options?: AuditPluginOptions): Plugin` attaches audit hooks. `AUDIT_PLUGIN_ORDER` is `1000`. `AuditOperation` is `"create" | "update" | "delete" | "read" | "auth"`. `logOperation` is deprecated; see the [migration guide](../guides/).
