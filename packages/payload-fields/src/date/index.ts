import type { DateField, Field, RowField, TextField } from "payload";

import { fromJalali, parseJalaliDate, TEHRAN_TIME_ZONE, toValidDate } from "@nexload-sdk/persian/date";
import { toEnglishDigits } from "@nexload-sdk/persian/digits";

import type { JalaliDateDisplayOptions, JalaliDateValue } from "./format-date";
import type { JalaliPickerAppearance } from "./picker-types";

import { t } from "../i18n/messages";
import { assertProtected } from "../internal/protect";
import { formatJalaliDate } from "./format-date";

export type { JalaliDateDisplayOptions, JalaliDateValue } from "./format-date";
export type { JalaliPickerAppearance } from "./picker-types";
export type JalaliDateFieldOptions = {
  name: string
  pickerAppearance?: JalaliPickerAppearance
  display?: JalaliDateDisplayOptions
  timeZone?: string
  min?: string
  max?: string
  label?: { fa: string, en: string }
  required?: boolean
  overrides?: Partial<DateField>
};
export type JalaliTimestampsOptions = {
  createdAt?: boolean
  updatedAt?: boolean
  display?: JalaliDateDisplayOptions
  overrides?: { createdAt?: Partial<TextField>, updatedAt?: Partial<TextField> }
};

export function toStoredJalaliInstant (
  picked: { year: number, month: number, day: number, hour?: number, minute?: number },
  appearance: JalaliPickerAppearance,
  timeZone = TEHRAN_TIME_ZONE
): string {
  const dateOnly = appearance === "dayOnly" || appearance === "monthOnly";

  return fromJalali({
    year: picked.year,
    month: picked.month,
    day: appearance === "monthOnly" ? 1 : picked.day,
    hour: dateOnly ? 12 : (picked.hour ?? 0),
    minute: dateOnly ? 0 : (picked.minute ?? 0),
  }, { timeZone, }).toISOString();
}

const ISO_PREFIX = /^\d{4}-\d{2}-\d{2}/;
const JALALI_STRING = /^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}:\d{2}))?$/;

/** Converts "1404/07/02[ HH:mm]" (Persian or Latin digits) to an ISO string; null when not a valid Jalali string. */
function jalaliStringToIso (value: string, appearance: JalaliPickerAppearance, timeZone: string): string | null {
  const match = toEnglishDigits(value.trim()).match(JALALI_STRING);

  if (!match) return null;
  const [, y, m, d, time] = match;

  if (!parseJalaliDate(`${y}/${m}/${d}`, { timeZone, })) return null;
  const picked = { year: Number(y), month: Number(m), day: Number(d), };

  if (appearance === "dayOnly" || appearance === "monthOnly") return toStoredJalaliInstant(picked, appearance, timeZone);

  return parseJalaliDate(`${y}/${m}/${d}`, { timeZone, time: time ?? "00:00", })?.toISOString() ?? null;
}

export function jalaliDateField (options: JalaliDateFieldOptions): DateField {
  const overrides = options.overrides ?? {};

  assertProtected(overrides, options.name, "date", "Jalali date field");
  const appearance = options.pickerAppearance ?? "dayOnly";
  const timeZone = options.timeZone ?? TEHRAN_TIME_ZONE;
  const required = options.required ?? overrides.required;
  const min = toValidDate(options.min, { timeZone, });
  const max = toValidDate(options.max, { timeZone, });

  if ((options.min !== undefined && !min) || (options.max !== undefined && !max) || (min && max && min > max)) {
    throw new Error("Invalid Jalali date bounds.");
  }

  const display = {
    digits: "persian" as const,
    dateStyle: "medium" as const,
    ...(
      appearance === "dayAndTime" || appearance === "timeOnly"
        ? { timeStyle: "short" as const, }
        : {}
    ),
    timeZone,
    ...options.display,
  };

  return {
    ...overrides,
    name: options.name,
    type: "date",
    label: overrides.label ?? options.label,
    required,
    validate: (value, args) => {
      const language = args?.req?.i18n?.language;
      const candidate = value === undefined ? args.previousValue : value;

      if (candidate == null || (typeof candidate === "string" && candidate === "")) {
        if (args.required ?? required) return t(language, "required");
      } else {
        const converted = typeof candidate === "string" && !ISO_PREFIX.test(candidate)
          ? jalaliStringToIso(candidate, appearance, timeZone)
          : candidate;
        const instant = typeof candidate === "string" && converted === null
          ? null
          : toValidDate(converted, { timeZone, });

        if (!instant) return t(language, "date.invalid");
        if (min && instant < min) return t(language, "date.min");
        if (max && instant > max) return t(language, "date.max");
      }

      return overrides.validate?.(value, args) ?? true;
    },
    hooks: {
      ...overrides.hooks,
      beforeValidate: [
        ...(overrides.hooks?.beforeValidate ?? []),
        ({ value, }) => typeof value === "string" && !ISO_PREFIX.test(value)
          ? (jalaliStringToIso(value, appearance, timeZone) ?? value)
          : value
      ],
    },
    admin: {
      ...overrides.admin,
      date: { ...overrides.admin?.date, pickerAppearance: appearance, },
      components: {
        ...overrides.admin?.components,
        Field: { path: "@nexload-sdk/payload-fields/admin/jalali-date-field#JalaliDateFieldComponent", clientProps: { appearance, display, timeZone, }, },
        Cell: { path: "@nexload-sdk/payload-fields/admin/jalali-date-cell#JalaliDateCell", clientProps: { display, }, },
      },
    },
    custom: { ...overrides.custom, nexload: { ...(overrides.custom?.nexload as object), jalaliDate: { appearance, display, timeZone, }, }, },
  } as DateField;
}

export function jalaliDateRangeField (options: {
  start?: string
  end?: string
  pickerAppearance?: JalaliPickerAppearance
  timeZone?: string
  required?: boolean
  labels?: { start?: { fa: string, en: string }, end?: { fa: string, en: string } }
} = {}): RowField {
  const { start = "startsAt", end = "endsAt", pickerAppearance, timeZone, required, labels, } = options;
  const shared = { pickerAppearance, timeZone, required, };

  return {
    type: "row",
    fields: [
      jalaliDateField({ ...shared, name: start, label: labels?.start ?? { fa: t("fa", "dateRange.start"), en: t("en", "dateRange.start"), }, }),
      jalaliDateField({
        ...shared,
        name: end,
        label: labels?.end ?? { fa: t("fa", "dateRange.end"), en: t("en", "dateRange.end"), },
        overrides: {
          validate: (value, args) => {
            const siblings = args.siblingData as Record<string, unknown> | undefined;
            const startValue = siblings?.[start];
            const startDate = typeof startValue === "string" || startValue instanceof Date
              ? toValidDate(startValue, { timeZone, })
              : null;
            const endDate = toValidDate(value === undefined ? args.previousValue : value, { timeZone, });

            return startDate && endDate && endDate < startDate ? t(args?.req?.i18n?.language, "dateRange.order") : true;
          },
        },
      })
    ],
  };
}

export function withJalaliTimestamps<T extends Field[]> (
  fields: T, options: JalaliTimestampsOptions = {}
): Field[] {
  const output = [...fields];
  const add = (
    name: "createdAtJalali" | "updatedAtJalali", source: "createdAt" | "updatedAt", override?: Partial<TextField>
  ) => {
    if (output.some((field) => "name" in field && field.name === name)) throw new Error(`Duplicate Jalali timestamp field: ${name}`);
    output.push({
      ...override,
      name,
      type: "text",
      virtual: true,
      admin: { ...override?.admin, readOnly: true, },
      hooks: {
        ...override?.hooks, afterRead: [
          ...(override?.hooks?.afterRead ?? []),
          ({ siblingData = {}, }) => formatJalaliDate(
            siblingData[source] as JalaliDateValue, options.display
          )
        ],
      },
    } as TextField);
  };

  if (options.createdAt !== false) add(
    "createdAtJalali", "createdAt", options.overrides?.createdAt
  );
  if (options.updatedAt !== false) add(
    "updatedAtJalali", "updatedAt", options.overrides?.updatedAt
  );

  return output;
}

export { formatJalaliDate };
