# Healthcheck Prometheus API

Public Prometheus and OpenMetrics serializer exports.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/api/
## Functions

### `toOpenMetricsText`

```ts
toOpenMetricsText(report: HealthReport, options?: OpenMetricsExportOptions) => string
```

Public function exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L259)

### `toPrometheusText`

```ts
toPrometheusText(report: HealthReport, options?: PrometheusExportOptions) => string
```

Public function exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L233)

## Interfaces

### `PrometheusExportOptions`

```ts
interface PrometheusExportOptions {
  prefix?: string
  defaultLabels?: Record<string, string>
  includeDescriptions?: boolean
}
```

Public interface exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L8)

## Types

### `OpenMetricsExportOptions`

```ts
type OpenMetricsExportOptions = PrometheusExportOptions;
```

Public type exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L14)

* `toPrometheusText(report, options?)` returns newline-terminated text.
* `toOpenMetricsText(report, options?)` appends the OpenMetrics EOF marker.
* `PrometheusExportOptions` supports `prefix`, `defaultLabels`, and `includeDescriptions`.
* `OpenMetricsExportOptions` aliases the same options.

Source: [`src/index.ts`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts).
