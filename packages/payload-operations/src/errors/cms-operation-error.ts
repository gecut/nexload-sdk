import { CMS_OPERATION_ERROR_SYMBOL } from "../internal/symbols.js";

export interface CMSOperationErrorOptions<
  TCode extends string,
  TData,
  TDefined extends boolean
> {
  cause?: unknown
  code: TCode
  data?: TData
  defined: TDefined
  message: string
  status: number
}

export class CMSOperationError<
  TCode extends string = string,
  TData = unknown,
  TDefined extends boolean = boolean
> extends Error {
  readonly [CMS_OPERATION_ERROR_SYMBOL] = true;

  readonly code: TCode;

  readonly data: TData;

  readonly defined: TDefined;

  readonly status: number;

  constructor (options: CMSOperationErrorOptions<TCode, TData, TDefined>) {
    super(
      options.message, { cause: options.cause, }
    );
    this.name = "CMSOperationError";
    this.code = options.code;
    this.data = options.data as TData;
    this.defined = options.defined;
    this.status = options.status;
    Object.setPrototypeOf(
      this, new.target.prototype
    );
  }
}

export function isCMSOperationError (error: unknown): error is CMSOperationError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as Partial<CMSOperationError>;

  return (
    candidate[CMS_OPERATION_ERROR_SYMBOL] === true
    && typeof candidate.code === "string"
    && typeof candidate.defined === "boolean"
    && typeof candidate.message === "string"
    && typeof candidate.status === "number"
  );
}
