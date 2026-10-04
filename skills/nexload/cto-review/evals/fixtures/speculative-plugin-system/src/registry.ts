export interface TimeoutPlugin {
  readonly id: string;
  beforeTimeout?(context: Record<string, unknown>): Promise<void>;
  afterTimeout?(context: Record<string, unknown>): Promise<void>;
  onAbort?(error: unknown): void;
}

export class TimeoutPluginRegistry {
  private static instance: TimeoutPluginRegistry;
  private readonly plugins = new Map<string, TimeoutPlugin>();

  static getInstance(): TimeoutPluginRegistry {
    if (!this.instance) this.instance = new TimeoutPluginRegistry();
    return this.instance;
  }

  register(plugin: TimeoutPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugins(): TimeoutPlugin[] {
    return Array.from(this.plugins.values());
  }
}
