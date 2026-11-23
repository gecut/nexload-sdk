/* eslint-disable turbo/no-undeclared-env-vars -- These fallbacks are read at runtime, after the package build. */

import pino from "pino";

import type { Logger, LoggerOptions, LogLevel } from "./types";

import { getLogContext, isBrowser } from "./context.node";
import { LEVELS } from "./levels";
import { createPrettyStream } from "./pretty";
import { createProxy } from "./proxy";
import { DEFAULT_REDACT_PATHS } from "./redact";
import { serializeError } from "./serialize-error";

type PinoLogger = pino.Logger<"success">;

let configuredLogger: PinoLogger | undefined;
let fallbackLogger: PinoLogger | undefined;
let configuredProxy: Logger | undefined;

function isLogLevel(value: string): value is LogLevel {
  return Object.prototype.hasOwnProperty.call(LEVELS, value);
}

function resolveLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.trim().toLowerCase();

  if (level && isLogLevel(level)) {
    return level;
  }

  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function buildPinoOptions(
  options: Partial<LoggerOptions>,
): pino.LoggerOptions<"success"> {
  return {
    redact: { paths: [...(options.redact?.replaceDefaults ? [] : DEFAULT_REDACT_PATHS), ...(options.redact?.paths ?? [])], censor: options.redact?.censor ?? "[REDACTED]" },
    serializers: { err: serializeError },
    mixin: getLogContext,
    level: options.level ?? resolveLevel(),
    customLevels: { success: LEVELS.success },
    useOnlyCustomLevels: false,
    base: {
      ...options.base,
      service: options.service ?? process.env.SERVICE_NAME ?? "unknown",
      release: options.release ?? process.env.RELEASE,
      instance: options.instance,
      environment: options.environment,
      pid: process.pid,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
  };
}

export function createPinoLogger(options: Partial<LoggerOptions>): PinoLogger {
  const pinoOptions = buildPinoOptions(options);

  if (isBrowser) {
    return pino({
      ...pinoOptions,
      browser: {
        asObject: true,
        serialize: ["err", "!stdSerializers.err"],
        formatters: {
          level: pinoOptions.formatters?.level,
          log: (record) => ({ ...pinoOptions.base, ...record }),
        },
      },
    });
  }

  const destination = options.destination ??
    ((options.pretty ?? process.env.NODE_ENV !== "production")
      ? createPrettyStream((line) => { process.stdout.write(line); })
      : undefined);

  return pino(pinoOptions, destination);
}

export function configureLogger(options: LoggerOptions): Logger {
  if (configuredLogger && !options.force) {
    configuredLogger
      .child({}, { level: "warn" })
      .warn(
        { event: "logger.reconfigure.ignored" },
        "Logger is already configured",
      );

    return (configuredProxy ??= createProxy());
  }

  configuredLogger = createPinoLogger(options);
  fallbackLogger = undefined;

  return (configuredProxy ??= createProxy());
}

export function getActiveLogger(): PinoLogger {
  return configuredLogger ?? (fallbackLogger ??= createPinoLogger({}));
}

export function resetLoggerForTests(): void {
  configuredLogger = undefined;
  fallbackLogger = undefined;
}
