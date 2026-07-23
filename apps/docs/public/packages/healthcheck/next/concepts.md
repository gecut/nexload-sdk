# Healthcheck Next.js concepts

Understand route factories, status mapping, formats, and protection.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/concepts/
`createNextHealthRoute()` runs one health scope and returns JSON or summary output. `createNextMetricsRoute()` runs `all` by default and emits Prometheus, OpenMetrics, or JSON.

Health handlers use the configured core HTTP policy. Responses carry no-store headers plus status, scope, duration, service, and optional instance headers.

Protection supports bearer token, Basic auth, IPv4 address, and IPv4 CIDR policies. IP policies require explicit `trustProxy: true`; the first configured proxy-header address is trusted.
