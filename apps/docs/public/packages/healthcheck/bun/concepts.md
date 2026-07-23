# Healthcheck Bun concepts

Understand Bun runtime and server observations.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/concepts/
`bunRuntimeAdapter()` reads `Bun.version`, revision, platform, process identity, uptime, and memory where available.

`bunRuntimeInfoCheck()` is diagnostic and non-critical by default; it degrades when the active runtime is not Bun. `bunServerMetricsCheck()` reads pending requests and WebSockets and remains non-critical. These are observations, not dependency readiness checks.
