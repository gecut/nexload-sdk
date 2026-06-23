import type {
  HealthHttpStatusPolicy,
  HealthStatus
} from "./types";

export const DEFAULT_HTTP_STATUS_POLICY: HealthHttpStatusPolicy = {
  ok: 200,
  degraded: 200,
  unhealthy: 503,
};

export const STRICT_READINESS_HTTP_STATUS_POLICY: HealthHttpStatusPolicy = {
  ok: 200,
  degraded: 503,
  unhealthy: 503,
};

export function statusToHttpStatus (
  status: HealthStatus, policy: HealthHttpStatusPolicy = DEFAULT_HTTP_STATUS_POLICY
): number {
  return policy[status];
}
