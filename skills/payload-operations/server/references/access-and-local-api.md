# Access and Local API

The built-in default permits only `Boolean(req.user)`. Use an explicit override such as `() => true` for a public operation. A denial returns 401 when `req.user` is absent and 403 when an authenticated user is denied.

Authentication remains Payload's responsibility. Do not decode cookies, JWTs, or API keys inside an operation handler.

Handlers receive `req`, which carries Payload and transaction context. For caller-scoped Local API work, preserve that context and enforce access explicitly:

```ts
await req.payload.find({
  collection: "orders",
  overrideAccess: false,
  req,
  user: req.user,
});
```

Do not add a transaction wrapper around handlers. Application workflow owns transaction boundaries and business authorization beyond the operation access gate.
