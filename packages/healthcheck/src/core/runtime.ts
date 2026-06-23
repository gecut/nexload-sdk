import type {
  RuntimeAdapter,
  RuntimeIdentity,
  RuntimeMemorySnapshot
} from "./types";

type ProcessLike = {
  version?: string
  versions?: Record<string, string | undefined>
  platform?: string
  arch?: string
  pid?: number
  uptime?: () => number
  memoryUsage?: (() => {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers?: number
  }) & { rss?: () => number }
  constrainedMemory?: () => number
  availableMemory?: () => number
};

type BunLike = {
  version?: string
  revision?: string
};

function getProcess (): ProcessLike | undefined {
  return (globalThis as typeof globalThis & { process?: ProcessLike }).process;
}

function getBun (): BunLike | undefined {
  return (globalThis as typeof globalThis & { Bun?: BunLike }).Bun;
}

function now (): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function finitePositive (value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function runtimeInfo (): RuntimeIdentity {
  const bun = getBun();
  const processLike = getProcess();

  if (bun) {
    return {
      name: "bun",
      version: bun.version,
      revision: bun.revision,
      platform: processLike?.platform,
      arch: processLike?.arch,
      pid: processLike?.pid,
    };
  }

  if (processLike?.versions?.node) {
    return {
      name: "node",
      version: processLike.version,
      platform: processLike.platform,
      arch: processLike.arch,
      pid: processLike.pid,
    };
  }

  return { name: "unknown", };
}

function memorySnapshot (): RuntimeMemorySnapshot {
  const processLike = getProcess();
  const memory = processLike?.memoryUsage?.();
  const constrainedBytes = finitePositive(processLike?.constrainedMemory?.());
  const availableBytes = finitePositive(processLike?.availableMemory?.());
  const totalBytes = constrainedBytes;
  const rssBytes = finitePositive(memory?.rss);
  const usedRatio = totalBytes && rssBytes ? rssBytes / totalBytes : null;
  const availableRatio = totalBytes && availableBytes ? availableBytes / totalBytes : null;

  return {
    rssBytes,
    heapTotalBytes: finitePositive(memory?.heapTotal),
    heapUsedBytes: finitePositive(memory?.heapUsed),
    externalBytes: finitePositive(memory?.external),
    arrayBuffersBytes: finitePositive(memory?.arrayBuffers),
    constrainedBytes,
    availableBytes,
    totalBytes,
    usedRatio,
    availableRatio,
    source: totalBytes ? "process" : memory ? "process-memory" : "none",
  };
}

export function genericRuntimeAdapter (): RuntimeAdapter {
  return {
    name: runtimeInfo().name,
    now,
    uptimeSeconds () {
      return finitePositive(getProcess()?.uptime?.()) ?? null;
    },
    getRuntimeInfo: runtimeInfo,
    getMemory: memorySnapshot,
  };
}

export function autoRuntimeAdapter (): RuntimeAdapter {
  return genericRuntimeAdapter();
}
