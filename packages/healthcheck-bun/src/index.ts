import { defineHealthCheck } from "@nexload-sdk/healthcheck";

import type {
  HealthCheckDefinition,
  HealthScope,
  RuntimeAdapter,
  RuntimeMemorySnapshot
} from "@nexload-sdk/healthcheck";

interface BunGlobalShape {
  version?: string
  revision?: string
}

export interface BunServerLike {
  pendingRequests?: number
  pendingWebSockets?: number
  subscriberCount?: (topic: string) => number
}

function getBun (): BunGlobalShape | null {
  return (globalThis as typeof globalThis & { Bun?: BunGlobalShape }).Bun ?? null;
}

function getProcess () {
  return (globalThis as typeof globalThis & { process?: NodeJS.Process }).process;
}

function finitePositive (value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function memorySnapshot (): RuntimeMemorySnapshot {
  const processLike = getProcess();
  const memory = processLike?.memoryUsage?.();

  return {
    rssBytes: finitePositive(memory?.rss),
    heapTotalBytes: finitePositive(memory?.heapTotal),
    heapUsedBytes: finitePositive(memory?.heapUsed),
    externalBytes: finitePositive(memory?.external),
    arrayBuffersBytes: finitePositive(memory?.arrayBuffers),
    constrainedBytes: null,
    availableBytes: null,
    totalBytes: null,
    usedRatio: null,
    availableRatio: null,
    source: memory ? "process" : "none",
  };
}

export function bunRuntimeAdapter (): RuntimeAdapter {
  const bun = getBun();
  const processLike = getProcess();

  return {
    name: "bun",
    now: () => performance.now(),
    uptimeSeconds: () => finitePositive(processLike?.uptime?.()) ?? null,
    getRuntimeInfo: () => ({
      name: "bun",
      version: bun?.version,
      revision: bun?.revision,
      platform: processLike?.platform,
      arch: processLike?.arch,
      pid: processLike?.pid,
    }),
    getMemory: memorySnapshot,
  };
}

export function bunRuntimeInfoCheck (options: { scopes?: readonly HealthScope[] } = {}): HealthCheckDefinition<"bun.runtime"> {
  return defineHealthCheck({
    name: "bun.runtime",
    scopes: options.scopes ?? ["diagnostics"],
    critical: false,
    run (ctx) {
      const info = ctx.runtime.getRuntimeInfo();

      return {
        status: info.name === "bun" ? "ok" : "degraded",
        metrics: { uptimeSeconds: ctx.runtime.uptimeSeconds(), },
        details: { ...info, },
      };
    },
  });
}

export function bunServerMetricsCheck (
  server: BunServerLike, options: { scopes?: readonly HealthScope[] } = {}
): HealthCheckDefinition<"bun.server.metrics"> {
  return defineHealthCheck({
    name: "bun.server.metrics",
    scopes: options.scopes ?? ["diagnostics"],
    critical: false,
    run () {
      return {
        status: "ok",
        metrics: {
          pendingRequests: server.pendingRequests ?? null,
          pendingWebSockets: server.pendingWebSockets ?? null,
        },
      };
    },
  });
}
