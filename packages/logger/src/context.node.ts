import { AsyncLocalStorage } from "node:async_hooks";

import type { LogBindings } from "./types";

export { randomUUID as newTraceId } from "node:crypto";
export const isBrowser: boolean = false;

// Share context across the independently bundled root and testing entries.
const contextKey = Symbol.for("@nexload-sdk/logger/context");
const runtime = globalThis as typeof globalThis & {
  [contextKey]?: AsyncLocalStorage<LogBindings>;
};
const context = (runtime[contextKey] ??= new AsyncLocalStorage<LogBindings>());

export function withLogContext<T>(bindings: LogBindings, fn: () => T): T {
  return context.run({ ...context.getStore(), ...bindings }, fn);
}

export function getLogContext(): LogBindings {
  // Pino mutates the mixin result when merging per-call fields.
  return { ...context.getStore() };
}
