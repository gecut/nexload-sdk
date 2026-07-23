# Healthcheck OpenTelemetry examples

Record numeric health values with an application-owned meter.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/examples/
```ts
import { toOtelMetricRecords } from "@nexload-sdk/healthcheck-otel";

for (const record of toOtelMetricRecords(await health.run("all"))) {
  if (typeof record.value !== "number") continue;
  const gauge = meter.createGauge(record.name, { unit: record.unit });
  gauge.record(record.value, record.attributes);
}
```

Cache instruments in production rather than creating them on every run. Executable transforms: [`otel.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/test/otel.test.mjs).

The documentation example is type-checked in CI: [`healthcheck-otel.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-otel.ts).
