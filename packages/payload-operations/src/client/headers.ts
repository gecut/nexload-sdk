export function createOperationInit (
  baseInit: RequestInit | undefined,
  callOptions: Omit<RequestInit, "body" | "method"> | undefined,
  body: RequestInit["body"]
): RequestInit {
  const headers = new Headers(baseInit?.headers);

  new Headers(callOptions?.headers).forEach((
    value, key
  ) => {
    headers.set(
      key, value
    );
  });

  headers.set(
    "Content-Type", "application/json"
  );
  headers.delete("Content-Length");

  return {
    ...baseInit,
    ...callOptions,
    body,
    headers,
    method: "POST",
  };
}
