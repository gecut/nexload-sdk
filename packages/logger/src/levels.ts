import type { LogLevel } from "./types";

export const LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  success: 35,
  warn: 40,
  error: 50,
  fatal: 60,
};
