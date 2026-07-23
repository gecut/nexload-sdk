# Healthcheck Bun guides

Expose safe Bun health and diagnostics endpoints.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/guides/
Call `health.run("liveness")` or `health.run("readiness")` inside a Bun route and serialize with core. Keep runtime/server detail on a protected diagnostics endpoint.

Do not treat pending requests as an automatic failure threshold: `bunServerMetricsCheck()` reports them with status `ok`. Define a separate custom check if your service has an explicit saturation policy.
