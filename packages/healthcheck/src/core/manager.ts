import { aggregateStatus } from "./utils";
import type {
  HealthCheck,
  HealthCheckResult,
  HealthCheckType,
  HealthSecurityOptions,
} from "./types";

interface HealthManagerOptions {
  checks?: HealthCheck[];
  globalThresholds?: Record<string, unknown>;
  security?: HealthSecurityOptions;
}

export class HealthManager {
  private readonly checks = new Map<string, HealthCheck>();
  private readonly shutdownSignals = new Set<string>();
  private shuttingDown = false;
  private readonly security?: HealthSecurityOptions;

  constructor(private readonly options?: HealthManagerOptions) {
    this.security = options?.security;
    options?.checks?.forEach((c) => this.addCheck(c));
  }

  addCheck(check: HealthCheck): this {
    this.checks.set(check.name, check);
    return this;
  }

  /** Gracefully mark system as shutting down */
  setShutdownSignal(signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"]): this {
    for (const s of signals) {
      process.on(s, () => {
        this.shuttingDown = true;
      });
      this.shutdownSignals.add(s);
    }
    return this;
  }

  isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  async run(type: HealthCheckType): Promise<HealthCheckResult<"summary">> {
    if (this.shuttingDown) {
      return {
        name: "summary",
        type: [type],
        status: "unhealthy",
        metrics: { shuttingDown: true },
      };
    }

    const relevantChecks = Array.from(this.checks.values()).filter((c) =>
      c.types.includes(type)
    );

    const results = await Promise.all(relevantChecks.map((c) => c.run()));
    const overall = aggregateStatus(results.map((r) => r.status));

    return {
      name: "summary",
      type: [type],
      status: overall,
      metrics: {
        total: results.length,
        ok: results.filter((r) => r.status === "ok").length,
        degraded: results.filter((r) => r.status === "degraded").length,
        unhealthy: results.filter((r) => r.status === "unhealthy").length,
      },
      details: Object.fromEntries(results.map((r) => [r.name, r])),
    };
  }

  /** Optional security check helper */
  authorize(token?: string, ip?: string): boolean {
    if (!this.security) return true;
    if (this.security.token && this.security.token !== token) return false;
    if (
      this.security.ipWhitelist &&
      !this.security.ipWhitelist.includes(ip ?? "")
    )
      return false;
    return true;
  }
}
