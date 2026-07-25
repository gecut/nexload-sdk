import { isDefinedError } from "./is-defined-error.js";
import { CMS_OPERATION_PROMISE_ERROR_SYMBOL } from "../internal/symbols.js";

import type { CMSSafeResult } from "./types.js";

type AwaitedData<TPromise> = TPromise extends PromiseLike<infer TData>
  ? Awaited<TData>
  : never;

type DefinedError<TPromise> = TPromise extends { readonly [CMS_OPERATION_PROMISE_ERROR_SYMBOL]?: infer TError }
  ? TError
  : never;

export async function safe<const TPromise extends PromiseLike<unknown>> (promise: TPromise): Promise<CMSSafeResult<AwaitedData<TPromise>, DefinedError<TPromise>>> {
  try {
    const data = await promise;

    return [
      null,
      data as AwaitedData<TPromise>,
      false
    ];
  } catch (error) {
    if (isDefinedError(error)) {
      return [
        error as DefinedError<TPromise>,
        undefined,
        true
      ];
    }

    return [
      error,
      undefined,
      false
    ];
  }
}
