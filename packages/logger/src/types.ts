export type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "fatal";

export type LogBindings = Record<string, unknown>;

export type LogEntry = {
  level: LogLevel;
  time: string;
  service: string;
  msg?: string;
  [key: string]: unknown;
};

type LogMethod = (objOrMsg?: object | Error | string, msg?: string) => void;

export interface Logger {
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

export interface LoggerOptions {
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
