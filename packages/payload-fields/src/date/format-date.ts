import { formatJalali, TEHRAN_TIME_ZONE } from "@nexload-sdk/persian/date";

export type JalaliDateValue = Date | string | number | null | undefined;
export type JalaliDateDisplayOptions = {
  dateStyle?: "short" | "medium" | "long" | "full"
  timeStyle?: "short" | "medium"
  digits?: "persian" | "latin"
  timeZone?: string
};

export function formatJalaliDate (
  value: JalaliDateValue, options: JalaliDateDisplayOptions = {}
): string | null {
  return formatJalali(value, {
    format: options.dateStyle === "short" ? "short" : options.dateStyle === "long" || options.dateStyle === "full" ? "long" : "medium",
    time: options.timeStyle,
    digits: options.digits,
    timeZone: options.timeZone ?? TEHRAN_TIME_ZONE,
  });
}
