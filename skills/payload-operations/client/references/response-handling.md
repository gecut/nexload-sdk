# Response handling

## Input validation and transmission

Client input handling follows these steps in order:
1. Pre-validate caller's input with `safeParseAsync`. If validation fails, throws 422 `INPUT_VALIDATION_FAILED` immediately without sending a network request.
2. Check that the original input value is JSON-serializable. If serialization fails, throws 400 `BAD_REQUEST`.
3. Transmit the **original input value** (`z.input`) as JSON. The client-side parse result is discarded; defaults and transforms execute once, on the server.

Undefined parsed input sends no body.

## Response decoding with `z.decodeAsync`

On success:
- 204 supplies `undefined` to the output schema.
- Other 2xx responses contain valid JSON.
- The client decodes the JSON response with `z.decodeAsync(output, json)` to produce `z.output<OutputSchema>`, reconstructing rich types like `Date` (configured via `z.codec`).

## Defined error decoding

For failure, JSON must match the package error envelope. A declared error is accepted only when code, status, message, and optional data match that operation's definition. The client decodes defined error data with `z.decodeAsync(data, json)`.

Non-JSON bodies, invalid envelopes, mismatched status/message, and invalid success output downgrade to a generic safe framework error (`CMSOperationError`).

Use `isTimeoutError` for package or platform timeout identity. Do not reinterpret caller aborts as timeouts, and never convert native SDK errors into operation errors.
