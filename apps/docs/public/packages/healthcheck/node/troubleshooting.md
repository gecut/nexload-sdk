# Troubleshoot Healthcheck Node

Diagnose cgroup detection and TCP or DNS failures.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/troubleshooting/
* `container.detected` is false: confirm cgroup files are mounted and readable; OS fallback may still provide limits.
* Container status is degraded: inspect `confidence` and `source` in protected details.
* `TCP_CONNECT_FAILED`: verify host, port, network policy, and timeout.
* `DNS_RESOLVE_FAILED`: verify the requested record type and resolver inside the running container.
* Memory differs from host tools: the adapter prioritizes container limits, which is intentional.

Do not publish raw container paths or process detail on an unauthenticated endpoint.
