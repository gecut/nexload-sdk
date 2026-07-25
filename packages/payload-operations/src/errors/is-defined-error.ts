import { isCMSOperationError } from "./cms-operation-error.js";

import type { CMSOperationError } from "./cms-operation-error.js";

export function isDefinedError<
  TError extends CMSOperationError<string, unknown, true>
> (error: TError): error is TError;

export function isDefinedError<
  TError extends CMSOperationError<string, unknown, true>,
  TCode extends TError["code"]
> (
  error: TError,
  code: TCode
): error is Extract<TError, { code: TCode }>;

export function isDefinedError (
  error: unknown,
  code?: string
): error is CMSOperationError<string, unknown, true>;

export function isDefinedError (
  error: unknown,
  code?: string
): error is CMSOperationError<string, unknown, true> {
  return (
    isCMSOperationError(error)
    && error.defined
    && (code === undefined || error.code === code)
  );
}
