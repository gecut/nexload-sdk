import { defineHealthCheck, HEALTH_ERROR_CODES } from "@nexload-sdk/healthcheck";

import type {
  HealthCheckDefinition,
  HealthMetrics,
  HealthScope
} from "@nexload-sdk/healthcheck";
import type { Payload } from "payload";

export interface PayloadHealthCheckOptions {
  collection: string
  limit?: number
  timeoutMs?: number
  where?: Record<string, unknown>
  depth?: number
  expectedMinDocuments?: number
  scopes?: readonly HealthScope[]
}

type PayloadLike = Pick<Payload, "find">;
type PayloadFindArgs = Parameters<Payload["find"]>[0];

function getTotalDocs (result: unknown): number | null {
  if (result && typeof result === "object" && "totalDocs" in result) {
    const totalDocs = (result as { totalDocs?: unknown }).totalDocs;
    return typeof totalDocs === "number" ? totalDocs : null;
  }

  return null;
}

export function payloadHealthCheck (
  payload: PayloadLike, options: PayloadHealthCheckOptions
): HealthCheckDefinition<"payload"> {
  return defineHealthCheck({
    name: "payload",
    component: "payload",
    scopes: options.scopes ?? ["readiness"],
    critical: { readiness: true, diagnostics: false, },
    timeoutMs: options.timeoutMs,
    async run (ctx) {
      const startedAt = ctx.now();

      try {
        const result = await payload.find({
          collection: options.collection,
          limit: options.limit ?? 1,
          depth: options.depth ?? 0,
          where: options.where as PayloadFindArgs["where"],
        });
        const totalDocs = getTotalDocs(result);
        const expectedMin = options.expectedMinDocuments;
        const ok = expectedMin === undefined || (totalDocs !== null && totalDocs >= expectedMin);
        const metrics: HealthMetrics = {
          latencyMs: ctx.now() - startedAt,
          totalDocs,
          up: ok,
        };

        return {
          status: ok ? "ok" : "unhealthy",
          metrics,
          error: ok
            ? undefined
            : {
              code: HEALTH_ERROR_CODES.PAYLOAD_QUERY_FAILED,
              message: "Payload query did not meet expectations.",
            },
        };
      } catch (errorValue) {
        const error = errorValue instanceof Error ? errorValue : new Error(String(errorValue));

        return {
          status: "unhealthy",
          metrics: {
            latencyMs: ctx.now() - startedAt,
            up: false,
          },
          error: {
            code: HEALTH_ERROR_CODES.PAYLOAD_QUERY_FAILED,
            message: "Payload query failed.",
            causeName: error.name,
            causeMessage: error.message,
          },
        };
      }
    },
  });
}
