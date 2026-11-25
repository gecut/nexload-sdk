# @nexload-sdk/payload-hooks

**Type-safe Payload CMS collection audit and operation logging hooks for Node.js.**

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/payload-hooks)](https://www.npmjs.com/package/@nexload-sdk/payload-hooks)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node | Payload 3](https://img.shields.io/badge/runtime-Node%20%7C%20Payload%203-lightgrey.svg)

> [!IMPORTANT]
> Version 3.0.0 is pending in `.changeset/payload-hooks-audit-plugin.md`: it introduces `auditPlugin`, deprecates `logOperation`, and makes `payload >=3.85.0 <4.0.0` a required peer dependency.

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Migration](#migration)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/payload-hooks` attaches structured audit logging hooks to Payload CMS collections via `auditPlugin`. It solves inconsistent or missing visibility into document writes, reads, and authentication lifecycle events across collections. It is for Payload 3 backend teams who want structured, identifier-only audit logs routed through `@nexload-sdk/logger`.

What it is not:

- Not a database-backed audit trail; events are log-only and no audit records are persisted.
- Not an access control layer or data mutation hook.
- Not a full payload/body logger; document bodies, emails, and credentials are never logged.

## Philosophy

Writes log once per document; reads (off by default) log once per request: `find` logs a `count`, and `findByID` logs the document `id`. Auth events are on by default and apply only to collections with `auth` enabled.

- **IDs-only logging:** Audit entries emit collection slugs, document IDs, user IDs, and counts—never document bodies, credentials, or PII.
- **Non-blocking by design:** Logger failures are caught so logging issues never abort a database operation.
- **Additive hook attachment:** `auditPlugin` runs at `AUDIT_PLUGIN_ORDER` (`1000`) and appends hooks after existing collection hooks without altering fields.

## Install

```bash
pnpm add @nexload-sdk/payload-hooks payload
# or
npm install @nexload-sdk/payload-hooks payload
# or
yarn add @nexload-sdk/payload-hooks payload
# or
bun add @nexload-sdk/payload-hooks payload
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `payload` | `>=3.85.0 <4.0.0` | Required |

## Quick start

```ts
import { auditPlugin } from "@nexload-sdk/payload-hooks";
import { buildConfig } from "payload";

export default buildConfig({
  plugins: [
    auditPlugin({
      operations: ["create", "update", "delete", "read", "auth"],
    }),
  ],
  // ...collections, db, secret
});
```

## Usage

### Filtering collections

Target specific collections or exclude noisy ones:

```ts
import { auditPlugin } from "@nexload-sdk/payload-hooks";

export const audit = auditPlugin({
  collections: ["orders", "products", "users"],
  exclude: [],
});
```

An unknown slug in `collections` or `exclude` throws `auditPlugin: unknown collection "<slug>"` at config time.

### Emitted events

- `payload.document.created`
- `payload.document.updated`
- `payload.document.deleted`
- `payload.documents.listed`
- `payload.document.read`
- `payload.auth.logged_in`
- `payload.auth.password_reset_requested`
- `payload.auth.password_reset`

### Legacy `logOperation` (deprecated)

`logOperation(hookType)` logs `{ collection }` at `info` level with the hook type (`beforeChange`, `afterChange`, `afterDelete`, `afterRead`) as its message. It returns `args.data` when truthy, otherwise `args.doc` when truthy, otherwise `null`. Prefer `auditPlugin` for new code.

## API

### Root entry (`@nexload-sdk/payload-hooks`)

| Export | Kind | Summary |
| --- | --- | --- |
| `auditPlugin` | `function` | Payload plugin that attaches identifier-only audit hooks at order `1000` |
| `AUDIT_PLUGIN_ORDER` | `const` | Plugin execution order (`1000`) |
| `AuditPluginOptions` | `type` | Configuration options for `auditPlugin` |
| `AuditOperation` | `type` | `"create" \| "update" \| "delete" \| "read" \| "auth"` |
| `logOperation` | `function` | Deprecated per-hook operation logger |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collections` | `"all" \| string[]` | `"all"` | Collection slugs to audit, or `"all"` (unknown slugs throw at config time) |
| `exclude` | `string[]` | `[]` | Collection slugs to skip (unknown slugs throw at config time) |
| `operations` | `AuditOperation[]` | `["create", "update", "delete", "auth"]` | Enabled operations (`read` is off by default) |
| `logger` | `{ info: ... }` | `@nexload-sdk/logger` default | Custom logger with an `info` method |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtime:** Node.js / Payload 3 server configuration only.
- **Payload version:** `>=3.85.0 <4.0.0`.

## Caveats

> [!WARNING]
> Payload creates its implicit default `users` auth collection during config sanitization, **after** plugins run. It cannot be audited automatically or named in `collections` or `exclude`. Declare your auth collection explicitly to audit auth and write events.

> [!WARNING]
> Write events are emitted by `afterChange` and `afterDelete` inside the operation before the database transaction commits. If the transaction later fails and rolls back, a log entry may describe a change that did not persist.

> [!NOTE]
> Authentication auditing logs successful logins and password reset events; failed logins are not logged.

## Migration

### From v2 to v3

- Install `payload` (`>=3.85.0 <4.0.0`) as a peer dependency.
- Replace manual `logOperation()` hook wiring with `auditPlugin()`.
- If you rely on Payload's implicit `users` collection, declare the auth collection explicitly in your Payload config's `collections` array. `auditPlugin` cannot see or name the implicit one.

## Related packages

- [logger](../logger/README.md) — Default structured logger used by `auditPlugin`
- [payload-preset](../payload-preset/README.md) — Composed Payload preset that bundles `auditPlugin`

## License

MIT
