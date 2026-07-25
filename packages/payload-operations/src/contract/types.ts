import type {
  CMS_OPERATION_PROMISE_ERROR_SYMBOL,
  CMS_OPERATION_SYMBOL
} from "../internal/symbols.js";
import type { z } from "zod";

export type CMSOperationErrorDefinition<
  TDataSchema extends z.ZodType | undefined = z.ZodType | undefined
> = Readonly<{
  data?: TDataSchema
  message: string
  status: number
}>;

export type CMSOperationErrorDefinitions = Readonly<
  Record<string, CMSOperationErrorDefinition<z.ZodType | undefined>>
>;

export interface CMSOperation<
  TInputSchema extends z.ZodType = z.ZodType,
  TOutputSchema extends z.ZodType = z.ZodType,
  TErrors extends CMSOperationErrorDefinitions = CMSOperationErrorDefinitions
> {
  readonly [CMS_OPERATION_SYMBOL]: true
  readonly errors: TErrors
  readonly input: TInputSchema
  readonly output: TOutputSchema
}

export type CMSOperationContract = CMSOperation;

export type CMSOperationsTree = Readonly<{ [key: string]: CMSOperationContract | CMSOperationsTree }>;

export type CMSOperationCallOptions = Omit<RequestInit, "body" | "method">;

export type CMSOperationPromise<TData, TError> = Promise<TData> & { readonly [CMS_OPERATION_PROMISE_ERROR_SYMBOL]?: TError };

export type InferOperationInput<TOperation extends CMSOperationContract>
  = z.input<TOperation["input"]>;

export type InferParsedOperationInput<
  TOperation extends CMSOperationContract
> = z.output<TOperation["input"]>;

export type InferOperationOutput<TOperation extends CMSOperationContract>
  = z.output<TOperation["output"]>;

export type InferHandlerOutput<TOperation extends CMSOperationContract>
  = z.input<TOperation["output"]>;
