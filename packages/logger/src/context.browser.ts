import type { LogBindings } from "./types";

export const isBrowser = true;

// esbuild injects this for shared code that reads the runtime environment.
const runtime: { process?: typeof globalThis.process } = globalThis;
export const browserProcess = runtime.process ?? { env: {} };

export function withLogContext<T>(_bindings: LogBindings, fn: () => T): T {
  return fn();
}

export function getLogContext(): LogBindings {
  return {};
}

export function newTraceId(): string {
  return globalThis.crypto.randomUUID();
}
