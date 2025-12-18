import { Dispatcher } from "undici";
import { BaseHttpClient } from "../base/base-client";
import { ConnectionPoolManager } from "../pool/connection-manager";

export class UndiciHttpClient extends BaseHttpClient {
  private readonly poolManager: ConnectionPoolManager;

  constructor(poolManager?: ConnectionPoolManager) {
    super();
    this.poolManager = poolManager ?? ConnectionPoolManager.getInstance();
  }

  public async fetch(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> {
    const { url, method, headers, body } = await this.extractRequestData(
      input,
      init
    );

    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin;
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;

    const pool = this.poolManager.getPool(origin);

    try {
      const requestOptions: Dispatcher.RequestOptions = {
        path: pathAndQuery,
        method: method as Dispatcher.HttpMethod,
        headers: headers as Record<string, string>,
        body: this.convertBody(body),
      };

      const {
        statusCode,
        headers: resHeaders,
        body: resStream,
      } = await pool.request(requestOptions);

      // Normalize headers safely
      const responseHeaders = new Headers();
      for (const [k, v] of Object.entries(resHeaders)) {
        responseHeaders.set(k, Array.isArray(v) ? v.join(", ") : String(v));
      }

      // No-body statuses must not have a body
      if (statusCode === 204 || statusCode === 304) {
        return new Response(null, {
          status: statusCode,
          statusText: this.getStatusText(statusCode),
          headers: responseHeaders,
        });
      }

      const arrayBuf = await resStream.arrayBuffer();

      return new Response(arrayBuf, {
        status: statusCode,
        statusText: this.getStatusText(statusCode),
        headers: responseHeaders,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      const fallbackHeaders: Record<string, string> = {
        ...(headers as Record<string, string>),
        "X-Fallback-Fetch": "true",
        "X-Original-Error": errorMessage,
      };

      return fetch(input, {
        ...init,
        method,
        headers: fallbackHeaders,
      });
    }
  }
}
