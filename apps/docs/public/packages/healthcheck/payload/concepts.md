# Healthcheck Payload concepts

Understand readiness, Local API queries, and document-count expectations.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/concepts/
The check calls `payload.find` and records latency, `totalDocs`, and `up`. Query success means `ok`. A thrown query or unmet `expectedMinDocuments` means `unhealthy` with `PAYLOAD_QUERY_FAILED`.

Default scopes are `readiness`; the core critical policy is true for readiness and false for diagnostics. The check does not participate in liveness unless you override scopes, which is rarely appropriate.
