import { filesize } from "filesize";
import { mem } from "systeminformation";
import { HealthCheck } from "../core/types";
import type { HealthStatus } from "../core/types";

export class MemoryHealthCheck extends HealthCheck<"memory"> {
  constructor(
    private readonly thresholds = { degraded: 0.15, unhealthy: 0.05 }
  ) {
    super("memory", ["liveness", "readiness"]);
  }

  async run() {
    const { free, total, used } = await mem();
    const ratio = free / total;

    let status: HealthStatus = "ok";
    if (ratio < this.thresholds.unhealthy) status = "unhealthy";
    else if (ratio < this.thresholds.degraded) status = "degraded";

    return {
      name: this.name,
      type: this.types,
      status,
      metrics: {
        total: filesize(total),
        used: filesize(used),
        free: filesize(free),
        freePercent: `${(ratio * 100).toFixed(1)}%`,
      },
    };
  }
}
