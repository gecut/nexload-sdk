/**
 * src/client/UndiciHttpClient.ts
 *
 * Implements BaseHttpClient using ConnectionPoolManager + undici.Pool.request
 * - returns Web-compatible Response objects
 * - fallback to global fetch when undici call fails
 *
 * Micro-optimizations:
 * - avoid creating multiple URL instances in the hot path
 * - keep conversion work minimal and synchronous where possible
 */

import { Dispatcher } from "undici";

import { BaseHttpClient } from "../base/base-client";
import { ConnectionPoolManager } from "../pool/connection-manager";

export class UndiciHttpClient extends BaseHttpClient {
  private readonly poolManager: ConnectionPoolManager;

  // Allow DI of poolManager for testing
  constructor (poolManager?: ConnectionPoolManager) {
    super();
    this.poolManager = poolManager ?? ConnectionPoolManager.getInstance();
  }

  public async fetch (
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> {
    const { url, method, headers, body, } = await this.extractRequestData(
      input, init
    );

    // Reuse a single URL instance to avoid repeated parsing
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

      // read body once as ArrayBuffer
      const arrayBuf = await resStream.arrayBuffer();

      // Build Response (Web API)
      const response = new Response(
        arrayBuf, {
          status: statusCode,
          statusText: this.getStatusText(statusCode),
          headers: new Headers(resHeaders as HeadersInit),
        }
      );

      return response;
    } catch (err) {
      // Detailed but concise error handling
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.debug(
        { url, method, }, `Undici fetch failed: ${errorMessage}`
      );

      // fallback headers
      const fallbackHeaders = {
        ...((headers as Record<string, string>) ?? {}),
        "X-Fallback-Fetch": "true",
        "X-Original-Error": errorMessage,
        "X-Service": "nexload-web-fallback",
      };

      // Use global fetch as fallback (keeps behavior consistent)
      // Note: keep method and merged headers to preserve intent
      // Avoid awaiting extra work here beyond returning the fetch Promise
      return fetch(
        input, { ...init, method, headers: fallbackHeaders, }
      );
    }
  }
}
