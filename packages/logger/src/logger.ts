import {
  isBrowser,
  isNode,
  levelPriorities,
  LogLevel,
  LogRenderer,
} from "./types";

export class NexloadLogger {
  private readonly threshold: number;

  constructor(
    public readonly name: string,
    public readonly level: LogLevel,
    protected readonly renderer: LogRenderer,
    protected baseObject: object = {}
  ) {
    this.threshold = levelPriorities[level];
    this.name = this.name.toUpperCase();
  }

  private dispatch(level: LogLevel, obj: object, message?: string): void {
    if (levelPriorities[level] < this.threshold) return;

    const payload: any = {
      ...this.baseObject,
      ...obj,
      name: this.name,
      level,
      time: Date.now(),
    };

    if (message) {
      payload.message = message;
    }

    if (isBrowser()) return this.renderer.browser(payload);
    if (isNode()) return this.renderer.node(payload);

    return console.log(payload);
  }

  public child(obj: object = {}): NexloadLogger {
    return new NexloadLogger(this.name, this.level, this.renderer, {
      ...this.baseObject,
      ...obj,
    });
  }

  public trace(obj: object, msg?: string): void {
    this.dispatch("TRACE", obj, msg);
  }
  public debug(obj: object, msg?: string): void {
    this.dispatch("DEBUG", obj, msg);
  }
  public info(obj: object, msg?: string): void {
    this.dispatch("INFO", obj, msg);
  }
  public success(obj: object, msg?: string): void {
    this.dispatch("SUCCESS", obj, msg);
  }
  public warn(obj: object, msg?: string): void {
    this.dispatch("WARN", obj, msg);
  }
  public error(obj: object, msg?: string): void {
    this.dispatch("ERROR", obj, msg);
  }
  public fatal(obj: object, msg?: string): void {
    this.dispatch("FATAL", obj, msg);
  }
}
