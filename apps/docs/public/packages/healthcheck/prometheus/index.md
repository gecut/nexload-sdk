# Overview & Quick Start

Serialize healthcheck reports into Prometheus text exposition and OpenMetrics format without heavy SDKs.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/
**Package:** `@nexload-sdk/healthcheck-prometheus`

**Current released version:** `2.1.0`

Prometheus and OpenMetrics text serializers for @nexload-sdk/healthcheck reports.

[npm](https://www.npmjs.com/package/@nexload-sdk/healthcheck-prometheus) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/healthcheck/prometheus)

`@nexload-sdk/healthcheck-prometheus` serializes `@nexload-sdk/healthcheck` reports directly into Prometheus text exposition and OpenMetrics format without requiring bloated third-party metric client libraries.

***

## 10-Second Code Snippet

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { prometheusExporter } from "@nexload-sdk/healthcheck-prometheus";

const health = createHealthManager({ service: { name: "api" } });
const exporter = prometheusExporter({ prefix: "app" });

const report = await health.run("readiness");
const metricsText = exporter.export(report);

// Return Prometheus text in your HTTP endpoint
// Content-Type: text/plain; version=0.0.4; charset=utf-8
```

***

## What You Get

* **Lightweight Metric Formatting**: Fast string serialization with zero dependencies on `prom-client`.
* **Status Gauges & Check Durations**: Exports `health_status`, `health_check_status`, and `health_check_duration_seconds`.
* **Standard OpenMetrics Support**: Fully compliant with Prometheus scrapers, VictoriaMetrics, and Grafana Agent.

***

## Installation & Requirements

```bash
pnpm add @nexload-sdk/healthcheck-prometheus @nexload-sdk/healthcheck
```

Requires Node.js `>=20.9.0` or Bun `>=1.0.0`.

***

## Next Steps

* Explore [Production Guides & Scraping Setup](./guides/) for metric names, label conventions, and scraping routes.
* Check the [API Reference & Signatures](./api/) for exporter configuration options.
