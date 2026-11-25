# Production Guides & Recipes

Audit options, events, privacy, and migration.

**Topic:** guides
**Package:** `@nexload-sdk/payload-hooks` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-hooks/guides/
## Audit options

| Option | Default | Behavior |
| --- | --- | --- |
| `collections` | `"all"` | All collections or an array of slugs. |
| `exclude` | `[]` | Slugs to skip. Unknown requested or excluded slugs throw at config time. |
| `operations` | `["create", "update", "delete", "auth"]` | Enabled operations; add `"read"` to audit reads. |
| `logger` | SDK default logger | Custom logger with an `info` method. |

The plugin runs at order 1000 and appends hooks after existing hooks. Writes log once per document. Reads are off by default; when enabled, each request produces one list summary or single-read event. Auth auditing is on by default for auth collections; failed logins are not logged. Logging failures do not interrupt operations. Events contain identifiers and counts, never document bodies, emails, tokens, or other credentials.

## Events

* `payload.document.created`
* `payload.document.updated`
* `payload.document.deleted`
* `payload.documents.listed`
* `payload.document.read`
* `payload.auth.logged_in`
* `payload.auth.password_reset_requested`
* `payload.auth.password_reset`

Write event IDs may be absent. List events include a count rather than document contents or IDs.

## Boundaries

Payload creates its implicit default `users` collection after plugins run. Declare the auth collection explicitly to audit its auth and write events. Write hooks emit events before transaction commit, so a later rollback can leave an event for a change that did not persist.

## Migrate from `logOperation`

`logOperation` is deprecated. Remove per-collection hooks and register the plugin once:

```ts
// Before: hooks: { afterChange: [logOperation("afterChange")] }
import { auditPlugin } from "@nexload-sdk/payload-hooks";

const plugins = [auditPlugin()];
```

The preset also includes `auditPlugin` by default; do not register it twice. See [Payload Preset](/nexload-sdk/packages/payload-preset/).
