import {
  iranAddressField,
  iranMobileField,
  jalaliDateField,
  jalaliDateRangeField,
  moneyField,
  slugField,
} from "@nexload-sdk/payload-fields";
import { schemaFields } from "@nexload-sdk/payload-fields/schema";

export const fields = [
  { name: "title", type: "text" as const },
  ...slugField({ source: "title" }),
  jalaliDateField({ name: "publishedAt" }),
  jalaliDateRangeField({ start: "startsAt", end: "endsAt" }),
  moneyField({ name: "price", currency: "IRT", minMinorUnits: 0 }),
  iranMobileField({ name: "contactMobile" }),
  iranAddressField({ recipient: true }),
];

export const mobileSchema = schemaFields.iranMobile();
