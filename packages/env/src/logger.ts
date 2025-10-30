/* eslint-disable no-console */
import { constantCase } from "change-case";

type LogLevelType = "info" | "warn" | "error" | "success";

export class BaseLogger {
  public readonly serviceName: string;

  constructor (serviceName: string) {
    this.serviceName = constantCase(serviceName);
  }

  protected log (
    type: LogLevelType, ...args: unknown[]
  ) {
    const { color, reset, } = BaseLogger.getColor(type);
    const symbol = BaseLogger.getSymbols(type);
    const params = [
      symbol + "{ENV}",
      color + `[${this.serviceName}]:` + reset,
      ...args
    ];

    if (type === "success") console.log(...params);
    else console[type](...params);
  }

  private static getColor (type: LogLevelType): {
    color: string
    reset: string
  } {
    let color = "\x1b[34m";

    if (type === "success") color = "\x1b[32m";
    if (type === "warn") color = "\x1b[33m";
    if (type === "error") color = "\x1b[31m";

    return { color, reset: "\x1b[0m", };
  }

  private static getSymbols (type: LogLevelType): string {
    const { color, reset, } = this.getColor(type);

    if (type === "success") return color + " ✔ " + reset;
    if (type === "warn") return color + " ▲ " + reset;
    if (type === "error") return color + " ✗ " + reset;

    return color + " ￮ " + reset;
  }
}
