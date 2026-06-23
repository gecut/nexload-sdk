---
name: nexload-healthcheck-payload-adapter
description: Use when integrating Payload CMS health checks with @nexload-sdk/healthcheck-payload.
---

# Payload Adapter

Use `@nexload-sdk/healthcheck-payload`. Do not import Payload from the root package.

Use a minimal deterministic query:

```ts
payloadHealthCheck(payload, {
  collection: "users",
  limit: 1,
  depth: 0,
});
```

Payload failures should fail readiness, not liveness, by default.
