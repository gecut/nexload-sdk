import {
  flattenCMSOperations,
  isCMSOperation
} from "./traversal.js";

import type { CMSOperationsTree } from "./types.js";

export function defineCMSOperations<const TOperations extends CMSOperationsTree> (operations: TOperations): TOperations {
  flattenCMSOperations(operations);
  return freezeOperationsTree(operations);
}

function freezeOperationsTree<TTree extends CMSOperationsTree> (tree: TTree): TTree {
  for (const value of Object.values(tree)) {
    if (!isCMSOperation(value)) {
      freezeOperationsTree(value);
    }
  }

  return Object.freeze(tree);
}
