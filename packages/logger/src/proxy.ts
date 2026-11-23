import type { LogBindings, Logger, LogLevel } from "./types";

import { getActiveLogger } from "./config";

export function createProxy(bindings?: LogBindings): Logger {
  let root: ReturnType<typeof getActiveLogger> | undefined;
  let child: ReturnType<typeof getActiveLogger> | undefined;

  function resolve() {
    const active = getActiveLogger();

    if (!bindings) {
      return active;
    }

    if (!child || root !== active) {
      child = active.child(bindings);
      root = active;
    }

    return child;
  }

  function forward(level: LogLevel): Logger[LogLevel] {
    return (objOrMsg, msg) => {
      const active = resolve();
      active[level](objOrMsg instanceof Error ? { err: objOrMsg } : objOrMsg, msg);
    };
  }

  return {
    trace: forward("trace"),
    debug: forward("debug"),
    info: forward("info"),
    success: forward("success"),
    warn: forward("warn"),
    error: forward("error"),
    fatal: forward("fatal"),
    child: (additionalBindings) =>
      createProxy({ ...bindings, ...additionalBindings }),
    isLevelEnabled: (level) => resolve().isLevelEnabled(level),
  };
}
