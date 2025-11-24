import {
  bold,
  yellow,
  redBright,
  red,
  gray,
  dim,
  magentaBright,
  greenBright,
  green,
  cyanBright,
} from "colorette";
import { jsonHumanize } from "@/utils/json-humanize";
import { LogRendererFunc } from "@/types";

export type LogLevel = "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL" | "DEBUG";

const levelColors = {
  TRACE: gray,
  DEBUG: magentaBright,
  INFO: cyanBright,
  SUCCESS: green,
  WARN: yellow,
  ERROR: redBright,
  FATAL: red,
} as const;

export const levelSymbols = {
  TRACE: "›",
  DEBUG: "•",
  INFO: "ℹ",
  SUCCESS: "✔",
  WARN: "⚠",
  ERROR: "✗",
  FATAL: "✝",
} as const;

const extrasFromatter = (extras: any) => {
  if (
    extras == null ||
    typeof extras !== "object" ||
    Object.keys(extras).length === 0
  )
    return [];

  return ["\n" + jsonHumanize(extras, 2)];
};

const levelToSymbol = (level: LogLevel) => {
  const symbol = levelSymbols[level];
  const color = levelColors[level];

  return color("[" + symbol + "]");
};

export const nodePrettyRenderer: LogRendererFunc = (line) => {
  const columns =
    typeof process !== "undefined" ? process?.stdout?.columns : 80;

  const { level, time, message, name, pid, ...extras } = line as any;

  const dateTime = new Date(time ?? undefined);

  const levelColor = levelColors[level as LogLevel];
  const symbol = levelToSymbol(level as LogLevel);

  const nameStr = dim(bold(name.padEnd(6)));
  const levelStr = levelColor(bold(level.padEnd(7)));
  const timeStr = dim(dateTime.toTimeString().slice(0, 8));
  let lineStr = `${symbol} ${levelStr} ${nameStr} — ${message}`;
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
};
