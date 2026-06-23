import { defineMetricCollector } from "./core/define";

import type {
  HealthMetric,
  HealthScope,
  MetricCollectorDefinition
} from "./core/types";

export function runtimeMetricsCollector (options: { scopes?: readonly HealthScope[] } = {}): MetricCollectorDefinition<"runtime.metrics"> {
  return defineMetricCollector({
    name: "runtime.metrics",
    scopes: options.scopes ?? ["diagnostics"],
    collect (ctx) {
      const runtime = ctx.runtime.getRuntimeInfo();
      const uptimeSeconds = ctx.runtime.uptimeSeconds();
      const metrics: HealthMetric[] = [
        {
          name: "runtime.info",
          value: 1,
          type: "info",
          labels: {
            runtime: runtime.name,
            version: runtime.version ?? "unknown",
          },
        },
        {
          name: "service.uptime_seconds",
          value: uptimeSeconds,
          unit: "seconds",
          type: "gauge",
        }
      ];

      return { metrics, };
    },
  });
}
