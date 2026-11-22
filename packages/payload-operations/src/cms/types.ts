import type { PayloadSDK } from "@payloadcms/sdk";
import type {
  PayloadTypes,
  PayloadTypesShape
} from "payload";

import type { InferOperationsClient } from "../client/types.js";
import type { CMSOperationsTree } from "../contract/types.js";
import type {
  CMSClientPlugin,
  CMSClientTransport,
  CMSClientTransportRequest
} from "../transport/types.js";

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
  CMSClientTransportRequest,
  InferOperationsClient
};
