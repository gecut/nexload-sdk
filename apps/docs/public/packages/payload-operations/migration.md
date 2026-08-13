# Migration

Move custom Payload endpoints to shared typed operation contracts incrementally.

**Topic:** migration
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/migration/
Payload Operations 0.1.0 is the initial release. This page describes migration from project-owned custom endpoints; use the [package changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/CHANGELOG.md) for later version-specific changes.

## Incremental migration

1. Select one POST workflow with JSON input and output.
2. Write Zod input, output, and declared business-error schemas.
3. Place the contract in a module shared by server and client.
4. Move endpoint logic into the matching handler leaf.
5. Express public or special access as the narrowest override.
6. Register generated endpoints while retaining the old route.
7. Switch one consumer to `cms.operations`.
8. Compare status, wire JSON, access, CORS, and failure behavior before removing the old route.

```ts
// Before
await fetch("/api/custom/reserve", {
  method: "POST",
  body: JSON.stringify(input),
});

// After
await cms.operations.inventory.reserve(input);
```

## Compatibility cautions

Do not copy transformed Zod output into handler return types. The handler owns the wire input shape; the client owns final output parsing. Preserve request-scoped Local API calls with `req` and `overrideAccess: false`.

If an old endpoint uses uploads, streaming, non-POST methods, custom serialization, or transaction middleware, it is outside this package's contract. Keep that endpoint native.

## Rollback

Keep the previous route available until all consumers use the generated operation. Rollback means restoring the old client call and endpoint registration; this package performs no database migration or stored-data rewrite.
