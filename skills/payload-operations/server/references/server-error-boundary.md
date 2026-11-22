# Server error boundary

## Request body parsing and size limits

Read an empty body as `undefined`. Require `application/json` for non-empty bodies, reject malformed JSON (400 `BAD_REQUEST`), then parse input asynchronously.

Incoming request bodies are bounded by `maxBodyBytes` (default `1_048_576` / 1 MiB):
- Checks `Content-Length` header upfront.
- Streams the body while counting bytes, aborting if the stream exceeds the limit.
- Requests over the limit return HTTP 413 `PAYLOAD_TOO_LARGE`.

Sanitized input issues may be returned in the framework validation envelope (422 `INPUT_VALIDATION_FAILED`).

## Output encoding and data leak prevention

Handlers return `z.output<output>`. The server encodes the result using `z.encodeAsync(output, result)`.

Standard `z.object` output schemas automatically strip unrecognized keys on encode, guaranteeing internal model fields, password hashes, or secret attributes never reach callers. Using `z.looseObject` or `.passthrough()` is an explicit opt-in to passing extra keys.

## Codec safety rule

Because responses are encoded with `z.encodeAsync`, output schemas and defined-error `data` schemas must be codec-safe:
- Plain schemas or checks/overwrites (`.trim()`, `.toLowerCase()`)
- Symmetrical codecs via `z.codec` (e.g. for `Date` instances)

If an output or error-data schema contains a unidirectional `.transform()`, `z.encodeAsync` throws and the server returns HTTP 500 `INTERNAL_SERVER_ERROR`.

## Declared errors and error isolation

Handlers throw operation-specific errors through the generated factory:

```ts
throw errors.ORDER_NOT_FOUND({
  data: { orderId: input.orderId },
});
```

Before serialization, verify the error belongs to the current operation and encode its data schema with `z.encodeAsync(data, value)`.

`CMSOperationError` is exported from `@nexload-sdk/payload-operations/errors` and `@nexload-sdk/payload-operations/server`.

Unknown exceptions, undeclared framework errors, Payload errors, invalid output, mismatched declared errors, and causes become a generic 500 response. Never serialize a stack, cause, raw Zod output issue, database detail, or Payload error object.
