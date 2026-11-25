# healthcheck-node — Optimization

Production choices for @nexload-sdk/healthcheck-node.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/optimization/
## Restrict container details

Use private or authenticated endpoints for process metrics and container resources. Reports can include process identifiers and cgroup paths.

## Check deployment platform

Use container limits only where the platform supplies the required cgroup data.

## Keep network probes in readiness

`tcpCheck` and `dnsCheck` default to readiness. Container checks and process and container collectors default to diagnostics.

## Respect the runtime boundary

This adapter uses Node.js APIs and Linux cgroup files. On non-Linux hosts, container detection reports low confidence and the container check is degraded.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/container-resources/SKILL.md).
