# Integration playbook

## Choose the probe

Select a collection that is always available when Payload is operational and whose access/query path matches the application runtime. Avoid volatile content where zero documents is normal unless no minimum is configured.

Use `expectedMinDocuments` only when document existence is a true operational invariant, such as a required singleton settings record. It is not a general data-quality check.

## Scope and criticality

Defaults are scopes `["readiness"]` and criticality `{ readiness: true, diagnostics: false }`. This removes traffic when Payload is unavailable without making external database failure a process-liveness restart signal.

If adding diagnostics scope, retain non-critical behavior unless product policy requires otherwise. The public options expose scopes but not a custom criticality option; do not claim otherwise.

## Timeout

`timeoutMs` is assigned to the definition and enforced by the manager race. A timeout becomes `CHECK_TIMEOUT` with `timedOut: true` under manager policy. `payload.find` receives no AbortSignal, so the underlying database query may continue after the manager returns.

Keep query cost low because timeout is not cancellation. Do not add retry inside the adapter; manager retry policy is a separate core concern.

## Exposure

Serve public readiness without details and with default error suppression. Protect diagnostics if raw details are enabled. Treat collection names, latency, total document counts, and runtime identity as an explicit exposure decision.

Import `payloadHealthCheck` from `@nexload-sdk/healthcheck-payload`; core does not import Payload.
