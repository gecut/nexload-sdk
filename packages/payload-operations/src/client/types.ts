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
import type { PayloadSDK } from "@payloadcms/sdk";
import type {
  PayloadTypes,
  PayloadTypesShape
} from "payload";

export interface CMSPayloadClientOptions {
  baseInit?: RequestInit
  baseURL: string
  fetch?: typeof fetch
}

export interface CMSClientOptions<
  TOperations extends CMSOperationsTree
> {
  basePath?: string
  operations: TOperations
  payload: CMSPayloadClientOptions
  plugins?: readonly CMSClientPlugin[]
}

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

export interface CMSClient<
  TPayloadConfig extends PayloadTypesShape = PayloadTypes,
  TOperations extends CMSOperationsTree = CMSOperationsTree
> {
  readonly operations: InferOperationsClient<TOperations>
  readonly payload: PayloadSDK<TPayloadConfig>
}

export type {
  CMSClientPlugin,
  CMSClientTransport,
  CMSClientTransportRequest
} from "../transport/types.js";
