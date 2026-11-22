import type { PayloadRequest } from "payload";

import { z } from "zod";

import type { CMSOperationContract } from "../contract/types.js";
import type {
  CMSOperationAccess,
  CMSOperationHandler,
  CMSOperationMetadata
} from "./types.js";

import {
  createFrameworkError,
  createInputValidationError,
  createInternalError
} from "../errors/built-in-errors.js";
import { isCMSOperationError } from "../errors/cms-operation-error.js";
import {
  createDefinedErrorFactories,
  validateDefinedError
} from "../errors/defined-error.js";
import { sanitizeZodIssues } from "../errors/validation-error.js";
import { DEFAULT_MAX_BODY_BYTES } from "./constants.js";
import { createErrorResponse, createSuccessResponse } from "./responses.js";

export interface ExecuteOperationOptions {
  access: CMSOperationAccess
  definition: CMSOperationContract
  handler: CMSOperationHandler<CMSOperationContract>
  maxBodyBytes?: number
  metadata: CMSOperationMetadata
  req: PayloadRequest
}

export async function executeOperation (options: ExecuteOperationOptions): Promise<Response> {
  try {
    const allowed = await options.access({
      operation: options.metadata,
      req: options.req,
    });

    if (!allowed) {
      return createErrorResponse(
        options.req, options.req.user
          ? createFrameworkError(
            "FORBIDDEN", "Forbidden"
          )
          : createFrameworkError(
            "UNAUTHORIZED", "Unauthorized"
          )
      );
    }

    const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
    const rawInput = await parseRequestInput(options.req, maxBodyBytes);
    const inputResult = await options.definition.input.safeParseAsync(rawInput);

    if (!inputResult.success) {
      return createErrorResponse(
        options.req, createInputValidationError(
          sanitizeZodIssues(inputResult.error.issues), inputResult.error
        )
      );
    }

    const handlerResult = await options.handler({
      errors: createDefinedErrorFactories(options.definition),
      input: inputResult.data,
      operation: options.metadata,
      req: options.req,
    });
    let encodedOutput: unknown;

    try {
      encodedOutput = await z.encodeAsync(
        options.definition.output, handlerResult
      );
    } catch (error) {
      return createErrorResponse(
        options.req, createInternalError(error)
      );
    }

    return createSuccessResponse(
      options.req, encodedOutput
    );
  } catch (error) {
    return createErrorResponse(
      options.req, await normalizeHandlerError(
        error, options.definition
      )
    );
  }
}

async function parseRequestInput (
  req: PayloadRequest,
  maxBodyBytes: number
): Promise<unknown> {
  const contentLengthHeader = req.headers.get("content-length");

  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader.trim());

    if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
      throw createFrameworkError(
        "PAYLOAD_TOO_LARGE", "Request payload exceeds size limit."
      );
    }
  }

  let body: string;
  const rawBody = req.body as unknown;

  if (
    rawBody !== null
    && rawBody !== undefined
    && typeof (rawBody as { getReader?: unknown }).getReader === "function"
  ) {
    body = await readBodyStream(rawBody as ReadableStream<Uint8Array>, maxBodyBytes);
  } else {
    const readText = req.text as unknown;

    if (typeof readText !== "function") {
      throw createFrameworkError(
        "BAD_REQUEST", "Request body is unavailable."
      );
    }

    body = await (readText as () => Promise<string>).call(req);
    const bodyBytes = typeof Buffer !== "undefined"
      ? Buffer.byteLength(body, "utf8")
      : new TextEncoder().encode(body).byteLength;

    if (bodyBytes > maxBodyBytes) {
      throw createFrameworkError(
        "PAYLOAD_TOO_LARGE", "Request payload exceeds size limit."
      );
    }
  }

  if (body.length === 0) {
    return undefined;
  }

  const contentType = req.headers.get("Content-Type");

  if (
    contentType === null
    || !contentType.toLowerCase().startsWith("application/json")
  ) {
    throw createFrameworkError(
      "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json."
    );
  }

  try {
    return JSON.parse(body) as unknown;
  } catch (error) {
    throw createFrameworkError(
      "BAD_REQUEST", "Malformed JSON request body.", { cause: error, }
    );
  }
}

async function readBodyStream (
  bodyStream: ReadableStream<Uint8Array>,
  maxBodyBytes: number
): Promise<string> {
  const reader = bodyStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunkBytes = toUint8Array(value);
      totalBytes += chunkBytes.byteLength;

      if (totalBytes > maxBodyBytes) {
        try {
          await reader.cancel();
        } catch {
          // Ignore stream cancellation errors
        }
        throw createFrameworkError(
          "PAYLOAD_TOO_LARGE", "Request payload exceeds size limit."
        );
      }

      chunks.push(chunkBytes);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Ignored
    }
  }

  if (chunks.length === 0) {
    return "";
  }

  if (chunks.length === 1) {
    return new TextDecoder().decode(chunks[0]);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const fullBuffer = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(fullBuffer);
}

function toUint8Array (value: unknown): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  throw createFrameworkError(
    "BAD_REQUEST", "Unsupported request body chunk."
  );
}

async function normalizeHandlerError (
  error: unknown,
  operation: CMSOperationContract
) {
  if (isCMSOperationError(error)) {
    if (!error.defined) {
      const safeCodes = new Set([
        "BAD_REQUEST",
        "PAYLOAD_TOO_LARGE",
        "UNSUPPORTED_MEDIA_TYPE"
      ]);

      return safeCodes.has(error.code)
        ? error
        : createInternalError(error);
    }

    const definedError = await validateDefinedError(
      error, operation
    );

    if (definedError !== undefined) {
      return definedError;
    }
  }

  return createInternalError(error);
}
