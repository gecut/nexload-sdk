import { aggregateStatus, summarizeChecks } from "./aggregate";
import { HEALTH_ERROR_CODES } from "./errors";
import { autoRuntimeAdapter } from "./runtime";
import { createAbortSignal, sleep } from "./timeout";

import type {
  HealthCheckDefinition,
  HealthCheckResult,
  HealthDataProfile,
  HealthManager,
  HealthManagerOptions,
  HealthMetric,
  HealthRunContext,
  HealthRunScope,
  HealthScope,
  MetricCollectorDefinition,
  MetricCollectionResult,
  RuntimeAdapter
} from "./types";

const DEFAULT_TIMEOUT_MS = 1_000;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_PROFILE: HealthDataProfile = "summary";

function isScopeMatch (
  scopes: readonly HealthScope[] | undefined, scope: HealthRunScope
): boolean {
  return scope === "all" || !scopes || scopes.includes(scope);
}

function isCritical (
  check: HealthCheckDefinition, scope: HealthRunScope
): boolean {
  if (typeof check.critical === "boolean") {
    return check.critical;
  }

  if (scope !== "all" && check.critical?.[scope] !== undefined) {
    return check.critical[scope] === true;
  }

  return scope === "readiness" || scope === "startup";
}

function asError (value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function shouldRetry (
  status: string, retryOn?: readonly string[]
): boolean {
  return (retryOn ?? ["unhealthy"]).includes(status);
}

function retryDelay (
  baseDelay: number, attempt: number, backoff: "none" | "linear" | "exponential" | undefined
): number {
  if (backoff === "exponential") {
    return baseDelay * 2 ** Math.max(
      0, attempt - 1
    );
  }

  if (backoff === "linear") {
    return baseDelay * attempt;
  }

  return baseDelay;
}

async function runLimited<T> (
  items: readonly T[], concurrency: number, task: (item: T) => Promise<void>
): Promise<void> {
  let cursor = 0;
  const workers = Array.from(
    {
      length: Math.min(
        concurrency, items.length
      ),
    }, async () => {
      while (cursor < items.length) {
        const item = items[cursor];
        cursor += 1;

        if (item !== undefined) {
          await task(item);
        }
      }
    }
  );

  await Promise.all(workers);
}

export function createHealthManager (options: HealthManagerOptions): HealthManager {
  const checks = new Map<string, HealthCheckDefinition>();
  const collectors = new Map<string, MetricCollectorDefinition>();
  const disposers: Array<() => void> = [];
  const runtime: RuntimeAdapter = options.runtime === "auto" || !options.runtime
    ? autoRuntimeAdapter()
    : options.runtime;
  const defaults = options.defaults ?? {};
  const concurrency = defaults.concurrency ?? DEFAULT_CONCURRENCY;
  let shutdownState: { shuttingDown: boolean, reason?: string } = { shuttingDown: false, };

  for (const check of options.checks ?? []) {
    checks.set(
      check.name, check
    );
  }

  for (const collector of options.collectors ?? []) {
    collectors.set(
      collector.name, collector
    );
  }

  const manager: HealthManager = {
    register (check) {
      checks.set(
        check.name, check
      );
      return manager;
    },
    registerCollector (collector) {
      collectors.set(
        collector.name, collector
      );
      return manager;
    },
    unregister (name) {
      return checks.delete(name) || collectors.delete(name);
    },
    async run (
      scope, runOptions = {}
    ) {
      const observedAt = new Date().toISOString();
      const startedAt = runtime.now();
      const profile = runOptions.profile
        ?? (scope !== "all" ? options.profiles?.[scope] : undefined)
        ?? options.profiles?.default
        ?? defaults.profile
        ?? DEFAULT_PROFILE;
      const selectedChecks = Array.from(checks.values()).filter((check) => isScopeMatch(
        check.scopes, scope
      ));
      const selectedCollectors = Array.from(collectors.values()).filter((collector) => isScopeMatch(
        collector.scopes, scope
      ));
      const results: HealthCheckResult[] = [];
      const metrics: HealthMetric[] = [];
      const resources: Record<string, unknown> = {};

      const makeContext = (signal: AbortSignal): HealthRunContext => ({
        scope,
        signal,
        runtime,
        service: options.service,
        profile,
        now: runtime.now,
        getShutdownState: () => shutdownState,
        result: (result) => result,
      });

      async function runCheck (check: HealthCheckDefinition): Promise<HealthCheckResult> {
        const timeoutMs = check.timeoutMs ?? runOptions.timeoutMs ?? defaults.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        const maxAttempts = Math.max(
          0, check.retries?.attempts ?? 0
        ) + 1;
        let lastResult: HealthCheckResult | undefined;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          const attemptStartedAt = runtime.now();
          const attemptObservedAt = new Date().toISOString();
          const { signal, dispose, } = createAbortSignal(
            timeoutMs, runOptions.signal
          );
          let timedOut = false;

          try {
            const timeoutPromise = new Promise<never>((
              _, reject
            ) => {
              signal.addEventListener(
                "abort", () => {
                  timedOut = signal.reason instanceof DOMException && signal.reason.name === "TimeoutError";
                  reject(signal.reason);
                }, { once: true, }
              );
            });
            const runResult = await Promise.race([
              Promise.resolve(check.run(makeContext(signal))),
              timeoutPromise
            ]);
            const result: HealthCheckResult = {
              name: check.name,
              component: check.component,
              scope,
              status: runResult.status,
              critical: isCritical(
                check, scope
              ),
              observedAt: attemptObservedAt,
              durationMs: runtime.now() - attemptStartedAt,
              timedOut: false,
              attempt,
              metrics: runResult.metrics ?? {},
              details: runResult.details,
              error: runResult.error,
              tags: check.tags,
            };

            lastResult = result;

            if (attempt < maxAttempts && shouldRetry(
              result.status, check.retries?.retryOn
            )) {
              await sleep(
                retryDelay(
                  check.retries?.delayMs ?? 0, attempt, check.retries?.backoff
                ), runOptions.signal
              );
              continue;
            }

            return result;
          } catch (errorValue) {
            const error = asError(errorValue);
            const aborted = runOptions.signal?.aborted === true && !timedOut;
            const includeStack = runOptions.includeStacks ?? defaults.includeStack ?? false;
            lastResult = {
              name: check.name,
              component: check.component,
              scope,
              status: "unhealthy",
              critical: isCritical(
                check, scope
              ),
              observedAt: attemptObservedAt,
              durationMs: runtime.now() - attemptStartedAt,
              timedOut,
              attempt,
              metrics: {},
              error: {
                code: timedOut
                  ? HEALTH_ERROR_CODES.CHECK_TIMEOUT
                  : aborted
                    ? HEALTH_ERROR_CODES.CHECK_ABORTED
                    : HEALTH_ERROR_CODES.CHECK_THROWN,
                message: timedOut
                  ? "Health check timed out."
                  : aborted
                    ? "Health check was aborted."
                    : "Health check threw an error.",
                causeName: error.name,
                causeMessage: error.message,
                stack: includeStack ? error.stack : undefined,
              },
              tags: check.tags,
            };

            if (attempt < maxAttempts) {
              await sleep(
                retryDelay(
                  check.retries?.delayMs ?? 0, attempt, check.retries?.backoff
                ), runOptions.signal
              );
              continue;
            }
          } finally {
            dispose();
          }
        }

        return lastResult as HealthCheckResult;
      }

      await runLimited(
        selectedChecks, concurrency, async (check) => {
          results.push(await runCheck(check));
        }
      );

      await runLimited(
        selectedCollectors, concurrency, async (collector) => {
          const { signal, dispose, } = createAbortSignal(
            collector.timeoutMs ?? defaults.timeoutMs ?? DEFAULT_TIMEOUT_MS, runOptions.signal
          );
          try {
            const collection: MetricCollectionResult = await collector.collect(makeContext(signal));
            metrics.push(...collection.metrics);
            Object.assign(
              resources, collection.resources ?? {}
            );
          } catch {
            metrics.push({
              name: `collector.${collector.name}.up`,
              value: 0,
              unit: "state",
              type: "gauge",
              labels: { collector: collector.name, },
            });
          } finally {
            dispose();
          }
        }
      );

      const summary = summarizeChecks(results);

      return {
        schemaVersion: "2.0",
        service: options.service,
        scope,
        status: aggregateStatus(results),
        observedAt,
        durationMs: runtime.now() - startedAt,
        runtime: runtime.getRuntimeInfo(),
        environment: options.environment,
        summary,
        checks: results.sort((
          a, b
        ) => a.name.localeCompare(b.name)),
        metrics,
        resources: Object.keys(resources).length > 0 ? resources : undefined,
      };
    },
    setShutdownState (
      state, reason
    ) {
      shutdownState = { shuttingDown: state, reason, };
    },
    isShuttingDown () {
      return shutdownState.shuttingDown;
    },
    dispose () {
      for (const dispose of disposers.splice(0)) {
        dispose();
      }
    },
  };

  if (runtime.onShutdown) {
    disposers.push(runtime.onShutdown(
      [
        "SIGTERM",
        "SIGINT"
      ], (signal) => manager.setShutdownState(
        true, signal
      )
    ));
  }

  return manager;
}
