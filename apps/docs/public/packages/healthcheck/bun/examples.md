# Healthcheck Bun examples

Return a readiness report from Bun.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/examples/
```ts
import { stringifyHealthJson } from "@nexload-sdk/healthcheck";
import { health } from "./health";

Bun.serve({
  async fetch(request) {
    if (new URL(request.url).pathname !== "/readyz") return new Response("Not found", { status: 404 });
    const report = await health.run("readiness");
    return new Response(stringifyHealthJson(report), {
      status: report.status === "unhealthy" ? 503 : 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  },
});
```

The portable package-contract example is type-checked in CI: [`healthcheck-bun.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-bun.ts).
