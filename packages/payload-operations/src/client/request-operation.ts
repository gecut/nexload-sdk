import { createOperationInit } from "./headers.js";
import { parseOperationResponse } from "./response.js";
import { joinOperationURL } from "./url.js";
import {
  createFrameworkError,
  createInputValidationError
} from "../errors/built-in-errors.js";
import { sanitizeZodIssues } from "../errors/validation-error.js";

import type {
  CMSOperationCallOptions,
  CMSOperationContract
} from "../contract/types.js";
import type { CMSClientTransport } from "../transport/types.js";

export interface RequestOperationOptions {
  baseInit?: RequestInit
  baseURL: string
  callOptions?: CMSOperationCallOptions
  definition: CMSOperationContract
  input: unknown
  name: string
  path: string
  transport: CMSClientTransport
}

export async function requestOperation (options: RequestOperationOptions): Promise<unknown> {
  const inputResult = await options.definition.input.safeParseAsync(options.input);

  if (!inputResult.success) {
    throw createInputValidationError(
      sanitizeZodIssues(inputResult.error.issues), inputResult.error
    );
  }

  let body: string | undefined;

  try {
    body = inputResult.data === undefined
      ? undefined
      : JSON.stringify(inputResult.data);
  } catch (error) {
    throw createFrameworkError(
      "BAD_REQUEST", "Operation input is not JSON serializable.", { cause: error, }
    );
  }

  const response = await options.transport({
    init: createOperationInit(
      options.baseInit, options.callOptions, body
    ),
    operation: {
      name: options.name,
      path: options.path,
    },
    source: "operation",
    url: joinOperationURL(
      options.baseURL, options.path
    ),
  });

  return parseOperationResponse(
    response, options.definition
  );
}
