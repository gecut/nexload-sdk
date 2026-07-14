import {
  DEFAULT_HTTP_STATUS_POLICY,
  statusToHttpStatus,
  stringifyHealthJson,
  toHealthJson
} from "@nexload-sdk/healthcheck";
import {
  toOpenMetricsText,
  toPrometheusText
} from "@nexload-sdk/healthcheck-prometheus";

import type {
  HealthHttpStatusPolicy,
  HealthManager,
  HealthReport,
  HealthRunScope,
  HealthScope
} from "@nexload-sdk/healthcheck";

export interface NextHealthRouteProtection {
  bearerToken?: string
  basicAuth?: {
    username: string
    password: string
  }
  allowCidrs?: readonly string[]
  allowIps?: readonly string[]
  trustProxy?: boolean
  proxyHeader?: "x-forwarded-for" | "x-real-ip" | string
}

export interface NextHealthRouteOptions {
  scope: HealthScope
  format?: "json" | "summary"
  httpStatus?: HealthHttpStatusPolicy
  includeDetails?: boolean | ((request: Request) => boolean)
  protect?: NextHealthRouteProtection
  headers?: HeadersInit | ((report: HealthReport) => HeadersInit)
  cache?: "no-store"
}

export interface NextMetricsRouteOptions {
  format: "prometheus" | "openmetrics" | "json"
  scope?: HealthRunScope
  protect?: NextHealthRouteProtection
  prefix?: string
  defaultLabels?: Record<string, string>
}

function constantTimeEquals (
  input: string, expected: string
): boolean {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(input);
  const expectedBytes = encoder.encode(expected);
  const length = Math.max(
    inputBytes.length, expectedBytes.length
  );
  let mismatch = inputBytes.length === expectedBytes.length ? 0 : 1;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (inputBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return mismatch === 0;
}

function parseBasicAuth (value: string | null): { username: string, password: string } | null {
  if (!value?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(value.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;

    return {
      username: decoded.slice(
        0, separator
      ),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

function ipToNumber (ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }

  return (((parts[0] ?? 0) << 24) >>> 0) + ((parts[1] ?? 0) << 16) + ((parts[2] ?? 0) << 8) + (parts[3] ?? 0);
}

function cidrContains (
  cidr: string, ip: string
): boolean {
  const [
    range,
    bitsRaw
  ] = cidr.split("/");
  const bits = Number(bitsRaw);
  const rangeNumber = ipToNumber(range ?? "");
  const ipNumber = ipToNumber(ip);

  if (rangeNumber === null || ipNumber === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return false;
  }

  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (rangeNumber & mask) === (ipNumber & mask);
}

function isValidCidr (cidr: string): boolean {
  const [
    range,
    bitsRaw
  ] = cidr.split("/");
  const bits = Number(bitsRaw);

  return ipToNumber(range ?? "") !== null
    && Number.isInteger(bits)
    && bits >= 0
    && bits <= 32;
}

function invalidConfig (message: string): Error {
  const error = new Error(message);
  error.name = "HEALTHCHECK_INVALID_CONFIG";
  return error;
}

function validateProtection (protection?: NextHealthRouteProtection): void {
  if (!protection) return;

  const hasBearer = "bearerToken" in protection;
  const hasBasic = protection.basicAuth !== undefined;
  const hasIps = (protection.allowIps?.length ?? 0) > 0;
  const hasCidrs = (protection.allowCidrs?.length ?? 0) > 0;

  if (!hasBearer && !hasBasic && !hasIps && !hasCidrs) {
    throw invalidConfig("Route protection must configure at least one access policy.");
  }

  if (hasBearer && !protection.bearerToken?.trim()) {
    throw invalidConfig("Bearer token protection requires a non-empty token.");
  }

  if (hasBasic && (!protection.basicAuth?.username.trim() || !protection.basicAuth.password)) {
    throw invalidConfig("Basic authentication requires a non-empty username and password.");
  }

  if (hasBearer && hasBasic) {
    throw invalidConfig("Bearer and Basic authentication cannot share one Authorization header.");
  }

  if ((hasIps || hasCidrs) && protection.trustProxy !== true) {
    throw invalidConfig("IP and CIDR protection require trustProxy: true.");
  }

  if (protection.allowIps?.some((ip) => ipToNumber(ip) === null)) {
    throw invalidConfig("IP protection currently accepts valid IPv4 addresses only.");
  }

  if (protection.allowCidrs?.some((cidr) => !isValidCidr(cidr))) {
    throw invalidConfig("CIDR protection currently accepts valid IPv4 CIDRs only.");
  }
}

function getRequestIp (
  request: Request, protection: NextHealthRouteProtection
): string | null {
  if (!protection.trustProxy) return null;

  const header = protection.proxyHeader ?? "x-forwarded-for";
  const value = request.headers.get(header);
  if (!value) return null;

  return value.split(",")[0]?.trim() ?? null;
}

function isAuthorized (
  request: Request, protection?: NextHealthRouteProtection
): boolean {
  if (!protection) return true;

  if (protection.bearerToken) {
    const token = request.headers.get("authorization")?.replace(
      /^Bearer\s+/i, ""
    ) ?? "";
    if (!constantTimeEquals(
      token, protection.bearerToken
    )) {
      return false;
    }
  }

  if (protection.basicAuth) {
    const parsed = parseBasicAuth(request.headers.get("authorization"));
    if (!parsed || !constantTimeEquals(
      parsed.username, protection.basicAuth.username
    ) || !constantTimeEquals(
      parsed.password, protection.basicAuth.password
    )) {
      return false;
    }
  }

  const ip = getRequestIp(
    request, protection
  );
  if (protection.allowIps?.length && (!ip || !protection.allowIps.includes(ip))) {
    return false;
  }

  if (protection.allowCidrs?.length && (!ip || !protection.allowCidrs.some((cidr) => cidrContains(
    cidr, ip
  )))) {
    return false;
  }

  return true;
}

function unauthorized (): Response {
  return new Response(
    JSON.stringify({
      code: "HEALTHCHECK_ROUTE_UNAUTHORIZED",
      message: "Unauthorized.",
    }), {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, max-age=0",
      },
    }
  );
}

function mergeHeaders (...headersList: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const headersInit of headersList) {
    if (!headersInit) continue;
    new Headers(headersInit).forEach((
      value, key
    ) => headers.set(
      key, value
    ));
  }

  return headers;
}

function baseHeaders (
  report: HealthReport, contentType: string
): HeadersInit {
  return {
    "cache-control": "no-store, max-age=0",
    "content-type": contentType,
    "x-health-status": report.status,
    "x-health-scope": String(report.scope),
    "x-health-duration-ms": report.durationMs.toFixed(2),
    "x-health-service": report.service.name,
    ...(report.service.instanceId ? { "x-health-instance": report.service.instanceId, } : {}),
  };
}

function summaryBody (report: HealthReport): string {
  return JSON.stringify({
    status: report.status,
    scope: report.scope,
    observedAt: report.observedAt,
    durationMs: report.durationMs,
    summary: report.summary,
  });
}

export function createNextHealthRoute (
  manager: HealthManager, options: NextHealthRouteOptions
): {
  GET: (request: Request) => Promise<Response>
  HEAD: (request: Request) => Promise<Response>
} {
  validateProtection(options.protect);

  if (options.cache !== undefined && options.cache !== "no-store") {
    throw invalidConfig("Health routes only support cache: no-store.");
  }

  async function handle (
    request: Request, head = false
  ): Promise<Response> {
    if (!isAuthorized(
      request, options.protect
    )) {
      return unauthorized();
    }

    const report = await manager.run(options.scope);
    const includeDetails = typeof options.includeDetails === "function"
      ? options.includeDetails(request)
      : options.includeDetails ?? false;
    const body = options.format === "summary"
      ? summaryBody(report)
      : stringifyHealthJson(
        report, { includeDetails, }
      );
    const headers = mergeHeaders(
      baseHeaders(
        report, "application/json; charset=utf-8"
      ), typeof options.headers === "function" ? options.headers(report) : options.headers
    );

    return new Response(
      head ? null : body, {
        status: statusToHttpStatus(
          report.status, options.httpStatus ?? DEFAULT_HTTP_STATUS_POLICY
        ),
        headers,
      }
    );
  }

  return {
    GET: (request) => handle(request),
    HEAD: (request) => handle(
      request, true
    ),
  };
}

export function createNextMetricsRoute (
  manager: HealthManager, options: NextMetricsRouteOptions
): { GET: (request: Request) => Promise<Response> } {
  validateProtection(options.protect);

  return {
    async GET (request) {
      if (!isAuthorized(
        request, options.protect
      )) {
        return unauthorized();
      }

      const report = await manager.run(
        options.scope ?? "all", { profile: "monitoring", }
      );
      const contentType = options.format === "json"
        ? "application/json; charset=utf-8"
        : options.format === "openmetrics"
          ? "application/openmetrics-text; version=1.0.0; charset=utf-8"
          : "text/plain; version=0.0.4; charset=utf-8";
      const body = options.format === "json"
        ? JSON.stringify(toHealthJson(
          report, { includeDetails: false, }
        ))
        : options.format === "openmetrics"
          ? toOpenMetricsText(
            report, { prefix: options.prefix, defaultLabels: options.defaultLabels, }
          )
          : toPrometheusText(
            report, { prefix: options.prefix, defaultLabels: options.defaultLabels, }
          );

      return new Response(
        body, {
          status: 200,
          headers: baseHeaders(
            report, contentType
          ),
        }
      );
    },
  };
}
