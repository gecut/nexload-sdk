import { logger } from "./base";

/**
 * Represents a value that may be a Promise or not.
 */
type MaybePromise<T> = T | Promise<T>;

/**
 * Operation type definitions
 */
type LoggerRenderType = { type: "render" };
type LoggerGetDataType = { type: "get-data"; functionName?: string };

export type LoggerOptions = { route: string } & (
  | LoggerRenderType
  | LoggerGetDataType
);
export type LoggerTimingShotFunction = (name: string) => void;

const getLogOptions = (baseLog: Record<string, unknown>, duration: string) => {
  if ("timing" in baseLog) {
    const timing = baseLog.timing as Record<string, number>;

    return {
      ...baseLog,
      timing: {
        ...Object.fromEntries(
          Object.entries(timing).map(([key, value]) => [
            key,
            value.toFixed(2) + "ms",
          ])
        ),
        total:
          Object.values(timing)
            .reduce((acc, value) => acc + value, 0)
            .toFixed(2) + "ms",
      },
    };
  }

  return { ...baseLog, duration };
};

/**
 * Structured performance-aware logger wrapper.
 * Supports both sync and async functions (MaybePromise).
 */
export async function withLogger<T>(
  options: LoggerOptions,
  fn: (timingShot: LoggerTimingShotFunction) => MaybePromise<T>
): Promise<T> {
  let start = performance.now();
  const operationName =
    options.type === "render" ? "Rendering" : "Getting data";

  const baseLog: Record<string, unknown> = {
    route: options.route,
    ...(options.type === "get-data" && options.functionName
      ? { functionName: options.functionName }
      : {}),
  };

  logger.debug(baseLog, `${operationName} start`);

  const timingShot: LoggerTimingShotFunction = (name) => {
    const duration = performance.now() - start;
    start = performance.now();

    baseLog.timing ??= {};
    (baseLog.timing as Record<string, number>)[String(name)] = duration;
  };

  try {
    // Handle both sync and async results safely
    const result = await Promise.resolve(fn(timingShot));
    const duration = performance.now() - start;

    logger.debug(
      getLogOptions(baseLog, `${duration.toFixed(2)}ms`),
      `${operationName} completed`
    );

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logger.error(
      getLogOptions(baseLog, `${duration.toFixed(2)}ms`),
      `${operationName} failed`,
      error
    );

    throw error;
  }
}
