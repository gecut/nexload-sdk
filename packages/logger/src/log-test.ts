import type { NexloadLogger } from "./logger";

export async function test(logger: NexloadLogger) {
  const processId = Math.floor(Math.random() * 10000);

  // ---------------------------------------------------------
  // 1. System Startup (Boot Sequence) - TRACE / DEBUG
  // ---------------------------------------------------------
  logger.trace(
    { pid: processId, memory: 80 },
    "Process started, initializing modules..."
  );

  // شبیه‌سازی خواندن کانفیگ
  const config = { db: "mongo:27017", timeout: 5000, retries: 3 };
  logger.debug({ config }, "Configuration loaded successfully");

  // ---------------------------------------------------------
  // 2. Database Connection - INFO / SUCCESS
  // ---------------------------------------------------------
  logger.info(
    { dbHost: config.db, poolSize: 10 },
    "Attempting to connect to Database..."
  );

  // شبیه‌سازی تاخیر اتصال
  await new Promise((r) => setTimeout(r, 100));

  logger.success(
    { latency_ms: 45, status: "connected" },
    "Database connection established"
  );

  // ---------------------------------------------------------
  // 3. Batch Processing Simulation (High Volume) - TRACE / INFO
  // ---------------------------------------------------------
  const orders = [
    { id: 101, amount: 500, user: "ali" },
    { id: 102, amount: 0, user: "bot" }, // Invalid
    { id: 103, amount: 12000, user: "sara" },
  ];

  logger.info({ batchSize: orders.length }, "Starting batch order processing");

  for (const order of orders) {
    // لاگ بسیار جزئی برای دیباگ کردن لوپ‌ها
    logger.trace({ orderId: order.id }, "Processing order item");

    if (order.amount <= 0) {
      // ---------------------------------------------------------
      // 4. Validation Logic - WARN
      // ---------------------------------------------------------
      logger.warn(
        { orderId: order.id, userId: order.user, amount: order.amount },
        "Skipping invalid order amount"
      );
      continue;
    }

    // عملیات موفقیت‌آمیز
    logger.info(
      {
        orderId: order.id,
        transactionId: `tx_${Math.random().toString(36).substring(7)}`,
      },
      "Order processed"
    );
  }

  // ---------------------------------------------------------
  // 5. Error Handling Simulation - ERROR
  // ---------------------------------------------------------
  try {
    // شبیه‌سازی یک خطای غیرمنتظره
    simulateCriticalFailure();
  } catch (err: any) {
    // پاس دادن آبجکت خطا به لاگر
    logger.error(
      {
        errorName: err.name,
        errorMessage: err.message,
        stack: err.stack, // لاگر باید بتواند استک‌تریس را هندل کند
        failedModule: "PaymentGateway",
      },
      "Transaction failed unexpectedly"
    );
  }

  // ---------------------------------------------------------
  // 6. Critical System Failure - FATAL
  // ---------------------------------------------------------
  // شرایطی که سرویس دیگر نمی‌تواند ادامه دهد
  const heapTotal = 80;
  const heapLimit = 1024 * 1024 * 500; // فرض 500MB

  if (heapTotal < heapLimit) {
    // شرط نمایشی
    logger.fatal(
      {
        usage: heapTotal,
        limit: heapLimit,
        action: "graceful_shutdown",
      },
      "CRITICAL: Memory leak detected, shutting down service!"
    );
  }
}

// Helper to throw error
function simulateCriticalFailure() {
  throw new Error("Connection ECONNREFUSED 127.0.0.1:8080");
}
