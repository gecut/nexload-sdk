# Overview & Quick Start

Export healthcheck reports as OpenTelemetry metrics, log attributes, and span metadata.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/
**Package:** `@nexload-sdk/healthcheck-otel`

**Current released version:** `2.1.0`

OpenTelemetry-friendly transforms for @nexload-sdk/healthcheck reports.

[npm](https://www.npmjs.com/package/@nexload-sdk/healthcheck-otel) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/healthcheck/otel)

`@nexload-sdk/healthcheck-otel` transforms `@nexload-sdk/healthcheck` reports into OpenTelemetry attributes, structured semantic conventions, and metrics payloads without mandatory dependencies on heavy `@opentelemetry/api` packages.

***

## 10-Second Code Snippet

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { otelExporter } from "@nexload-sdk/healthcheck-otel";

const health = createHealthManager({ service: { name: "api" } });
const exporter = otelExporter({ namespace: "app" });

const report = await health.run("readiness");
const attributes = exporter.exportAttributes(report);
// Ready to attach to an active OpenTelemetry trace span or log record
```

***

## What You Get

* **OTel Semantic Conventions**: Standard attributes: `health.status`, `health.service.name`, and individual check attributes.
* **Span Metadata Formatter**: Automatically attaches health reports to active distributed trace spans.
* **Zero Heavy SDK Dependencies**: Pure data transformers that work with any existing OpenTelemetry collector or custom logger.

***

## Installation & Requirements

```bash
pnpm add @nexload-sdk/healthcheck-otel @nexload-sdk/healthcheck
```

Requires Node.js `>=20.9.0` or Bun `>=1.0.0`.

***

## Next Steps

* Explore [Production Guides & OTel Recipes](./guides/) for span attachment and telemetry conventions.
* Check the [API Reference & Signatures](./api/) for exporter options.
