# Guides

Configure access, base paths, error handling, plugins, and request-scoped Payload workflows.

**Topic:** guides
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/guides/
## Make one operation public

Default access is `Boolean(req.user)`. A denied anonymous request receives 401; a denied authenticated request receives 403.

```ts
createPayloadEndpoints({
  operations: cmsOperations,
  handlers,
  access: {
    overrides: {
      status: {
        ping: () => true,
      },
    },
  },
});
```

The access tree is partial but cannot contain unknown leaves. The handler tree must match every operation exactly.

## Use a custom base path

```ts
const basePath = "/internal/actions";

createPayloadEndpoints({ basePath, operations: cmsOperations, handlers });

createCMSClient({
  basePath,
  operations: cmsOperations,
  payload: { baseURL: "https://cms.example.com/api" },
});
```

The base path accepts safe slash-separated segments and is normalized at both boundaries. `baseURL` must not contain a query or hash.

## Handle defined errors

```ts
const [error, data, defined] = await safe(
  cms.operations.inventory.reserve({ sku: "A-1", quantity: 2 }),
);

if (defined && isDefinedError(error, "OUT_OF_STOCK")) {
  console.log(error.data.available);
} else if (error) {
  reportUnexpectedError(error);
} else {
  console.log(data.reservationId);
}
```

Do not treat every `CMSOperationError` as a declared business outcome. Check `defined`, preferably through `safe()` or `isDefinedError()`.

## Add a timeout

```ts
const cms = createCMSClient({
  operations: cmsOperations,
  payload: { baseURL },
  plugins: [timeoutPlugin({ timeout: 5_000 })],
});
```

The timeout plugin affects both request sources, but converts a timeout to the package timeout error only for operations. Caller aborts and native SDK failures are preserved.

## Use Local API in the caller's request

Pass the handler's `req` into Local API calls and keep access checks enabled:

```ts
await req.payload.update({
  collection: "orders",
  id,
  data,
  overrideAccess: false,
  req,
  user: req.user,
});
```

The adapter does not open transactions or supply Local API access options for you. Compose transaction behavior explicitly in application code.
