import type {
  PayloadTypes,
  PayloadTypesShape
} from "payload";

import { PayloadSDK } from "@payloadcms/sdk";

import type { CMSOperationsTree } from "../contract/types.js";
import type { CMSClientTransport } from "../transport/types.js";
import type {
  CMSClient,
  CMSClientOptions
} from "./types.js";

import { buildOperationsClient } from "../client/build-operations-client.js";
import { assertAndNormalizeBaseURL } from "../client/url.js";
import { composeClientPlugins } from "../transport/compose-plugins.js";
import { createFetchTransport } from "../transport/fetch-transport.js";

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
  const operations = buildOperationsClient(
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

export function createPayloadFetchAdapter (transport: CMSClientTransport): typeof fetch {
  return (
    input, init
  ) => {
    let url: string;
    let requestInit: RequestInit;

    if (typeof input === "string") {
      url = input;
      requestInit = init ?? {};
    } else if (input instanceof URL) {
      url = input.href;
      requestInit = init ?? {};
    } else {
      url = input.url;
      const fromRequest: RequestInit = {
        body: input.body,
        credentials: input.credentials,
        headers: input.headers,
        method: input.method,
        signal: input.signal,
      };
      requestInit = {
        ...fromRequest,
        ...init,
      };
    }

    return transport({
      init: requestInit,
      source: "payload",
      url,
    });
  };
}
