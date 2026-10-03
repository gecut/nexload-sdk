# Build, Lint & Release Lifecycle

This document defines the monorepo build pipeline, bundling mechanics, linting protocols, and release workflows for `nexload-sdk`.

---

## 1. Monorepo Architecture (`pnpm` + `Turborepo`)

The repository uses `pnpm` workspaces configured in `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/**'
  - 'tools/*'
```

Task orchestration and caching are governed by `turbo.json`:
- **`build`:** Compiles TypeScript source across all packages using each package's `esbuild.config.mjs`. Cached based on `src/**` changes.
- **`lint`:** Runs ESLint across packages and apps.

### Core CLI Commands
```bash
# Build the entire monorepo
pnpm build

# Lint the entire monorepo
pnpm lint

# Build a single package quickly
pnpm -C packages/payload-operations build

# Lint a single package
pnpm -C packages/payload-operations lint
```

---

## 2. Bundling Pipeline (`@nexload-sdk/bundler`)

Each publishable package contains an `esbuild.config.mjs` in its root:
```javascript
import { buildPackage } from '@nexload-sdk/bundler';

await buildPackage({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
});
```

### Standard Output Distribution in `dist/`:
- `dist/index.mjs` (ESM module format)
- `dist/index.cjs` (CommonJS module format)
- `dist/index.d.ts` (TypeScript type declarations)
- `dist/index.d.ts.map` (Declaration sourcemaps)

> [!CAUTION]
> Never manually edit files in `dist/`. All changes must be authored in `src/` and compiled via the build command.

---

## 3. Releases & Versioning (Changesets)

Releases are managed using [Changesets](https://github.com/changesets/changesets).

### Creating a Changeset
When introducing a bug fix, new feature, or breaking change to any package:
```bash
pnpm changeset
```
1. Select which packages are modified.
2. Choose the semver bump level (`patch`, `minor`, or `major`).
3. Enter a concise summary of the change.
4. Commit the generated markdown file in `.changeset/`.

### Versioning & Publishing Rules
- Do not manually edit version numbers in `package.json` files unless executing a release.
- **Autonomous Agent Safety Rule:** An AI agent must **never** execute `pnpm changeset publish` or publish packages to npm without explicit, unambiguous human user instruction.
