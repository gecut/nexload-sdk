import type {
  HealthReport,
  RedactionPolicy
} from "./types";

const DEFAULT_REDACTION: RedactionPolicy = {
  redactSecrets: true,
  redactUrls: "query",
  includeStack: false,
  includeErrorMessage: false,
};

const SECRET_KEY_PATTERN = /token|secret|password|authorization|cookie|api[_-]?key|connection|string/i;

function redactUrl (
  value: string, mode: RedactionPolicy["redactUrls"]
): string {
  if (mode === "none") return value;

  try {
    const url = new URL(value);
    if (mode === "full") return "[redacted-url]";
    if (mode === "origin") return url.origin;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
}

function sanitizeValue (
  key: string, value: unknown, policy: RedactionPolicy
): unknown {
  if (policy.redactSecrets && SECRET_KEY_PATTERN.test(key)) {
    return "[redacted]";
  }

  if (typeof value === "string") {
    return redactUrl(
      value, policy.redactUrls
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(
      key, item, policy
    ));
  }

  if (value && typeof value === "object") {
    return sanitizeObject(
      value as Record<string, unknown>, policy
    );
  }

  return value;
}

function sanitizeObject (
  value: Record<string, unknown>, policy: RedactionPolicy
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [
    key,
    entry
  ] of Object.entries(value)) {
    if (policy.allowedDetailKeys && !policy.allowedDetailKeys.includes(key)) {
      continue;
    }

    result[key] = sanitizeValue(
      key, entry, policy
    );
  }

  return result;
}

export interface HealthJsonOptions {
  includeDetails?: boolean
  redact?: boolean
  redaction?: Partial<RedactionPolicy>
}

export function toHealthJson (
  report: HealthReport, options: HealthJsonOptions = {}
): HealthReport {
  const policy = { ...DEFAULT_REDACTION, ...options.redaction, };
  const redact = options.redact ?? true;
  const includeDetails = options.includeDetails ?? false;

  return {
    ...report,
    checks: report.checks.map((check) => ({
      ...check,
      details: includeDetails && check.details
        ? (redact
          ? sanitizeObject(
            check.details, policy
          )
          : check.details)
        : undefined,
      error: check.error
        ? {
          ...check.error,
          message: policy.includeErrorMessage ? check.error.message : "Health check failed.",
          causeMessage: policy.includeErrorMessage ? check.error.causeMessage : undefined,
          stack: policy.includeStack ? check.error.stack : undefined,
        }
        : undefined,
    })),
    resources: report.resources && redact
      ? sanitizeObject(
        report.resources, policy
      )
      : report.resources,
  };
}

export function stringifyHealthJson (
  report: HealthReport, options?: HealthJsonOptions
): string {
  return JSON.stringify(toHealthJson(
    report, options
  ));
}
