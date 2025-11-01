import { cpu, currentLoad } from "systeminformation";

import { HealthCheck } from "../core/types";

import type { HealthStatus } from "../core/types";

export class ProcessorHealthCheck extends HealthCheck<"processor"> {
  constructor (private readonly thresholds = { degraded: 0.85, unhealthy: 0.95, }) {
    super(
      "processor", ["liveness"]
    );
  }

  async run () {
    const { manufacturer, brand, model, cores, } = await cpu();
    const { currentLoad: load, } = await currentLoad();

    const ratio = load / 100;
    let status: HealthStatus = "ok";
    if (ratio > this.thresholds.unhealthy) status = "unhealthy";
    else if (ratio > this.thresholds.degraded) status = "degraded";

    return {
      name: this.name,
      type: this.types,
      status,
      metrics: {
        cpu: `${manufacturer} ${brand} ${model}`,
        cores,
        load: `${load.toFixed(2)}%`,
      },
    };
  }
}
