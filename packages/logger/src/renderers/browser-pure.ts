import { LogLevel, LogRendererFunc } from "@/types";

export const browserPureRenderer: LogRendererFunc = (line) => {
  const { level, time, message, name, pid, ...extras } = line as any;

  const nameStr = name.padEnd(6);
  const levelStr = level.padEnd(5);
  const lineStr = `${levelStr} ${nameStr} — ${message}`;

  switch (level as LogLevel) {
    case "WARN":
      console.warn(lineStr, extras);
    case "ERROR":
      console.error(lineStr, extras);
      break;
    default:
      break;
  }
};
