import { formatDuration } from "../core/utils";
import { HealthCheck, HealthStatus } from "../core/types";

export class UptimeHealthCheck extends HealthCheck<"uptime"> {
  constructor() {
    super("uptime", ["liveness"]);
  }

  async run() {
    const uptime = process.uptime();

    return {
      name: this.name,
      type: this.types,
      status: "ok" as HealthStatus,
      metrics: { uptime: formatDuration(uptime) },
    };
  }
}
