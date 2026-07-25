import type { CMSOperationError } from "./cms-operation-error.js";
import type {
  CMSOperationContract,
  CMSOperationErrorDefinition
} from "../contract/types.js";
import type { z } from "zod";

export interface CMSOperationErrorJSON {
  code: string
  data?: unknown
  defined: boolean
  message: string
  status: number
}

export interface CMSValidationErrorData {
  issues: Array<{
    code?: string
    message: string
    path: Array<number | string>
  }>
}

type DefinedErrorFromDefinition<
  TCode extends string,
  TDefinition extends CMSOperationErrorDefinition
> = TDefinition extends { readonly data: infer TSchema extends z.ZodType }
  ? CMSOperationError<TCode, z.output<TSchema>, true>
  : CMSOperationError<TCode, undefined, true>;

export type CMSDefinedOperationError<
  TOperation extends CMSOperationContract = CMSOperationContract
> = {
  [TCode in keyof TOperation["errors"] & string]: DefinedErrorFromDefinition<
    TCode,
    TOperation["errors"][TCode]
  >;
}[keyof TOperation["errors"] & string];

type ErrorFactoryFromDefinition<
  TCode extends string,
  TDefinition extends CMSOperationErrorDefinition
> = TDefinition extends { readonly data: infer TSchema extends z.ZodType }
  ? (options: {
    cause?: unknown
    data: z.input<TSchema>
  }) => CMSOperationError<TCode, z.input<TSchema>, true>
  : (
    options?: { cause?: unknown }
  ) => CMSOperationError<TCode, undefined, true>;

export type CMSDefinedErrorFactories<
  TOperation extends CMSOperationContract
> = {
  readonly [TCode in keyof TOperation["errors"] & string]:
  ErrorFactoryFromDefinition<TCode, TOperation["errors"][TCode]>;
};

export type CMSSafeResult<TData, TDefinedError>
  = | readonly [error: null, data: TData, isDefined: false]
    | readonly [
      error: TDefinedError,
      data: undefined,
      isDefined: true
    ]
    | readonly [error: unknown, data: undefined, isDefined: false];
