import type {
  HealthMetric,
  HealthMetricValue,
  HealthReport,
  HealthStatus
} from "@nexload-sdk/healthcheck";

export interface PrometheusExportOptions {
  prefix?: string
  defaultLabels?: Record<string, string>
  includeDescriptions?: boolean
}

export type OpenMetricsExportOptions = PrometheusExportOptions;

const STATUSES: readonly HealthStatus[] = [
  "ok",
  "degraded",
  "unhealthy"
];
const ALLOWED_LABELS = new Set([
  "service",
  "scope",
  "check",
  "component",
  "dependency",
  "runtime",
  "status",
  "error_code",
  "collector",
  "version"
]);

function metricName (
  name: string, prefix: string
): string {
  const normalized = name.replace(
    /[^a-zA-Z0-9_:]/g, "_"
  ).replace(
    /_+/g, "_"
  )
    .replace(
      /^_+|_+$/g, ""
    )
    .toLowerCase();
  return `${prefix}_${normalized}`;
}

function metricValue (value: HealthMetricValue): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") return 1;
  return null;
}

function escapeLabel (value: string): string {
  return value.replace(
    /\\/g, "\\\\"
  ).replace(
    /\n/g, "\\n"
  )
    .replace(
      /"/g, "\\\""
    );
}

function labels (input: Record<string, string | undefined>): string {
  const entries = Object.entries(input)
    .filter((entry): entry is [string, string] => Boolean(entry[1]) && ALLOWED_LABELS.has(entry[0]))
    .sort((
      [a], [b]
    ) => a.localeCompare(b));

  if (entries.length === 0) return "";

  return `{${entries.map(([
    key,
    value
  ]) => `${key}="${escapeLabel(value)}"`).join(",")}}`;
}

function appendMetric (
  lines: string[], name: string, labelsInput: Record<string, string | undefined>, value: HealthMetricValue
): void {
  const numeric = metricValue(value);
  if (numeric === null) return;

  lines.push(`${name}${labels(labelsInput)} ${numeric}`);
}

function appendHealthStatus (
  lines: string[], report: HealthReport, prefix: string, defaults: Record<string, string>
): void {
  const name = metricName(
    "health.status", prefix
  );

  for (const status of STATUSES) {
    appendMetric(
      lines, name, {
        ...defaults,
        service: report.service.name,
        scope: report.scope,
        status,
      }, report.status === status ? 1 : 0
    );
  }
}

function appendCheckMetrics (
  lines: string[], report: HealthReport, prefix: string, defaults: Record<string, string>
): void {
  const statusName = metricName(
    "health.check.status", prefix
  );
  const durationName = metricName(
    "health.check.duration_milliseconds", prefix
  );

  for (const check of report.checks) {
    for (const status of STATUSES) {
      appendMetric(
        lines, statusName, {
          ...defaults,
          service: report.service.name,
          scope: String(check.scope),
          check: check.name,
          component: check.component,
          status,
        }, check.status === status ? 1 : 0
      );
    }

    appendMetric(
      lines, durationName, {
        ...defaults,
        service: report.service.name,
        scope: String(check.scope),
        check: check.name,
        component: check.component,
      }, check.durationMs
    );
  }
}

function appendReportMetrics (
  lines: string[], report: HealthReport, prefix: string, defaults: Record<string, string>
): void {
  const runDurationName = metricName(
    "health.run.duration_milliseconds", prefix
  );
  appendMetric(
    lines, runDurationName, {
      ...defaults,
      service: report.service.name,
      scope: report.scope,
    }, report.durationMs
  );

  for (const metric of report.metrics) {
    appendHealthMetric(
      lines, metric, report, prefix, defaults
    );
  }
}

function appendHealthMetric (
  lines: string[], metric: HealthMetric, report: HealthReport, prefix: string, defaults: Record<string, string>
): void {
  appendMetric(
    lines, metricName(
      metric.name, prefix
    ), {
      ...defaults,
      service: report.service.name,
      scope: report.scope,
      ...metric.labels,
    }, metric.value
  );
}

export function toPrometheusText (
  report: HealthReport, options: PrometheusExportOptions = {}
): string {
  const prefix = options.prefix ?? "nexload";
  const defaults = options.defaultLabels ?? {};
  const lines: string[] = [];

  appendHealthStatus(
    lines, report, prefix, defaults
  );
  appendCheckMetrics(
    lines, report, prefix, defaults
  );
  appendReportMetrics(
    lines, report, prefix, defaults
  );

  return `${lines.join("\n")}\n`;
}

export function toOpenMetricsText (
  report: HealthReport, options: OpenMetricsExportOptions = {}
): string {
  return `${toPrometheusText(
    report, options
  )}# EOF\n`;
}
