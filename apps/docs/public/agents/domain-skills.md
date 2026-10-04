# Domain Specialists (Tier 3) | Nexload SDK

Production package skills for Healthcheck observability and Payload CMS enterprise suites.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/domain-skills/
Tier 3 skills encode **deep operational invariants** for specific packages within the Nexload ecosystem. When your coding assistant works on health checks or Payload CMS, these skills ensure immediate, zero-shot compliance with runtime safety contracts.

***

## 1. Healthcheck & Observability Skills

Designed to accompany `@nexload-sdk/healthcheck` across containerized and cloud environments:

### Core & Runtime Probes

* **`healthcheck-core`** (`--skill healthcheck-core`)
  * **Mission**: Defines health managers, collectors, checks, timeouts, status aggregation (`UP`, `DEGRADED`, `DOWN`), and report serialization.
  * **Trigger**: Initializing health check architectures; defining system check scopes; orchestrating health managers.
  * **Boundary**: Writing framework HTTP route handlers; parsing Linux cgroup files.

* **`healthcheck-node`** (`--skill healthcheck-node`)
  * **Mission**: Observes Node.js runtime health, Linux cgroup v1/v2 memory/CPU limits, event loop lag, and TCP reachability.
  * **Trigger**: Bare-metal or containerized Node.js services; checking memory/CPU pressure; diagnosing container restarts.
  * **Boundary**: Bun runtime environments; frontend React components.

* **`healthcheck-nextjs-routes`** (`--skill healthcheck-nextjs-routes`)
  * **Mission**: Implements no-store, zero-cache route handlers (`/api/health`, `/api/ready`) in Next.js App Router with proxy protection.
  * **Trigger**: Next.js health endpoints; Kubernetes/Dokploy liveness and readiness probes; proxy authorization.
  * **Boundary**: Express/Fastify apps; creating custom database checks from scratch.

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-nextjs-routes
```

### Custom Checks, Security & Exporters

* **`healthcheck-custom-checks`** (`--skill healthcheck-custom-checks`)
  * **Mission**: Implements custom check contracts for databases (Postgres, MongoDB), Redis, disk storage, and external SaaS with strict timeouts and error masking.
  * **Trigger**: Adding database or cache health checks; handling network timeouts safely.

* **`healthcheck-diagnostics-security`** (`--skill healthcheck-diagnostics-security`)
  * **Mission**: Protects diagnostic endpoints from unauthorized access, masks internal IP addresses and connection strings, and configures authorization tokens.
  * **Trigger**: Hardening public or internal health endpoints; implementing Bearer token or secret query authorization.

* **`healthcheck-monitoring-exporters`** (`--skill healthcheck-monitoring-exporters`)
  * **Mission**: Serializes health reports into Prometheus text, OpenMetrics, and OpenTelemetry attributes without bloated external SDKs.
  * **Trigger**: Integrating with Prometheus scrapers, Datadog agents, or Grafana OpenTelemetry collectors.

* **`healthcheck-payload`** (`--skill healthcheck-payload`)
  * **Mission**: Checks Payload CMS readiness and database availability via controlled, lightweight Local API queries.
  * **Trigger**: Payload CMS deployments; verifying database connectivity and collection accessibility at boot.

***

## 2. Payload CMS Specialist Skills

Domain-specific skills for building robust enterprise CMS solutions with Payload CMS and Lexical:

### Semantic Field Factories (`@nexload-sdk/payload-fields`)

* **`payload-fields-core`** (`--skill payload-fields-core`)
  * Builds reusable semantic field factories with validation hooks, database indexing, and custom Admin UI controls.
* **`payload-fields-slug`** (`--skill payload-fields-slug`)
  * Creates managed, collision-resistant Unicode slugs for internationalized content with lock/unlock modes.
* **`payload-fields-jalali-date`** (`--skill payload-fields-jalali-date`)
  * Manages Persian/Jalali solar calendar dates, formatting, and dual-calendar storage in Payload CMS.
* **`payload-fields-money`** (`--skill payload-fields-money`)
  * Implements integer minor-unit money fields (Rials, Cents) to prevent floating-point rounding errors in transactions.

```bash
npx skills add gecut/nexload-sdk --skill payload-fields-core
```

### Rich Text & Lexical Editor (`@nexload-sdk/payload-editor`)

* **`payload-editor-core`** (`--skill payload-editor-core`)
  * Configures deterministic Payload Lexical rich-text editors from explicit presets and clean feature sets.
* **`payload-editor-presets`** (`--skill payload-editor-presets`)
  * Standardizes editor configurations into predictable presets (`minimal`, `standard`, `article`, `full`).
* **`payload-editor-extensions`** (`--skill payload-editor-extensions`)
  * Authors native Lexical features, custom nodes, decorator blocks, and HTML serializers.

### Schemas & Custom Operations

* **`payload-schema-use`** (`--skill payload-schema-use`)
  * Consumes canonical field schemas, derives Zod validations, and builds collection definitions without duplicated types.
* **`payload-schema-develop`** (`--skill payload-schema-develop`)
  * Develops and tests internal schema derivation compilers, adapters, and TypeScript type transformers.
* **`payload-operations-core`** (`--skill payload-operations-core`)
  * Defines typed Payload operation contracts, shared Zod schemas, and client/server transports.
* **`payload-operations-client`** (`--skill payload-operations-client`)
  * Generates frontend SDK clients that interact with Payload custom operations with full type inference.
* **`payload-operations-server`** (`--skill payload-operations-server`)
  * Implements secure custom server endpoints in Payload with RBAC access control and error masking.

***

## Next Steps

* [Healthcheck Package Docs](/packages/healthcheck/core/) — Inspect the runtime implementation of @nexload-sdk/healthcheck.

- [Payload Suite Overview](/start/payload-packages/) — Learn about the design principles of the Nexload Payload suite.
