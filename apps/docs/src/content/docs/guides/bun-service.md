---
title: Bun service
---

Use `@nexload-sdk/healthcheck-bun` for Bun runtime metadata and `Bun.serve` metrics.

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter } from "@nexload-sdk/healthcheck-bun";

export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [shutdownCheck()],
});
```
