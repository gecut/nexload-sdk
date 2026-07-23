import type { HealthReport } from "@nexload-sdk/healthcheck";
import {
  toOtelMetricRecords,
  toOtelResourceAttributes,
} from "@nexload-sdk/healthcheck-otel";

declare const report: HealthReport;

export const metricRecords = toOtelMetricRecords(report);
export const resourceAttributes = toOtelResourceAttributes(report);
