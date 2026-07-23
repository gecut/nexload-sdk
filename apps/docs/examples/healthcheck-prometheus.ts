import type { HealthReport } from "@nexload-sdk/healthcheck";
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

declare const report: HealthReport;

export const metrics = toPrometheusText(report, {
  prefix: "nexload",
  defaultLabels: { service: "api" },
});
