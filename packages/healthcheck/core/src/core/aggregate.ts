import type {
  HealthCheckResult,
  HealthStatus,
  HealthSummary
} from "./types";

export function summarizeChecks (results: readonly HealthCheckResult[]): HealthSummary {
  return {
    ok: results.filter((result) => result.status === "ok").length,
    degraded: results.filter((result) => result.status === "degraded").length,
    unhealthy: results.filter((result) => result.status === "unhealthy").length,
    total: results.length,
    criticalFailed: results.filter((result) => result.critical && result.status !== "ok").length,
    nonCriticalFailed: results.filter((result) => !result.critical && result.status !== "ok").length,
  };
}

export function aggregateStatus (results: readonly HealthCheckResult[]): HealthStatus {
  if (results.some((result) => result.critical && result.status === "unhealthy")) {
    return "unhealthy";
  }

  if (results.some((result) => result.status !== "ok")) {
    return "degraded";
  }

  return "ok";
}
