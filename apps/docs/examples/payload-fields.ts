import {
  jalaliDateField,
  moneyField,
  slugField,
} from "@nexload-sdk/payload-fields";

export const fields = [
  { name: "title", type: "text" as const },
  ...slugField({ source: "title" }),
  jalaliDateField({ name: "publishedAt" }),
  moneyField({ name: "price", currency: "IRT", minMinorUnits: 0 }),
];
