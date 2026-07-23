# Troubleshoot Healthcheck Payload

Diagnose unhealthy queries, count expectations, and slow readiness.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/troubleshooting/
* `PAYLOAD_QUERY_FAILED` with a cause: verify Payload initialization, collection slug, access context, adapter connectivity, and query shape.
* The query succeeds but health is unhealthy: `totalDocs` is below `expectedMinDocuments`.
* Readiness is slow: keep `limit` small, `depth` zero, remove broad filters, and check database latency.
* The app restarts during a database outage: do not add this check to liveness.

Log causes privately; return only the safe core error message publicly.
