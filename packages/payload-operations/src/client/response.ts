import { createInternalError } from "../errors/built-in-errors.js";
import { CMSOperationError } from "../errors/cms-operation-error.js";
import { parseErrorEnvelope } from "../errors/error-envelope.js";
import { CMSClientTimeoutError } from "../plugins/timeout/cms-client-timeout-error.js";
import { isTimeoutError } from "../plugins/timeout/is-timeout-error.js";

import type { CMSOperationContract } from "../contract/types.js";
import type { z } from "zod";

export async function parseOperationResponse (
  response: Response,
  operation: CMSOperationContract
): Promise<unknown> {
  if (!response.ok) {
    throw await parseFailureResponse(
      response, operation
    );
  }

  try {
    const value = response.status === 204
      ? undefined
      : await response.json();
    const result = await operation.output.safeParseAsync(value);

    if (!result.success) {
      throw createInternalError(result.error);
    }

    return result.data;
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new CMSClientTimeoutError(
        undefined, error
      );
    }

    if (error instanceof CMSOperationError) {
      throw error;
    }

    throw createInternalError(error);
  }
}

async function parseFailureResponse (
  response: Response,
  operation: CMSOperationContract
): Promise<CMSOperationError> {
  let value: unknown;

  try {
    value = await response.json();
  } catch (error) {
    if (isTimeoutError(error)) {
      return new CMSClientTimeoutError(
        undefined, error
      );
    }

    return createInternalError(error);
  }

  const envelope = parseErrorEnvelope(value);
  if (
    envelope === undefined
    || envelope.status !== response.status
  ) {
    return createInternalError(value);
  }

  if (!envelope.defined) {
    return new CMSOperationError({
      code: envelope.code,
      data: envelope.data,
      defined: false,
      message: envelope.message,
      status: envelope.status,
    });
  }

  const definition = operation.errors[envelope.code];
  if (
    definition === undefined
    || definition.status !== envelope.status
    || definition.message !== envelope.message
  ) {
    return createInternalError(value);
  }

  const data = await parseDefinedData(
    definition.data, envelope.data
  );
  if (!data.success) {
    return createInternalError(value);
  }

  return new CMSOperationError({
    code: envelope.code,
    data: data.data,
    defined: true,
    message: definition.message,
    status: definition.status,
  });
}

async function parseDefinedData (
  schema: z.ZodType | undefined,
  value: unknown
): Promise<
  | { data: unknown, success: true }
  | { success: false }
> {
  if (schema === undefined) {
    return value === undefined
      ? { data: undefined, success: true, }
      : { success: false, };
  }

  const result = await schema.safeParseAsync(value);
  return result.success
    ? { data: result.data, success: true, }
    : { success: false, };
}
