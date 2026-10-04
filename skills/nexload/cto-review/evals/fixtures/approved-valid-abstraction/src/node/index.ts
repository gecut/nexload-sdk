import process from "node:process";
import type { SystemProbe, ProbeResult } from "../core/index.js";

export class NodeMemoryProbe implements SystemProbe {
  readonly name = "node:memory";

  async check(): Promise<ProbeResult> {
    const usage = process.memoryUsage();
    return {
      status: usage.heapUsed < usage.heapTotal ? "healthy" : "unhealthy",
      latencyMs: 0.1,
      metadata: { heapUsed: usage.heapUsed, heapTotal: usage.heapTotal }
    };
  }
}
