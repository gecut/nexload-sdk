# Route matrix

| Purpose | Factory | Scope | Format/body | Methods | HTTP policy |
|---|---|---|---|---|---|
| Liveness | `createNextHealthRoute` | `liveness` | summary or JSON without details | GET, HEAD | default |
| Readiness | `createNextHealthRoute` | `readiness` | summary/minimal JSON | GET, HEAD | default or strict |
| Startup | `createNextHealthRoute` | `startup` | summary/minimal JSON | GET, HEAD | default/custom |
| Diagnostics | `createNextHealthRoute` | `diagnostics` | JSON, optional sanitized details | GET, HEAD | deliberate custom/default |
| Metrics | `createNextMetricsRoute` | defaults `all` | Prometheus, OpenMetrics, or JSON | GET | always HTTP 200 |

## Health response contract

`format: "summary"` returns only status, scope, observedAt, durationMs, and summary. Omitted format or `"json"` uses core serialization. `includeDetails` defaults false and may be a boolean or request predicate.

Default HTTP policy is ok 200, degraded 200, unhealthy 503. Use `STRICT_READINESS_HTTP_STATUS_POLICY` when any non-ok readiness state should remove the instance from traffic.

HEAD executes the same manager run and status mapping as GET but has no body. Do not implement HEAD as a static shortcut that can disagree with GET.

## Metrics response contract

`createNextMetricsRoute` accepts `prometheus`, `openmetrics`, or `json`; default scope is `all`. It runs the manager with monitoring profile. Prometheus/OpenMetrics receive prefix/default labels. Metrics responses always use HTTP 200; inspect `x-health-status` for report state.

## Common headers

Responses include content type, `cache-control: no-store, max-age=0`, and `x-health-status`, `x-health-scope`, `x-health-schema`. Unauthorized responses are also no-store.
