# Install Healthcheck Next.js

Install App Router factories and their health packages.

**Topic:** installation
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/installation/
```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-next
```

Use `npm install`, `yarn add`, or `bun add` with the same package names if the
project does not use pnpm.

The route package depends on the Prometheus serializer internally. Install `@nexload-sdk/healthcheck-node` separately if the manager uses `nodeRuntimeAdapter()` or Node probes.

Use these handlers in App Router route modules, not browser components or Pages Router API handlers.
