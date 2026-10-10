# Canonical File & Directory Structure Standard

Architectural directory layout archetypes, naming conventions, and file placement rules for engineering teams and autonomous agents.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/standards/file-structure/
This standard defines canonical file and directory layouts across the Nexload SDK ecosystem. Autonomous agents and human engineers must adhere to these archetypes when creating, refactoring, or modernizing packages and applications.

***

## Core Architectural Principles

1. **Predictable Discovery**: A developer or agent inspecting `src/` should grasp module boundaries within 10 seconds.
2. **Explicit Dependency Flow**: Dependencies flow inward; internal helper utilities never leak through root barrel exports.
3. **Mandatory Kebab-Case**: Every file and folder name uses `kebab-case`. Never use `camelCase` or `PascalCase` filenames.
4. **Co-location of Tests**: Unit tests live directly adjacent to the unit under test (e.g., `manager.ts` and `manager.spec.ts`) or in a dedicated `test/` folder for integration suites.
5. **Private Boundary Markers**: Internal submodules or implementation details not meant for consumer import are prefixed with `_` or placed in `internal/`.

***

## The Four Production Archetypes

### Archetype 1: Zero-Dependency Core Library

Used for pure business logic, algorithmic engines, parsers, or serialization kernels (e.g., `@nexload-sdk/healthcheck`).

```text
packages/<package-name>/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts               # Public barrel: only exports public APIs & types
│   ├── types.ts               # Shared domain interfaces and schemas
│   ├── errors.ts              # Custom error hierarchy
│   ├── <domain-module>/
│   │   ├── index.ts           # Domain submodule public facade
│   │   ├── <feature>.ts       # Core logic
│   │   ├── <feature>.spec.ts  # Co-located unit tests
│   │   └── types.ts           # Submodule-specific types
│   └── internal/              # Strictly unexported helpers
│       ├── assertions.ts
│       └── clone.ts
```

***

### Archetype 2: Multi-Platform / Adapter Package

Used for packages supporting multiple runtimes (Node, Bun, Edge, Deno) or multiple monitoring exporters (Prometheus, OpenTelemetry).

```text
packages/<package-name>/
├── package.json               # Defines subpath exports: "./node", "./bun", "./otel"
├── tsconfig.json
├── src/
│   ├── index.ts               # Runtime-agnostic core entry
│   ├── node/                  # Node.js specific implementation
│   │   ├── index.ts
│   │   └── cgroup.ts
│   ├── bun/                   # Bun runtime specific implementation
│   │   └── index.ts
│   ├── otel/                  # OpenTelemetry exporter
│   │   ├── index.ts
│   │   └── serializers.ts
│   └── shared/                # Cross-adapter shared utilities
│       ├── formatting.ts
│       └── types.ts
```

***

### Archetype 3: React UI & Feature Slice Architecture

Used for frontend applications (Next.js, Vite) and React component libraries.

```text
src/
├── components/
│   ├── ui/                    # Reusable primitive tokens (Button, Dialog, Input)
│   │   ├── button/
│   │   │   ├── index.ts
│   │   │   ├── button.tsx
│   │   │   ├── button.styles.css
│   │   │   └── button.spec.tsx
│   │   └── dialog/
│   └── layout/                # Shell, Navigation, Footer
├── features/                  # Domain feature slices (Self-contained)
│   ├── auth/
│   │   ├── api/               # Feature data-fetching / server actions
│   │   ├── components/        # Feature-scoped UI components
│   │   ├── hooks/             # Custom hooks
│   │   ├── types.ts
│   │   └── index.ts           # Public boundary for other features
│   └── dashboard/
└── lib/                       # Global singleton utilities (fetcher, env)
```

***

### Archetype 4: Payload CMS Server vs. Admin Boundaries

Used for Payload CMS plugins and custom fields (e.g., `@nexload-sdk/payload-fields`).

```text
packages/<package-name>/
├── package.json               # Dual exports: "./" (server), "./client" (admin)
├── src/
│   ├── index.ts               # Server-safe entrypoint (CollectionConfig, Hooks)
│   ├── plugin.ts              # Main plugin initialization
│   ├── fields/                # Server field definitions
│   │   ├── index.ts
│   │   ├── slug-field.ts
│   │   └── money-field.ts
│   ├── admin/                 # Client-safe React admin components
│   │   ├── index.ts
│   │   ├── slug-cell.tsx
│   │   └── money-cell.tsx
│   └── errors/
│       └── index.ts
```

***

## File Naming & Extension Matrix

| Artifact Type | Convention | Example |
|---|---|---|
| Source implementation | `kebab-case.ts` | `health-manager.ts` |
| React component | `kebab-case.tsx` | `status-badge.tsx` |
| Co-located unit test | `<name>.spec.ts` | `health-manager.spec.ts` |
| Submodule types | `types.ts` | `types.ts` |
| Submodule entry | `index.ts` | `index.ts` |
| Configuration file | `kebab-case.<ext>` | `eslint.config.mjs`, `esbuild.config.mjs` |

***

## Anti-Patterns to Avoid

* ❌ **Deep Relative Import Leaks**: Importing across sibling boundaries like `../../../../feature-a/internal/utils`. Always import via published subpath or feature index.
* ❌ **Mixed Case Filenames**: Files like `UserProfile.tsx` or `dataFetcher.ts`. Use `user-profile.tsx` and `data-fetcher.ts`.
* ❌ **Barrel Bloat**: Re-exporting every private function in `src/index.ts`. Only export public interfaces, contracts, and entry functions.
* ❌ **Circular Dependencies**: Cycles between `types.ts` and implementation files. Types must remain leaf nodes.
