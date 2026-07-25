import type { CMSValidationErrorData } from "./types.js";
import type { z } from "zod";

export function sanitizeZodIssues (issues: readonly z.core.$ZodIssue[]): CMSValidationErrorData["issues"] {
  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.map((segment) => (typeof segment === "symbol"
      ? segment.description ?? "symbol"
      : segment)),
  }));
}
