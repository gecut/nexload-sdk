import { requestOperation } from "./request-operation.js";
import { flattenCMSOperations } from "../contract/traversal.js";

import type { InferOperationsClient } from "./types.js";
import type {
  CMSOperationCallOptions,
  CMSOperationPromise,
  CMSOperationsTree
} from "../contract/types.js";
import type { CMSDefinedOperationError } from "../errors/types.js";
import type { CMSClientTransport } from "../transport/types.js";

export function createOperationsClient<
  TOperations extends CMSOperationsTree
> (
  operations: TOperations,
  options: {
    baseInit?: RequestInit
    basePath?: string
    baseURL: string
    transport: CMSClientTransport
  }
): InferOperationsClient<TOperations> {
  const client = Object.create(null) as Record<string, unknown>;
  const flattened = flattenCMSOperations(
    operations, options.basePath
  );

  for (const item of flattened) {
    defineOperationMethod(
      client, item.segments, (
        input, callOptions
      ) => requestOperation({
        baseInit: options.baseInit,
        baseURL: options.baseURL,
        callOptions,
        definition: item.definition,
        input,
        name: item.name,
        path: item.path,
        transport: options.transport,
      }) as CMSOperationPromise<unknown, CMSDefinedOperationError>
    );
  }

  return freezeTree(client) as InferOperationsClient<TOperations>;
}

function defineOperationMethod (
  root: Record<string, unknown>,
  segments: readonly string[],
  method: (
    input: unknown,
    options?: CMSOperationCallOptions
  ) => Promise<unknown>
): void {
  let current = root;

  for (const segment of segments.slice(
    0, -1
  )) {
    const existing = current[segment];

    if (existing !== undefined) {
      current = existing as Record<string, unknown>;
      continue;
    }

    const namespace = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(
      current, segment, {
        configurable: false,
        enumerable: true,
        value: namespace,
        writable: false,
      }
    );
    current = namespace;
  }

  const operationName = segments.at(-1);
  if (operationName === undefined) {
    throw new TypeError("Operation path must not be empty.");
  }

  Object.defineProperty(
    current, operationName, {
      configurable: false,
      enumerable: true,
      value: method,
      writable: false,
    }
  );
}

function freezeTree<T extends Record<string, unknown>> (node: T): T {
  for (const value of Object.values(node)) {
    if (
      typeof value === "object"
      && value !== null
    ) {
      freezeTree(value as Record<string, unknown>);
    }
  }

  return Object.freeze(node);
}
