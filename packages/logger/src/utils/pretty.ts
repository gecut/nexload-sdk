import {
  bold,
  yellow,
  redBright,
  red,
  gray,
  dim,
  magentaBright,
  greenBright,
} from "colorette";
import { jsonHumanize } from "./json-humanize";

export type LogLevel = "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL" | "DEBUG";

const levelColors = {
  TRACE: gray,
  DEBUG: magentaBright,
  INFO: greenBright,
  WARN: yellow,
  ERROR: redBright,
  FATAL: red,
} as const;

export const levelSymbols = {
  TRACE: "›",
  DEBUG: "•",
  INFO: "✔",
  WARN: "⚠",
  ERROR: "✗",
  FATAL: "✝",
} as const;

function extrasFromatter(extras: any) {
  if (
    extras == null ||
    typeof extras !== "object" ||
    Object.keys(extras).length === 0
  )
    return [];

  return ["\n" + jsonHumanize(extras, 2)];
}

function levelToSymbol(level: LogLevel) {
  const symbol = levelSymbols[level];
  const color = levelColors[level];

  return color("[" + symbol + "]");
}

export function prettyLog(line: string) {
  const columns =
    typeof process !== "undefined" ? process?.stdout?.columns : 80;
  let json;

  try {
    json = JSON.parse(line);
  } catch {
    return console.log(line);
  }

  const { level, time, msg, name, pid, ...extras } = json;

  const dateTime = new Date(time ?? undefined);

  const levelColor = levelColors[level as LogLevel];
  const symbol = levelToSymbol(level as LogLevel);

  const nameStr = dim(bold(name.padEnd(6)));
  const levelStr = levelColor(bold(level.padEnd(5)));
  const timeStr = dim(dateTime.toTimeString().slice(0, 8));
  let lineStr = `${symbol} ${levelStr} ${nameStr} — ${msg}`;
  const spaceCount = Math.max(1, columns - lineStr.length - timeStr.length);

  lineStr = lineStr + " ".repeat(spaceCount) + timeStr;

  switch (level) {
    case "INFO":
      console.info(lineStr, ...extrasFromatter(extras));
      break;
    case "WARN":
      console.warn(lineStr, ...extrasFromatter(extras));
      break;
    case "ERROR":
      console.error(lineStr, ...extrasFromatter(extras));
      break;
    case "DEBUG":
      console.debug(lineStr, ...extrasFromatter(extras));
      break;

    default:
      console.log(lineStr, ...extrasFromatter(extras));
      break;
  }
}
