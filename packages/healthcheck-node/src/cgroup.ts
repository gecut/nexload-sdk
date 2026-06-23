import { readFile } from "node:fs/promises";
import os from "node:os";

export interface ContainerMemorySnapshot {
  currentBytes: number | null
  limitBytes: number | null
  highBytes: number | null
  swapCurrentBytes: number | null
  swapLimitBytes: number | null
  isLimited: boolean
  usageRatio: number | null
  source: string
}

export interface ContainerCpuSnapshot {
  quotaMicros: number | null
  periodMicros: number | null
  quotaCpus: number | null
  cpusetCpus: number | null
  availableParallelism: number | null
  hostCpuCount: number | null
  effectiveCpuCount: number | null
  isLimited: boolean
  source: string
}

export interface ContainerResourceSnapshot {
  detected: boolean
  platform: string
  cgroupVersion: 1 | 2 | null
  isContainerLikely: boolean | null
  memory: ContainerMemorySnapshot
  cpu: ContainerCpuSnapshot
  source: "cgroup-v2" | "cgroup-v1" | "node" | "os" | "none"
  confidence: "high" | "medium" | "low"
  warnings: string[]
}

export interface ContainerResourceOptions {
  root?: string
  platform?: string
}

const V1_UNLIMITED_MEMORY = 2 ** 60;

async function readText (
  path: string, warnings: string[]
): Promise<string | null> {
  try {
    return (await readFile(
      path, "utf8"
    )).trim();
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EACCES" || err.code === "EPERM") {
      warnings.push(`permission-denied:${path}`);
    }

    return null;
  }
}

function parsePositiveNumber (value: string | null): number | null {
  if (!value || value === "max") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseV1Limit (value: string | null): number | null {
  const parsed = parsePositiveNumber(value);
  return parsed && parsed < V1_UNLIMITED_MEMORY ? parsed : null;
}

function ratio (
  current: number | null, limit: number | null
): number | null {
  return current !== null && limit !== null && limit > 0 ? current / limit : null;
}

export function parseCpuList (value: string | null): number | null {
  if (!value) return null;

  let count = 0;

  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [
      startRaw,
      endRaw
    ] = trimmed.split("-");
    const start = Number(startRaw);
    const end = endRaw === undefined ? start : Number(endRaw);

    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
      return null;
    }

    count += end - start + 1;
  }

  return count > 0 ? count : null;
}

function minFinite (values: Array<number | null>): number | null {
  const finite = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  return finite.length > 0 ? Math.min(...finite) : null;
}

function getAvailableParallelism (): number | null {
  return typeof os.availableParallelism === "function" ? os.availableParallelism() : null;
}

function getHostCpuCount (): number | null {
  const cpus = os.cpus();
  return cpus.length > 0 ? cpus.length : null;
}

function emptyMemory (source: string): ContainerMemorySnapshot {
  return {
    currentBytes: null,
    limitBytes: null,
    highBytes: null,
    swapCurrentBytes: null,
    swapLimitBytes: null,
    isLimited: false,
    usageRatio: null,
    source,
  };
}

function emptyCpu (source: string): ContainerCpuSnapshot {
  const availableParallelism = getAvailableParallelism();
  const hostCpuCount = getHostCpuCount();

  return {
    quotaMicros: null,
    periodMicros: null,
    quotaCpus: null,
    cpusetCpus: null,
    availableParallelism,
    hostCpuCount,
    effectiveCpuCount: minFinite([
      availableParallelism,
      hostCpuCount
    ]),
    isLimited: false,
    source,
  };
}

async function readCgroupV2 (
  root: string, warnings: string[]
): Promise<Pick<ContainerResourceSnapshot, "memory" | "cpu"> | null> {
  const [
    memoryCurrentRaw,
    memoryMaxRaw,
    memoryHighRaw,
    swapCurrentRaw,
    swapMaxRaw,
    cpuMaxRaw,
    cpusetRaw
  ] = await Promise.all([
    readText(
      `${root}/memory.current`, warnings
    ),
    readText(
      `${root}/memory.max`, warnings
    ),
    readText(
      `${root}/memory.high`, warnings
    ),
    readText(
      `${root}/memory.swap.current`, warnings
    ),
    readText(
      `${root}/memory.swap.max`, warnings
    ),
    readText(
      `${root}/cpu.max`, warnings
    ),
    readText(
      `${root}/cpuset.cpus.effective`, warnings
    )
  ]);

  if (!memoryCurrentRaw && !memoryMaxRaw && !cpuMaxRaw && !cpusetRaw) {
    return null;
  }

  const currentBytes = parsePositiveNumber(memoryCurrentRaw);
  const limitBytes = parsePositiveNumber(memoryMaxRaw);
  const cpusetCpus = parseCpuList(cpusetRaw);
  const cpuMaxParts = cpuMaxRaw?.split(/\s+/) ?? [];
  const quotaMicros = cpuMaxParts[0] === "max" ? null : parsePositiveNumber(cpuMaxParts[0] ?? null);
  const periodMicros = parsePositiveNumber(cpuMaxParts[1] ?? null);
  const quotaCpus = quotaMicros && periodMicros ? quotaMicros / periodMicros : null;
  const availableParallelism = getAvailableParallelism();
  const hostCpuCount = getHostCpuCount();

  return {
    memory: {
      currentBytes,
      limitBytes,
      highBytes: parsePositiveNumber(memoryHighRaw),
      swapCurrentBytes: parsePositiveNumber(swapCurrentRaw),
      swapLimitBytes: parsePositiveNumber(swapMaxRaw),
      isLimited: limitBytes !== null,
      usageRatio: ratio(
        currentBytes, limitBytes
      ),
      source: "cgroup-v2",
    },
    cpu: {
      quotaMicros,
      periodMicros,
      quotaCpus,
      cpusetCpus,
      availableParallelism,
      hostCpuCount,
      effectiveCpuCount: minFinite([
        quotaCpus,
        cpusetCpus,
        availableParallelism,
        hostCpuCount
      ]),
      isLimited: quotaCpus !== null || cpusetCpus !== null,
      source: "cgroup-v2",
    },
  };
}

async function readCgroupV1 (
  root: string, warnings: string[]
): Promise<Pick<ContainerResourceSnapshot, "memory" | "cpu"> | null> {
  const [
    usageRaw,
    limitRaw,
    quotaRaw,
    periodRaw,
    cpusetRaw
  ] = await Promise.all([
    readText(
      `${root}/memory/memory.usage_in_bytes`, warnings
    ),
    readText(
      `${root}/memory/memory.limit_in_bytes`, warnings
    ),
    readText(
      `${root}/cpu/cpu.cfs_quota_us`, warnings
    ),
    readText(
      `${root}/cpu/cpu.cfs_period_us`, warnings
    ),
    readText(
      `${root}/cpuset/cpuset.cpus`, warnings
    )
  ]);

  if (!usageRaw && !limitRaw && !quotaRaw && !periodRaw && !cpusetRaw) {
    return null;
  }

  const currentBytes = parsePositiveNumber(usageRaw);
  const limitBytes = parseV1Limit(limitRaw);
  const quotaNumber = Number(quotaRaw);
  const quotaMicros = Number.isFinite(quotaNumber) && quotaNumber > 0 ? quotaNumber : null;
  const periodMicros = parsePositiveNumber(periodRaw);
  const quotaCpus = quotaMicros && periodMicros ? quotaMicros / periodMicros : null;
  const cpusetCpus = parseCpuList(cpusetRaw);
  const availableParallelism = getAvailableParallelism();
  const hostCpuCount = getHostCpuCount();

  return {
    memory: {
      currentBytes,
      limitBytes,
      highBytes: null,
      swapCurrentBytes: null,
      swapLimitBytes: null,
      isLimited: limitBytes !== null,
      usageRatio: ratio(
        currentBytes, limitBytes
      ),
      source: "cgroup-v1",
    },
    cpu: {
      quotaMicros,
      periodMicros,
      quotaCpus,
      cpusetCpus,
      availableParallelism,
      hostCpuCount,
      effectiveCpuCount: minFinite([
        quotaCpus,
        cpusetCpus,
        availableParallelism,
        hostCpuCount
      ]),
      isLimited: quotaCpus !== null || cpusetCpus !== null,
      source: "cgroup-v1",
    },
  };
}

export async function readContainerResourceSnapshot (options: ContainerResourceOptions = {}): Promise<ContainerResourceSnapshot> {
  const root = options.root ?? "/sys/fs/cgroup";
  const platform = options.platform ?? process.platform;
  const warnings: string[] = [];

  if (platform !== "linux") {
    return {
      detected: false,
      platform,
      cgroupVersion: null,
      isContainerLikely: null,
      memory: emptyMemory("none"),
      cpu: emptyCpu("os"),
      source: "os",
      confidence: "low",
      warnings,
    };
  }

  const v2 = await readCgroupV2(
    root, warnings
  );
  if (v2) {
    return {
      detected: true,
      platform,
      cgroupVersion: 2,
      isContainerLikely: true,
      memory: v2.memory,
      cpu: v2.cpu,
      source: "cgroup-v2",
      confidence: v2.memory.isLimited || v2.cpu.isLimited ? "high" : "medium",
      warnings,
    };
  }

  const v1 = await readCgroupV1(
    root, warnings
  );
  if (v1) {
    return {
      detected: true,
      platform,
      cgroupVersion: 1,
      isContainerLikely: true,
      memory: v1.memory,
      cpu: v1.cpu,
      source: "cgroup-v1",
      confidence: v1.memory.isLimited || v1.cpu.isLimited ? "high" : "medium",
      warnings,
    };
  }

  return {
    detected: false,
    platform,
    cgroupVersion: null,
    isContainerLikely: null,
    memory: emptyMemory("none"),
    cpu: emptyCpu("os"),
    source: "os",
    confidence: warnings.length > 0 ? "low" : "medium",
    warnings,
  };
}
