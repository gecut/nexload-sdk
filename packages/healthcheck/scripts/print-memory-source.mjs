import { MemoryHealthCheck } from "../dist/index.mjs";

const check = new MemoryHealthCheck();
const result = await check.run();

console.log(
  JSON.stringify(
    {
      source: result.metrics.source,
      total: result.metrics.total,
      used: result.metrics.used,
      free: result.metrics.free,
      freePercent: result.metrics.freePercent,
    },
    null,
    2
  )
);
