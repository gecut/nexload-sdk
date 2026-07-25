# Response handling

Input is parsed asynchronously before transport. Undefined parsed input sends no body; other values must serialize to JSON.

For success:

- 204 supplies `undefined` to the output schema;
- other 2xx responses must contain valid JSON;
- output parsing produces the caller's `z.output` value.

For failure, JSON must match the package envelope. A declared error is accepted only when code, status, message, and optional data match that operation's definition and schema. Non-JSON bodies, invalid envelopes, mismatched status/message, and invalid success output downgrade to a generic safe framework error.

Use `isTimeoutError` for package or platform timeout identity. Do not reinterpret caller aborts as timeouts, and never convert native SDK errors into operation errors.
