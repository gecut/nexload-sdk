# API contract

## Public signatures

```ts
type LogLevel = "trace" | "debug" | "info" | "success" | "warn" | "error" | "fatal";
type LogBindings = Record<string, unknown>;
type LogEntry = { level: LogLevel; time: string; service: string; msg?: string; [key: string]: unknown };
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
interface LoggerOptions {
  service: string; level?: LogLevel; release?: string; instance?: string; environment?: string;
  redact?: { paths?: string[]; replaceDefaults?: boolean; censor?: string };
  pretty?: boolean;                // default: NODE_ENV !== "production"
  destination?: { write(line: string): void };
  base?: Record<string, string | number | boolean>;
  force?: boolean;
}
export const logger: Logger;           // also default export
export function configureLogger(options: LoggerOptions): Logger;
export function withLogContext<T>(bindings: LogBindings, fn: () => T): T;
export function getLogContext(): LogBindings;
export const TRACE_HEADER: "x-trace-id";
export function resolveTraceId(headers: Headers | Record<string, string | undefined>): string;
export function traceHeaders(): Record<string, string>;
export const DEFAULT_REDACT_PATHS: readonly string[];
// @nexload-sdk/logger/testing
export function createTestLogger(options?: Partial<LoggerOptions>): { logger: Logger; entries: LogEntry[]; clear(): void };
```

Import from `@nexload-sdk/logger` for the shared logger, configuration, and context helpers. Import `createTestLogger` from `@nexload-sdk/logger/testing` to capture entries in tests.

Node defaults to pretty output outside production; an explicit destination takes precedence. Browser, edge-light, and worker select the browser bundle, where server pretty and destination settings do not apply and context is pass-through. The testing subpath uses Node bundles. Default redaction covers sensitive keys at the top level and one level below, plus explicit header and body paths; deeper keys require explicit paths. The default censor is `[REDACTED]`.
