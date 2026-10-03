# Shared Workspace Tooling

This document covers internal tooling packages located in `tools/*` that standardize building, linting, and type-checking across all packages in the `nexload-sdk` monorepo.

---

## 1. `@nexload-sdk/bundler`

### Overview
- **Location:** `tools/bundler`
- **Role:** The authoritative build runner for all publishable packages in the workspace.
- **Underlying Technology:** `esbuild` for ultra-fast compilation + `tsc` for TypeScript declaration (`.d.ts`) generation.

### Dual ESM/CJS Output Standard
Every package built by `@nexload-sdk/bundler` generates a clean dual-format distribution in `dist/`:
- **ESM:** `dist/index.mjs` (for modern bundlers, Next.js, Vite, and ESM Node)
- **CJS:** `dist/index.cjs` (for legacy CommonJS Node environments)
- **Types:** `dist/index.d.ts` (with declaration maps)

### Key Features:
- **Automatic Peer Dependency Externalization:** Automatically reads `package.json` and ensures dependencies, `peerDependencies`, and Node built-ins (`fs`, `path`, `crypto`, `net`) are marked external, preventing duplicate bundled runtimes.
- **Custom Entrypoints:** Supports packages with subpath exports (e.g., `@nexload-sdk/payload-fields/slug`, `@nexload-sdk/payload-fields/admin/jalali-date-field`) by declaring multiple entry configurations.
- **Declaration Generation:** Invokes TypeScript compiler programmatically with `emitDeclarationOnly: true` to ensure 100% accurate type definitions.

### Typical `esbuild.config.mjs` in a Package:
```javascript
import { buildPackage } from '@nexload-sdk/bundler';

await buildPackage({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
});
```

---

## 2. `@nexload-sdk/eslint-config`

### Overview
- **Location:** `tools/eslint-config`
- **Role:** Shared linting rules enforcing consistent style, clean imports, and preventing common runtime errors.
- **Standard:** Modern ESLint 9 configuration with TypeScript parser and React rules.

### Enforced Invariants:
- Strict unused variable elimination (`no-unused-vars` / `@typescript-eslint/no-unused-vars`).
- Explicit function return types where appropriate.
- Disallowing dangerous `any` when explicit types can be inferred or specified.
- React hooks rules (exhaustive deps, no conditional hooks).

---

## 3. `@nexload-sdk/typescript-config`

### Overview
- **Location:** `tools/typescript-config`
- **Role:** Canonical base TypeScript compiler options shared via `extends` in package `tsconfig.json` files.

### Base Presets:
- `base.json`: Common compiler flags (`strict: true`, `target: ES2022`, `moduleResolution: Bundler`, `skipLibCheck: true`).
- `node.json`: Tailored for Node.js backend services and probes.
- `react.json`: Tailored for React 19 UI components (Payload Admin field components).
