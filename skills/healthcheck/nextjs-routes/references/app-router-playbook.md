# App Router playbook

## Server-only manager

Create the manager in one server-only module and import it from every route. Do not instantiate a manager per request; that repeats registration and shutdown listeners and can make state inconsistent.

Register Node/container checks with the Node runtime adapter in that module. Core does not access process APIs directly.

## Route module

For a Node-backed route:

```ts
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";
import { healthManager } from "@/server/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const { GET, HEAD } = createNextHealthRoute(healthManager, {
  scope: "readiness",
  format: "summary",
});
```

Use the factory output directly unless wrapping behavior is necessary and covered by tests. A metrics route exports GET only.

## Status policy

Default degraded=200 preserves a reachable but impaired instance. Strict readiness degraded=503 removes it from traffic. Choose from orchestration consequences and test exact status values; do not infer status from the body alone.

## Verification matrix

- GET and HEAD execute the correct scope.
- HEAD body is empty.
- summary excludes checks/details/metrics.
- JSON defaults to no details and core redaction.
- default versus strict status mapping is exact.
- metrics content type matches format and HTTP remains 200.
- every success and denial response is no-store.
- invalid cache/protection/CIDR throws at construction.
- valid and invalid credential/proxy cases are covered.

When metrics conversion changes, build `healthcheck-prometheus` before the Next package because the adapter imports its output.
