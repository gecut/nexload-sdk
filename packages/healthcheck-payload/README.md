# @nexload-sdk/healthcheck-payload

Payload CMS health check integration for `@nexload-sdk/healthcheck`.

```ts
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

const check = payloadHealthCheck(payload, {
  collection: "users",
  limit: 1,
  depth: 0
});
```

Use a small, deterministic collection. Do not use a heavy query for readiness.
