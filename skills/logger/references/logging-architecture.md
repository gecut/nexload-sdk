# Logging architecture

## Boundaries

```text
Inbound request → wrapper → service → provider adapter
                   │         │         └─ Success or warn for each retry attempt
                   │         └─ Handles once or propagates without logging
                   └─ Logs propagated failure once and emits one request summary
```

The outermost request/job wrapper (route handler wrapper, server action wrapper, job runner, or worker loop) catches a propagated failure, logs once with `{ err, event, outcome: "failure", durationMs }` at `error` for unexpected failures or `warn` for handled/expected failures, emits the single request/job summary, then rethrows or responds. Include response status in the summary when known; do not repeat `err` there. A job summary includes aggregate counts when available.

Inner code that rethrows never logs that error. Inner code that handles an error by fallback, retry, or swallowing logs once there. For provider failures, the adapter logs `warn` per retry attempt; the final failure is logged by whoever handles it, usually the outermost boundary, not twice.

For example, a Node route wrapper can let an unexpected failure reach the framework:

```ts
import { logger, resolveTraceId, withLogContext } from "@nexload-sdk/logger";

const log = logger.child({ module: "orders" });

export function GET(request: Request): Promise<Response> {
  const traceId = resolveTraceId(request.headers);
  return withLogContext({ requestId: traceId, traceId }, async () => {
    const started = Date.now();
    let status: number | undefined;
    let outcome: "success" | "failure" = "failure";
    try {
      const response = await handleRequest(request);
      status = response.status;
      outcome = response.ok ? "success" : "failure";
      return response;
    } catch (err) {
      log.error({ err, event: "order.request.failed", outcome: "failure", durationMs: Date.now() - started }, "Order request failed");
      throw err;
    } finally {
      log.info({ event: "order.request.completed", method: request.method, route: "/orders", status, durationMs: Date.now() - started, outcome }, "Order request completed");
    }
  });
}
```

`handleRequest` represents the application's handler. Ensure errors are safe to log before passing them as `err`.

## Request context and propagation

Resolve `traceId` using `resolveTraceId(request.headers)`, and wrap the handler in `withLogContext({ requestId, traceId }, handler)` using the local request ID. Node attaches the active bindings to log lines across async work. Merge `traceHeaders()` into the outbound headers inside that scope, preserving other required headers. The propagation header is `TRACE_HEADER` (`x-trace-id`).

Browser and Edge use pass-through context. Where correlation is needed there, pass the IDs explicitly as log fields and forward the resolved trace ID under `TRACE_HEADER`.

## Configure once per runtime

In a Next.js app, configure from `instrumentation.ts`. Each server runtime runs its own registration and uses the matching logger entry. Keep configuration at startup and create module children where they are used.

```ts
export async function register() {
  const { configureLogger } = await import("@nexload-sdk/logger");
  configureLogger({ service: "shop-web", release: process.env.RELEASE });
}
```

In a standalone service, call `configureLogger` in the entry file before accepting traffic or starting jobs. Module-level children can be created earlier because they resolve the configured logger lazily.

## Output

Production server logs are JSON lines on stdout. Collectors can ingest one event per line and query structured fields without parsing human messages. Pretty output is for local development.
