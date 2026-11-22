# Access and Local API

## Required access.default

`createPayloadEndpoints` strictly requires `access.default`. Omitting it throws `TypeError: createPayloadEndpoints requires access.default.` at configuration time:

```ts
const endpoints = createPayloadEndpoints({
  operations,
  handlers,
  access: {
    // REQUIRED: default access function for all operations
    default: ({ req }) => !!req.user,
    // Optional per-operation overrides
    overrides: {
      publicGroup: {
        publicOp: () => true,
      },
    },
  },
});
```

A denial returns 401 when `req.user` is absent and 403 when an authenticated user is denied.

Authentication remains Payload's responsibility. Do not decode cookies, JWTs, or API keys inside an operation handler.

## Local API overrideAccess caveat

By default, Payload 3 `req.payload` Local API calls execute with `overrideAccess: true`. If collection-level access control must be enforced for the current caller, pass `{ overrideAccess: false, req }` explicitly:

```ts
await req.payload.find({
  collection: "orders",
  overrideAccess: false,
  req,
  user: req.user,
});
```

## Database transactions

Operations do not automatically wrap database mutations in transactions. If multi-step database consistency or atomicity is required, manage transactions explicitly via Payload's transaction API (`await req.payload.db.beginTransaction()` / `commitTransaction()`).
