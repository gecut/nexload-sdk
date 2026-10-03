# API Reference & Compatibility

Public API symbol reference and compatibility matrix for Healthcheck Prometheus.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `toOpenMetricsText`

```ts
toOpenMetricsText(report: HealthReport, options?: OpenMetricsExportOptions) => string
```

**Exported from:** `@nexload-sdk/healthcheck-prometheus`

Public function exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L259)

### `toPrometheusText`

```ts
toPrometheusText(report: HealthReport, options?: PrometheusExportOptions) => string
```

**Exported from:** `@nexload-sdk/healthcheck-prometheus`

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

**Exported from:** `@nexload-sdk/healthcheck-prometheus`

Public interface exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L8)

## Types

### `OpenMetricsExportOptions`

```ts
type OpenMetricsExportOptions = PrometheusExportOptions;
```

**Exported from:** `@nexload-sdk/healthcheck-prometheus`

Public type exported by @nexload-sdk/healthcheck-prometheus.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts#L14)

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Bun** | `>=1.0.0` | Verified on Bun 1.1+ |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
