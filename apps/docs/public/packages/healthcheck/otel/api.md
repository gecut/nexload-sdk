# Healthcheck OpenTelemetry API

Public transform and metric-record exports.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/api/
## Functions

### `toOtelMetricRecords`

```ts
toOtelMetricRecords(report: HealthReport) => OtelMetricRecord[]
```

Public function exported by @nexload-sdk/healthcheck-otel.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts#L35)

### `toOtelResourceAttributes`

```ts
toOtelResourceAttributes(report: HealthReport) => Record<string, string | number | boolean>
```

Public function exported by @nexload-sdk/healthcheck-otel.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts#L22)

## Interfaces

### `OtelMetricRecord`

```ts
interface OtelMetricRecord {
  name: string
  value: HealthMetricValue
  attributes: Record<string, string | number | boolean>
  unit?: string
  type?: HealthMetric["type"]
  observedAt: string
}
```

Public interface exported by @nexload-sdk/healthcheck-otel.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts#L7)

* `toOtelResourceAttributes(report)` returns semantic resource attributes.
* `toOtelMetricRecords(report)` returns `OtelMetricRecord[]`.
* `OtelMetricRecord` contains name, value, attributes, optional unit/type, and `observedAt`.

The functions do not mutate the report or call an exporter. Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts).
