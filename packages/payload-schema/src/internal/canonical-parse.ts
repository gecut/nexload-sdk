import type { z } from "zod";

import type { AnyCanonicalSchema } from "../types.js";

import { PayloadSchemaError, type SafeIssueSummary } from "../errors.js";

export function errorName (error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}

function isAsyncParseError (error: unknown): boolean {
  return error instanceof Error
    && (error.constructor.name === "$ZodAsyncError" || error.message.includes("Encountered Promise during synchronous parse"));
}

export function issueSummaries (error: z.ZodError): SafeIssueSummary[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path.map((part) => (typeof part === "symbol" ? part.description ?? part.toString() : part)),
    message: issue.message,
  }));
}

export function parseCanonical (
  schema: AnyCanonicalSchema,
  value: unknown,
  context: { entity?: string, fieldPath: string, fieldKind: string }
): ReturnType<AnyCanonicalSchema["safeParse"]> {
  try {
    return schema.safeParse(value);
  } catch (error) {
    if (isAsyncParseError(error)) {
      throw new PayloadSchemaError(
        "ASYNC_CANONICAL_SCHEMA_UNSUPPORTED", {
          phase: "definition",
          message: `Canonical schema for field "${context.fieldPath}" must be synchronous.`,
          data: context,
          cause: error,
        }
      );
    }
    throw error;
  }
}
