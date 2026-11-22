import { z } from "zod";

import type { AnyCanonicalSchema } from "../core/types.js";
import type { FieldSeed } from "./field-definition.js";

export function compositeChildSchema (seed: FieldSeed): AnyCanonicalSchema {
  if (!seed.schema) {
    throw new Error("Cannot build composite child schema without canonical schema.");
  }

  if (seed.required === true) {
    return seed.schema;
  }

  const isAlreadyNullable = seed.nullable === true
    || seed.schema instanceof z.ZodNullable
    || (typeof (seed.schema as { isNullable?: () => boolean }).isNullable === "function"
      && (seed.schema as { isNullable: () => boolean }).isNullable());

  const nullableSchema = isAlreadyNullable ? seed.schema : seed.schema.nullable();

  return nullableSchema.optional();
}
