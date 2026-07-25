# Package catalog

Browse the eleven current Nexload SDK packages documented on this site.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/
This site documents eleven stable, currently released packages. Each package has its own installation, quick start, concepts, guides, API inventory, examples, troubleshooting, migration, and compatibility path.

## Healthcheck

Start with the runtime-neutral core, then add only the runtime, framework, CMS, or exporter integration you need.

* [@nexload-sdk/healthcheck](/packages/healthcheck/core/) — Runtime-neutral health orchestration and monitoring report foundation for production services. (v4.1.0)
* [@nexload-sdk/healthcheck-node](/packages/healthcheck/node/) — Node.js runtime, process, cgroup, TCP, and DNS adapters for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-bun](/packages/healthcheck/bun/) — Bun runtime adapter and Bun server metrics for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-next](/packages/healthcheck/next/) — Next.js App Router route factories for @nexload-sdk/healthcheck. (v2.1.0)
* [@nexload-sdk/healthcheck-prometheus](/packages/healthcheck/prometheus/) — Prometheus and OpenMetrics text serializers for @nexload-sdk/healthcheck reports. (v2.1.0)
* [@nexload-sdk/healthcheck-otel](/packages/healthcheck/otel/) — OpenTelemetry-friendly transforms for @nexload-sdk/healthcheck reports. (v2.1.0)
* [@nexload-sdk/healthcheck-payload](/packages/healthcheck/payload/) — Payload CMS health checks for @nexload-sdk/healthcheck. (v2.1.0)

## Payload CMS

Choose semantic fields, explicit Lexical configuration, canonical Payload-and-Zod schemas, or contract-first custom operations.

* [@nexload-sdk/payload-fields](/packages/payload-fields/) — Production-grade semantic field factories and Admin integrations for Payload CMS. (v3.1.0)
* [@nexload-sdk/payload-editor](/packages/payload-editor/) — Semantic, deterministic Payload Lexical editor configuration. (v1.1.0)
* [@nexload-sdk/payload-schema](/packages/payload-schema/) — Canonical Payload field definitions with reusable Zod schemas. (v1.1.0)
* [@nexload-sdk/payload-operations](/packages/payload-operations/) — Typed custom operations for Payload CMS with the native Payload REST SDK. (v0.1.0)

## Documentation policy

The site describes the current released version shown on each package page. Historical versioned pages are not hosted. Use each package changelog and migration page when upgrading.
