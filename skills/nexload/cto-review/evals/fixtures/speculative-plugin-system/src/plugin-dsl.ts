import { TimeoutPluginRegistry, type TimeoutPlugin } from "./registry.js";

export class TimeoutDSLBuilder {
  private readonly plugins: TimeoutPlugin[] = [];

  use(plugin: TimeoutPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  build(): (ms: number) => AbortSignal {
    return (ms: number) => {
      const registry = TimeoutPluginRegistry.getInstance();
      for (const p of this.plugins) {
        registry.register(p);
      }
      return AbortSignal.timeout(ms);
    };
  }
}

export function createTimeoutPipeline(): TimeoutDSLBuilder {
  return new TimeoutDSLBuilder();
}
