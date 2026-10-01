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
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const locale = options.digits === "latin" ? "fa-IR-u-ca-persian-nu-latn" : "fa-IR-u-ca-persian";
  return new Intl.DateTimeFormat(
    locale, {
      dateStyle: options.dateStyle ?? "medium",
      ...(options.timeStyle ? { timeStyle: options.timeStyle, } : {}),
      ...(options.timeZone ? { timeZone: options.timeZone, } : {}),
    }
  ).format(date);
}
