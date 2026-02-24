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

  private normalizeInput(
    objOrMessage?: object | string,
    message?: string
  ): { obj: object; message?: string } {
    if (typeof objOrMessage === "string") {
      return {
        obj: {},
        message: message ?? objOrMessage,
      };
    }

    return {
      obj: objOrMessage ?? {},
      message,
    };
  }

  private dispatch(
    level: LogLevel,
    objOrMessage?: object | string,
    message?: string
  ): void {
    if (levelPriorities[level] < this.threshold) return;
    const normalized = this.normalizeInput(objOrMessage, message);

    const payload: any = {
      ...this.baseObject,
      ...normalized.obj,
      name: this.name,
      level,
      time: Date.now(),
    };

    if (normalized.message) {
      payload.message = normalized.message;
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

  public trace(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("TRACE", objOrMsg, msg);
  }
  public debug(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("DEBUG", objOrMsg, msg);
  }
  public info(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("INFO", objOrMsg, msg);
  }
  public success(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("SUCCESS", objOrMsg, msg);
  }
  public warn(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("WARN", objOrMsg, msg);
  }
  public error(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("ERROR", objOrMsg, msg);
  }
  public fatal(objOrMsg?: object | string, msg?: string): void {
    this.dispatch("FATAL", objOrMsg, msg);
  }
}
