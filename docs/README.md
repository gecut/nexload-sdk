# Nexload SDK Documentation Suite

Welcome to the internal, LLM-ready architectural and operational documentation suite for `nexload-sdk`.

This documentation suite provides compact, authoritative, and unambiguous ground truth about the repository, its packages, its cognitive agent skills, its architectural relationship with the **Nexload Modular Monolith**, and the protocols governing code changes.

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
    ├── KNOWLEDGE-GRAPH.md                 # Graphify usage, AST synchronization, and zero-revert policy
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
3. Query the knowledge graph using `graphify query "<topic>"`.

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

### 4. Agent Skills or Cognitive Reasoning Task
1. Read [`docs/skills/REASONING-ECOSYSTEM.md`](./skills/REASONING-ECOSYSTEM.md) (the 6+1 Cognitive Graph).
2. Read [`docs/skills/ENGINEERING-STANDARDS.md`](./skills/ENGINEERING-STANDARDS.md) (code, package, react, design, cto-review).
3. Read [`docs/skills/DOMAIN-SKILLS.md`](./skills/DOMAIN-SKILLS.md) (operational skills).
