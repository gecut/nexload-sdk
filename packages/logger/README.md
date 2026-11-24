# @nexload-sdk/logger

Configure-once structured logging for Node.js, Bun, Edge and browsers, built on pino.

## Install

```bash
pnpm add @nexload-sdk/logger
```

## Configure once

Configure each runtime at startup. For Next.js, use `instrumentation.ts`:

```ts
export async function register() {
  const { configureLogger } = await import('@nexload-sdk/logger');
  configureLogger({ service: 'shop-web', release: process.env.RELEASE });
}
```

For a Node.js or Bun service entry point:

```ts
import { configureLogger } from '@nexload-sdk/logger';

configureLogger({ service: 'shop-api', release: process.env.RELEASE });
```

`configureLogger` returns a lazy proxy that normalizes `Error` first arguments, as do the shared proxy and their children. A second call returns the existing proxy and emits a warning with `event: "logger.reconfigure.ignored"`. Set `force: true` to replace the configuration. Before configuration, the lazy logger uses environment defaults; children follow later configuration, including forced replacements.

For Payload, call `configureLogger()` before `buildConfig()`, then pass `getPinoLogger()` as `config.logger`. It returns the live configured pino 10 instance accepted by Payload, not the lazy proxy. Call it again after forced reconfiguration to get the replacement instance.

```ts
import { configureLogger, getPinoLogger } from '@nexload-sdk/logger';
import { buildConfig } from 'payload';

configureLogger({ service: 'cms' });
export default buildConfig({ logger: getPinoLogger() });
```

Options include `level`, `release`, `instance`, `environment`, `redact`, `pretty`, `destination`, `base`, and `force`. Base output includes `service`, optional release, instance and environment, `pid`, and ISO `time`.

## Logging anywhere

```ts
import logger from '@nexload-sdk/logger';

const log = logger.child({ module: 'orders' });
log.info({ event: 'order.lifecycle.created', orderId: '123' }, 'Order created');
```

The named `logger` export is the same proxy. Level methods accept an object, an `Error`, or a message string, followed by an optional message. Use `isLevelEnabled(level)` to check filtering.

## Levels

| Level | Value | Use |
| --- | ---: | --- |
| trace | 10 | Very verbose diagnostics |
| debug | 20 | Diagnostics |
| info | 30 | Lifecycle and request summaries |
| success | 35 | Business milestones |
| warn | 40 | Handled degradation or retry |
| error | 50 | Unexpected failure needing attention |
| fatal | 60 | Process cannot continue |

Structured output level labels are lowercase; the Node pretty stream displays them in uppercase. The default is `LOG_LEVEL`, otherwise `info` in production and `debug` elsewhere; uppercase `LOG_LEVEL` values are accepted.

## Redaction

By default, `password`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `otp`, `phone`, `mobile`, and `merchant` are redacted at the top level and one level below it. The defaults also cover `req.headers.authorization`, `req.headers.cookie`, `headers.authorization`, `headers.cookie`, `body`, and `req.body`. The default censor is `[REDACTED]`. `DEFAULT_REDACT_PATHS` exposes the list.

```ts
configureLogger({
  service: 'shop-api',
  redact: { paths: ['customer.nationalCode'] },
});
```

Paths extend the defaults; `replaceDefaults: true` replaces them, and `censor` changes the replacement string. There is no recursive wildcard: a secret two levels deep, such as `user.profile.phone`, is **not** redacted by the default key patterns. Add an explicit path and avoid logging sensitive data in the first place.

## Errors

```ts
try {
  await performOperation();
} catch (err) {
  logger.error({ err, event: 'order.operation.failed' }, 'Operation failed');
}
// An Error as the first argument is also normalized under `err`:
logger.error(new Error('Operation failed'));
```

The `err` serializer includes type, a message capped at 500 characters, a code matching `/^[A-Z][A-Z0-9_]{1,99}$/`, and up to two nested causes (three error records including the root). Non-Error values become a type and string message. Stack traces appear only outside production.

## Request context and trace

In Node.js, context is preserved across asynchronous calls; nested contexts merge with inner values taking precedence. `resolveTraceId` accepts `Headers` or a string record, reuses valid `x-trace-id` values, and otherwise generates a UUID. `TRACE_HEADER` names the header.

```ts
import { logger, resolveTraceId, traceHeaders, withLogContext } from '@nexload-sdk/logger';

export async function GET(req: Request) {
  const traceId = resolveTraceId(req.headers);
  return withLogContext({ requestId: traceId, traceId }, async () => {
    logger.info({ event: 'request.lifecycle.started' }, 'Request started');
    return fetch('https://example.com/api', { headers: traceHeaders() });
  });
}
```

`getLogContext()` returns the current bindings; `traceHeaders()` returns the trace header when a trace ID is present, otherwise an empty object.

## Edge and browser

The `browser`, `edge-light`, and `worker` export conditions select the browser entry; `import` and `require` select the Node entry. The `testing` subpath has Node import and require entries. The browser and Edge entry has the same public API but `withLogContext` is pass-through and `getLogContext()` returns an empty object. Pass identifiers explicitly where context propagation is required. Browser output uses pino browser records; `pretty` and `destination` do not select the server output stream there.

## Testing

```ts
import { createTestLogger } from '@nexload-sdk/logger/testing';

const { logger, entries, clear } = createTestLogger({ service: 'test' });
logger.info({ orderId: '123' }, 'Created');
console.log(entries[0]);
clear();
```

The test logger is isolated from global configuration and captures parsed entries.

## Migration from v4

- Replace `NexloadLogger` and `createGlobalLogger` with `configureLogger` and the `logger` proxy; use object bindings with `child`.
- Replace the removed `@nexload-sdk/logger/log-test` helper with `@nexload-sdk/logger/testing` and `createTestLogger`.
- Custom renderer APIs are removed. Configure `pretty` or `destination` instead.
- Output level labels are lowercase. `LOG_LEVEL` accepts uppercase values during migration.
- Review redaction paths and error handling: log errors under `err` or pass an `Error` first.

## Runtime constraints

Node.js and Bun support request context; Edge and browser do not. On Node, pretty output defaults to enabled outside production and JSON lines in production; an explicit `destination` takes precedence. `SERVICE_NAME` (default `unknown`), `LOG_LEVEL`, and `RELEASE` provide environment fallbacks; `NODE_ENV` controls production defaults.
