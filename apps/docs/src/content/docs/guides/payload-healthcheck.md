---
title: Payload healthcheck
---

Payload checks live in `@nexload-sdk/healthcheck-payload` so the root package never imports Payload.

```ts
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

const check = payloadHealthCheck(payload, {
  collection: "users",
  limit: 1,
  depth: 0,
});
```
