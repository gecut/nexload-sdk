import { z } from "zod";

import type {
  CMSOperationContract,
  CMSOperationErrorDefinition
} from "../contract/types.js";
import type { CMSDefinedErrorFactories } from "./types.js";

import { CMSOperationError } from "./cms-operation-error.js";

export function createDefinedErrorFactories<
  TOperation extends CMSOperationContract
> (operation: TOperation): CMSDefinedErrorFactories<TOperation> {
  const factories = Object.create(null) as Record<
    string,
    (options?: {
      cause?: unknown
      data?: unknown
    }) => CMSOperationError<string, unknown, true>
  >;

  for (const [
    code,
    definition
  ] of Object.entries(operation.errors)) {
    Object.defineProperty(
      factories, code, {
        configurable: false,
        enumerable: true,
        value: (options: {
          cause?: unknown
          data?: unknown
        } = {}) => new CMSOperationError({
          cause: options.cause,
          code,
          data: options.data,
          defined: true,
          message: definition.message,
          status: definition.status,
        }),
        writable: false,
      }
    );
  }

  return Object.freeze(factories) as CMSDefinedErrorFactories<TOperation>;
}

export async function validateDefinedError (
  error: CMSOperationError,
  operation: CMSOperationContract
): Promise<CMSOperationError<string, unknown, true> | undefined> {
  if (!error.defined) {
    return undefined;
  }

  const definition = operation.errors[error.code];

  if (
    definition === undefined
    || definition.status !== error.status
    || definition.message !== error.message
  ) {
    return undefined;
  }

  const parsedData = await parseDefinedErrorData(
    definition, error.data
  );

  if (!parsedData.success) {
    return undefined;
  }

  return new CMSOperationError({
    cause: error.cause,
    code: error.code,
    data: parsedData.data,
    defined: true,
    message: definition.message,
    status: definition.status,
  });
}

async function parseDefinedErrorData (
  definition: CMSOperationErrorDefinition<z.ZodType | undefined>,
  data: unknown
): Promise<
  | { data: unknown, success: true }
  | { success: false }
> {
  if (definition.data === undefined) {
    return data === undefined
      ? { data: undefined, success: true, }
      : { success: false, };
  }

  try {
    const encoded = await z.encodeAsync(
      definition.data, data
    );

    return { data: encoded, success: true, };
  } catch {
    return { success: false, };
  }
}
