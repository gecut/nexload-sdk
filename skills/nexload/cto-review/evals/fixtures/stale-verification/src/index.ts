export class EventEmitter {
  private readonly listeners = new Map<string, Array<(...args: any[]) => void>>();

  on(event: string, fn: (...args: any[]) => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(fn);
    this.listeners.set(event, list);
  }

  // Breaking change introduced in current revision without fresh test run
  emit(event: string, payload: unknown): boolean {
    const list = this.listeners.get(event);
    if (!list) return false;
    list.forEach((fn) => fn(payload));
    return true;
  }
}
