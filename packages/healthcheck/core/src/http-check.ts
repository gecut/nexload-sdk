import { defineHealthCheck } from "./core/define";
import { HEALTH_ERROR_CODES } from "./core/errors";

import type {
  HealthCheckDefinition,
  HealthMetrics,
  HealthScope
} from "./core/types";

export interface HttpCheckOptions {
  scopes?: readonly HealthScope[]
  method?: "GET" | "HEAD" | "POST"
  headers?: HeadersInit
  body?: BodyInit | null
  expectedStatus?: number | readonly number[] | { min: number, max: number }
  validateBody?: (body: string, response: Response) => boolean | Promise<boolean>
  timeoutMs?: number
}

function isExpectedStatus (
  status: number, expected: HttpCheckOptions["expectedStatus"]
): boolean {
  if (!expected) return status >= 200 && status <= 399;
  if (typeof expected === "number") return status === expected;
  if (Array.isArray(expected)) return expected.includes(status);
  if (!("min" in expected)) return false;
  return status >= expected.min && status <= expected.max;
}

export function httpCheck (
  name: string, url: string | URL, options: HttpCheckOptions = {}
): HealthCheckDefinition<string> {
  return defineHealthCheck({
    name,
    component: "http",
    scopes: options.scopes ?? ["readiness"],
    critical: { readiness: true, diagnostics: false, },
    timeoutMs: options.timeoutMs,
    async run (ctx) {
      const startedAt = ctx.now();

      try {
        const response = await fetch(
          url, {
            method: options.method ?? "GET",
            headers: options.headers,
            body: options.body,
            signal: ctx.signal,
          }
        );
        const latencyMs = ctx.now() - startedAt;
        const expected = isExpectedStatus(
          response.status, options.expectedStatus
        );

        if (!expected) {
          return {
            status: "unhealthy",
            metrics: {
              latencyMs,
              statusCode: response.status,
              responseBytes: null,
              up: false,
            } satisfies HealthMetrics,
            error: {
              code: HEALTH_ERROR_CODES.HTTP_STATUS_MISMATCH,
              message: "HTTP status did not match.",
            },
          };
        }

        if (options.validateBody) {
          const body = await response.text();
          const valid = await options.validateBody(
            body, response
          );

          if (!valid) {
            return {
              status: "unhealthy",
              metrics: {
                latencyMs,
                statusCode: response.status,
                responseBytes: body.length,
                up: false,
              } satisfies HealthMetrics,
              error: {
                code: HEALTH_ERROR_CODES.HTTP_BODY_MISMATCH,
                message: "HTTP body did not match.",
              },
            };
          }

          return {
            status: "ok",
            metrics: {
              latencyMs,
              statusCode: response.status,
              responseBytes: body.length,
              up: true,
            } satisfies HealthMetrics,
          };
        }

        return {
          status: "ok",
          metrics: {
            latencyMs,
            statusCode: response.status,
            responseBytes: null,
            up: true,
          } satisfies HealthMetrics,
        };
      } catch (errorValue) {
        const error = errorValue instanceof Error ? errorValue : new Error(String(errorValue));

        return {
          status: "unhealthy",
          metrics: {
            latencyMs: ctx.now() - startedAt,
            statusCode: null,
            responseBytes: null,
            up: false,
          } satisfies HealthMetrics,
          error: {
            code: HEALTH_ERROR_CODES.HEALTHCHECK_DEPENDENCY_UNAVAILABLE,
            message: "HTTP dependency is unavailable.",
            causeName: error.name,
            causeMessage: error.message,
          },
        };
      }
    },
  });
}
