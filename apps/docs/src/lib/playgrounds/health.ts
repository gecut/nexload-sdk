import { createHealthManager } from "@nexload-sdk/healthcheck";
import { toOtelMetricRecords } from "@nexload-sdk/healthcheck-otel";
import { toOpenMetricsText, toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

export async function evaluate(input: string, mode: string): Promise<string> {
  const state = input.trim().toLowerCase();
  if (!["ok", "degraded", "unhealthy"].includes(state)) return "Enter ok, degraded or unhealthy.";
  const status = state === "unhealthy" ? "unhealthy" : state === "degraded" ? "degraded" : "ok";
  const manager = createHealthManager({
    service: { name: "shop" },
    checks: [{ name: "inventory", critical: true, scopes: ["readiness"], run: () => ({ status }) }],
  });
  const report = await manager.run("readiness");
  manager.dispose();
  if (mode === "Prometheus") return toPrometheusText(report);
  if (mode === "OpenMetrics") return toOpenMetricsText(report);
  if (mode === "OTel") return JSON.stringify(toOtelMetricRecords(report), null, 2);
  return JSON.stringify(report, null, 2);
}
