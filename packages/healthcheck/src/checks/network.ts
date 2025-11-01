import ping from "ping";
import { HealthCheck } from "../core/types";
import type { HealthStatus } from "../core/types";

export class NetworkHealthCheck extends HealthCheck<"network"> {
  constructor(
    private readonly host: string,
    private readonly thresholds = { degraded: 200, unhealthy: 500 } // in ms
  ) {
    super("network", ["readiness"]);
  }

  async run() {
    const res = await ping.promise.probe(this.host);
    const time = res.time ?? Infinity;

    let status: HealthStatus = "ok";
    if (time > this.thresholds.unhealthy) status = "unhealthy";
    else if (time > this.thresholds.degraded) status = "degraded";

    return {
      name: this.name,
      type: this.types,
      status,
      metrics: { host: this.host, time: `${time} ms` },
    };
  }
}
