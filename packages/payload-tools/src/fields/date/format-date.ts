import { format as formatJalali } from "date-fns-jalali";

export function formatDate (_date?: Date | string): string {
  if (!_date) return "";

  const date = typeof _date === "string" ? new Date(_date) : _date;

  let formatted: string;
  try {
    formatted = formatJalali(
      date, "EEEE d MMMM y ساعت HH:mm"
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "error formatting date:", err
    );
    // if error, show ISO simple
    formatted = date.toLocaleDateString("fa-IR");
  }

  return formatted;
}
