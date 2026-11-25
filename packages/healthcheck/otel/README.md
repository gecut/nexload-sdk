# @nexload-sdk/healthcheck-otel

**OpenTelemetry-friendly resource attribute and metric record transforms for `@nexload-sdk/healthcheck` reports.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-otel)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-otel)
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

`@nexload-sdk/healthcheck-otel` converts a `HealthReport` into OpenTelemetry semantic resource attributes (`toOtelResourceAttributes`) and plain metric records (`toOtelMetricRecords`). It solves exporting health check statuses, run durations, and collector metrics to OpenTelemetry pipelines without pulling `@opentelemetry/sdk-metrics` into `@nexload-sdk/healthcheck`. It is for services bridging health reports into OpenTelemetry collectors or custom OTLP exporters.

What it is not:

- Not an OpenTelemetry SDK, exporter, or OTLP network client.
- Not a tracer or span instrumentation library.

## Philosophy

- **Zero OTel SDK dependency:** Emits plain TypeScript objects (`OtelMetricRecord[]` and `Record<string, string | number | boolean>`) so you can feed any OpenTelemetry SDK version or custom exporter.
- **Numeric state encoding:** Maps `ok -> 1`, `degraded -> 0.5`, and `unhealthy -> 0` for `health.status` and `health.check.status`.

## Install

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-otel
# or
npm install @nexload-sdk/healthcheck @nexload-sdk/healthcheck-otel
# or
yarn add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-otel
# or
bun add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-otel
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies (`@nexload-sdk/healthcheck` is a direct dependency) |

## Quick start

```ts
import { createHealthManager, runtimeInfoCheck } from "@nexload-sdk/healthcheck";
import { toOtelMetricRecords, toOtelResourceAttributes } from "@nexload-sdk/healthcheck-otel";

const health = createHealthManager({
  service: { name: "api", version: "1.0.0" },
  checks: [runtimeInfoCheck()],
});

const report = await health.run("diagnostics");
const resourceAttrs = toOtelResourceAttributes(report);
const records = toOtelMetricRecords(report);
```

## Usage

### Emitted resource attributes and metric records

`toOtelResourceAttributes(report)` maps `service.name`, `service.version`, `deployment.environment.name`, `service.instance.id`, `process.runtime.name`, `process.runtime.version`, `host.arch`, and `os.type` (falling back to `"unknown"` when absent).

`toOtelMetricRecords(report)` emits:

| Metric Name | Unit | Type | Source |
| --- | --- | --- | --- |
| `health.status` | `state` | `gauge` | Aggregate report status (`1`, `0.5`, `0`) |
| `health.run.duration_ms` | `milliseconds` | `gauge` | Total `report.durationMs` |
| `health.check.status` | `state` | `gauge` | Per-check status (`1`, `0.5`, `0`) |
| `health.check.duration_ms` | `milliseconds` | `gauge` | Per-check duration |
| *(collector metrics)* | `metric.unit` | `metric.type` | Every entry in `report.metrics` |

## API

### Root entry (`@nexload-sdk/healthcheck-otel`)

| Export | Kind | Summary |
| --- | --- | --- |
| `toOtelResourceAttributes` | `function` | Maps `HealthReport` service/runtime/environment fields to OTel resource attributes |
| `toOtelMetricRecords` | `function` | Converts report status, check results, and `report.metrics` into `OtelMetricRecord[]` |
| `OtelMetricRecord` | `interface` | `{ name, value, attributes, unit?, type?, observedAt }` |

## Configuration

Neither `toOtelResourceAttributes` nor `toOtelMetricRecords` takes additional configuration options beyond the `HealthReport`.

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtimes:** Pure TypeScript; runs in Node.js, Bun, Edge, and browsers.

## Caveats

> [!WARNING]
> `toOtelMetricRecords` exports `report.metrics` produced by metric collectors; check-local `check.metrics` remain in JSON reports. Collector `metric.labels` become OpenTelemetry attributes, so keep them low-cardinality and free of secrets, user IDs, request IDs, or raw error messages.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and `MetricCollectorDefinition`
- [healthcheck-prometheus](../prometheus/README.md) — Prometheus and OpenMetrics text serializers

## License

MIT
