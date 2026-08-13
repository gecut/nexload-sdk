# Troubleshooting

Diagnose contract trees, routes, validation, errors, CORS, timeout, and Payload SDK behavior.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/troubleshooting/
## Operation method returns before network access

Client input parsing happens first. Inspect the sanitized `INPUT_VALIDATION_FAILED` issues and pass the schema's input type. Async refinements and transforms are supported.

## Endpoint returns 401 or 403

The default operation access policy requires `req.user`. Anonymous denial is 401 and authenticated denial is 403. Add a narrow operation override for public routes; do not parse cookies, JWTs, or API keys inside the handler.

## Route returns 404

Confirm that Payload includes every returned endpoint and that client and server use the same `basePath`. The operation path is derived from the exact namespace keys. Do not include a query or hash in `baseURL`.

## Browser preflight fails

Register the complete result of `createPayloadEndpoints`, including its OPTIONS entries. Success and error responses use Payload's `headersWithCors`, so verify Payload's CORS configuration and the request origin.

## A defined error became internal

The response must match the operation's code, status, message, and data schema exactly. Unknown, malformed, non-JSON, or forged envelopes are deliberately downgraded. Throw the supplied handler factory instead of constructing a lookalike object.

## Output becomes an internal error

Handlers return the output schema's input shape, and that value must also be JSON-serializable. The client receives the output schema's parsed shape. Return a wire-safe value rather than the transformed result.

## Timeout classification is unexpected

`timeoutPlugin` requires a positive finite integer. It converts only operation transport timeouts. A caller-supplied abort remains the original abort, and native Payload SDK request failures are not converted to operation errors.

## Payload SDK method behaves differently

`cms.payload` is the native SDK instance and keeps native SDK semantics and error types. Inspect Payload SDK documentation for its request behavior; operation error handling applies only to `cms.operations`.
