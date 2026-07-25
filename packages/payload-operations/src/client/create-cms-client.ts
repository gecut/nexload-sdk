import { PayloadSDK } from "@payloadcms/sdk";

import { createOperationsClient } from "./create-operations-client.js";
import { assertAndNormalizeBaseURL } from "./url.js";
import { composeClientPlugins } from "../transport/compose-plugins.js";
import { createFetchTransport } from "../transport/fetch-transport.js";

import type {
  CMSClient,
  CMSClientOptions
} from "./types.js";
import type { CMSOperationsTree } from "../contract/types.js";
import type { CMSClientTransport } from "../transport/types.js";
import type {
  PayloadTypes,
  PayloadTypesShape
} from "payload";

export function createCMSClient<
  TPayloadConfig extends PayloadTypesShape = PayloadTypes,
  const TOperations extends CMSOperationsTree = CMSOperationsTree
> (options: CMSClientOptions<TOperations>): CMSClient<TPayloadConfig, TOperations> {
  const baseURL = assertAndNormalizeBaseURL(options.payload.baseURL);
  const terminal = createFetchTransport(options.payload.fetch);
  const transport = composeClientPlugins(
    terminal, options.plugins ?? []
  );
  const sdkFetch = createPayloadFetchAdapter(transport);
  const payload = new PayloadSDK<TPayloadConfig>({
    baseInit: options.payload.baseInit,
    baseURL,
    fetch: sdkFetch,
  });
  const operations = createOperationsClient(
    options.operations, {
      baseInit: options.payload.baseInit,
      basePath: options.basePath,
      baseURL,
      transport,
    }
  );

  return Object.freeze({
    operations,
    payload,
  });
}

function createPayloadFetchAdapter (transport: CMSClientTransport): typeof fetch {
  return (
    input, init
  ) => transport({
    init: init ?? {},
    source: "payload",
    url: typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
  });
}
