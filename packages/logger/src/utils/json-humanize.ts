import {
  cyan,
  green,
  yellow,
  red,
  magenta,
  gray,
  white,
  bold,
  dim,
} from "colorette";

const styleValue = (value: any): string => {
  if (value === null) return bold(gray("null"));
  if (value === undefined) return bold(gray("undefined"));

  switch (typeof value) {
    case "string":
      return green(`"${value}"`); // رشته‌ها سبز
    case "number":
      return yellow(String(value)); // اعداد زرد
    case "boolean":
      return magenta(String(value)); // بولین‌ها بنفش
    default:
      return white(String(value));
  }
};

export function jsonHumanize(data: any, indentLevel = 0): string {
  const indent = "  ".repeat(indentLevel);

  if (data === null || typeof data !== "object") {
    return styleValue(data);
  }

  let output = "";

  for (const [key, value] of Object.entries(data)) {
    const coloredKey = cyan(key);

    if (typeof value === "string" && value.includes("\n")) {
      output += `${indent}${coloredKey}: |\n`;
      const lines = value.split("\n");
      output += lines.map((line) => `${indent}  ${dim(line)}`).join("\n");
      output += "\n";
      continue;
    }

    if (typeof value === "object" && value !== null) {
      if (Object.keys(value).length === 0) {
        output += `${indent}${coloredKey}: ${gray("{}")}\n`;
      } else {
        output += `${indent}${coloredKey}:\n`;
        output += jsonHumanize(value, indentLevel + 1);
      }
      continue;
    }

    output += `${indent}${coloredKey}: ${styleValue(value)}\n`;
  }

  return output;
}
