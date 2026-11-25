# @nexload-sdk/healthcheck-prometheus

**Zero-dependency Prometheus and OpenMetrics text serializers for `@nexload-sdk/healthcheck` reports.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-prometheus)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-prometheus)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node | Bun | Edge | Browser](https://img.shields.io/badge/runtime-Node%20%7C%20Bun%20%7C%20Edge%20%7C%20Browser-lightgrey.svg)

> [!IMPORTANT]
> A new major release is pending across the healthcheck family in `.changeset/healthcheck-major.md` (import ordering updates, no runtime behavior changes).

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/healthcheck-prometheus` serializes a `HealthReport` into Prometheus exposition text (`toPrometheusText`) or OpenMetrics text (`toOpenMetricsText`). It solves exposing `/metrics` endpoints for Prometheus scrapers without requiring `prom-client` or global metric registries. It is for services running `@nexload-sdk/healthcheck` in Node.js, Bun, Next.js, or Edge runtimes.

What it is not:

- Not a `prom-client` wrapper or stateful metric registry.
- Not an HTTP server (pair with `@nexload-sdk/healthcheck-next` `createNextMetricsRoute` or your own framework route).

## Philosophy

- **Zero external dependencies:** Pure string serialization with no `prom-client` dependency.
- **Low-cardinality label allowlist:** Only safe, bounded labels (`service`, `scope`, `check`, `component`, `dependency`, `runtime`, `status`, `error_code`, `collector`, `version`) are emitted; unknown labels are dropped.
- **Collectors over check-local metrics:** Monitoring series come from `report.metrics` (collectors) plus aggregate/per-check status and duration, keeping check-local diagnostic payloads out of time-series storage.

## Install

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-prometheus
# or
npm install @nexload-sdk/healthcheck @nexload-sdk/healthcheck-prometheus
# or
yarn add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-prometheus
# or
bun add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-prometheus
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies (`@nexload-sdk/healthcheck` is a direct dependency) |

## Quick start

```ts
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const text = toPrometheusText(report, {
  prefix: "nexload",
  includeDescriptions: true,
});
```

## Usage

### OpenMetrics format

`toOpenMetricsText` appends the required `# EOF\n` terminator for `application/openmetrics-text; version=1.0.0; charset=utf-8` responses:

```ts
import { toOpenMetricsText } from "@nexload-sdk/healthcheck-prometheus";

const body = toOpenMetricsText(report, {
  prefix: "shop_api",
  defaultLabels: { version: "1.2.0" },
});
```

### Emitted series

- `<prefix>_health_status{scope,service,status}` (`1` for active status, `0` otherwise across `ok`, `degraded`, `unhealthy`)
- `<prefix>_health_check_status{check,component,scope,service,status}`
- `<prefix>_health_check_duration_milliseconds{check,component,scope,service}`
- `<prefix>_health_run_duration_milliseconds{scope,service}`
- `<prefix>_<collector_metric_name>{...}` for every metric in `report.metrics`

## API

### Root entry (`@nexload-sdk/healthcheck-prometheus`)

| Export | Kind | Summary |
| --- | --- | --- |
| `toPrometheusText` | `function` | Serializes `HealthReport` to Prometheus text format (`0.0.4`) |
| `toOpenMetricsText` | `function` | Serializes `HealthReport` to OpenMetrics text format (`1.0.0`, ending with `# EOF`) |
| `PrometheusExportOptions` | `interface` | `{ prefix?, defaultLabels?, includeDescriptions? }` |
| `OpenMetricsExportOptions` | `type` | Alias of `PrometheusExportOptions` |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `prefix` | `string` | `"nexload"` | Metric name prefix |
| `defaultLabels` | `Record<string, string>` | `{}` | Default labels merged into emitted series (filtered by allowlist) |
| `includeDescriptions` | `boolean` | `false` | Emits `# HELP` lines for built-in and collector metrics |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtimes:** Pure TypeScript; runs in Node.js, Bun, Edge, and browsers.

## Caveats

> [!WARNING]
> Unsupported or high-cardinality labels (including in `defaultLabels` or collector `metric.labels`) are silently dropped by the allowlist (`service`, `scope`, `check`, `component`, `dependency`, `runtime`, `status`, `error_code`, `collector`, `version`).

> [!NOTE]
> Metrics embedded inside individual `check.metrics` objects are not exported as Prometheus series; use a `MetricCollectorDefinition` (`report.metrics`) for Prometheus metrics.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and `MetricCollectorDefinition`
- [healthcheck-next](../next/README.md) — Next.js App Router `createNextMetricsRoute`
- [healthcheck-otel](../otel/README.md) — OpenTelemetry metric record transforms

## License

MIT
