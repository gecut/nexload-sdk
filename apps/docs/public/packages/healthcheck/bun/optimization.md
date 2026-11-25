# healthcheck-bun — Optimization

Production choices for @nexload-sdk/healthcheck-bun.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/optimization/
## Interpret missing memory limits

The Bun adapter reads process memory when available and returns null for container limits. The memory check reports degraded with this adapter.

## Restrict diagnostic routes

Protect endpoints that expose Bun runtime and server metrics.

## Keep runtime metrics in diagnostics

`bunRuntimeInfoCheck` and `bunServerMetricsCheck` default to diagnostics and are noncritical.

## Use the Bun runtime

This adapter is designed for Bun. It does not read Linux cgroups, so missing memory limits are not container limits.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts).
