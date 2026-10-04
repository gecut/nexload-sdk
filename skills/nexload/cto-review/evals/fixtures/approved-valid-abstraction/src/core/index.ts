export interface ProbeResult {
  readonly status: "healthy" | "unhealthy";
  readonly latencyMs: number;
  readonly metadata?: Record<string, unknown>;
}

export interface SystemProbe {
  readonly name: string;
  check(): Promise<ProbeResult>;
}

export class ProbeManager {
  private readonly probes: SystemProbe[] = [];

  register(probe: SystemProbe): void {
    this.probes.push(probe);
  }

  async runAll(): Promise<ProbeResult[]> {
    return Promise.all(this.probes.map((p) => p.check()));
  }
}
