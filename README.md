# Nexload SDK Monorepo

Monorepo for the `@nexload-sdk/*` packages.

This repository contains reusable Node.js / TypeScript packages for:

- environment variable management
- structured logging
- health checks
- JWT helpers
- Payload CMS utilities
- HTTP pooling and RPC client helpers
- internal build/lint/TypeScript tooling

## Workspace Layout

- `packages/*`: publishable SDK packages
- `tools/*`: internal shared tooling packages used by the workspace
- `apps/web`: small Vite playground/demo app
- `.changeset`: release metadata for versioning/publishing

## Packages

### Runtime packages (`packages/*`)

- `@nexload-sdk/env`: typed environment variable manager + presets
- `@nexload-sdk/logger`: lightweight structured logger (Node + browser renderers)
- `@nexload-sdk/healthcheck`: framework-agnostic liveness/readiness checks
- `@nexload-sdk/jwt`: policy-driven JWT factory
- `@nexload-sdk/orpc-client`: small oRPC client factory wrapper
- `@nexload-sdk/payload-fields`: Payload CMS custom fields + lexical editor preset
- `@nexload-sdk/payload-hooks`: Payload CMS logging hooks
- `@nexload-sdk/iconcraft`: CLI to generate local icon components from Iconify

### Tooling packages (`tools/*`)

- `@nexload-sdk/bundler`: shared esbuild + `tsc` bundling helper
- `@nexload-sdk/eslint-config`: shared flat ESLint configs
- `@nexload-sdk/typescript-config`: shared tsconfig presets

## Requirements

- Node.js 20+ (recommended)
- pnpm 10+

The workspace is configured with `pnpm` and `turbo`.

## Getting Started

```bash
pnpm install
pnpm build
```

Common commands:

```bash
pnpm dev      # turbo run dev
pnpm build    # turbo run build
pnpm lint     # turbo run lint
pnpm format   # prettier on ts/tsx/md
```

## Development Notes

- Most packages are bundled with the internal `@nexload-sdk/bundler` helper.
- Package builds usually output CJS + ESM + `.d.ts` files to `dist/`.
- Releases are managed through Changesets (`.changeset/`).
- The root script `cublish` is a local convenience release flow (build/install/changesets/publish).

## Documentation

Each package has its own `README.md` with:

- install instructions
- exported API overview
- usage examples
- package-specific caveats

See also `AGENTS.md` for repository-specific guidance when working with automated coding agents.
