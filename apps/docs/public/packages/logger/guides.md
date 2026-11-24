# Production Guides & Recipes

Configure the logger per runtime and use request context, trace headers, redaction, and error serialization.

**Topic:** guides
**Package:** `@nexload-sdk/logger` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/logger/guides/
## Configure Once per Runtime

Call `configureLogger` in the Node.js or Bun service entry point. Configure a browser bundle separately at its startup if it needs custom settings. The lazy logger uses environment fallbacks before configuration. `SERVICE_NAME` defaults to `unknown`, `RELEASE` supplies the release, and `LOG_LEVEL` defaults to `info` in production and `debug` elsewhere.

A second configuration call returns the existing logger and emits a warning with event `logger.reconfigure.ignored`. Use `force: true` when you intentionally need to replace it.

### Next.js Instrumentation

Configure the logger in `instrumentation.ts`. Each server runtime initializes its own logger when Next.js invokes `register`.

```ts
export async function register() {
  const { configureLogger } = await import("@nexload-sdk/logger");
  configureLogger({ service: "shop-web", release: process.env.RELEASE });
}
```

***

## Request Context and Trace Propagation

Resolve the trace ID at the request boundary and attach it to a request scope. Node's async context carries bindings through awaited calls. Nested scopes merge bindings, with inner values taking precedence.

```ts
import { logger, resolveTraceId, traceHeaders, withLogContext } from "@nexload-sdk/logger";

const log = logger.child({ module: "inventory" });

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const traceId = resolveTraceId(request.headers);

  return withLogContext({ requestId, traceId }, async () => {
    const startedAt = performance.now();
    const upstream = await fetch("https://inventory.example.com/availability", {
      headers: traceHeaders(),
    });
    log.info({
      event: "inventory.request.completed",
      status: upstream.status,
      durationMs: performance.now() - startedAt,
      outcome: upstream.ok ? "success" : "failure",
    }, "Inventory request completed");
    return upstream;
  });
}
```

### Edge and Browser

`withLogContext` calls the callback directly, and `getLogContext()` returns an empty object. Browser output uses pino browser records; server `pretty` and `destination` settings do not apply. Bind IDs with `logger.child({ requestId, traceId })` and forward the trace explicitly with `{ [TRACE_HEADER]: traceId }`.

***

## Redaction

```ts
import { configureLogger } from "@nexload-sdk/logger";

configureLogger({
  service: "shop-api",
  redact: { paths: ["customer.nationalCode"] },
});
```

### Path Coverage

The default censor is `[REDACTED]`. Default key patterns cover `password`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `otp`, `phone`, `mobile`, and `merchant` at the top level and one level below it. The defaults also cover `req.headers.authorization`, `req.headers.cookie`, `headers.authorization`, `headers.cookie`, `body`, and `req.body`.

Extra paths extend the defaults unless you set `replaceDefaults: true`. Deeper fields such as `user.profile.phone` require an explicit path. Keep log fields limited to IDs and safe metadata, and keep secrets out of message strings.

***

## Errors

Pass the error under `err`, or pass an `Error` as the first argument. Log it once at the boundary that handles it. Let errors propagate to that boundary when the caller handles them.

```ts
import { logger } from "@nexload-sdk/logger";

const log = logger.child({ module: "orders" });

export function orderFailure(err: unknown) {
  log.error({ err, event: "order.request.failed" }, "Order request failed");
  return new Response("Unable to process order", { status: 500 });
}
```

### Serialized Fields

The serializer includes the error type, up to 500 characters of its message, an optional code that matches `/^[A-Z][A-Z0-9_]{1,99}$/`, and up to two nested causes (three error records including the root). Non-Error values become a type and string message. Stack traces are included outside production.

***

## Testing

Use `createTestLogger` from `@nexload-sdk/logger/testing` to assert on emitted events. It captures parsed entries independently of the global configuration, so tests do not need to reset shared state.

```ts
import { createTestLogger } from "@nexload-sdk/logger/testing";

const { logger, entries, clear } = createTestLogger({ service: "test", level: "info" });

logger.success({ event: "order.lifecycle.placed", orderId: "123" }, "Order placed");

entries[0]?.event; // "order.lifecycle.placed"
clear();
```

Inject the test logger into the code under test instead of mocking the shared `logger`.

***

## Libraries

A library that logs imports the shared logger and never calls `configureLogger`. The host application owns configuration, so the library's module children follow it. Before the application configures the logger, calls use the environment fallbacks described above.

***

## Logging Architecture

Create one child per module. Log on request completion, outbound provider calls, job completion, and business state transitions. Aggregate loop results and log the summary once. Give each event a stable past-tense `domain.entity.action` name and a short message. Add `durationMs` and `outcome` to timed operations, and `attempt` to retry events.

Use `info` for lifecycle summaries, `success` for business milestones, `warn` for handled degradation, and `error` for unexpected failures. Reserve `fatal` for conditions that prevent the process from continuing. Use `debug` and `trace` for diagnostics. Skip logs for successful health checks.

See the [logger skill](https://github.com/gecut/nexload-sdk/tree/main/skills/logger) for boundary, field, and level rules.

***

## Troubleshooting & Migration from v4

### 1. Global Setup and Children's Bindings

Replace `NexloadLogger` and `createGlobalLogger` with startup configuration and the shared `logger` export. Pass an object to `child`, such as `logger.child({ module: "orders" })`.

### 2. Renderers and Level Filters

Replace custom renderer APIs with `pretty` or `destination`. Update structured-log queries and filters to use lowercase output labels; the Node pretty stream displays uppercase labels. Existing uppercase `LOG_LEVEL` values are accepted.

### 3. Tests and Error Fields

Replace `@nexload-sdk/logger/log-test` with `createTestLogger` from `@nexload-sdk/logger/testing`. Review redaction coverage and pass errors under `err` or as the first argument.
