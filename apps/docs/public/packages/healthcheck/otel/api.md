# API Reference & Compatibility

Public API symbol reference and compatibility matrix for Healthcheck OpenTelemetry.

**Topic:** api
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `toOtelMetricRecords`

```ts
toOtelMetricRecords(report: HealthReport) => OtelMetricRecord[]
```

**Exported from:** `@nexload-sdk/healthcheck-otel`

Public function exported by @nexload-sdk/healthcheck-otel.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts#L35)

### `toOtelResourceAttributes`

```ts
toOtelResourceAttributes(report: HealthReport) => Record<string, string | number | boolean>
```

**Exported from:** `@nexload-sdk/healthcheck-otel`

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

**Exported from:** `@nexload-sdk/healthcheck-otel`

Public interface exported by @nexload-sdk/healthcheck-otel.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts#L7)

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Bun** | `>=1.0.0` | Verified on Bun 1.1+ |
| **Module Format** | ESM only | Native ECMAScript Modules |
| **Side Effects** | `false` | Fully tree-shakeable |
