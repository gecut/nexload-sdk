---
title: Getting started
---

Install the core package:

```bash
pnpm add @nexload-sdk/healthcheck
```

Create a manager:

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: "auto",
  checks: [shutdownCheck(), memoryCheck()],
});
```

Run probes with `health.run("liveness")`, `health.run("readiness")`, `health.run("startup")`, or `health.run("diagnostics")`.
