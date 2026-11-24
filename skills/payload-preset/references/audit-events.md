# Audit Events Reference

The `auditPlugin` emits structured log entries at level `info` using `@nexload-sdk/logger` (or a custom logger implementing `Pick<Logger, "info">`).

## Event Catalog

| Event Name | Operation | Hook | Trigger Condition | Message |
| --- | --- | --- | --- | --- |
| `payload.document.created` | `"create"` | `afterChange` | Document created via API or Admin UI | `"Payload document created"` |
| `payload.document.updated` | `"update"` | `afterChange` | Document updated via API or Admin UI | `"Payload document updated"` |
| `payload.document.deleted` | `"delete"` | `afterDelete` | Document deleted via API or Admin UI | `"Payload document deleted"` |
| `payload.documents.listed` | `"find"` | `afterOperation` | Read operation enabled; collection find query | `"Payload documents listed"` |
| `payload.document.read` | `"findByID"` | `afterOperation` | Read operation enabled; collection findByID query | `"Payload document read"` |
| `payload.auth.logged_in` | `"login"` | `afterOperation` | Auth operation enabled; user logged in | `"Payload user logged in"` |
| `payload.auth.password_reset` | `"resetPassword"` | `afterOperation` | Auth operation enabled; password successfully reset | `"Payload password reset"` |
| `payload.auth.password_reset_requested` | `"forgotPassword"` | `afterOperation` | Auth operation enabled; forgotPassword triggered | `"Payload password reset requested"` |

---

## Event Schemas and Fields

### 1. Document Created (`payload.document.created`)
```ts
{
  event: "payload.document.created",
  collection: string,
  operation: "create",
  id?: string | number,
  userId?: string | number // included only when req.user.id is present
}
```

### 2. Document Updated (`payload.document.updated`)
```ts
{
  event: "payload.document.updated",
  collection: string,
  operation: "update",
  id?: string | number,
  userId?: string | number // included only when req.user.id is present
}
```

### 3. Document Deleted (`payload.document.deleted`)
```ts
{
  event: "payload.document.deleted",
  collection: string,
  operation: "delete",
  id: string | number, // doc.id ?? args.id
  userId?: string | number // included only when req.user.id is present
}
```

### 4. Documents Listed (`payload.documents.listed`)
Emitted once per list query when `"read"` is included in `operations`:
```ts
{
  event: "payload.documents.listed",
  collection: string,
  operation: "find",
  count: number // docs.length or 0, never document contents or arrays of IDs
}
```

### 5. Document Read (`payload.document.read`)
Emitted once per single read query when `"read"` is included in `operations`:
```ts
{
  event: "payload.document.read",
  collection: string,
  operation: "findByID",
  id?: string | number
}
```

### 6. User Logged In (`payload.auth.logged_in`)
Emitted when `"auth"` is included in `operations` and collection has `auth: true`:
```ts
{
  event: "payload.auth.logged_in",
  collection: string,
  operation: "login",
  userId?: string | number // extracted from result.user.id
}
```

### 7. Password Reset Completed (`payload.auth.password_reset`)
Emitted when `"auth"` is included in `operations` and collection has `auth: true`:
```ts
{
  event: "payload.auth.password_reset",
  collection: string,
  operation: "resetPassword",
  userId?: string | number // extracted from result.user.id
}
```

### 8. Password Reset Requested (`payload.auth.password_reset_requested`)
Emitted when `"auth"` is included in `operations` and collection has `auth: true`:
```ts
{
  event: "payload.auth.password_reset_requested",
  collection: string,
  operation: "forgotPassword"
}
```

---

## Security Redaction Rules

1. **No User Credentials:** Never logs raw passwords, password hashes, or reset tokens.
2. **No Email in Auth Requests:** `forgotPassword` explicitly strips user email addresses; the log event records only `{ event, collection, operation }`.
3. **No Request or Document Bodies:** Mutation hooks never log full document data or incoming request payloads.
4. **No Timing/Duration:** `auditPlugin` does not record operation execution duration or timestamps beyond Pino's standard logger timestamp.
5. **No Individual List Items:** `find` queries log only aggregate document `count`, preventing mass data leakage in log sinks.
