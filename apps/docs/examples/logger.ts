import {
  configureLogger,
  logger,
  resolveTraceId,
  traceHeaders,
  withLogContext,
} from "@nexload-sdk/logger";
import { createTestLogger } from "@nexload-sdk/logger/testing";

configureLogger({
  service: "shop-api",
  release: process.env.RELEASE,
  redact: { paths: ["customer.nationalCode"] },
});

const log = logger.child({ module: "orders" });

export async function handleOrder(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  const traceId = resolveTraceId(request.headers);

  return withLogContext({ requestId, traceId }, async () => {
    const startedAt = performance.now();

    try {
      const upstream = await fetch("https://inventory.example.com/availability", {
        headers: traceHeaders(),
      });

      log.info(
        {
          event: "order.request.completed",
          durationMs: performance.now() - startedAt,
          outcome: upstream.ok ? "success" : "failure",
        },
        "Order request completed",
      );

      return upstream;
    } catch (err) {
      log.error(
        {
          err,
          event: "order.request.failed",
          durationMs: performance.now() - startedAt,
          outcome: "failure",
        },
        "Order request failed",
      );

      return new Response("Unable to process order", { status: 500 });
    }
  });
}

export function captureOrderLogs() {
  const { logger: testLogger, entries, clear } = createTestLogger({
    service: "test",
    level: "info",
  });

  testLogger.success({ event: "order.lifecycle.placed", orderId: "123" }, "Order placed");

  const event = entries[0]?.event;

  clear();

  return event;
}
