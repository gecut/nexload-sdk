# Query contract

`payloadHealthCheck(payload, options)` returns a check named `payload` with component `payload`.

The adapter calls:

```ts
payload.find({
  collection: options.collection,
  limit: options.limit ?? 1,
  depth: options.depth ?? 0,
  where: options.where,
});
```

Keep the query deterministic and cheap. Prefer a stable collection, `limit: 1`, `depth: 0`, and a narrow indexed filter only when the integration needs it. Do not fetch relationship graphs or run business reports.

## Empty collection semantics

If `expectedMinDocuments` is omitted, the query succeeding is enough: zero documents and even a missing/non-numeric `totalDocs` do not fail.

If a minimum is configured, `totalDocs` must be numeric and at least that value. Otherwise the result is unhealthy with `PAYLOAD_QUERY_FAILED` and message `Payload query did not meet expectations.`

## Query failure

A thrown value returns unhealthy, metrics for latency/up, stable code `PAYLOAD_QUERY_FAILED`, generic message `Payload query failed.`, and cause name/message in the raw result.

Public serializer defaults suppress cause messages. Do not expose raw database/connection context from the report.

## Metrics

The check returns latencyMs, totalDocs when parsed (otherwise null), and up. These are check-local JSON diagnostics. Prometheus/OTel custom metrics require a collector; exporters do not flatten them.
