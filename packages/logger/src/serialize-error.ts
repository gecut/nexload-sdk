/* eslint-disable turbo/no-undeclared-env-vars -- Runtime controls stack visibility. */
export function serializeError(error: unknown, depth = 0): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { type: typeof error, message: String(error).slice(0, 500) };
  }

  const result: Record<string, unknown> = {
    type: error.name,
    message: error.message.slice(0, 500),
  };
  const code = (error as Error & { code?: unknown }).code;

  if (typeof code === "string" && /^[A-Z][A-Z0-9_]{1,99}$/.test(code)) result.code = code;
  if (process.env.NODE_ENV !== "production" && error.stack) result.stack = error.stack;
  if (error.cause !== undefined && depth < 2) result.cause = serializeError(error.cause, depth + 1);

  return result;
}
