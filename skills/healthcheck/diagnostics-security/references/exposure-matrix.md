# Exposure matrix

| Endpoint class | Typical content | Details/errors | Protection | HTTP/cache |
|---|---|---|---|---|
| Public liveness | summary or minimal JSON | never | platform/network as needed | status policy, no-store |
| Public readiness/startup | minimal status/summary | never | platform/network as needed | default or strict policy, no-store |
| Private diagnostics | JSON with explicitly required details | sanitized opt-in only | app auth plus private network/IP policy where possible | no-store |
| Private metrics | Prometheus/OpenMetrics/JSON | no check details | scraper auth/network/IP policy | HTTP 200 by adapter, no-store |

Public probes should answer orchestration questions, not disclose dependency names, runtime versions, regions, instance IDs, URLs, resource topology, or error context unless those fields are explicitly accepted.

## Data surfaces

Audit all of these separately:

- `check.details` and `report.resources`: serializer sanitizes when redaction is enabled.
- `check.error`: public message/cause/stack suppression is policy-controlled.
- `check.metrics` and `report.metrics`: not sanitized by JSON serializer.
- metric labels: exporter-specific behavior; OTel copies labels verbatim.
- service, environment, runtime, links: not sanitized by serializer.

Profiles do not filter any surface automatically. `includeDetails` controls details only; metrics remain present.

## Composition

The security decision belongs here, but implementation remains with the owning route/exporter skill. For Next, use route `protect` plus deployment controls. For other frameworks, implement equivalent fail-closed behavior without claiming the Next API is portable.

Document whether an endpoint is reachable from the public internet, cluster network, load balancer, or monitoring network. A private URL convention is not an access control.
