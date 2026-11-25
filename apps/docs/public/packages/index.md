# Package catalog

Browse the Nexload SDK packages documented on this site.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/
Start with a package overview for installation and first use. Follow its guides for examples and configuration.

## Core Primitives

[`@nexload-sdk/logger`](./logger/) provides structured application events, request context, and trace propagation across service boundaries.

[`@nexload-sdk/persian`](./persian/) provides Persian and Iranian utilities.

## Healthcheck

Start with the runtime-neutral core, then add only the runtime, framework, CMS, or exporter integration you need.

* [@nexload-sdk/healthcheck](/nexload-sdk/packages/healthcheck/core/) — Runtime-neutral health orchestration and monitoring report foundation for production services. (v5.0.0)
* [@nexload-sdk/healthcheck-node](/nexload-sdk/packages/healthcheck/node/) — Node.js runtime, process, cgroup, TCP, and DNS adapters for @nexload-sdk/healthcheck. (v3.0.0)
* [@nexload-sdk/healthcheck-bun](/nexload-sdk/packages/healthcheck/bun/) — Bun runtime adapter and Bun server metrics for @nexload-sdk/healthcheck. (v3.0.0)
* [@nexload-sdk/healthcheck-next](/nexload-sdk/packages/healthcheck/next/) — Next.js App Router route factories for @nexload-sdk/healthcheck. (v3.0.0)
* [@nexload-sdk/healthcheck-prometheus](/nexload-sdk/packages/healthcheck/prometheus/) — Prometheus and OpenMetrics text serializers for @nexload-sdk/healthcheck reports. (v3.0.0)
* [@nexload-sdk/healthcheck-otel](/nexload-sdk/packages/healthcheck/otel/) — OpenTelemetry-friendly transforms for @nexload-sdk/healthcheck reports. (v3.0.0)
* [@nexload-sdk/healthcheck-payload](/nexload-sdk/packages/healthcheck/payload/) — Payload CMS health checks for @nexload-sdk/healthcheck. (v3.0.0)

## Payload CMS

Choose semantic fields, explicit Lexical configuration, canonical Payload-and-Zod schemas, or contract-first custom operations.

* [@nexload-sdk/payload-fields](/nexload-sdk/packages/payload-fields/) — Production-grade semantic field factories and Admin integrations for Payload CMS. (v4.0.0)
* [@nexload-sdk/payload-hooks](/nexload-sdk/packages/payload-hooks/) — Effortless, type-safe logging for Payload CMS collection operations. (v3.0.0)
* [@nexload-sdk/payload-preset](/nexload-sdk/packages/payload-preset/) —  (v1.0.0)
* [@nexload-sdk/payload-editor](/nexload-sdk/packages/payload-editor/) — Semantic, deterministic Payload Lexical editor configuration. (v2.0.0)
* [@nexload-sdk/payload-schema](/nexload-sdk/packages/payload-schema/) — Canonical Payload field definitions with reusable Zod schemas. (v3.0.0)
* [@nexload-sdk/payload-operations](/nexload-sdk/packages/payload-operations/) — Typed custom operations for Payload CMS with the native Payload REST SDK. (v2.0.0)

## Developer Tooling & Standards

Shared TypeScript compiler configurations, ESLint 9 Flat Config presets, and canonical architectural standards.

* [@nexload-sdk/typescript-config](/nexload-sdk/packages/typescript-config/) — Shared TypeScript configurations for the Nexload SDK monorepo (v5.9.3)
* [@nexload-sdk/eslint-config](/nexload-sdk/packages/eslint-config/) — Shared authoritative ESLint configurations for the Nexload SDK monorepo (v9.39.2)

## Documentation policy

Versions come from workspace manifests. Check pending Changesets before using an example with a registry release.
