# @nexload-sdk/logger

**Configure-once structured logging for Node.js, Bun, Edge, and browsers, built on Pino.**

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/logger)](https://www.npmjs.com/package/@nexload-sdk/logger)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node | Bun | Edge | Browser](https://img.shields.io/badge/runtime-Node%20%7C%20Bun%20%7C%20Edge%20%7C%20Browser-lightgrey.svg)

> [!IMPORTANT]
> Version 5.0.0 is pending in `.changeset/`: log levels in structured output are lowercase (`LOG_LEVEL` accepts uppercase), `NexloadLogger`, custom renderers, and `./log-test` are removed, and `getPayloadLoggerConfig()` (with `PayloadLoggerConfig`) is added to bridge SDK options into Payload's logger.

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Migration](#migration)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/logger` provides a single configure-once structured logger built on `pino` for server and client runtimes. It solves duplicated logger setup, inconsistent redaction, and broken `Error` serialization across Next.js, Node.js, Bun, and Payload CMS services. It is for application and package authors who want safe defaults, request-scoped context on Node/Bun, and isolated test capture.

What it is not:

- Not a log shipping agent or external transport collector (no Datadog, Loki, or OpenTelemetry transport built in).
- Not a distributed tracing SDK; it only propagates an `x-trace-id` header and AsyncLocalStorage bindings.
- Not an arbitrary-depth object scrubber; default redaction stops one level below the top-level log object.

## Philosophy

- **Configure once at startup:** A lazy proxy lets modules import `logger` at load time while binding to the runtime configuration set once by `configureLogger()`.
- **Safe defaults by default:** Sensitive keys (`password`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `otp`, `phone`, `mobile`, `merchant`), `Error` serialization, and ISO timestamps are enabled without boilerplate.
- **Identifiers over payloads:** Context propagation and child bindings carry `requestId`, `traceId`, and entity IDs rather than full request bodies or credentials.
- **Explicit runtime boundaries:** Conditional exports route `browser`, `edge-light`, and `worker` to a browser-safe build while keeping Node `AsyncLocalStorage` isolated on the server.

## Install

```bash
pnpm add @nexload-sdk/logger
# or
npm install @nexload-sdk/logger
# or
yarn add @nexload-sdk/logger
# or
bun add @nexload-sdk/logger
```

This package has no required or optional peer dependencies (`pino` is a direct dependency).

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies |

## Quick start

Configure logging once at your service entry point, then import the `logger` proxy anywhere:

```ts
import { configureLogger, logger } from "@nexload-sdk/logger";

configureLogger({ service: "shop-api", release: process.env.RELEASE });

const log = logger.child({ module: "orders" });
log.info({ event: "order.lifecycle.created", orderId: "123" }, "Order created");
```

## Usage

Before configuration, the lazy logger uses environment defaults; children follow later configuration, including forced replacements. The `SERVICE_NAME` / `"unknown"` fallback applies to the unconfigured lazy logger and `createTestLogger`. Base output includes `service`, optional release, instance and environment, `pid`, and ISO `time`.

### Next.js instrumentation

Register the logger in `instrumentation.ts` before handling requests:

```ts
export async function register() {
  const { configureLogger } = await import("@nexload-sdk/logger");
  configureLogger({ service: "shop-web", release: process.env.RELEASE });
}
```

### Payload CMS logger bridge

Call `configureLogger()` before `buildConfig()`, then pass `getPayloadLoggerConfig()` to `config.logger`:

```ts
import { configureLogger, getPayloadLoggerConfig } from "@nexload-sdk/logger";
import { buildConfig } from "payload";

configureLogger({ service: "cms" });

export default buildConfig({
  logger: getPayloadLoggerConfig(),
});
```

Payload creates its own Pino logger using the SDK's redaction, error serializer, request context mixin, base fields, ISO timestamps, level, and explicit `destination`.

### Log levels

| Level | Value | Use |
| --- | ---: | --- |
| `trace` | 10 | Very verbose diagnostics |
| `debug` | 20 | Diagnostics |
| `info` | 30 | Lifecycle and request summaries |
| `success` | 35 | Business milestones |
| `warn` | 40 | Handled degradation or retry |
| `error` | 50 | Unexpected failure needing attention |
| `fatal` | 60 | Process cannot continue |

Structured JSON uses lowercase level labels; the Node pretty stream displays them in uppercase.

Level methods accept an object, an `Error`, or a string message, followed by an optional message. Use `isLevelEnabled(level)` to guard expensive log construction.

### Redaction

By default, `DEFAULT_REDACT_PATHS` redacts `password`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `otp`, `phone`, `mobile`, and `merchant` at the top level and one level below it, plus `req.headers.authorization`, `req.headers.cookie`, `headers.authorization`, `headers.cookie`, `body`, and `req.body`, using `[REDACTED]` as the censor.

```ts
import { configureLogger } from "@nexload-sdk/logger";

configureLogger({
  service: "shop-api",
  redact: { paths: ["customer.nationalCode"] },
});
```

Set `replaceDefaults: true` to replace `DEFAULT_REDACT_PATHS`, or `censor` to change the replacement string.

### Error serialization

Pass an `Error` under `err` or as the first argument:

```ts
import { logger } from "@nexload-sdk/logger";

try {
  await performOperation();
} catch (err) {
  logger.error({ err, event: "order.operation.failed" }, "Operation failed");
}

logger.error(new Error("Operation failed"));
```

The `err` serializer records the error type, a message capped at 500 characters, a `code` matching `/^[A-Z][A-Z0-9_]{1,99}$/`, and up to two nested causes (three error records total). Stack traces appear only outside production. Non-`Error` values become `{ type, message }`, using `typeof` and the string value capped at 500 characters.

### Request context and trace IDs

On Node.js and Bun, `withLogContext` preserves bindings across async calls; nested calls merge with inner bindings taking precedence:

```ts
import {
  logger,
  resolveTraceId,
  traceHeaders,
  withLogContext,
} from "@nexload-sdk/logger";

export async function GET(req: Request) {
  const traceId = resolveTraceId(req.headers);
  return withLogContext({ requestId: traceId, traceId }, async () => {
    logger.info({ event: "request.lifecycle.started" }, "Request started");
    return fetch("https://example.com/api", { headers: traceHeaders() });
  });
}
```

### Testing with `@nexload-sdk/logger/testing`

Use `createTestLogger` to capture parsed JSON log entries in isolation from the global logger:

```ts
import { createTestLogger } from "@nexload-sdk/logger/testing";

const { logger, entries, clear } = createTestLogger({ service: "test" });
logger.info({ orderId: "123" }, "Created");
// entries[0] -> { level: "info", service: "test", orderId: "123", msg: "Created", ... }
clear();
```

## API

### Root entry (`@nexload-sdk/logger`)

| Export | Kind | Summary |
| --- | --- | --- |
| `logger` | `const` | Lazy `Logger` proxy (also exported as `default`) |
| `configureLogger` | `function` | Configures the global logger once and returns the proxy |
| `getPayloadLoggerConfig` | `function` | Returns `PayloadLoggerConfig` for Payload's `config.logger` |
| `withLogContext` | `function` | Runs a callback with `AsyncLocalStorage` bindings (pass-through on Edge/browser) |
| `getLogContext` | `function` | Returns current context bindings (`{}` on Edge/browser) |
| `DEFAULT_REDACT_PATHS` | `const` | Default Pino redaction paths |
| `TRACE_HEADER` | `const` | Trace header name (`"x-trace-id"`) |
| `resolveTraceId` | `function` | Reuses a valid `x-trace-id` (8–64 characters of `[A-Za-z0-9-]`) from `Headers` or a string record; otherwise generates a UUID |
| `traceHeaders` | `function` | Returns `{ "x-trace-id": traceId }` when active, otherwise `{}` |
| `PayloadLoggerConfig` | `type` | Return shape of `getPayloadLoggerConfig()` |
| `Logger` | `type` | Logger interface (`trace`..`fatal`, `child`, `isLevelEnabled`) |
| `LoggerOptions` | `type` | Configuration options accepted by `configureLogger` |
| `LogLevel` | `type` | Union of supported level names |
| `LogBindings` | `type` | Record of structured context bindings |
| `LogEntry` | `type` | Parsed JSON log record shape |

### Testing subpath (`@nexload-sdk/logger/testing`)

| Export | Kind | Summary |
| --- | --- | --- |
| `createTestLogger` | `function` | Creates an isolated `{ logger, entries, clear }` test harness |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `service` | `string` | Required | Service name included in `base` fields |
| `level` | `LogLevel` | `LOG_LEVEL`, else `"info"` (prod) / `"debug"` | Minimum log threshold |
| `release` | `string` | `process.env.RELEASE` | Optional release identifier |
| `instance` | `string` | `undefined` | Optional instance identifier |
| `environment` | `string` | `undefined` | Optional environment label |
| `redact` | `{ paths?: string[]; replaceDefaults?: boolean; censor?: string }` | `DEFAULT_REDACT_PATHS`, `"[REDACTED]"` | Redaction paths and replacement censor |
| `pretty` | `boolean` | `NODE_ENV !== "production"` | Enables pretty output on Node when no `destination` is set |
| `destination` | `{ write(line: string): void }` | `undefined` | Custom output stream; overrides `pretty` |
| `base` | `Record<string, string \| number \| boolean>` | `undefined` | Extra base fields merged into every record |
| `force` | `boolean` | `false` | Replaces an existing configuration when `true` |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`) via conditional `exports`.
- **Node.js and Bun:** Full support, including `AsyncLocalStorage` request context, pretty stream, and `destination`.
- **Edge and Browser:** Selected automatically via `browser`, `edge-light`, and `worker` export conditions. Uses Pino browser object output; `pretty` and `destination` do not configure a server stream, `withLogContext` is pass-through, and `getLogContext()` returns `{}`.
- **Testing subpath (`./testing`):** Node ESM and CJS only.
- **Environment fallbacks:** Reads `SERVICE_NAME`, `LOG_LEVEL` (case-insensitive), `RELEASE`, and `NODE_ENV`.

## Caveats

> [!WARNING]
> Default redaction only matches keys at the top level and one level deep. A nested key two levels deep, such as `user.profile.phone`, is **not** redacted unless you add an explicit path.

> [!WARNING]
> Calling `configureLogger()` a second time without `force: true` logs a warning (`event: "logger.reconfigure.ignored"`) and returns the existing proxy. With `getPayloadLoggerConfig()`, you must rebuild Payload's config to pick up a forced reconfiguration.

> [!NOTE]
> `getPayloadLoggerConfig()` maps the SDK's `success` threshold (`35`) to `warn` (`40`)—the next standard Pino level—because Payload's logger uses standard Pino levels. Without an explicit `destination`, Payload writes JSON to its default stream.

## Migration

### From v4 to v5

- Replace `NexloadLogger` and `createGlobalLogger` with `configureLogger` and the `logger` proxy; pass object bindings to `child()`.
- Replace the removed `@nexload-sdk/logger/log-test` subpath with `createTestLogger` from `@nexload-sdk/logger/testing`.
- Remove custom renderer APIs; use `pretty` or `destination` instead.
- Expect lowercase level labels in structured JSON output (`LOG_LEVEL` still accepts uppercase values).
- Pass errors under `err` or as the first argument to log methods.

## Related packages

- [payload-hooks](../payload-hooks/README.md) — Payload collection audit logging built on `@nexload-sdk/logger`
- [payload-preset](../payload-preset/README.md) — Composed Payload preset that bridges `@nexload-sdk/logger` into `config.logger`

## License

MIT
