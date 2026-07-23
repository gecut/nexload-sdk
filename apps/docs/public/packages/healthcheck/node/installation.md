# Install Healthcheck Node

Install the Node integration with core.

**Topic:** installation
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/installation/
```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-node
```

Use `npm install`, `yarn add`, or `bun add` with the same package names if the
project does not use pnpm.

Core is a direct dependency, but install it explicitly because your application imports both packages. The package uses Node built-ins and is not intended for browser or edge runtimes.
