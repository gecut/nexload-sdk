import type {
  CMSOperationContract,
  CMSOperationsTree,
  InferHandlerOutput,
  InferParsedOperationInput
} from "../contract/types.js";
import type { CMSDefinedErrorFactories } from "../errors/types.js";
import type {
  Endpoint,
  PayloadRequest
} from "payload";

export interface CMSOperationMetadata<
  TOperation extends CMSOperationContract = CMSOperationContract
> {
  readonly definition: TOperation
  readonly name: string
  readonly path: string
}

export interface CMSOperationAccessContext<
  TOperation extends CMSOperationContract = CMSOperationContract
> {
  readonly operation: CMSOperationMetadata<TOperation>
  readonly req: PayloadRequest
}

export type CMSOperationAccess<
  TOperation extends CMSOperationContract = CMSOperationContract
> = (
  context: CMSOperationAccessContext<TOperation>
) => boolean | Promise<boolean>;

export interface CMSOperationHandlerContext<
  TOperation extends CMSOperationContract
> {
  readonly errors: CMSDefinedErrorFactories<TOperation>
  readonly input: InferParsedOperationInput<TOperation>
  readonly operation: CMSOperationMetadata<TOperation>
  readonly req: PayloadRequest
}

export type CMSOperationHandler<
  TOperation extends CMSOperationContract
> = (
  context: CMSOperationHandlerContext<TOperation>
) => Promise<InferHandlerOutput<TOperation>>;

export type CMSOperationHandlers<TOperations extends CMSOperationsTree> = {
  readonly [TKey in keyof TOperations]:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationHandler<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? CMSOperationHandlers<TOperations[TKey]>
      : never;
};

export type CMSOperationAccessOverrides<
  TOperations extends CMSOperationsTree
> = {
  readonly [TKey in keyof TOperations]?:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationAccess<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? CMSOperationAccessOverrides<TOperations[TKey]>
      : never;
};

export interface CreatePayloadEndpointsOptions<
  TOperations extends CMSOperationsTree
> {
  access?: {
    default?: CMSOperationAccess
    overrides?: CMSOperationAccessOverrides<TOperations>
  }
  basePath?: string
  handlers: CMSOperationHandlers<TOperations>
  operations: TOperations
}

export type PayloadOperationEndpoints = readonly Endpoint[];
