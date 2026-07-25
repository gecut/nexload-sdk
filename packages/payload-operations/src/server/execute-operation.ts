import { createErrorResponse, createSuccessResponse } from "./responses.js";
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

import type {
  CMSOperationAccess,
  CMSOperationHandler,
  CMSOperationMetadata
} from "./types.js";
import type { CMSOperationContract } from "../contract/types.js";
import type { PayloadRequest } from "payload";

export interface ExecuteOperationOptions {
  access: CMSOperationAccess
  definition: CMSOperationContract
  handler: CMSOperationHandler<CMSOperationContract>
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

    const rawInput = await parseRequestInput(options.req);
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
    const outputResult = await options.definition.output.safeParseAsync(handlerResult);

    if (!outputResult.success) {
      return createErrorResponse(
        options.req, createInternalError(outputResult.error)
      );
    }

    return createSuccessResponse(
      options.req, handlerResult
    );
  } catch (error) {
    return createErrorResponse(
      options.req, await normalizeHandlerError(
        error, options.definition
      )
    );
  }
}

async function parseRequestInput (req: PayloadRequest): Promise<unknown> {
  const contentType = req.headers.get("Content-Type");
  const readText = req.text;

  if (typeof readText !== "function") {
    throw createFrameworkError(
      "BAD_REQUEST", "Request body is unavailable."
    );
  }

  const body = await readText.call(req);

  if (body.length === 0) {
    return undefined;
  }

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

async function normalizeHandlerError (
  error: unknown,
  operation: CMSOperationContract
) {
  if (isCMSOperationError(error)) {
    if (!error.defined) {
      const safeCodes = new Set([
        "BAD_REQUEST",
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
