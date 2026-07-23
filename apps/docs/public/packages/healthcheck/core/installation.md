# Install Healthcheck Core

Install the runtime-neutral health manager and choose optional integrations.

**Topic:** installation
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/installation/
```bash
pnpm add @nexload-sdk/healthcheck
```

The examples use pnpm. With another package manager, use
`npm install`, `yarn add`, or `bun add` with the same package names.

Core has no runtime dependencies or framework peer dependencies. It supports ESM and CommonJS entrypoints.

Install integrations separately; they are not bundled:

```bash
pnpm add @nexload-sdk/healthcheck-node
pnpm add @nexload-sdk/healthcheck-bun
pnpm add @nexload-sdk/healthcheck-next
pnpm add @nexload-sdk/healthcheck-prometheus
pnpm add @nexload-sdk/healthcheck-otel
pnpm add @nexload-sdk/healthcheck-payload payload
```

Do not install Node and Bun adapters merely to expose HTTP routes. Runtime probes and HTTP route factories solve different problems.
