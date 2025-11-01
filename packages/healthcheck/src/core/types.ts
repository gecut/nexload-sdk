export type HealthCheckType = "liveness" | "readiness";

export type HealthStatus = "ok" | "degraded" | "unhealthy";

export interface HealthCheckResult<TName extends string = string> {
  name: TName;
  type: HealthCheckType[];
  status: HealthStatus;
  metrics: Record<string, string | number | boolean>;
  details?: Record<string, unknown>;
}

export interface HealthThresholds {
  degraded: number;
  unhealthy: number;
}

export interface HealthSecurityOptions {
  token?: string;
  ipWhitelist?: string[];
}

export abstract class HealthCheck<TName extends string = string> {
  constructor(
    public readonly name: TName,
    public readonly types: HealthCheckType[]
  ) {}

  /** Run this health check and return the result */
  abstract run(): Promise<HealthCheckResult<TName>>;
}
