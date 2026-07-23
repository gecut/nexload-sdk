# Healthcheck Node concepts

Understand runtime adapters, cgroup detection, collectors, and dependency probes.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/concepts/
`nodeRuntimeAdapter()` supplies process identity, uptime, memory, CPU, and shutdown hooks.

Container detection reads cgroup v2 and v1, then falls back to constrained-process and OS values. A fractional CPU quota such as `0.5` is preserved. Low-confidence detection makes the default container check degraded, not unhealthy.

`processMetricsCollector()` and `containerMetricsCollector()` add monitoring series. `tcpCheck()` and `dnsCheck()` are readiness checks by default. They are probes, not HTTP route handlers.
