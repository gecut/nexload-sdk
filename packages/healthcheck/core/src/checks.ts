import { defineHealthCheck } from "./core/define";
import { HEALTH_ERROR_CODES } from "./core/errors";
import { sleep } from "./core/timeout";

import type {
  HealthCheckDefinition,
  HealthCheckRunResult,
  HealthMetrics,
  HealthScope,
  HealthStatus
} from "./core/types";

function thresholdStatus (
  value: number | null, degraded: number, unhealthy: number, direction: "above" | "below"
): HealthStatus {
  if (value === null) return "degraded";

  if (direction === "above") {
    if (value >= unhealthy) return "unhealthy";
    if (value >= degraded) return "degraded";
    return "ok";
  }

  if (value <= unhealthy) return "unhealthy";
  if (value <= degraded) return "degraded";
  return "ok";
}

export function runtimeInfoCheck (options: {
  scopes?: readonly HealthScope[]
  critical?: boolean
} = {}): HealthCheckDefinition<"runtime.info"> {
  return defineHealthCheck({
    name: "runtime.info",
    scopes: options.scopes ?? ["diagnostics"],
    critical: options.critical ?? false,
    run (ctx) {
      const info = ctx.runtime.getRuntimeInfo();

      return {
        status: "ok",
        metrics: { uptimeSeconds: ctx.runtime.uptimeSeconds(), },
        details: { ...info, },
      };
    },
  });
}

export function shutdownCheck (options: { scopes?: readonly HealthScope[] } = {}): HealthCheckDefinition<"shutdown"> {
  return defineHealthCheck({
    name: "shutdown",
    scopes: options.scopes ?? [
      "liveness",
      "readiness"
    ],
    critical: true,
    run (ctx) {
      const state = ctx.getShutdownState();

      return {
        status: state.shuttingDown ? "unhealthy" : "ok",
        metrics: { shuttingDown: state.shuttingDown, },
        details: state.reason ? { reason: state.reason, } : undefined,
      };
    },
  });
}

export function startupCheck (options: {
  isStarted: () => boolean | Promise<boolean>
  scopes?: readonly HealthScope[]
  timeoutMs?: number
}): HealthCheckDefinition<"startup"> {
  return defineHealthCheck({
    name: "startup",
    scopes: options.scopes ?? ["startup"],
    critical: true,
    timeoutMs: options.timeoutMs,
    async run () {
      const started = await options.isStarted();

      return {
        status: started ? "ok" : "unhealthy",
        metrics: { started, },
      };
    },
  });
}

export function timerLagCheck (options: {
  scopes?: readonly HealthScope[]
  sampleMs?: number
  thresholds?: { degradedMs: number, unhealthyMs: number }
  critical?: boolean
} = {}): HealthCheckDefinition<"timer.lag"> {
  const sampleMs = options.sampleMs ?? 10;
  const thresholds = options.thresholds ?? { degradedMs: 100, unhealthyMs: 500, };

  return defineHealthCheck({
    name: "timer.lag",
    scopes: options.scopes ?? [
      "liveness",
      "diagnostics"
    ],
    critical: options.critical ?? false,
    async run (ctx): Promise<HealthCheckRunResult> {
      const startedAt = ctx.now();
      await sleep(
        sampleMs, ctx.signal
      );
      const lagMs = Math.max(
        0, ctx.now() - startedAt - sampleMs
      );

      return {
        status: thresholdStatus(
          lagMs, thresholds.degradedMs, thresholds.unhealthyMs, "above"
        ),
        metrics: { lagMs, sampleMs, },
      };
    },
  });
}

export function memoryCheck (options: {
  scopes?: readonly HealthScope[]
  availableRatio?: { degraded: number, unhealthy: number }
  usedRatio?: { degraded: number, unhealthy: number }
  critical?: boolean | Partial<Record<HealthScope, boolean>>
} = {}): HealthCheckDefinition<"memory"> {
  const availableRatio = options.availableRatio ?? { degraded: 0.15, unhealthy: 0.05, };
  const usedRatio = options.usedRatio;

  return defineHealthCheck({
    name: "memory",
    scopes: options.scopes ?? [
      "readiness",
      "diagnostics"
    ],
    critical: options.critical ?? { readiness: true, diagnostics: false, },
    async run (ctx): Promise<HealthCheckRunResult> {
      const snapshot = await ctx.runtime.getMemory?.();

      if (!snapshot) {
        return {
          status: "degraded",
          metrics: {} satisfies HealthMetrics,
          error: {
            code: HEALTH_ERROR_CODES.METRIC_UNAVAILABLE,
            message: "Memory metrics are unavailable.",
          },
        };
      }

      const statusFromAvailable = thresholdStatus(
        snapshot.availableRatio, availableRatio.degraded, availableRatio.unhealthy, "below"
      );
      const statusFromUsed = usedRatio
        ? thresholdStatus(
          snapshot.usedRatio, usedRatio.degraded, usedRatio.unhealthy, "above"
        )
        : "ok";
      const status = statusFromAvailable === "unhealthy" || statusFromUsed === "unhealthy"
        ? "unhealthy"
        : statusFromAvailable === "degraded" || statusFromUsed === "degraded"
          ? "degraded"
          : "ok";

      return {
        status,
        metrics: {
          rssBytes: snapshot.rssBytes,
          heapTotalBytes: snapshot.heapTotalBytes,
          heapUsedBytes: snapshot.heapUsedBytes,
          externalBytes: snapshot.externalBytes,
          arrayBuffersBytes: snapshot.arrayBuffersBytes,
          constrainedBytes: snapshot.constrainedBytes,
          availableBytes: snapshot.availableBytes,
          totalBytes: snapshot.totalBytes,
          usedRatio: snapshot.usedRatio,
          availableRatio: snapshot.availableRatio,
        } satisfies HealthMetrics,
        details: { source: snapshot.source, },
      };
    },
  });
}
