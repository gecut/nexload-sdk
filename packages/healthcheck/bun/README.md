# @nexload-sdk/healthcheck-bun

Bun runtime adapter and Bun server metrics for `@nexload-sdk/healthcheck`.

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/api/)

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter, bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({ fetch: () => new Response("ok") });

export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [shutdownCheck(), bunServerMetricsCheck(server)]
});
```
