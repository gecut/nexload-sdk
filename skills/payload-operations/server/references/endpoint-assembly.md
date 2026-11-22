# Endpoint assembly

Pass the same contract to `createPayloadEndpoints`. The handler object mirrors every namespace and operation exactly; missing, extra, non-function, or malformed leaves fail during endpoint creation. Access overrides mirror only leaves that need a different policy and may be partial.

```ts
createPayloadEndpoints({
  operations,
  handlers,
  access: { default: CMSOperationAccess, overrides?: ... }, // required
  basePath?: string,      // default "/operations"
  maxBodyBytes?: number,  // default 1_048_576 (1 MiB)
});
```

## Request body limits (`maxBodyBytes`)

`createPayloadEndpoints` limits incoming request bodies via `maxBodyBytes` (defaults to `1_048_576` bytes / 1 MiB):
- Checks incoming `Content-Length` header upfront to reject oversized requests before buffering.
- Streams the request body while counting bytes, aborting if the limit is exceeded.
- Oversized requests return HTTP 413 `PAYLOAD_TOO_LARGE`.

## Routing and responses

The default base path is normalized by the package; when a custom `basePath` is used, configure the client with the same value. Generated operation routes use POST. Matching OPTIONS routes provide CORS preflight handling.

Empty parsed output returns 204 with no body. Other success returns JSON 200 with encoded output. All responses pass through Payload's CORS header helper.
