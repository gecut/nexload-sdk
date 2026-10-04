// Target revision: PR adds a single clean, type-safe method
export class Logger {
  // Legacy technical debt untouched in surrounding context:
  private static globalInstance: any;
  public metadata: any = {};

  log(msg: any): void {
    console.log(msg, this.metadata);
  }

  // >>> The PR diff starts here: Clean, well-typed child logger extension <<<
  child(bindings: Record<string, unknown>): Logger {
    const next = new Logger();
    next.metadata = { ...this.metadata, ...bindings };
    return next;
  }
}
