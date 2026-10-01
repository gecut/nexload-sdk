import { getDateLib } from "react-day-picker/persian";

import type { JalaliPickerAppearance } from "../date/picker-types";

export function canonicalizeJalaliPickerDate (
  date: Date, appearance: JalaliPickerAppearance
): Date {
  const result = appearance === "monthOnly"
    ? getDateLib().startOfMonth(date)
    : new Date(date);

  if (appearance === "dayOnly" || appearance === "monthOnly") result.setHours(
    12, 0, 0, 0
  );

  return result;
}
