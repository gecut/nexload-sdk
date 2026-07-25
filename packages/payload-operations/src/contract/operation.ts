import {
  assertErrorDefinitions,
  isRecord
} from "./validation.js";
import { CMS_OPERATION_SYMBOL } from "../internal/symbols.js";

import type {
  CMSOperation,
  CMSOperationErrorDefinitions
} from "./types.js";
import type { z } from "zod";

const EMPTY_ERRORS = Object.freeze({});

export function operation<
  const TInput extends z.ZodType,
  const TOutput extends z.ZodType,
  const TErrors extends CMSOperationErrorDefinitions = Readonly<
    Record<string, never>
  >
> (definition: {
  errors?: TErrors
  input: TInput
  output: TOutput
}): CMSOperation<TInput, TOutput, TErrors> {
  if (!isRecord(definition)) {
    throw new TypeError("Operation definition must be an object.");
  }

  assertSchema(
    definition.input, "input"
  );
  assertSchema(
    definition.output, "output"
  );

  const errors = (definition.errors ?? EMPTY_ERRORS) as TErrors;
  assertErrorDefinitions(errors);

  return Object.freeze({
    [CMS_OPERATION_SYMBOL]: true as const,
    errors,
    input: definition.input,
    output: definition.output,
  });
}

function assertSchema (
  value: unknown, property: string
): asserts value is z.ZodType {
  if (
    !isRecord(value)
    || typeof value.safeParseAsync !== "function"
  ) {
    throw new TypeError(`Operation ${property} must be a Zod schema.`);
  }
}
