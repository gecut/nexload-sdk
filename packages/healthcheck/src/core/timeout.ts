export function createAbortSignal (
  timeoutMs: number | undefined,
  parent?: AbortSignal
): { signal: AbortSignal, dispose: () => void } {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const abort = (reason?: unknown) => {
    if (!controller.signal.aborted) {
      controller.abort(reason);
    }
  };

  if (parent) {
    if (parent.aborted) {
      abort(parent.reason);
    } else {
      parent.addEventListener(
        "abort", () => abort(parent.reason), { once: true, }
      );
    }
  }

  if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0) {
    timeout = setTimeout(
      () => abort(new DOMException(
        "Healthcheck timed out.", "TimeoutError"
      )), timeoutMs
    );
  }

  return {
    signal: controller.signal,
    dispose () {
      if (timeout) {
        clearTimeout(timeout);
      }
    },
  };
}

export function sleep (
  ms: number, signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  return new Promise((
    resolve, reject
  ) => {
    const timeout = setTimeout(
      resolve, ms
    );

    signal?.addEventListener(
      "abort", () => {
        clearTimeout(timeout);
        reject(signal.reason);
      }, { once: true, }
    );
  });
}
