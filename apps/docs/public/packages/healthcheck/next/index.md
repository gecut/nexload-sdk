# Healthcheck Next.js

App Router health and metrics route factories.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/
`@nexload-sdk/healthcheck-next` turns a core manager into Next.js App Router `GET` and `HEAD` handlers. It supports JSON/summary health responses, Prometheus/OpenMetrics/JSON metrics, HTTP status policies, and route protection.

It does not create checks or choose a runtime adapter. Use core plus Node checks for Node runtime observations. Keep diagnostics and metrics protected when they expose operational detail.
