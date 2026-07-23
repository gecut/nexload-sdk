# Healthcheck Payload guides

Choose a safe collection and readiness query.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/guides/
Choose a collection that always exists, has predictable access behavior, and can be queried cheaply. Keep `limit: 1`, `depth: 0`, and a narrow `where`.

Use `expectedMinDocuments` only when emptiness truly means the service is not ready. Set `timeoutMs` based on the probe budget. Do not query a heavy relation graph, write data, or expose error causes on a public endpoint.
