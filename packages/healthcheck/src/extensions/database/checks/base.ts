import { HealthCheck } from "../../../core/types";

import type { HealthCheckResult, HealthStatus } from "../../../core/types";
import type { DatabaseClientAdapter } from "../adapters/base";

export class DatabaseHealthCheck extends HealthCheck<"database"> {
  constructor (
    private readonly client: DatabaseClientAdapter,
    private readonly thresholds = { degraded: 300, unhealthy: 1000, } // ms
  ) {
    super(
      "database", ["readiness"]
    );
  }

  async run (): Promise<HealthCheckResult<"database">> {
    const start = performance.now();

    try {
      const latency = await this.client.ping();
      const duration = performance.now() - start;

      let status: HealthStatus = "ok";
      if (duration > this.thresholds.unhealthy) status = "unhealthy";
      else if (duration > this.thresholds.degraded) status = "degraded";

      return {
        name: this.name,
        type: this.types,
        status,
        metrics: {
          latency: `${duration.toFixed(1)} ms`,
          queryTime: `${latency.toFixed(1)} ms`,
        },
      };
    } catch (err: unknown) {
      return {
        name: this.name,
        type: this.types,
        status: "unhealthy",
        metrics: { error: true, },
        details: { message: (err as Error).message, },
      };
    }
  }
}
