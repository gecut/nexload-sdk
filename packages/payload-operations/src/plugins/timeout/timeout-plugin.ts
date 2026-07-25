import { defineClientPlugin } from "../define-client-plugin.js";
import { CMSClientTimeoutError } from "./cms-client-timeout-error.js";

export interface TimeoutPluginOptions { timeout: number }

export function timeoutPlugin (options: TimeoutPluginOptions) {
  assertTimeout(options.timeout);

  return defineClientPlugin({
    name: "timeout",
    wrapTransport: (next) => async (request) => {
      const timeoutSignal = AbortSignal.timeout(options.timeout);
      const signal = request.init.signal == null
        ? timeoutSignal
        : AbortSignal.any([
          request.init.signal,
          timeoutSignal
        ]);

      try {
        return await next({
          ...request,
          init: {
            ...request.init,
            signal,
          },
        });
      } catch (error) {
        const timedOut = timeoutSignal.aborted
          && signal.reason === timeoutSignal.reason;

        if (timedOut && request.source === "operation") {
          throw new CMSClientTimeoutError(
            options.timeout, error
          );
        }

        throw error;
      }
    },
  });
}

function assertTimeout (timeout: number): void {
  if (
    !Number.isFinite(timeout)
    || !Number.isInteger(timeout)
    || timeout <= 0
  ) {
    throw new TypeError("Timeout must be a positive finite integer.");
  }
}
