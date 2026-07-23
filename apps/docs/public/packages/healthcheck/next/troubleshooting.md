# Troubleshoot Healthcheck Next.js

Diagnose caching, unauthorized responses, invalid protection, and wrong runtime.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/troubleshooting/
* A route appears cached: export `dynamic`, `revalidate`, and `fetchCache` as shown in Quick start.
* Response is 401: verify the exact Authorization header and, for IP rules, the configured proxy header.
* Factory throws `HEALTHCHECK_INVALID_CONFIG`: provide at least one policy; do not combine bearer and Basic; enable `trustProxy` for IP/CIDR; use IPv4.
* Node probes fail at the edge: set route runtime to `nodejs` or remove Node-only checks.
* Metrics are empty: register collectors; check-local metrics are not report-level exporter series.
