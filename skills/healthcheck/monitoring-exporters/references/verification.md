# Verification

## Report fixture

Create one deterministic report containing:

- stable service/runtime identity and observedAt;
- ok, degraded, and unhealthy check variants;
- check-local metrics that must not appear;
- collector numbers, booleans, strings, null, and non-finite values;
- described and undescribed collector metrics;
- allowed, empty, disallowed, and collision labels;
- explicit unit/type/observedAt for OTel preservation.

## Prometheus assertions

- exact normalized/prefixed names;
- one-hot status values;
- deterministic label ordering and escaping;
- allowed/default labels retained;
- disallowed/empty labels dropped without dropping sample;
- HELP present only when enabled and described;
- null/non-finite omitted, boolean/string conversion exact;
- no check-local custom metric;
- OpenMetrics terminates with `# EOF`.

Prefer an exact text snapshot plus targeted assertions that explain policy.

## OTel assertions

- stable resource attributes and unknown fallback;
- status mapping 1/0.5/0;
- aggregate/check durations;
- collector-only custom records;
- value, unit, type, and observedAt preservation;
- labels copied verbatim, including a clearly fake high-cardinality example proving caller responsibility;
- no accidental assumption that records were exported through an SDK.

## Commands

Run build before tests because tests consume `dist`:

```bash
pnpm -C packages/healthcheck/prometheus build
pnpm -C packages/healthcheck/prometheus lint
pnpm -C packages/healthcheck/prometheus test
pnpm -C packages/healthcheck/otel build
pnpm -C packages/healthcheck/otel lint
pnpm -C packages/healthcheck/otel test
```
