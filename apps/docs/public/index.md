# Nexload SDK: Service Observability & Payload CMS Superpowers

Production-grade TypeScript toolkits for Service Observability and Payload CMS superpowers. Modular, independently installable packages.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/
**Production-grade TypeScript toolkits for Service Observability and Payload CMS superpowers.**

Nexload SDK is a collection of modular, independent packages engineered for mission-critical TypeScript systems. Install only the specific package your service requires—zero mandatory lock-in, zero runtime bloat.

Choose a package

Browse all packages

AI Coding Agent Skills

***

## Immediate 10-Second Quick Start

### Payload Schema (Validation & Sync)

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

// Define intrinsic fields once: Payload collection fields + reusable Zod schemas
export const product = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true, minLength: 3 }),
    slug: field.slug({ required: true }),
    price: field.money({ currency: "USD", required: true }),
    stock: field.number({ integer: true, safe: true, defaultValue: 0 }),
  },
});

// Export to Payload Collection
export const Products = { slug: "products", fields: product.payload.all() };

// Derive Next.js / API form schema
export const createProductDTO = product.schema(({ pick }) =>
  pick(["title", "slug", "price", "stock"], { optional: ["stock"] })
);
```

### Healthcheck Core (Kubernetes / Dokploy)

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";

export const health = createHealthManager({
  service: { name: "api-service", version: "1.0.0" },
  checks: [
    shutdownCheck(),
    memoryCheck({ heapUsedPercent: 90 }),
  ],
});

// Execute non-blocking probe (200 OK / 503 Unhealthy)
const report = await health.run("readiness");
console.log(report.status); // "ok" | "degraded" | "unhealthy"
```

***

## Two Core Ecosystem Pillars

### 🛡️ Observability & Health Engine

Lightweight, runtime-neutral health orchestration. Multi-scope probes (`liveness`, `readiness`, `startup`, `diagnostics`), cgroup v1/v2 container limits, Next.js App Router zero-cache route handlers, Prometheus text exposition, and OpenTelemetry semantic attributes.

Explore Healthcheck Core →

### 📦 Payload CMS Superpowers

Deterministic, enterprise extensions for Payload CMS 3. Managed Unicode slugs with lock protection, Jalali (Persian Solar) datepickers, minor-unit money arithmetic, declarative Lexical presets, dual Zod-to-Payload schema derivation, and type-safe RPC operations.

Explore Payload Suite →

***

## Healthcheck Packages

* [@nexload-sdk/healthcheck](/packages/healthcheck/core/) — Runtime-neutral health orchestration and monitoring report foundation for production services. (v4.1.0)
* [@nexload-sdk/healthcheck-node](/packages/healthcheck/node/) — Node.js runtime, process, cgroup, TCP, and DNS adapters for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-bun](/packages/healthcheck/bun/) — Bun runtime adapter and Bun server metrics for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-next](/packages/healthcheck/next/) — Next.js App Router route factories for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-prometheus](/packages/healthcheck/prometheus/) — Prometheus and OpenMetrics text serializers for @nexload-sdk/healthcheck reports. (v2.1.0)
* [@nexload-sdk/healthcheck-otel](/packages/healthcheck/otel/) — OpenTelemetry-friendly transforms for @nexload-sdk/healthcheck reports. (v2.1.0)
* [@nexload-sdk/healthcheck-payload](/packages/healthcheck/payload/) — Payload CMS health checks for @nexload-sdk/healthcheck. (v2.1.0)

***

## Payload CMS Packages

* [@nexload-sdk/payload-fields](/packages/payload-fields/) — Production-grade semantic field factories and Admin integrations for Payload CMS. (v3.1.0)
* [@nexload-sdk/payload-editor](/packages/payload-editor/) — Semantic, deterministic Payload Lexical editor configuration. (v1.1.0)
* [@nexload-sdk/payload-schema](/packages/payload-schema/) — Canonical Payload field definitions with reusable Zod schemas. (v2.0.0)
* [@nexload-sdk/payload-operations](/packages/payload-operations/) — Typed custom operations for Payload CMS with the native Payload REST SDK. (v1.0.0)
