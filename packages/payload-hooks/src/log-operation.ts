import logger from "@nexload-sdk/logger";

import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
} from "payload";

type HookType = "beforeChange" | "afterChange" | "afterDelete" | "afterRead";

type HookReturnType<T extends HookType> = T extends "beforeChange"
  ? CollectionBeforeChangeHook
  : T extends "afterChange"
    ? CollectionAfterChangeHook
    : T extends "afterDelete"
      ? CollectionAfterDeleteHook
      : T extends "afterRead"
        ? CollectionAfterReadHook
        : never;

export const logOperation = <
  THookType extends HookType,
  TReturn extends HookReturnType<THookType>,
>(
  hookType: THookType
): TReturn => {
  const hook: TReturn = ((args: any) => {
    const collectionName = args.collection?.slug || args.collection;

    logger.info({ collection: collectionName }, hookType);

    if ("data" in args && args.data) return args.data;
    if ("doc" in args && args.doc) return args.doc;

    return null as any;
  }) as TReturn;

  return hook;
};
