import { headersWithCors } from "payload";

import { serializeOperationError } from "../errors/error-envelope.js";

import type { CMSOperationError } from "../errors/cms-operation-error.js";
import type { PayloadRequest } from "payload";

export function createErrorResponse (
  req: PayloadRequest,
  error: CMSOperationError
): Response {
  const headers = createCorsHeaders(
    req, true
  );

  return Response.json(
    serializeOperationError(error), {
      headers,
      status: error.status,
    }
  );
}

export function createSuccessResponse (
  req: PayloadRequest,
  data: unknown
): Response {
  if (data === undefined) {
    return new Response(
      null, {
        headers: createCorsHeaders(
          req, false
        ),
        status: 204,
      }
    );
  }

  return Response.json(
    data, {
      headers: createCorsHeaders(
        req, true
      ),
      status: 200,
    }
  );
}

export function createPreflightResponse (req: PayloadRequest): Response {
  return new Response(
    null, {
      headers: createCorsHeaders(
        req, false
      ),
      status: 204,
    }
  );
}

function createCorsHeaders (
  req: PayloadRequest,
  json: boolean
): Headers {
  const headers = new Headers();

  if (json) {
    headers.set(
      "Content-Type", "application/json"
    );
  }

  return headersWithCors({
    headers,
    req,
  });
}
