import { CMSOperationError } from "./cms-operation-error.js";

import type { CMSValidationErrorData } from "./types.js";

export const BUILT_IN_ERROR_STATUS = Object.freeze({
  BAD_GATEWAY: 502,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  FORBIDDEN: 403,
  GATEWAY_TIMEOUT: 504,
  INPUT_VALIDATION_FAILED: 422,
  INTERNAL_SERVER_ERROR: 500,
  METHOD_NOT_SUPPORTED: 405,
  NOT_FOUND: 404,
  NOT_IMPLEMENTED: 501,
  OUTPUT_VALIDATION_FAILED: 500,
  PAYLOAD_TOO_LARGE: 413,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  UNAUTHORIZED: 401,
  UNSUPPORTED_MEDIA_TYPE: 415,
});

export function createFrameworkError<
  const TCode extends keyof typeof BUILT_IN_ERROR_STATUS,
  TData = undefined
> (
  code: TCode,
  message: string,
  options: {
    cause?: unknown
    data?: TData
  } = {}
): CMSOperationError<TCode, TData, false> {
  return new CMSOperationError({
    cause: options.cause,
    code,
    data: options.data as TData,
    defined: false,
    message,
    status: BUILT_IN_ERROR_STATUS[code],
  });
}

export function createInputValidationError (
  issues: CMSValidationErrorData["issues"],
  cause?: unknown
): CMSOperationError<
  "INPUT_VALIDATION_FAILED",
  CMSValidationErrorData,
  false
> {
  return createFrameworkError(
    "INPUT_VALIDATION_FAILED", "Input validation failed.", {
      cause,
      data: { issues, },
    }
  );
}

export function createInternalError (cause?: unknown): CMSOperationError<"INTERNAL_SERVER_ERROR", undefined, false> {
  return createFrameworkError(
    "INTERNAL_SERVER_ERROR", "Internal Server Error", { cause, }
  );
}
