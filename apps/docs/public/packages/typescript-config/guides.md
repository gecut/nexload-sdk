# Configuration Guides & Recipes

Monorepo project references, overriding compiler options safely, and library declaration builds.

**Topic:** guides
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/typescript-config/guides/
## Monorepo Setup with Project References

In high-performance monorepos (Turborepo or pnpm workspaces), use a root orchestrator configuration and extend specific presets in each workspace package.

### 1. Root `tsconfig.json`

The root configuration acts as the solution orchestrator without compiling files directly:

```json title="tsconfig.json"
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/ui" },
    { "path": "apps/web" }
  ]
}
```

### 2. Workspace Package `tsconfig.json`

Inside individual packages, point `extends` to the preset matching that package's runtime archetype:

```json title="packages/core/tsconfig.json"
{
  "extends": "@nexload-sdk/typescript-config/node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"]
}
```

***

## Overriding Compiler Options Safely

Presets are designed to be composable. When overriding options in your local `tsconfig.json`, follow these guidelines:

### Safe to Customize

* **`rootDir` and `outDir`**: Configure directory output paths according to your build tool (esbuild, tsup, tsc).
* **`declaration` and `declarationMap`**: Enable when publishing dual packages with source-linked `.d.ts.map` files.
* **`paths` / `baseUrl`**: Add path aliases (e.g., `~/*` or `@/*`) if required by your framework bundler.

### Never Weaken

* **`strict`**: Do not disable `strict: false`. Narrow types explicitly at trust boundaries instead.
* **`moduleDetection`**: Keep `"force"` to guarantee proper module scoping in all environments.
* **`forceConsistentCasingInFileNames`**: Never disable; required to prevent cross-OS deployment failures.

***

## Migrating from Legacy `tsconfig.json`

If upgrading an existing codebase with many loose types or legacy CommonJS options:

1. **Update Dependencies**: Install `typescript@^5.9.0` and `@nexload-sdk/typescript-config`.
2. **Replace `extends`**: Replace local compiler flags with `"extends": "@nexload-sdk/typescript-config/<target>.json"`.
3. **Run Typecheck**: Run `pnpm tsc --noEmit` to surface type discrepancies.
4. **Fix Module Imports**: Ensure all relative imports use modern ESM file extensions (`.js` in import paths when targeting `NodeNext`).
5. **Resolve Strictness Issues**: Add explicit return types on recursive functions and eliminate switch statement fallthroughs.
