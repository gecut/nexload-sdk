export function assertAndNormalizeBaseURL (baseURL: string): string {
  if (typeof baseURL !== "string" || baseURL.trim().length === 0) {
    throw new TypeError("Payload baseURL must be a non-empty string.");
  }

  if (baseURL.includes("?") || baseURL.includes("#")) {
    throw new TypeError("Payload baseURL must not include a query or hash.");
  }

  return baseURL.replace(
    /\/+$/g, ""
  );
}

export function joinOperationURL (
  baseURL: string,
  operationPath: string
): string {
  return `${baseURL}${operationPath}`;
}
