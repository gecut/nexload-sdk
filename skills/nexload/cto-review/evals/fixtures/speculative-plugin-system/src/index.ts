export { TimeoutPluginRegistry, type TimeoutPlugin } from "./registry.js";
export { TimeoutDSLBuilder, createTimeoutPipeline } from "./plugin-dsl.js";

// Public root exports excessive abstraction for aborting an operation
export async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const signal = AbortSignal.timeout(ms);
  return new Promise<T>((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("Timeout")));
    fn().then(resolve, reject);
  });
}
