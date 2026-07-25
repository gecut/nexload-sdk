import { isRecord } from "../contract/validation.js";

import type { CMSOperationError } from "./cms-operation-error.js";
import type { CMSOperationErrorJSON } from "./types.js";

export function parseErrorEnvelope (value: unknown): CMSOperationErrorJSON | undefined {
  if (
    !isRecord(value)
    || typeof value.code !== "string"
    || typeof value.defined !== "boolean"
    || typeof value.message !== "string"
    || typeof value.status !== "number"
    || !Number.isInteger(value.status)
    || value.status < 400
    || value.status > 599
  ) {
    return undefined;
  }

  return {
    code: value.code,
    data: value.data,
    defined: value.defined,
    message: value.message,
    status: value.status,
  };
}

export function serializeOperationError (error: CMSOperationError): CMSOperationErrorJSON {
  const serialized: CMSOperationErrorJSON = {
    code: error.code,
    defined: error.defined,
    message: error.message,
    status: error.status,
  };

  if (error.data !== undefined) {
    serialized.data = error.data;
  }

  return serialized;
}
