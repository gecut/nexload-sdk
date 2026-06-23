---
title: Node service
---

Use `@nexload-sdk/healthcheck-node` for Node process, container, TCP, and DNS checks.

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { nodeRuntimeAdapter, processMetricsCollector } from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: nodeRuntimeAdapter(),
  checks: [shutdownCheck()],
  collectors: [processMetricsCollector()],
});
```
