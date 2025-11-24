export type LogLevel =
  | "TRACE"
  | "INFO"
  | "SUCCESS"
  | "WARN"
  | "ERROR"
  | "FATAL"
  | "DEBUG";
export type LogRendererFunc = (line: object) => void;
export type LogRenderer = { node: LogRendererFunc; browser: LogRendererFunc };

export const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";
export const isNode = () => typeof process !== "undefined";
export const levelPriorities = {
  FATAL: 70,
  ERROR: 60,
  WARN: 50,
  SUCCESS: 40,
  INFO: 30,
  DEBUG: 20,
  TRACE: 10,
} as const;
