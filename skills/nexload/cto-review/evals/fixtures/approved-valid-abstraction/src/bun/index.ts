import type { SystemProbe, ProbeResult } from "../core/index.js";

declare const Bun: {
  nanoseconds(): number;
};

export class BunNanotimeProbe implements SystemProbe {
  readonly name = "bun:nanotime";

  async check(): Promise<ProbeResult> {
    const t0 = Bun.nanoseconds();
    const t1 = Bun.nanoseconds();
    return {
      status: "healthy",
      latencyMs: (t1 - t0) / 1_000_000,
      metadata: { runtime: "bun" }
    };
  }
}
