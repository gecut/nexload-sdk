# Healthcheck Payload examples

Require a known configuration document before accepting traffic.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/examples/
```ts
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

const payloadReady = payloadHealthCheck(payload, {
  collection: "settings",
  where: { key: { equals: "primary" } },
  expectedMinDocuments: 1,
  limit: 1,
  depth: 0,
  timeoutMs: 750,
});
```

Only use this minimum when the document is a real readiness prerequisite. Executable cases: [`payload.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/test/payload.test.mjs).

The documentation example is type-checked in CI: [`healthcheck-payload.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-payload.ts).
