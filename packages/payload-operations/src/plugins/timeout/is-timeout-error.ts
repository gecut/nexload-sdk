import { CMSClientTimeoutError } from "./cms-client-timeout-error.js";
import { isCMSOperationError } from "../../errors/cms-operation-error.js";

export function isTimeoutError (error: unknown): boolean {
  if (
    error instanceof CMSClientTimeoutError
    || (
      isCMSOperationError(error)
      && !error.defined
      && error.code === "TIMEOUT"
    )
  ) {
    return true;
  }

  return (
    typeof error === "object"
    && error !== null
    && "name" in error
    && error.name === "TimeoutError"
  );
}
