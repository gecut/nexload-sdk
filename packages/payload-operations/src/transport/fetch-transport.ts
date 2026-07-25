import type { CMSClientTransport } from "./types.js";

export function createFetchTransport (customFetch?: typeof fetch): CMSClientTransport {
  const terminalFetch = customFetch ?? globalThis.fetch?.bind(globalThis);

  if (terminalFetch === undefined) {
    throw new TypeError("A global or custom fetch implementation is required.");
  }

  return ({ init, url, }) => terminalFetch(
    url, init
  );
}
