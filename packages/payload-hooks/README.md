# @nexload-sdk/payload-hooks

Payload config hooks for Node.js. Audit events are log-only; no audit records are stored.

## Install

```bash
pnpm add @nexload-sdk/payload-hooks payload
```

Payload is a peer dependency (`>=3.85.0 <4.0.0`). This is a breaking change from v2.

## Audit plugin

```ts
import { auditPlugin } from "@nexload-sdk/payload-hooks";

const plugins = [auditPlugin({ operations: ["create", "update", "delete", "read", "auth"] })];
```

| Option | Default | Meaning |
| --- | --- | --- |
| `collections` | `"all"` | Collection slugs to audit, or all collections. |
| `exclude` | `[]` | Collection slugs to skip. Unknown slugs throw at config time. |
| `operations` | `["create", "update", "delete", "auth"]` | Enabled audit operations. |
| `logger` | SDK default logger | Logger with an `info` method. |

The plugin runs at order `1000` and appends hooks after existing hooks. It does not change fields. Writes log once per document. Reads are off by default and log once per request. Authentication is on by default for auth collections; failed logins are not logged. Logger failures do not interrupt operations. Entries contain only identifiers and counts, never document bodies or credentials.

Payload creates its implicit default `users` auth collection during config sanitization, after plugins run. It is not audited and cannot be named in `collections` or `exclude`; declare the auth collection explicitly to audit auth and write events.

Write events are emitted by `afterChange` and `afterDelete` inside the operation, before the transaction commits. If the operation later fails and rolls back, an event may describe a change that did not persist.

Events: `payload.document.created`, `payload.document.updated`, `payload.document.deleted`, `payload.documents.listed`, `payload.document.read`, `payload.auth.logged_in`, `payload.auth.password_reset_requested`, and `payload.auth.password_reset`.

## Deprecated: `logOperation(hookType)`

Use `auditPlugin` instead. `logOperation` logs `{ collection }` at info level with the hook type as its message. It returns `args.data` when truthy, otherwise `args.doc` when truthy, otherwise `null`. Supported types are `beforeChange`, `afterChange`, `afterDelete`, and `afterRead`.
