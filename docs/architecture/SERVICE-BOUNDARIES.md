# Service Boundaries & Runtime Rules

This document specifies the strict boundary constraints and runtime invariants governing applications built with the **Nexload Modular Monolith** and powered by `nexload-sdk`.

---

## 1. The Allowed Runtime Graph

```text
Browser Client ──► apps/api (Bun BFF) ──► apps/cms (Payload) ──► PostgreSQL
Browser Client ──► apps/web (Next.js) ──► apps/cms (Read-Only SSR)
```

### Inviolable Invariants:
1. **PostgreSQL Isolation:**
   Only `apps/cms` is permitted to connect directly to PostgreSQL or run database migrations. Neither `apps/api` nor `apps/web` may import a PostgreSQL driver, connection pool, or ORM.
2. **Payload Initialization Isolation:**
   Only `apps/cms` initializes the Payload instance (`payload.init()` or Local API execution directly against DB). `apps/web` and `apps/api` must never import `@payloadcms/next`, internal database adapters, or initialize Payload runtime.
3. **Command & Mutation Routing:**
   Every user command, browser mutation, session creation, or state change MUST travel through `apps/api`. The browser client never issues mutations directly to `apps/cms`.
4. **Operation Transport Boundary:**
   When `apps/api` triggers a business transaction in `apps/cms`, it communicates strictly through `@nexload-sdk/payload-operations` endpoints. This ensures typed contracts, input validation, execution context, and standardized error responses without leaking internal CMS collections.

---

## 2. Layer Responsibilities & Source of Truth

| Layer | Responsibility | Permitted Imports | Prohibited Imports |
| --- | --- | --- | --- |
| **`apps/web`** (Next.js) | Server-rendered pages, route handlers, UI components, URL state, browser caching headers. | `@nexload-sdk/env`<br>`@nexload-sdk/healthcheck-next`<br>`packages/contracts` | `payload`<br>`@payloadcms/*`<br>PostgreSQL drivers<br>`apps/cms/*` |
| **`apps/api`** (Bun / oRPC) | User authentication, OTP verification, session cookies, payment providers, command validation. | `@nexload-sdk/env`<br>`@nexload-sdk/logger`<br>`@nexload-sdk/healthcheck-bun`<br>`@nexload-sdk/payload-operations` (client)<br>`packages/contracts` | `payload`<br>Direct database access<br>DOM / React code |
| **`apps/cms`** (Payload) | Collection definitions, access control, transactional persistence, field normalization, background jobs. | `@nexload-sdk/payload-schema`<br>`@nexload-sdk/payload-operations` (server)<br>`@nexload-sdk/payload-fields`<br>`@nexload-sdk/payload-editor`<br>`@nexload-sdk/payload-hooks`<br>`@nexload-sdk/healthcheck-payload` | Browser DOM APIs<br>`apps/web/*`<br>`apps/api/*` |
| **`packages/schema`** | Framework-agnostic entity models, canonical field validation rules, domain logic. | `@nexload-sdk/payload-schema`<br>`zod` | Database connections<br>Transport code (HTTP, RPC)<br>Framework code |
| **`packages/contracts`** | API request/response definitions, custom operation inputs/outputs, DTO projections. | `@nexload-sdk/payload-operations`<br>`packages/schema`<br>`zod` | Database adapters<br>React components<br>Server runtimes |

---

## 3. How `nexload-sdk` Enforces Clean Boundaries

### A. Canonical Schemas (`@nexload-sdk/payload-schema`)
In traditional setups, developers write a Zod schema for client validation and duplicate the rules in Payload field definitions.
`@nexload-sdk/payload-schema` allows defining the canonical field validation once. It then compiles into:
- Payload collection field definitions (with built-in validation functions).
- Pure Zod schemas for contracts and client validation.

### B. Typed Custom Operations (`@nexload-sdk/payload-operations`)
Rather than creating ad-hoc REST endpoints or exposing raw collection CRUD:
- Operations are defined as contract objects with typed input, output, and error schemas.
- `apps/cms` registers the operation handler inside its Payload configuration.
- `apps/api` uses the typed SDK client facade to invoke the operation over secure HTTP with HMAC, authentication tokens, or shared service credentials.
- Runtime errors (`NotFoundError`, `ValidationError`, `ConflictError`, `UnauthorizedError`) are mapped to consistent RFC 7807-style payloads.

### C. Isolated Health Probing (`@nexload-sdk/healthcheck-*`)
Instead of mixing health check logic with business endpoints:
- Each application registers only the probe adapters for its own runtime.
- `apps/api` uses `@nexload-sdk/healthcheck-bun` to monitor Bun event loop and server metrics.
- `apps/cms` uses `@nexload-sdk/healthcheck-node` for cgroups and `@nexload-sdk/healthcheck-payload` for Local API ping.
- `apps/web` uses `@nexload-sdk/healthcheck-next` for App Router route handlers.
- Infrastructure monitors ingest Prometheus text or OpenTelemetry metrics via `@nexload-sdk/healthcheck-prometheus` and `@nexload-sdk/healthcheck-otel`.
