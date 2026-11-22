import type {
  CMSOperationCallOptions,
  CMSOperationContract,
  CMSOperationPromise,
  CMSOperationsTree,
  InferOperationInput,
  InferOperationOutput
} from "../contract/types.js";
import type { CMSDefinedOperationError } from "../errors/types.js";
import type { CMSClientPlugin } from "../transport/types.js";

export interface OperationsClientOptions<
  TOperations extends CMSOperationsTree = CMSOperationsTree
> {
  baseInit?: RequestInit
  basePath?: string
  baseURL: string
  fetch?: typeof fetch
  operations: TOperations
  plugins?: readonly CMSClientPlugin[]
}

export type CreateOperationsClientOptions<
  TOperations extends CMSOperationsTree = CMSOperationsTree
> = OperationsClientOptions<TOperations>;

type CMSOperationMethod<TOperation extends CMSOperationContract> = (
  input: InferOperationInput<TOperation>,
  options?: CMSOperationCallOptions
) => CMSOperationPromise<
  InferOperationOutput<TOperation>,
  CMSDefinedOperationError<TOperation>
>;

export type InferOperationsClient<TOperations extends CMSOperationsTree> = {
  readonly [TKey in keyof TOperations]:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationMethod<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? InferOperationsClient<TOperations[TKey]>
      : never;
};

export type {
  CMSClientPlugin,
  CMSClientTransport,
  CMSClientTransportRequest
} from "../transport/types.js";
