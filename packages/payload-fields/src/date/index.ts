import { formatJalaliDate } from "./format-date";

import type { DateField, Field, TextField } from "payload";

export type JalaliPickerAppearance
  = | "dayOnly"
    | "dayAndTime"
    | "timeOnly"
    | "monthOnly";
export type { JalaliDateDisplayOptions, JalaliDateValue } from "./format-date";
export type JalaliDateFieldOptions = {
  name: string
  pickerAppearance?: JalaliPickerAppearance
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: Partial<DateField>
};
export type JalaliTimestampsOptions = {
  createdAt?: boolean
  updatedAt?: boolean
  display?: import("./format-date").JalaliDateDisplayOptions
  overrides?: { createdAt?: Partial<TextField>, updatedAt?: Partial<TextField> }
};

export function jalaliDateField (options: JalaliDateFieldOptions): DateField {
  const overrides = options.overrides ?? {};
  if (overrides.name && overrides.name !== options.name) throw new Error("Jalali date field name is protected.");
  if (overrides.type && overrides.type !== "date") throw new Error("Jalali date field type is protected.");
  const appearance = options.pickerAppearance ?? "dayOnly";
  const display = {
    digits: "persian" as const,
    dateStyle: "medium" as const,
    ...(
      appearance === "dayAndTime" || appearance === "timeOnly"
        ? { timeStyle: "short" as const, }
        : {}
    ),
    ...options.display,
  };
  return {
    ...overrides,
    name: options.name,
    type: "date",
    admin: {
      ...overrides.admin,
      date: { ...overrides.admin?.date, pickerAppearance: appearance, },
      components: {
        ...overrides.admin?.components,
        Field: { path: "@nexload-sdk/payload-fields/admin/jalali-date-field#JalaliDateFieldComponent", clientProps: { appearance, display, }, },
        Cell: { path: "@nexload-sdk/payload-fields/admin/jalali-date-cell#JalaliDateCell", clientProps: { display, }, },
      },
    },
    custom: { ...overrides.custom, nexload: { ...(overrides.custom?.nexload as object), jalaliDate: { appearance, display, }, }, },
  } as DateField;
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
          ({ siblingData, }) => formatJalaliDate(
            siblingData?.[source] as import("./format-date").JalaliDateValue, options.display
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
