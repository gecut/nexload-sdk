# Migrate from v4 to v5

Configure once per runtime at startup, before accepting traffic:

```ts
import { configureLogger, logger } from "@nexload-sdk/logger";

configureLogger({ service: "shop-api" });
const log = logger.child({ module: "orders" });
log.info({ event: "order.lifecycle.created", orderId: "123" }, "Order created");
```

A repeated configuration is ignored with a warning unless `force: true` is set. Children of the shared proxy follow later configuration.

| v4 | v5 |
| --- | --- |
| `NexloadLogger` or `createGlobalLogger` | Configure with `configureLogger` and use the shared `logger` proxy. |
| Custom renderer exports | Use `pretty` or `destination` on Node; custom renderer exports are removed. |
| `@nexload-sdk/logger/log-test` | Import `createTestLogger` from `@nexload-sdk/logger/testing`. |
| Child tags | Use object bindings: `logger.child({ module: "orders" })`. |
| Uppercase output level labels | Update queries and snapshots for lowercase labels. |

`LOG_LEVEL` is case-insensitive and trimmed, so uppercase values remain accepted; use lowercase for new configuration. Invalid values fall back to `info` in production or `debug` elsewhere. Review sensitive fields: default key redaction reaches the top level and one level below, with explicit header and body exceptions; deeper fields need explicit paths. Browser and Edge context is pass-through, so forward trace IDs explicitly.

```ts
import { createTestLogger } from "@nexload-sdk/logger/testing";
const { logger, entries, clear } = createTestLogger({ service: "test" });
logger.info({ event: "test.run.completed" }, "Completed");
clear();
```
