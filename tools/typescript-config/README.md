# @nexload-sdk/typescript-config

Shared, authoritative TypeScript configuration presets for the Nexload SDK monorepo and ecosystem.

## Presets

- **`base.json`**: Strict shared foundation (`strict: true`, `noUncheckedIndexedAccess: true`, `target: ES2022`, `moduleResolution: Bundler`, `declaration: true`, `declarationMap: true`).
- **`node.json`**: For Node.js / Bun library packages and backend services.
- **`react.json`**: For React 19 UI component libraries (`jsx: react-jsx`, `emitDeclarationOnly: true`).
- **`next.json`**: For Next.js App Router applications (`jsx: preserve`, `plugins: [{ name: "next" }]`, `noEmit: true`).
- **`vite.json`**: For Vite-based client applications (`noEmit: true`, DOM lib enabled).

## Usage

In your package or app `tsconfig.json`:

```json
{
  "extends": "@nexload-sdk/typescript-config/node.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

For a React UI library:

```json
{
  "extends": "@nexload-sdk/typescript-config/react.json",
  "include": ["src"],
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

## Compiler Invariants

- Modern module resolution via `Bundler`
- Explicit trust boundaries via `noUncheckedIndexedAccess: true`
- Complete declaration output with maps (`declaration: true`, `declarationMap: true`)
- Strict type-checking rules enabled across all presets
