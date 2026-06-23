import type {
  HealthMetric,
  HealthMetricValue,
  HealthReport
} from "@nexload-sdk/healthcheck";

export interface OtelMetricRecord {
  name: string
  value: HealthMetricValue
  attributes: Record<string, string | number | boolean>
  unit?: string
  type?: HealthMetric["type"]
  observedAt: string
}

function statusValue (status: string): number {
  if (status === "ok") return 1;
  if (status === "degraded") return 0.5;
  return 0;
}

export function toOtelResourceAttributes (report: HealthReport): Record<string, string | number | boolean> {
  return {
    "service.name": report.service.name,
    "service.version": report.service.version ?? "unknown",
    "deployment.environment.name": report.service.environment ?? report.environment?.name ?? "unknown",
    "service.instance.id": report.service.instanceId ?? "unknown",
    "process.runtime.name": report.runtime.name,
    "process.runtime.version": report.runtime.version ?? "unknown",
    "host.arch": report.runtime.arch ?? "unknown",
    "os.type": report.runtime.platform ?? "unknown",
  };
}

export function toOtelMetricRecords (report: HealthReport): OtelMetricRecord[] {
  const records: OtelMetricRecord[] = [
    {
      name: "health.status",
      value: statusValue(report.status),
      unit: "state",
      type: "gauge",
      observedAt: report.observedAt,
      attributes: {
        service: report.service.name,
        scope: report.scope,
        status: report.status,
      },
    },
    {
      name: "health.run.duration_ms",
      value: report.durationMs,
      unit: "milliseconds",
      type: "gauge",
      observedAt: report.observedAt,
      attributes: {
        service: report.service.name,
        scope: report.scope,
      },
    }
  ];

  for (const check of report.checks) {
    records.push({
      name: "health.check.status",
      value: statusValue(check.status),
      unit: "state",
      type: "gauge",
      observedAt: check.observedAt,
      attributes: {
        service: report.service.name,
        scope: String(check.scope),
        check: check.name,
        status: check.status,
        critical: check.critical,
      },
    });
    records.push({
      name: "health.check.duration_ms",
      value: check.durationMs,
      unit: "milliseconds",
      type: "gauge",
      observedAt: check.observedAt,
      attributes: {
        service: report.service.name,
        scope: String(check.scope),
        check: check.name,
      },
    });
  }

  for (const metric of report.metrics) {
    records.push({
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      type: metric.type,
      observedAt: metric.observedAt ?? report.observedAt,
      attributes: {
        service: report.service.name,
        scope: report.scope,
        ...(metric.labels ?? {}),
      },
    });
  }

  return records;
}
