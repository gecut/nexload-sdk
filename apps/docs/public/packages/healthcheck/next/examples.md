# Healthcheck Next.js examples

Expose a protected OpenMetrics route.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/examples/
```ts
import { createNextMetricsRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, HEAD } = createNextMetricsRoute(health, {
  format: "openmetrics",
  scope: "all",
  prefix: "web",
  protect: { bearerToken: process.env.METRICS_TOKEN! },
});
```

Executable route behavior: [`route.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/test/route.test.mjs).

The documentation example is type-checked in CI: [`healthcheck-next.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-next.ts).
