import { LogLevel, LogRendererFunc } from "@/types";

export const browserPureRenderer: LogRendererFunc = (line) => {
  const { level, time, message, name, pid, ...extras } = line as any;

  const nameStr = name.padEnd(6);
  const levelStr = level.padEnd(5);
  const lineStr = `${levelStr} ${nameStr} — ${message}`;

  switch (level as LogLevel) {
    case "WARN":
      console.warn(lineStr, extras);
      break;
    case "ERROR":
    case "FATAL":
      console.error(lineStr, extras);
      break;
    case "DEBUG":
    case "TRACE":
      console.debug(lineStr, extras);
      break;
    case "INFO":
    case "SUCCESS":
      console.info(lineStr, extras);
      break;
    default:
      console.log(lineStr, extras);
      break;
  }
};
