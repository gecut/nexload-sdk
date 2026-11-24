import { toEnglishDigits, toPersianDigits } from "../digits";
import {
  type CalendarDate,
  gregorianToJalali,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
} from "./calendar";
export * from "./calendar";
export const TEHRAN_TIME_ZONE = "Asia/Tehran";
export const JALALI_MONTH_NAMES_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;
export const JALALI_WEEKDAY_NAMES_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
] as const;
export type DateInput = Date | string | number;
export type ZoneOptions = { timeZone?: string };
export type JalaliParts = CalendarDate & {
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
};
export type JalaliDateTime = CalendarDate & {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  weekday: number;
};
function parseIsoDate(input: string, timeZone: string): Date | null {
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}(?::?\d{2})?)?)?$/);

  if (!iso) return null;
  const year = Number(iso[1]), month = Number(iso[2]), day = Number(iso[3]);
  const hour = Number(iso[4] ?? 0), minute = Number(iso[5] ?? 0), second = Number(iso[6] ?? 0);
  const millisecond = Number((iso[7] ?? "").slice(0, 3).padEnd(3, "0"));
  const target = utc({ year, month, day, hour, minute, second, millisecond });
  const check = new Date(target);

  if (year < 1 || check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return null;
  const zone = iso[8];

  if (!zone) {
    try { return resolveWall(target, timeZone); } catch { return null; }
  }
  if (zone === "Z") return new Date(target);
  const offset = zone.slice(1).replace(":", "");
  const hours = Number(offset.slice(0, 2)), minutes = Number(offset.slice(2) || 0);

  if (hours > 23 || minutes > 59) return null;

  return new Date(target - (zone[0] === "+" ? 1 : -1) * (hours * 60 + minutes) * 60000);
}
export function toValidDate(input: DateInput | null | undefined, options: ZoneOptions = {}): Date | null {
  if (input == null || !(input instanceof Date || typeof input === "string" || typeof input === "number")) return null;
  if (typeof input === "string") {
    if (/^[+-]/.test(input)) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(input)) return parseIsoDate(input, options.timeZone ?? TEHRAN_TIME_ZONE);
  }
  const date = new Date(input);

  return Number.isFinite(date.getTime()) ? date : null;
}
const wallFormatters = new Map<string, Intl.DateTimeFormat>();
function wallFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = wallFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23", era: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
    });
    wallFormatters.set(timeZone, formatter);
  }

  return formatter;
}
function wall(t: number, timeZone: string) {
  const p = wallFormatter(timeZone).formatToParts(t);

  if (p.find((v) => v.type === "era")?.value !== "AD") throw new RangeError("Invalid era");
  const n = (type: string) => Number(p.find((v) => v.type === type)?.value);

  return {
    year: n("year"),
    month: n("month"),
    day: n("day"),
    hour: n("hour"),
    minute: n("minute"),
    second: n("second"),
    millisecond: ((t % 1000) + 1000) % 1000,
  };
}
function utc(p: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}) {
  const d = new Date(0);
  d.setUTCFullYear(p.year, p.month - 1, p.day);
  d.setUTCHours(p.hour, p.minute, p.second, p.millisecond);

  return d.getTime();
}
function resolveWall(target: number, tz: string): Date {
  const offset = (t: number) => utc(wall(t, tz)) - t;
  const offsets = [offset(target), offset(target - 86400000), offset(target + 86400000)];
  offsets.push(offset(target - (offsets[0] ?? 0)));
  const candidates = offsets.map((o) => target - o).filter((t) => utc(wall(t, tz)) === target);

  return new Date(candidates.length ? Math.min(...candidates) : target - Math.min(...offsets));
}
export function toJalali(
  input: DateInput,
  options: ZoneOptions = {},
): JalaliDateTime {
  const d = toValidDate(input, options);

  if (!d) throw new RangeError("Invalid instant");
  const p = wall(d.getTime(), options.timeZone ?? TEHRAN_TIME_ZONE);
  const j = gregorianToJalali(p.year, p.month, p.day);

  return {
    ...j,
    hour: p.hour,
    minute: p.minute,
    second: p.second,
    millisecond: p.millisecond,
    weekday: (new Date(utc(p)).getUTCDay() + 1) % 7,
  };
}
export function fromJalali(
  parts: JalaliParts | null | undefined,
  options: ZoneOptions = {},
): Date {
  if (!parts || typeof parts !== "object") throw new RangeError("Invalid date");
  const {
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
  } = parts;

  if (
    !isValidJalaliDate(year, month, day) ||
    ![hour, minute, second, millisecond].every(Number.isInteger) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    millisecond < 0 ||
    millisecond > 999
  )
    throw new RangeError("Invalid date");
  const g = jalaliToGregorian(year, month, day);
  const target = utc({ ...g, hour, minute, second, millisecond });

  return resolveWall(target, options.timeZone ?? TEHRAN_TIME_ZONE);
}
export type JalaliFormat = "short" | "medium" | "long" | "full";
export type JalaliFormatOptions = ZoneOptions & {
  format?: JalaliFormat;
  time?: "none" | "short" | "medium";
  digits?: "persian" | "latin";
};
export function formatJalaliPattern(
  date: DateInput | null | undefined,
  pattern: string,
  options: ZoneOptions & { digits?: "persian" | "latin" } = {},
): string | null {
  const valid = toValidDate(date, options);

  if (!valid) return null;
  let p: JalaliDateTime;

  try { p = toJalali(valid, options); } catch { return null; }
  const pad = (n: number) => String(n).padStart(2, "0");
  const tokens: Record<string, string> = {
    yyyy: String(p.year).padStart(4, "0"),
    yy: pad(p.year % 100),
    MMMM: JALALI_MONTH_NAMES_FA[p.month - 1] ?? "",
    MM: pad(p.month),
    M: String(p.month),
    dd: pad(p.day),
    d: String(p.day),
    EEEE: JALALI_WEEKDAY_NAMES_FA[p.weekday] ?? "",
    HH: pad(p.hour),
    H: String(p.hour),
    mm: pad(p.minute),
    ss: pad(p.second),
  };

  return pattern.replace(
    /'([^']*)'|yyyy|MMMM|EEEE|yy|MM|dd|HH|mm|ss|M|d|H/g,
    (match, literal: string | undefined) =>
      literal === undefined
        ? options.digits === "latin"
          ? (tokens[match] ?? match)
          : toPersianDigits((tokens[match] ?? match))
        : literal,
  );
}
export function formatJalali(
  date: DateInput | null | undefined,
  options: JalaliFormatOptions = {},
): string | null {
  const pattern =
    options.format === "short"
      ? "yyyy/MM/dd"
      : options.format === "long" || options.format === "full"
        ? "EEEE d MMMM yyyy"
        : "d MMMM yyyy";
  const time =
    options.time === "short"
      ? "، HH:mm"
      : options.time === "medium"
        ? "، HH:mm:ss"
        : "";

  return formatJalaliPattern(date, pattern + time, options);
}
export function parseJalaliDate(
  input: string | number | null | undefined,
  options: ZoneOptions & { time?: string } = {},
): Date | null {
  if (typeof input !== "string" || !input || (options.time !== undefined && typeof options.time !== "string")) return null;
  const m = toEnglishDigits(input.trim()).match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/,
  );
  const t = toEnglishDigits(options.time ?? "12:00").match(
    /^(\d{1,2}):(\d{2})$/,
  );

  if (!m || !t) return null;
  const year = Number(m[1]),
    month = Number(m[2]),
    day = Number(m[3]),
    hour = Number(t[1]),
    minute = Number(t[2]);

  if (!isValidJalaliDate(year, month, day) || hour > 23 || minute > 59)
    return null;

  try { return fromJalali({ year, month, day, hour, minute }, options); } catch { return null; }
}
export function startOfJalaliMonth(
  date: DateInput,
  options: ZoneOptions = {},
): Date {
  const p = toJalali(date, options);

  return fromJalali({ year: p.year, month: p.month, day: 1 }, options);
}
function endOfDay(year: number, month: number, day: number, options: ZoneOptions): Date {
  const g = jalaliToGregorian(year, month, day);
  const target = utc({ ...g, hour: 0, minute: 0, second: 0, millisecond: 0 }) + 86400000;

  return new Date(resolveWall(target, options.timeZone ?? TEHRAN_TIME_ZONE).getTime() - 1);
}
export function endOfJalaliMonth(
  date: DateInput,
  options: ZoneOptions = {},
): Date {
  const p = toJalali(date, options);

  return endOfDay(p.year, p.month, jalaliMonthLength(p.year, p.month), options);
}
export function startOfJalaliYear(
  date: DateInput,
  options: ZoneOptions = {},
): Date {
  const p = toJalali(date, options);

  return fromJalali({ year: p.year, month: 1, day: 1 }, options);
}
export function endOfJalaliYear(
  date: DateInput,
  options: ZoneOptions = {},
): Date {
  const p = toJalali(date, options);

  return endOfDay(p.year, 12, jalaliMonthLength(p.year, 12), options);
}
