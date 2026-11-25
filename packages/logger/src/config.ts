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

export type PayloadLoggerConfig = {
  options: ReturnType<typeof buildPinoOptions>;
  destination?: LoggerOptions["destination"];
};

let configured: { logger: PinoLogger; config: PayloadLoggerConfig } | undefined;
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

function buildPinoOptions(options: Partial<LoggerOptions>) {
  return {
    redact: { paths: [...(options.redact?.replaceDefaults ? [] : DEFAULT_REDACT_PATHS), ...(options.redact?.paths ?? [])], censor: options.redact?.censor ?? "[REDACTED]" },
    serializers: { err: serializeError },
    mixin: getLogContext,
    level: options.level ?? resolveLevel(),
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
  } satisfies pino.LoggerOptions;
}

export function createPinoLogger(
  options: Partial<LoggerOptions>,
  sharedOptions = buildPinoOptions(options),
): PinoLogger {
  const pinoOptions = {
    ...sharedOptions,
    customLevels: { success: LEVELS.success },
    useOnlyCustomLevels: false,
  };

  if (isBrowser) {
    return pino({
      ...pinoOptions,
      browser: {
        asObject: true,
        serialize: ["err", "!stdSerializers.err"],
        formatters: {
          level: pinoOptions.formatters.level,
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
  if (configured && !options.force) {
    configured.logger
      .child({}, { level: "warn" })
      .warn(
        { event: "logger.reconfigure.ignored" },
        "Logger is already configured",
      );

    return (configuredProxy ??= createProxy());
  }

  const sharedOptions = buildPinoOptions(options);
  configured = {
    logger: createPinoLogger(options, sharedOptions),
    config: { options: sharedOptions, destination: options.destination },
  };
  fallbackLogger = undefined;

  return (configuredProxy ??= createProxy());
}

export function getActiveLogger(): PinoLogger {
  return configured?.logger ?? (fallbackLogger ??= createPinoLogger({}));
}

export function getPayloadLoggerConfig(): PayloadLoggerConfig {
  const { options, destination } = configured?.config ?? {
    options: buildPinoOptions({}),
  };

  return {
    options: {
      ...options,
      level: options.level === "success" ? "warn" : options.level,
      redact: { ...options.redact, paths: [...options.redact.paths] },
      serializers: { ...options.serializers },
      base: { ...options.base },
      formatters: { ...options.formatters },
    },
    ...(destination === undefined ? {} : { destination }),
  };
}
