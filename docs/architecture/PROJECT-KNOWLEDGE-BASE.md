# Project Knowledge Base

This document is the compact, cross-domain map for an LLM or coding agent working in `nexload-sdk`. Package-level API truth remains in each package's `src/index.ts` and `package.json`; documentation site truth remains in `apps/docs`; workspace dependencies remain in `pnpm-lock.yaml`.

---

## Status Vocabulary

- **Implemented:** Evidenced by current source code in `packages/`, `tools/`, or `skills/`, built, tested, and actively usable.
- **Internal Tooling:** Code supporting workspace developer ergonomics, bundling, linting, or documentation building, not published as external client SDKs.
- **Experimental / In-Refactor:** Code residing in transitional workspace locations (e.g., `packages/refactoring/`) while maintaining stable public package semantics.
- **External:** Packages or services referenced by the broader Nexload ecosystem (e.g., `@nexload-sdk/jwt`) that are published or maintained in separate repositories.
- **TBD / Planned:** A confirmed requirement or package capability not yet implemented in source code; do not infer APIs, schemas, or exports.

---

## Repository Architecture & Areas

`nexload-sdk` is a `pnpm` + `Turborepo` monorepo containing standalone TypeScript packages, internal development tools, an Astro Starlight documentation website, and production-grade Agent Skills.

| Area | Purpose | Location | Key Packages / Output |
| --- | --- | --- | --- |
| **Healthcheck Suite** | Framework-agnostic service health, runtime probes, and observability serializers. | `packages/healthcheck/*` | `@nexload-sdk/healthcheck`, `-node`, `-bun`, `-next`, `-prometheus`, `-otel`, `-payload` |
| **Payload CMS Suite** | Type-safe field factories, Lexical editor presets, custom operations, canonical schemas, and logging hooks. | `packages/payload-*`, `packages/refactoring/payload-fields` | `@nexload-sdk/payload-schema`, `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-editor`, `@nexload-sdk/payload-fields`, `@nexload-sdk/payload-hooks` |
| **Core Primitives** | Environment validation and structured logging foundations. | `packages/refactoring/*` | `@nexload-sdk/env`, `@nexload-sdk/logger` |
| **Shared Tooling** | Workspace build pipeline, ESLint configurations, and TypeScript presets. | `tools/*` | `@nexload-sdk/bundler`, `@nexload-sdk/eslint-config`, `@nexload-sdk/typescript-config` |
| **Agent Skills** | The 6+1 Cognitive Graph reasoning framework and repo engineering standards. | `skills/*`, `.agents/skills/*` | `nexload-reasoning`, `nexload-code`, `nexload-package`, `nexload-react`, `nexload-cto-review`, domain skills |
| **Public Docsite** | Astro Starlight documentation portal. | `apps/docs` | Published to `https://gecut.github.io/nexload-sdk/` |
| **Demo Playground** | Minimal Vite client for development verification. | `apps/web` | Internal playground |

---

## The Nexload Modular Monolith Connection

`nexload-sdk` was conceived by extracting reusable primitives, architectural contracts, and operational components from the **Nexload Modular Monolith** architecture (exemplified in applications such as `nexload-e-commerce`).

### The Nexload Architecture Triad
1. **Frontend / Storefront (`apps/web`):** Next.js App Router (RTL/Persian UI, URL state, Cache Components).
2. **Backend-for-Frontend / Gateway (`apps/api`):** Bun + oRPC (session management, OTP, third-party payment gateways, rate limiting).
3. **Data Authority & CMS (`apps/cms`):** Payload CMS + PostgreSQL (authorization, business logic, persistence, background worker jobs).

### Why the SDK Exists
In the raw modular monolith, several complex problems were duplicated across apps or tightly coupled:
- Health checking and liveness/readiness probes across heterogeneous runtimes (Bun in API, Node in CMS, Next.js in Web).
- Custom business operations needing typed contracts shared across the API and CMS boundaries without exposing PostgreSQL or Payload internals to the frontend/BFF.
- Canonical entity validation needing to be defined once and projected simultaneously into Payload collection fields and client-facing Zod schemas.
- CMS field UI ergonomics (Unicode slugs, Jalali Persian calendars, integer-toman currency fields).
- Cognitive agent workflows and repository engineering standards.

`nexload-sdk` decouples these capabilities into modular, independently installable packages. While every package can be used in any standard Node/Bun/Next/Payload project, their APIs and design assumptions are optimized to compose seamlessly within the Nexload architecture.

---

## Package Inventory & Source of Truth

```text
packages/
├── healthcheck/
│   ├── core/         -> @nexload-sdk/healthcheck         (Zero-dependency check manager & aggregator)
│   ├── node/         -> @nexload-sdk/healthcheck-node    (Node.js process, cgroups, DNS, TCP probes)
│   ├── bun/          -> @nexload-sdk/healthcheck-bun     (Bun runtime identification & server metrics)
│   ├── next/         -> @nexload-sdk/healthcheck-next    (Next.js App Router route handlers)
│   ├── prometheus/   -> @nexload-sdk/healthcheck-prometheus (Prometheus / OpenMetrics text serializer)
│   ├── otel/         -> @nexload-sdk/healthcheck-otel    (OpenTelemetry resource & metric mapper)
│   └── payload/      -> @nexload-sdk/healthcheck-payload (Payload CMS local query probe)
├── payload-editor/   -> @nexload-sdk/payload-editor      (Payload Lexical presets and feature builder)
├── payload-hooks/    -> @nexload-sdk/payload-hooks       (Collection operation logging hooks)
├── payload-operations/ -> @nexload-sdk/payload-operations (Typed custom operations, endpoints & SDK)
├── payload-schema/   -> @nexload-sdk/payload-schema      (Canonical validation shared by Payload & Zod)
└── refactoring/
    ├── env/          -> @nexload-sdk/env                 (Type-safe env manager & validation presets)
    ├── logger/       -> @nexload-sdk/logger              (Structured, leveled logger with color formatting)
    └── payload-fields/ -> @nexload-sdk/payload-fields    (Unicode slug, Jalali date, integer money fields)
```

---

## Invariant Rules for Autonomous Agents

1. **Query Before Grepping:** Always query `graphify query "<question>"` or `graphify explain "<symbol>"` before running blind file system searches.
2. **Never Edit `dist/`:** All packages bundle from `src/` to `dist/` via `esbuild.config.mjs`. Never make manual modifications in `dist/`.
3. **Dual Build Targets:** Every published package produces both ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`), along with TypeScript declaration maps (`dist/index.d.ts`).
4. **Documentation Synchronization:** Whenever modifying a package's public API or runtime behavior, update its `README.md` and the relevant file in `docs/packages/` within the same commit.
5. **AST Knowledge Graph Sync:** Run `graphify update .` before concluding any work session modifying code files. Never revert modified files in `graphify-out/`.
