# Healthcheck Node examples

Collect container metrics and check a TCP dependency.

**Topic:** examples
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/examples/
```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import {
  containerMetricsCollector,
  nodeRuntimeAdapter,
  tcpCheck,
} from "@nexload-sdk/healthcheck-node";

const health = createHealthManager({
  service: { name: "worker" },
  runtime: nodeRuntimeAdapter(),
  checks: [tcpCheck("redis", { host: "redis", port: 6379 })],
  collectors: [containerMetricsCollector()],
});
```

Executable cgroup cases: [`cgroup.test.mjs`](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/test/cgroup.test.mjs).

The documentation example is type-checked in CI: [`healthcheck-node.ts`](https://github.com/gecut/nexload-sdk/blob/main/apps/docs/examples/healthcheck-node.ts).
