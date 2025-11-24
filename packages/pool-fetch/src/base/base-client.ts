import { EnvManager, merge } from "@nexload-sdk/env";
import { $NodePreset } from "@nexload-sdk/env/presets";
import logger from "@nexload-sdk/logger";

/**
 * Abstract base class providing shared HTTP utilities
 * for all NexLoad SDK network clients.
 */
export abstract class BaseHttpClient {
  protected readonly env = new EnvManager(merge($NodePreset));

  protected readonly logger: typeof logger = logger.child({
    package: "@nexload-sdk/pool-fetch",
  });

  protected getStatusText(code: number): string {
    const map: Record<number, string> = {
      200: "OK",
      201: "Created",
      202: "Accepted",
      204: "No Content",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      409: "Conflict",
      422: "Unprocessable Entity",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
    };
    return map[code] || "Unknown Status";
  }

  protected convertBody(body?: BodyInit | null): string | Buffer | null {
    if (!body) return null;

    if (typeof body === "string") return body;

    // ArrayBuffer and TypedArray handling
    if (body instanceof ArrayBuffer) return Buffer.from(body);
    if (body instanceof Uint8Array) return Buffer.from(body);

    // Buffer detection
    if (Buffer.isBuffer(body)) return body;

    // Fallback: small overhead but ensures compatibility for FormData, etc.
    return String(body);
  }

  protected async extractRequestData(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<{
    url: string;
    method: string;
    headers: Record<string, string> | HeadersInit;
    body: BodyInit | null;
  }> {
    // Fast path: input is Request
    if (input instanceof Request) {
      const url = input.url;
      const method = input.method;
      // convert Headers to plain object only once (lazy)
      const headersObj: Record<string, string> = {};

      input.headers.forEach((v, k) => (headersObj[k] = v));

      let body: BodyInit | null = null;
      // Read only if body available and not used — keep try/catch minimal
      if (input.body && !input.bodyUsed) {
        try {
          body = await input.arrayBuffer();
        } catch {
          body = null;
        }
      }

      // Merge init.headers if present (init overrides Request headers)
      if (init?.headers) {
        const initHeaders = init.headers as HeadersInit;
        // Merge minimal: if init.headers is an object, spread; if Headers, iterate
        if (initHeaders instanceof Headers) {
          initHeaders.forEach((v, k) => (headersObj[k] = v));
        } else if (typeof initHeaders === "object") {
          Object.assign(headersObj, initHeaders as Record<string, string>);
        }
      }

      return { url, method, headers: headersObj, body };
    }

    // Non-Request path
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "POST"; // default to POST for RPC-like flows
    const headers = init?.headers ?? {};
    const body = init?.body ?? null;

    return { url, method, headers, body };
  }

  abstract fetch(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response>;
}
