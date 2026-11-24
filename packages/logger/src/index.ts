import type { Logger } from "./types";

import { createProxy } from "./proxy";

export { configureLogger, getPayloadLoggerConfig } from "./config";
export { getLogContext, withLogContext } from "./context.node";
export { DEFAULT_REDACT_PATHS } from "./redact";
export { resolveTraceId, TRACE_HEADER, traceHeaders } from "./trace";
export type {
  LogBindings,
  LogEntry,
  Logger,
  LoggerOptions,
  LogLevel,
} from "./types";

export const logger: Logger = createProxy();
export default logger;
