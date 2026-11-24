# Nexload SDK Documentation Suite

Welcome to the internal, LLM-ready architectural and operational documentation suite for `nexload-sdk`.

This documentation suite provides compact, authoritative, and unambiguous ground truth about the repository, its packages, its cognitive agent skills, its architectural relationship with the **Nexload Modular Monolith**, and the protocols governing code changes.

---

## Project Intent

Read this before designing a new package, module, or API. It states what the owner wants from this repository; the rest of `docs/` describes what already exists.

### Goal

Ship recurring Payload CMS + Next.js products, first of all **Iranian e-commerce sites**, as fast and as cheaply as possible. The north star is a **stable, high-performance "WordPress-like" base**, built as code modules instead of runtime plugins.

### Who decides what

| Decision | Owner | Where it lives |
| --- | --- | --- |
| Which modules a site uses, collections, business rules | Developer | Code: package imports, Payload plugins, `buildConfig` |
| Per-client runtime choices: active payment gateways (many of them installment gateways), provider credentials, SMS templates, store settings | Site owner (client) | A Payload **global** edited in the admin panel |
| Service identity and infrastructure: service name, log level, database URL, secrets that never change per client | Operator | Environment variables, read once at startup |

A module that a client must be able to switch on or tune ships its own global (or global fields) plus code that reads it at runtime. Do not force a redeploy for a client-level choice.

### Design principles

1. **Evidence first (rule of three).** Build only what two or three real projects already repeat. The evidence base is `docs/research/recurring-patterns/` (16 local projects and 42 GitHub repositories). Cite it in specs.
2. **No over-engineering.** No registries, DI containers, lifecycle systems, or extension points without a second real user. A thin function over a standard tool beats a framework.
3. **Thin over Payload.** Our types are Payload's types. Capabilities are plain `Plugin` functions (`(config) => config`). No wrapper around `buildConfig`. Each plugin works alone; presets only fix order and defaults.
4. **Clear ownership.** One package owns each concern: `payload-schema` owns field definitions and validation, `payload-fields` owns field components, presets change top-level config only and never touch collection fields.
5. **Performance is a feature.** Defaults must not add work to read or list paths (for example, no `afterRead` logging by default).
6. **Iran-specific details are first-class:** Persian admin language, RTL, `Asia/Tehran`, Jalali dates, Persian digits, phone normalization, and an **explicit currency unit** (Rial vs Toman vs thousand Toman is the most common bug in the researched projects).
7. **Safe by default:** redaction in logs, idempotent payment and SMS flows, no process-local state for anything shared (rate limits, OTP stores).
8. **One global logger** (`@nexload-sdk/logger`), configured once per service. Every module logs through it, following `skills/logger/SKILL.md`.

### Roadmap state (update when it changes)

| Item | State | Document |
| --- | --- | --- |
| `@nexload-sdk/persian` | Done | `docs/superpowers/specs/2026-11-23-persian-package-design.md` |
| `@nexload-sdk/logger` v5 (base for every module) | Done | `packages/logger/README.md` |
| `@nexload-sdk/payload-preset` + `auditPlugin` in `payload-hooks` | Ready to execute | `docs/superpowers/plans/2026-11-23-payload-preset.md` |
| Payment gateway module | Parked: spec must move gateway config into a client-editable global and cover installment gateways | `docs/superpowers/specs/2026-11-22-payment-module-design.md` |
| SMS transport + delivery queue | Parked | `docs/superpowers/specs/2026-11-22-sms-module-design.md` |
| Phone OTP, orders and inventory, discounts, outbox | Candidates, not designed | `docs/research/recurring-patterns/SYNTHESIS.md` |

Specs and plans under `docs/superpowers/` describe intended work. Do not document a planned feature as implemented in package READMEs or `apps/docs/`.

---

## Documentation Topology

```text
docs/
├── README.md                              # This navigation index and agent reading guide
├── architecture/                          # Architectural blueprint and system boundaries
│   ├── PROJECT-KNOWLEDGE-BASE.md          # Primary compact LLM cross-domain knowledge base
│   ├── NEXLOAD-MODULAR-MONOLITH.md        # The Nexload architectural pattern and SDK extraction
│   └── SERVICE-BOUNDARIES.md              # Runtime boundaries, data flows, and contract segregation
├── packages/                              # Deep inventory and technical breakdown of packages
│   ├── OVERVIEW.md                        # Complete package matrix, dependency graphs, and statuses
│   ├── HEALTHCHECK-SUITE.md               # 7 Healthcheck packages (core, node, bun, next, prometheus, otel, payload)
│   ├── PAYLOAD-SUITE.md                   # 5 Payload CMS packages (schema, operations, editor, fields, hooks)
│   ├── CORE-PRIMITIVES.md                 # Foundational primitives (env, logger)
│   └── SHARED-TOOLS.md                    # Internal build and quality tools (bundler, eslint, tsconfig)
├── skills/                                # Cognitive agent skills and engineering standards
│   ├── REASONING-ECOSYSTEM.md             # The 6+1 Cognitive Graph & Divergence Firewall
│   ├── ENGINEERING-STANDARDS.md           # Engineering rules (nexload-code, package, react, design, cto-review)
│   └── DOMAIN-SKILLS.md                   # Operational domain skills & distribution via npx skills
└── workflows/                             # Operational protocols for human engineers and coding agents
    ├── AGENT-GUIDELINES.md                # Strict protocols, safety rules, and simultaneous doc maintenance
    └── BUILD-AND-RELEASE.md               # Monorepo toolchain (pnpm, turbo, esbuild, changesets)
```

---

## Two Distinct Documentation Planes

This repository contains two separate documentation directories that serve distinct audiences:

| Plane | Location | Purpose & Audience | Format |
| --- | --- | --- | --- |
| **Internal & Agent Docs** | `docs/` (here) | Architectural ground truth, domain boundaries, invariants, and guidelines for **LLMs, AI coding agents, and core maintainers**. | High-density, token-optimized Markdown with strict status vocabularies and runtime graphs. |
| **Public Documentation Site** | `apps/docs/` | Public catalog published to [gecut.github.io/nexload-sdk](https://gecut.github.io/nexload-sdk/) for **external end-users and library consumers**. | Astro Starlight MDX pages with interactive components, search, and user tutorials. |

> [!IMPORTANT]
> When implementing code changes or resolving domain questions as an agent, consult `docs/architecture/PROJECT-KNOWLEDGE-BASE.md` first. Do not treat `apps/docs/` as the primary source of internal engineering truth.

---

## Agent Reading Pathways

Depending on your assigned task, follow the recommended reading path:

### 1. General Repository Onboarding / Unknown Task
1. Read [`docs/architecture/PROJECT-KNOWLEDGE-BASE.md`](./architecture/PROJECT-KNOWLEDGE-BASE.md) (high-level map & status vocabulary).
2. Read [`docs/workflows/AGENT-GUIDELINES.md`](./workflows/AGENT-GUIDELINES.md) (rules of engagement).
3. Get the architectural map with enola (`enola --explain --summary`, or the enola MCP tools when connected).

### 2. Architecture & Monolith Integration Task
1. Read [`docs/architecture/NEXLOAD-MODULAR-MONOLITH.md`](./architecture/NEXLOAD-MODULAR-MONOLITH.md) (understanding the Nexload Web + BFF + CMS triad).
2. Read [`docs/architecture/SERVICE-BOUNDARIES.md`](./architecture/SERVICE-BOUNDARIES.md) (runtime dependency rules).

### 3. Package Modification or Refactoring Task
1. Read [`docs/packages/OVERVIEW.md`](./packages/OVERVIEW.md) (package matrix & dependency graph).
2. Read the specific suite document:
   - [`docs/packages/HEALTHCHECK-SUITE.md`](./packages/HEALTHCHECK-SUITE.md)
   - [`docs/packages/PAYLOAD-SUITE.md`](./packages/PAYLOAD-SUITE.md)
   - [`docs/packages/CORE-PRIMITIVES.md`](./packages/CORE-PRIMITIVES.md)
   - [`docs/packages/SHARED-TOOLS.md`](./packages/SHARED-TOOLS.md)
3. Read [`docs/workflows/BUILD-AND-RELEASE.md`](./workflows/BUILD-AND-RELEASE.md) for bundling (`esbuild.config.mjs`) and changeset requirements.

### 4. New Module or Roadmap Task
1. Read [Project Intent](#project-intent) above.
2. Read [`docs/research/recurring-patterns/SYNTHESIS.md`](./research/recurring-patterns/SYNTHESIS.md) for evidence and extraction sources.
3. Read the matching spec and plan under `docs/superpowers/` before writing code.

### 5. Agent Skills or Cognitive Reasoning Task
1. Read [`docs/skills/REASONING-ECOSYSTEM.md`](./skills/REASONING-ECOSYSTEM.md) (the 6+1 Cognitive Graph).
2. Read [`docs/skills/ENGINEERING-STANDARDS.md`](./skills/ENGINEERING-STANDARDS.md) (code, package, react, design, cto-review).
3. Read [`docs/skills/DOMAIN-SKILLS.md`](./skills/DOMAIN-SKILLS.md) (operational skills).
