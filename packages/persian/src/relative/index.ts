import {
  type DateInput,
  formatJalali,
  toValidDate,
  type ZoneOptions,
} from "../date";
import { toPersianDigits } from "../digits";
export function formatRelativeTime(
  date: DateInput | null | undefined,
  options: ZoneOptions & { now?: DateInput; digits?: "persian" | "latin" } = {},
): string | null {
  const value = toValidDate(date, options),
    now = toValidDate(options.now ?? new Date(), options);

  try { new Intl.DateTimeFormat("en", { timeZone: options.timeZone }).format(0); } catch { return null; }

  if (!value || !now) return null;
  const delta = value.getTime() - now.getTime(),
    elapsed = Math.abs(delta);

  if (elapsed < 45000) return "همین حالا";
  if (elapsed >= 7 * 86400000) return formatJalali(value, options);
  const [count, unit] =
    elapsed < 3600000
      ? [Math.max(1, Math.floor(elapsed / 60000)), "دقیقه"]
      : elapsed < 86400000
        ? [Math.floor(elapsed / 3600000), "ساعت"]
        : [Math.floor(elapsed / 86400000), "روز"];

  return `${options.digits === "latin" ? count : toPersianDigits(count)} ${unit} ${delta > 0 ? "دیگر" : "پیش"}`;
}
