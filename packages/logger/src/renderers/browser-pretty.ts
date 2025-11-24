import { LogLevel, LogRendererFunc } from "@/types";

const reset = "color:inherit;font-weight:inherit;";
const dimStyle = "color:#808080cc;font-weight:100;";
const boldStyle = "font-weight:900;";
const levelColors = {
  TRACE: "color: #808080;",
  DEBUG: "color: #2980b9;",
  INFO: "color: #009688;",
  SUCCESS: "color: #27ae60;",
  WARN: "color: #d35400;",
  ERROR: "color: #c0392b;",
  FATAL: "color: #8e44ad;",
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

export const browserPrettyRenderer: LogRendererFunc = (line) => {
  const { level, time, message, name, pid, ...extras } = line as any;

  const symbol = levelSymbols[level as LogLevel];
  const colorStyle = levelColors[level as LogLevel];

  console.log(
    `%c[%s] %c%s %c%s%c - %s\n%o`,
    colorStyle,
    symbol,
    colorStyle + boldStyle,
    level.padEnd(7),
    dimStyle,
    name.padEnd(6),
    reset,
    message,
    extras
  );
};
