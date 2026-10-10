# File and Directory Structure Architecture

This reference defines the authoritative file and directory layout patterns across the Nexload ecosystem. Autonomous agents and human engineers MUST adhere to these canonical archetypes when writing new packages, refactoring existing modules, or performing full architectural rewrites.

---

## 1. Core Principles

1. **Strict Kebab-Case Filenames:**
   - Every project-authored file MUST use `kebab-case` (`user-card.tsx`, `parse-metrics.ts`, `payment-gateway.ts`).
   - PascalCase symbols (`export function UserCard()`) live inside kebab-case files (`user-card.tsx`).
   - External contract files (`package.json`, `README.md`, `next.config.ts`, `AGENTS.md`) preserve their required names.

2. **Locality over Layering:**
   - Co-locate tests, types, and private helpers next to the code that uses them.
   - Avoid creating separate top-level `tests/` or `types/` folders when files belong to a specific feature slice.

3. **Explicit Public Surface (`index.ts`):**
   - `src/index.ts` is an intentional facade and export boundary. It must contain only public exports, contracts, and factory functions—never fat implementations.

4. **Internal Direct Imports (No Barrel Cycles):**
   - Inside a package, import directly from the owning file (e.g., `import { parseDate } from "./utils/parse-date.js"`).
   - Never import from the package's own root `index.ts` internally; doing so creates circular dependencies and bundles unnecessary code.

---

## 2. Canonical Archetypes

### Archetype A: Zero-Dependency Core Library
Used for foundational primitives, health check engines, loggers, or mathematical/validation cores (e.g., `@nexload-sdk/healthcheck`, `@nexload-sdk/logger`, `@nexload-sdk/env`).

```text
packages/<package-name>/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── esbuild.config.mjs
├── README.md
└── src/
    ├── index.ts              # Public API facade & types (no fat logic)
    ├── types.ts              # Canonical domain contracts, enums, interfaces
    ├── core/                 # Central orchestration, lifecycle, manager
    │   ├── manager.ts
    │   ├── registry.ts
    │   └── manager.test.ts   # Co-located unit tests
    └── utils/                # Pure leaf utility functions
        ├── parse-token.ts
        └── parse-token.test.ts
```

### Archetype B: Multi-Platform / Adapter Packages
Used when extending a core library to specific runtimes, frameworks, or serialization protocols (e.g., `@nexload-sdk/healthcheck-node`, `-bun`, `-next`, `-prometheus`, `-otel`).

```text
packages/<suite>-<platform>/
├── package.json              # Declares core peer/dependency
├── tsconfig.json
├── eslint.config.mjs
├── README.md
└── src/
    ├── index.ts              # Adapter export (e.g., NodeHealthcheckProbe)
    ├── types.ts              # Platform-specific options & extensions
    ├── adapter.ts            # Adapter implementation connecting to core
    └── probes/               # Discrete platform-specific probe implementations
        ├── process.ts
        ├── tcp.ts
        └── memory.ts
```
*Invariant:* Adapters depend on Core; Core NEVER depends on Adapters.

### Archetype C: React UI & Component Library
Used for design systems, form fields, and interactive widgets (e.g., `@nexload-sdk/payload-fields`).

```text
packages/<ui-package>/
├── package.json
├── tsconfig.json             # Extends @nexload-sdk/typescript-config/react.json
├── eslint.config.mjs         # Uses nexloadConfig({ react: true })
├── README.md
└── src/
    ├── index.ts              # Public component exports
    ├── types.ts              # Shared component props
    └── components/           # Feature slices
        └── <feature-name>/
            ├── <feature-name>.tsx        # Main component (kebab-case)
            ├── <feature-name>.types.ts   # Local prop types
            ├── _<private-subpart>.tsx    # Private helper component (_ prefix)
            ├── <feature-name>.test.tsx   # Co-located tests
            └── index.ts                  # Slice barrel
```
*Private Locality Marker:* Use `_`-prefixed kebab-case filenames (e.g., `_calendar-header.tsx`) for internal components not exported publicly.

### Archetype D: Payload CMS Extension Suite
Used for Payload CMS fields, custom operations, schema derivations, and editor extensions (e.g., `@nexload-sdk/payload-*`).

```text
packages/payload-<extension>/
├── package.json
├── tsconfig.json
├── eslint.config.mjs         # Uses nexloadConfig({ payload: true })
├── README.md
└── src/
    ├── index.ts              # Server-safe entrypoint (collections, hooks, schema)
    ├── types.ts              # Shared domain contracts
    ├── fields/               # Field definitions & factories
    │   ├── date-field.ts
    │   └── slug-field.ts
    ├── hooks/                # Collection operation hooks
    │   └── audit-log.ts
    ├── admin/                # Client-safe Admin UI components (ISOLATED)
    │   ├── index.ts          # Dedicated admin subpath export
    │   └── components/
    │       └── custom-cell.tsx
    └── operations/           # Typed custom business operations
        └── handler.ts
```
*Runtime Boundary Invariant:* Keep Admin UI code under `src/admin/` and export it via a dedicated `./admin` subpath in `package.json`. Never leak React/Admin client imports into the server-safe root `src/index.ts`.

---

## 3. Anti-Patterns to Prevent during Refactors

| Anti-Pattern | Bad Example | Correct Replacement |
| :--- | :--- | :--- |
| **The "Junk Drawer" File** | `utils.ts` (300 lines of random string, math, date, and network helpers) | Focused leaf modules: `utils/format-slug.ts`, `utils/calc-duration.ts`. |
| **Casing Inconsistency** | `ProductCard.tsx`, `dateUtils.ts` | `product-card.tsx`, `date-utils.ts`. |
| **Circular Barrels** | `import { foo } from "../index.js"` inside a submodule | `import { foo } from "./foo.js"`. |
| **Server/Client Leakage** | Importing a browser React hook in root `index.ts` of a Node/CMS package | Move to `src/admin/` or `src/client/` under a dedicated subpath export. |
| **Orphaned Types Folder** | `types/all-types.ts` holding types for 10 unrelated modules | Co-locate types with their owning module or use `types.ts` per slice. |
