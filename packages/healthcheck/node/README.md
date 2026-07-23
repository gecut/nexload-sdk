# @nexload-sdk/healthcheck-node

Node.js runtime adapter and operational checks for `@nexload-sdk/healthcheck`.

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/node/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/node/api/)

```ts
import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";
import { containerResourceCheck, nodeRuntimeAdapter } from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "api" },
  runtime: nodeRuntimeAdapter(),
  checks: [
    shutdownCheck(),
    memoryCheck(),
    containerResourceCheck({ scopes: ["diagnostics"] })
  ]
});
```

Container resource detection reads cgroup v2 and v1 files before falling back to Node and OS values. It preserves fractional CPU quotas such as `0.5`.
