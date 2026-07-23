# Install Healthcheck Prometheus

Install Prometheus serializers with core.

**Topic:** installation
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/installation/
```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-prometheus
```

Use `npm install`, `yarn add`, or `bun add` with the same package names if the
project does not use pnpm.

No Prometheus client library is required. This package emits text; your application owns the HTTP endpoint and authentication.
