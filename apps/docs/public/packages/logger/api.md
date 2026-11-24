# API Reference & Compatibility

Public logger v5 signatures, examples, and runtime compatibility.

**Topic:** api
**Package:** `@nexload-sdk/logger` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/logger/api/
The inventory below is generated from the source entry points. The reference that follows describes the v5 contract.

## Functions

### `configureLogger`

```ts
configureLogger(options: LoggerOptions) => Logger
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/config.ts#L90)

### `createTestLogger`

```ts
createTestLogger(options?: Partial<LoggerOptions>) => { logger: Logger; entries: LogEntry[]; clear(): void; }
```

**Exported from:** `@nexload-sdk/logger/testing`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/testing.ts#L5)

### `getLogContext`

```ts
getLogContext() => LogBindings
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/context.node.ts#L19)

### `getPayloadLoggerConfig`

```ts
getPayloadLoggerConfig() => PayloadLoggerConfig
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/config.ts#L116)

### `resolveTraceId`

```ts
resolveTraceId(headers: Headers | HeaderRecord) => string
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/trace.ts#L12)

### `traceHeaders`

```ts
traceHeaders() => Record<string, string>
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/trace.ts#L18)

### `withLogContext`

```ts
withLogContext<T>(bindings: LogBindings, fn: () => T) => T
```

**Exported from:** `@nexload-sdk/logger`

Public function exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/context.node.ts#L15)

## Constants

### `DEFAULT_REDACT_PATHS`

```ts
DEFAULT_REDACT_PATHS: readonly string[]
```

**Exported from:** `@nexload-sdk/logger`

Public constant exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/redact.ts#L3)

### `TRACE_HEADER`

```ts
TRACE_HEADER: "x-trace-id"
```

**Exported from:** `@nexload-sdk/logger`

Public constant exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/trace.ts#L3)

### `logger`

```ts
logger: Logger
```

**Exported from:** `@nexload-sdk/logger`

Public constant exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/index.ts#L17)

## Interfaces

### `Logger`

```ts
interface Logger {
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  success: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
  child(bindings: LogBindings): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}
```

**Exported from:** `@nexload-sdk/logger`

Public interface exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/types.ts#L22)

### `LoggerOptions`

```ts
interface LoggerOptions {
  service: string;
  level?: LogLevel;
  release?: string;
  instance?: string;
  environment?: string;
  redact?: { paths?: string[]; replaceDefaults?: boolean; censor?: string };
  pretty?: boolean;
  destination?: { write(line: string): void };
  base?: Record<string, string | number | boolean>;
  force?: boolean;
}
```

**Exported from:** `@nexload-sdk/logger`

Public interface exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/types.ts#L34)

## Types

### `LogBindings`

```ts
type LogBindings = Record<string, unknown>;
```

**Exported from:** `@nexload-sdk/logger`

Public type exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/types.ts#L10)

### `LogEntry`

```ts
type LogEntry = {
  level: LogLevel;
  time: string;
  service: string;
  msg?: string;
  [key: string]: unknown;
};
```

**Exported from:** `@nexload-sdk/logger`

Public type exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/types.ts#L12)

### `LogLevel`

```ts
type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "fatal";
```

**Exported from:** `@nexload-sdk/logger`

Public type exported by @nexload-sdk/logger.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/types.ts#L1)

***

## Exported API Summary

Import the following from `@nexload-sdk/logger`. The testing helper has its own subpath.

| Export | Signature | Example and behavior |
|---|---|---|
| `logger` | `const logger: Logger` | `import { logger } from "@nexload-sdk/logger"`. The lazy proxy resolves the current configuration on each call. |
| Default export | `export default logger` | `import logger from "@nexload-sdk/logger"`. The default and named exports share the same proxy. |
| `getPayloadLoggerConfig` | `getPayloadLoggerConfig(): { options: pino.LoggerOptions; destination?: { write(line: string): void } }` | Node.js Payload configuration bridge. Call `configureLogger()` before `buildConfig()`; rebuild Payload configuration after forced reconfiguration. |
| `configureLogger` | `configureLogger(options: LoggerOptions): Logger` | `configureLogger({ service: "shop-api" })` configures the runtime. |
| `withLogContext` | `withLogContext<T>(bindings: LogBindings, fn: () => T): T` | `withLogContext({ requestId: "req-123" }, handleRequest)` runs the handler with request bindings where async context is supported. |
| `getLogContext` | `getLogContext(): LogBindings` | `const { requestId } = getLogContext()` reads the current bindings. |
| `TRACE_HEADER` | `const TRACE_HEADER: "x-trace-id"` | `response.headers.set(TRACE_HEADER, traceId)` sends the trace ID in the response. |
| `resolveTraceId` | `resolveTraceId(headers: Headers \| Record<string, string \| undefined>): string` | `resolveTraceId(request.headers)` reuses an incoming ID matching `/^[A-Za-z0-9-]{8,64}$/` or generates a UUID. |
| `traceHeaders` | `traceHeaders(): Record<string, string>` | `const outbound = new Headers(traceHeaders())` copies the active trace header. With no active trace ID it returns an empty record. |
| `DEFAULT_REDACT_PATHS` | `const DEFAULT_REDACT_PATHS: readonly string[]` | `const paths = [...DEFAULT_REDACT_PATHS, "customer.nationalCode"]` copies the defaults for inspection or reuse. |

### Public Types

| Type | Signature | Example |
|---|---|---|
| `LogLevel` | `"trace" \| "debug" \| "info" \| "success" \| "warn" \| "error" \| "fatal"` | `const level: LogLevel = "warn"` |
| `LogBindings` | `Record<string, unknown>` | `const bindings: LogBindings = { module: "orders" }` |
| `Logger` | See methods below. | `const log: Logger = logger.child({ module: "orders" })` |
| `LoggerOptions` | See configuration signature below. | `const options: LoggerOptions = { service: "shop-api", level: "info" }` |
| `LogEntry` | `{ level: LogLevel; time: string; service: string; msg?: string; [key: string]: unknown }` | `const first: LogEntry \| undefined = entries[0]` |

All level methods use the same signature.

```ts
interface Logger {
  trace(objOrMsg?: object | Error | string, msg?: string): void;
  debug(objOrMsg?: object | Error | string, msg?: string): void;
  info(objOrMsg?: object | Error | string, msg?: string): void;
  success(objOrMsg?: object | Error | string, msg?: string): void;
  warn(objOrMsg?: object | Error | string, msg?: string): void;
  error(objOrMsg?: object | Error | string, msg?: string): void;
  fatal(objOrMsg?: object | Error | string, msg?: string): void;
  child(bindings: LogBindings): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}
```

`log.isLevelEnabled("debug")` checks whether debug events will be emitted. Levels map to `trace: 10`, `debug: 20`, `info: 30`, `success: 35`, `warn: 40`, `error: 50`, and `fatal: 60`.

```ts
interface LoggerOptions {
  service: string;
  level?: LogLevel;
  release?: string;
  instance?: string;
  environment?: string;
  redact?: { paths?: string[]; replaceDefaults?: boolean; censor?: string };
  pretty?: boolean;
  destination?: { write(line: string): void };
  base?: Record<string, string | number | boolean>;
  force?: boolean;
}
```

On Node, pretty output defaults to enabled outside production; `destination` takes precedence. Browser and Edge use pino browser output and ignore these server stream options. Server log records include `service`, `pid`, and ISO `time`, plus configured `release`, `instance`, and `environment` fields.

### Testing Subpath

```ts
function createTestLogger(options?: Partial<LoggerOptions>): {
  logger: Logger;
  entries: LogEntry[];
  clear(): void;
};
```

```ts
import { createTestLogger } from "@nexload-sdk/logger/testing";

const { logger, entries, clear } = createTestLogger({ service: "test", level: "info" });
logger.success({ event: "order.lifecycle.placed", orderId: "123" }, "Order placed");

const event = entries[0]?.event;
clear();
```

The test logger captures parsed entries independently of global configuration. `clear()` empties the existing entries array.

***

Root export conditions `browser`, `edge-light`, and `worker` select the browser bundle; `import` and `require` select Node bundles. The `./testing` subpath provides Node import and require bundles.

Default redaction covers the ten sensitive keys listed in the [guide](../guides/) at the top level and one level below, plus the explicit header and body paths. It does not recursively redact deeper keys. The censor defaults to `[REDACTED]`. Error serialization includes type, a 500-character message, a matching uppercase code, at most two nested causes, and a stack outside production.

## Runtime Compatibility Matrix

| Runtime | Logging | Request context |
|---|---|---|
| Node.js and Bun | Server output with configurable destination | Async request bindings |
| Edge and browser | Same root API | Explicit bindings and trace headers |
