import type { DateField } from "payload";

type Date = (overrides?: DateField) => [DateField];

export const dateField: Date = (overrides = {
  type: "date",
  name: "date",
}) => {
  const dateField: DateField = {
    index: true,
    label: "تاریخ",
    ...(overrides || {}),
    admin: {
      position: "sidebar",
      ...(overrides?.admin || {}),
      components: {
        Cell: { path: "@nexload-sdk/payload-fields/fields/date/date-cell#DateCell", },
        Field: { path: "@nexload-sdk/payload-fields/fields/date/date-picker#DatePicker", },
      },
    },
  };

  return [dateField];
};

export * from './format-date';