import dns from "node:dns/promises";
import net from "node:net";
import os from "node:os";
import process from "node:process";

import {
  defineHealthCheck,
  defineMetricCollector,
  HEALTH_ERROR_CODES
} from "@nexload-sdk/healthcheck";

import { readContainerResourceSnapshot } from "./cgroup";

import type { ContainerResourceOptions } from "./cgroup";
import type {
  HealthCheckDefinition,
  HealthCheckRunResult,
  HealthMetrics,
  HealthMetric,
  HealthScope,
  RuntimeAdapter,
  RuntimeCpuSnapshot,
  RuntimeMemorySnapshot
} from "@nexload-sdk/healthcheck";

export * from "./cgroup";

function finitePositive (value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

async function nodeMemory (): Promise<RuntimeMemorySnapshot> {
  const memory = process.memoryUsage();
  const container = await readContainerResourceSnapshot();
  const constrainedBytes = finitePositive(process.constrainedMemory?.());
  const availableBytes = finitePositive(process.availableMemory?.());
  const totalBytes = container.memory.limitBytes ?? constrainedBytes ?? os.totalmem();
  const usedBytes = container.memory.currentBytes ?? memory.rss;
  const usedRatio = totalBytes > 0 ? usedBytes / totalBytes : null;
  const availableRatio = totalBytes > 0 && availableBytes !== null ? availableBytes / totalBytes : null;

  return {
    rssBytes: memory.rss,
    heapTotalBytes: memory.heapTotal,
    heapUsedBytes: memory.heapUsed,
    externalBytes: memory.external,
    arrayBuffersBytes: memory.arrayBuffers,
    constrainedBytes,
    availableBytes,
    totalBytes,
    usedRatio,
    availableRatio,
    source: container.memory.source !== "none" ? container.memory.source : "process",
  };
}

export function nodeRuntimeAdapter (): RuntimeAdapter {
  return {
    name: "node",
    now: () => performance.now(),
    uptimeSeconds: () => process.uptime(),
    getRuntimeInfo: () => ({
      name: "node",
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    }),
    getMemory: nodeMemory,
    getCpu (previous?: RuntimeCpuSnapshot): RuntimeCpuSnapshot {
      const usage = process.cpuUsage(previous?.userMicros && previous.systemMicros
        ? { user: previous.userMicros, system: previous.systemMicros, }
        : undefined);

      return {
        userMicros: usage.user,
        systemMicros: usage.system,
        availableParallelism: typeof os.availableParallelism === "function" ? os.availableParallelism() : os.cpus().length,
      };
    },
    onShutdown (
      signals, callback
    ) {
      const handlers = signals.map((signal) => {
        const handler = () => callback(signal);
        process.on(
          signal, handler
        );
        return { signal, handler, };
      });

      return () => {
        for (const { signal, handler, } of handlers) {
          process.off(
            signal, handler
          );
        }
      };
    },
  };
}

export function containerResourceCheck (options: {
  scopes?: readonly HealthScope[]
  memory?: { usageRatio?: { degraded: number, unhealthy: number } }
  root?: string
  critical?: boolean | Partial<Record<HealthScope, boolean>>
} = {}): HealthCheckDefinition<"container.resources"> {
  return defineHealthCheck({
    name: "container.resources",
    scopes: options.scopes ?? ["diagnostics"],
    critical: options.critical ?? false,
    async run (): Promise<HealthCheckRunResult> {
      const snapshot = await readContainerResourceSnapshot({ root: options.root, });
      const usageRatio = snapshot.memory.usageRatio;
      const thresholds = options.memory?.usageRatio;
      const status = thresholds && usageRatio !== null
        ? usageRatio >= thresholds.unhealthy
          ? "unhealthy"
          : usageRatio >= thresholds.degraded
            ? "degraded"
            : "ok"
        : snapshot.confidence === "low"
          ? "degraded"
          : "ok";

      return {
        status,
        metrics: {
          detected: snapshot.detected,
          cgroupVersion: snapshot.cgroupVersion,
          memoryCurrentBytes: snapshot.memory.currentBytes,
          memoryLimitBytes: snapshot.memory.limitBytes,
          memoryUsageRatio: snapshot.memory.usageRatio,
          cpuQuotaCpus: snapshot.cpu.quotaCpus,
          cpuEffectiveCpus: snapshot.cpu.effectiveCpuCount,
          cpuCpusetCpus: snapshot.cpu.cpusetCpus,
        },
        details: { ...snapshot, },
      };
    },
  });
}

export function processMetricsCollector (options: { scopes?: readonly HealthScope[] } = {}) {
  return defineMetricCollector({
    name: "process.metrics",
    scopes: options.scopes ?? ["diagnostics"],
    collect () {
      const memory = process.memoryUsage();
      const usage = process.cpuUsage();
      const resource = process.resourceUsage();
      const metrics: HealthMetric[] = [
        { name: "process.pid", value: process.pid, type: "gauge", },
        { name: "process.memory.rss_bytes", value: memory.rss, unit: "bytes", type: "gauge", },
        { name: "process.memory.heap_total_bytes", value: memory.heapTotal, unit: "bytes", type: "gauge", },
        { name: "process.memory.heap_used_bytes", value: memory.heapUsed, unit: "bytes", type: "gauge", },
        { name: "process.cpu.user_seconds_total", value: usage.user / 1_000_000, unit: "seconds", type: "counter", },
        { name: "process.cpu.system_seconds_total", value: usage.system / 1_000_000, unit: "seconds", type: "counter", },
        { name: "process.resource.max_rss_bytes", value: resource.maxRSS * 1024, unit: "bytes", type: "gauge", },
        { name: "process.resource.fs_read_total", value: resource.fsRead, unit: "count", type: "counter", },
        { name: "process.resource.fs_write_total", value: resource.fsWrite, unit: "count", type: "counter", }
      ];

      return { metrics, };
    },
  });
}

export function containerMetricsCollector (options: ContainerResourceOptions & { scopes?: readonly HealthScope[] } = {}) {
  return defineMetricCollector({
    name: "container.metrics",
    scopes: options.scopes ?? ["diagnostics"],
    async collect () {
      const snapshot = await readContainerResourceSnapshot(options);

      return {
        metrics: [
          { name: "container.detected", value: snapshot.detected, type: "gauge", },
          { name: "container.cgroup.version", value: snapshot.cgroupVersion, type: "gauge", },
          { name: "container.memory.current_bytes", value: snapshot.memory.currentBytes, unit: "bytes", type: "gauge", },
          { name: "container.memory.limit_bytes", value: snapshot.memory.limitBytes, unit: "bytes", type: "gauge", },
          { name: "container.memory.usage_ratio", value: snapshot.memory.usageRatio, unit: "ratio", type: "gauge", },
          { name: "container.cpu.quota_cpus", value: snapshot.cpu.quotaCpus, unit: "count", type: "gauge", },
          { name: "container.cpu.effective_cpus", value: snapshot.cpu.effectiveCpuCount, unit: "count", type: "gauge", },
          { name: "container.cpu.cpuset_cpus", value: snapshot.cpu.cpusetCpus, unit: "count", type: "gauge", }
        ],
        resources: { container: snapshot, },
      };
    },
  });
}

export function tcpCheck (
  name: string, options: {
    host: string
    port: number
    scopes?: readonly HealthScope[]
    timeoutMs?: number
  }
): HealthCheckDefinition<string> {
  return defineHealthCheck({
    name,
    component: "tcp",
    scopes: options.scopes ?? ["readiness"],
    critical: { readiness: true, diagnostics: false, },
    timeoutMs: options.timeoutMs,
    run (ctx) {
      const startedAt = ctx.now();

      return new Promise((resolve) => {
        const socket = net.createConnection({ host: options.host, port: options.port, });
        const finish = (
          status: "ok" | "unhealthy", error?: Error
        ) => {
          socket.destroy();
          resolve({
            status,
            metrics: {
              latencyMs: ctx.now() - startedAt,
              up: status === "ok",
            },
            error: error
              ? {
                code: HEALTH_ERROR_CODES.TCP_CONNECT_FAILED,
                message: "TCP connection failed.",
                causeName: error.name,
                causeMessage: error.message,
              }
              : undefined,
          });
        };

        socket.once(
          "connect", () => finish("ok")
        );
        socket.once(
          "error", (error) => finish(
            "unhealthy", error
          )
        );
        ctx.signal.addEventListener(
          "abort", () => finish(
            "unhealthy", new Error("TCP check aborted.")
          ), { once: true, }
        );
      });
    },
  });
}

export function dnsCheck (
  name: string, options: {
    hostname: string
    recordType?: "A" | "AAAA" | "CNAME" | "TXT" | "MX"
    scopes?: readonly HealthScope[]
    timeoutMs?: number
  }
): HealthCheckDefinition<string> {
  return defineHealthCheck({
    name,
    component: "dns",
    scopes: options.scopes ?? ["readiness"],
    critical: { readiness: true, diagnostics: false, },
    timeoutMs: options.timeoutMs,
    async run (): Promise<HealthCheckRunResult> {
      try {
        const startedAt = performance.now();
        const recordType = options.recordType ?? "A";
        const records = await dns.resolve(
          options.hostname, recordType
        );
        const recordCount = Array.isArray(records) ? records.length : 1;

        return {
          status: recordCount > 0 ? "ok" : "unhealthy",
          metrics: {
            latencyMs: performance.now() - startedAt,
            records: recordCount,
          } satisfies HealthMetrics,
        };
      } catch (errorValue) {
        const error = errorValue instanceof Error ? errorValue : new Error(String(errorValue));

        return {
          status: "unhealthy",
          metrics: { latencyMs: null, records: 0, } satisfies HealthMetrics,
          error: {
            code: HEALTH_ERROR_CODES.DNS_RESOLVE_FAILED,
            message: "DNS resolution failed.",
            causeName: error.name,
            causeMessage: error.message,
          },
        };
      }
    },
  });
}
