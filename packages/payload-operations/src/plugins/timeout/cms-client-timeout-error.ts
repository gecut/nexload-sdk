import { CMSOperationError } from "../../errors/cms-operation-error.js";

export class CMSClientTimeoutError extends CMSOperationError<
  "TIMEOUT",
  undefined,
  false
> {
  constructor (
    timeout?: number, cause?: unknown
  ) {
    super({
      cause,
      code: "TIMEOUT",
      defined: false,
      message: timeout === undefined
        ? "The request timed out."
        : `The request timed out after ${timeout}ms.`,
      status: 408,
    });
    this.name = "CMSClientTimeoutError";
  }
}
