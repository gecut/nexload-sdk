# Healthcheck Core examples

Compose startup, readiness, diagnostics, and serialization.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/examples/
```ts
import {
  createHealthManager,
  httpCheck,
  startupCheck,
  stringifyHealthJson,
} from "@nexload-sdk/healthcheck";

const health = createHealthManager({
  service: { name: "worker" },
  checks: [
    startupCheck({ isStarted: () => queue.connected }),
    httpCheck("upstream", "https://api.example.com/status", {
      scopes: ["readiness"],
    }),
  ],
});

const report = await health.run("readiness", {
  profile: "standard",
});
const body = stringifyHealthJson(report, {
  includeDetails: false,
  redact: true,
});
```

The package test suite is the source-owned executable contract: [`core.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/test/core.test.mjs).

The documentation example is type-checked in CI: [`healthcheck.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck.ts).
