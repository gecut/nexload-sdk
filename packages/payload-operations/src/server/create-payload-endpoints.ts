import { executeOperation } from "./execute-operation.js";
import { createPreflightResponse } from "./responses.js";
import {
  assertTreeLeaves,
  getTreeValue
} from "./tree.js";
import { flattenCMSOperations } from "../contract/traversal.js";

import type {
  CMSOperationAccess,
  CMSOperationHandler,
  CreatePayloadEndpointsOptions
} from "./types.js";
import type {
  CMSOperationContract,
  CMSOperationsTree
} from "../contract/types.js";
import type { Endpoint } from "payload";

const DEFAULT_ACCESS: CMSOperationAccess = ({ req, }) => Boolean(req.user);

export function createPayloadEndpoints<
  const TOperations extends CMSOperationsTree
> (options: CreatePayloadEndpointsOptions<TOperations>): Endpoint[] {
  const flattened = flattenCMSOperations(
    options.operations, options.basePath
  );
  const operationNames = new Set(flattened.map(({ name, }) => name));

  assertTreeLeaves(
    options.handlers, operationNames, "handler", false
  );

  if (options.access?.overrides !== undefined) {
    assertTreeLeaves(
      options.access.overrides, operationNames, "access override", true
    );
  }

  return flattened.flatMap((item): Endpoint[] => {
    const handler = getTreeValue(
      options.handlers, item.segments
    );
    const accessOverride = getTreeValue(
      options.access?.overrides, item.segments
    );

    if (typeof handler !== "function") {
      throw new TypeError(`Missing handler leaf: ${item.name}`);
    }

    if (
      accessOverride !== undefined
      && typeof accessOverride !== "function"
    ) {
      throw new TypeError(`Invalid access override leaf: ${item.name}`);
    }

    const access = (
      accessOverride
      ?? options.access?.default
      ?? DEFAULT_ACCESS
    ) as CMSOperationAccess;
    const metadata = Object.freeze({
      definition: item.definition,
      name: item.name,
      path: item.path,
    });

    return [
      {
        handler: (req) => createPreflightResponse(req),
        method: "options",
        path: item.path,
      },
      {
        handler: (req) => executeOperation({
          access,
          definition: item.definition,
          handler: handler as CMSOperationHandler<CMSOperationContract>,
          metadata,
          req,
        }),
        method: "post",
        path: item.path,
      }
    ];
  });
}
