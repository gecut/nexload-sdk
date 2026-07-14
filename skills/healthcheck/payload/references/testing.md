# Testing

Build before test because the package suite imports `dist/index.mjs`.

## Exact query

Use a small Payload-like fake that records `find` arguments. Assert the exact default object and custom `limit`, `depth`, and `where` propagation. Return a realistic `{ totalDocs, docs }` result.

## Semantics

Cover:

- successful default query with documents;
- empty collection without expected minimum remains ok;
- totalDocs equal to, above, and below expected minimum;
- missing/non-numeric totalDocs with expected minimum fails;
- thrown Error and non-Error normalize to stable failure;
- custom scopes run only where declared.

## Timeout

Return a never-settling Promise from `find`, set a small adapter timeout, run through a real manager, and assert:

- report/check is unhealthy by default;
- `timedOut` is true;
- error code is `CHECK_TIMEOUT` rather than `PAYLOAD_QUERY_FAILED`.

Do not assert that the underlying query was cancelled; the adapter does not pass a signal.

## Privacy

Include a fake sensitive cause in a thrown error, then serialize through core defaults and assert cause suppression. If metrics export is in scope, assert check-local latency/totalDocs are absent from Prometheus/OTel unless a collector provides equivalents.

Commands:

```bash
pnpm -C packages/healthcheck/payload build
pnpm -C packages/healthcheck/payload lint
pnpm -C packages/healthcheck/payload test
```
