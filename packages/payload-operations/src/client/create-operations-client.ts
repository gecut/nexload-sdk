import type { CMSOperationsTree } from "../contract/types.js";
import type {
  InferOperationsClient,
  OperationsClientOptions
} from "./types.js";

import { composeClientPlugins } from "../transport/compose-plugins.js";
import { createFetchTransport } from "../transport/fetch-transport.js";
import { buildOperationsClient } from "./build-operations-client.js";
import { assertAndNormalizeBaseURL } from "./url.js";

export function createOperationsClient<
  const TOperations extends CMSOperationsTree = CMSOperationsTree
> (
  options: OperationsClientOptions<TOperations>
): InferOperationsClient<TOperations> {
  const baseURL = assertAndNormalizeBaseURL(options.baseURL);
  const terminal = createFetchTransport(options.fetch);
  const transport = composeClientPlugins(
    terminal, options.plugins ?? []
  );

  return buildOperationsClient(
    options.operations, {
      baseInit: options.baseInit,
      basePath: options.basePath ?? "/operations",
      baseURL,
      transport,
    }
  );
}
