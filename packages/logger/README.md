# @nexload-sdk/logger

Small structured logger for Node.js and browser environments with pluggable renderers.

## Install

```bash
pnpm add @nexload-sdk/logger
```

## Exports

- default export: global logger instance
- `NexloadLogger`
- logger types (`LogLevel`, renderer types, helpers)
- `test` helper from `@nexload-sdk/logger/log-test`

## Quick Start

```ts
import logger from "@nexload-sdk/logger";

logger.info({ service: "api" }, "Service started");
logger.warn({ userId: "u1" }, "Potential issue");
logger.error({ error: "Boom" }, "Request failed");
```

## Child Logger

```ts
const httpLogger = logger.child({ module: "http" });
httpLogger.debug({ route: "/health" }, "Incoming request");
```

## API

### `NexloadLogger`

Methods (all object-first):

- `trace(obj, msg?)`
- `debug(obj, msg?)`
- `info(obj, msg?)`
- `success(obj, msg?)`
- `warn(obj, msg?)`
- `error(obj, msg?)`
- `fatal(obj, msg?)`
- `child(obj)`

## Environment Variables (global logger)

The default logger instance reads from env/localStorage depending on runtime:

- `SERVICE_NAME` (or `$SERVICE_NAME` in browser localStorage)
- `LOG_LEVEL` (or `$LOG_LEVEL`)
- `NODE_ENV`
- `DEBUG`

Production mode uses compact renderers; non-production uses pretty renderers.

## Runtime Notes

- Works in Node.js and browsers.
- This is a custom logger implementation (not `pino`).
