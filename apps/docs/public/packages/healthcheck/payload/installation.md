# Install Healthcheck Payload

Install the Payload readiness integration with core and Payload.

**Topic:** installation
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/installation/
```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-payload payload
```

Use `npm install`, `yarn add`, or `bun add` with the same package names if the
project does not use pnpm.

The optional Payload peer range is `>=3`. Install Payload in the application that constructs the check. This package uses the server-side Local API and is not for browser or admin-bundle code.
