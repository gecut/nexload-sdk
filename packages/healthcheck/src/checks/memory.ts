import { readFile } from "node:fs/promises";
import { filesize } from "filesize";
import { mem } from "systeminformation";
import { HealthCheck } from "../core/types";
import type { HealthStatus } from "../core/types";

type MemorySnapshot = {
  total: number;
  used: number;
  free: number;
  source: "cgroup" | "host";
};

const CGROUP_V2_MAX = "/sys/fs/cgroup/memory.max";
const CGROUP_V2_CURRENT = "/sys/fs/cgroup/memory.current";
const CGROUP_V1_PATHS = [
  {
    limit: "/sys/fs/cgroup/memory/memory.limit_in_bytes",
    usage: "/sys/fs/cgroup/memory/memory.usage_in_bytes",
  },
  {
    limit: "/sys/fs/cgroup/memory.limit_in_bytes",
    usage: "/sys/fs/cgroup/memory.usage_in_bytes",
  },
];

const CGROUP_V1_UNLIMITED_THRESHOLD = 2 ** 60;

async function readText(path: string) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch {
    return null;
  }
}

function toFiniteByteValue(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function createSnapshot(limit: number, usage: number): MemorySnapshot {
  const used = Math.max(0, Math.min(usage, limit));
  const free = Math.max(0, limit - used);

  return {
    total: limit,
    used,
    free,
    source: "cgroup",
  };
}

async function readCgroupMemorySnapshot(): Promise<MemorySnapshot | null> {
  const [v2MaxRaw, v2CurrentRaw] = await Promise.all([
    readText(CGROUP_V2_MAX),
    readText(CGROUP_V2_CURRENT),
  ]);

  if (v2MaxRaw && v2CurrentRaw) {
    if (v2MaxRaw !== "max") {
      const limit = toFiniteByteValue(v2MaxRaw);
      const usage = toFiniteByteValue(v2CurrentRaw);

      if (limit && usage) {
        return createSnapshot(limit, usage);
      }
    }
  }

  for (const path of CGROUP_V1_PATHS) {
    const [limitRaw, usageRaw] = await Promise.all([
      readText(path.limit),
      readText(path.usage),
    ]);

    if (!limitRaw || !usageRaw) {
      continue;
    }

    const limit = toFiniteByteValue(limitRaw);
    const usage = toFiniteByteValue(usageRaw);

    if (!limit || !usage) {
      continue;
    }

    if (limit >= CGROUP_V1_UNLIMITED_THRESHOLD) {
      return null;
    }

    return createSnapshot(limit, usage);
  }

  return null;
}

export class MemoryHealthCheck extends HealthCheck<"memory"> {
  constructor(
    private readonly thresholds = { degraded: 0.15, unhealthy: 0.05 }
  ) {
    super("memory", ["liveness", "readiness"]);
  }

  async run() {
    const cgroupSnapshot = await readCgroupMemorySnapshot();

    const snapshot = cgroupSnapshot
      ? cgroupSnapshot
      : await mem().then(({ total, used, free }) => ({
          total,
          used,
          free,
          source: "host" as const,
        }));

    const ratio = snapshot.free / snapshot.total;

    let status: HealthStatus = "ok";
    if (ratio < this.thresholds.unhealthy) status = "unhealthy";
    else if (ratio < this.thresholds.degraded) status = "degraded";

    return {
      name: this.name,
      type: this.types,
      status,
      metrics: {
        source: snapshot.source,
        total: filesize(snapshot.total),
        used: filesize(snapshot.used),
        free: filesize(snapshot.free),
        freePercent: `${(ratio * 100).toFixed(1)}%`,
      },
    };
  }
}
