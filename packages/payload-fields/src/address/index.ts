import type { Field, GroupField, RowField, SelectField, TextareaField, TextField } from "payload";

import { IRAN_PROVINCES } from "@nexload-sdk/persian/geo";

import { iranMobileField } from "../contact";
import { postalCodeField } from "../identity";
import { assertProtected } from "../internal/protect";

export type IranAddressFieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  required?: boolean;
  recipient?: boolean;
  overrides?: Partial<GroupField>;
};

export function iranAddressField (options: IranAddressFieldOptions = {}): GroupField {
  const name = options.name ?? "address";
  const { required: overrideRequired, ...overrides } = options.overrides ?? {};
  assertProtected(overrides, name, "group", "Iran address field");

  const required = options.required ?? overrideRequired;
  const recipient = options.recipient ?? true;
  const defaultLabel = { fa: "نشانی", en: "Address", };

  const provinceField: SelectField = {
    name: "province",
    type: "select",
    label: { fa: "استان", en: "Province", },
    options: IRAN_PROVINCES.map((p) => ({
      value: p.code,
      label: { fa: p.nameFa, en: p.nameEn, },
    })),
    ...(required !== undefined ? { required, } : {}),
  };

  const cityField: TextField = {
    name: "city",
    type: "text",
    label: { fa: "شهر", en: "City", },
    ...(required !== undefined ? { required, } : {}),
  };

  const lineField: TextareaField = {
    name: "line",
    type: "textarea",
    label: { fa: "نشانی", en: "Address line", },
    ...(required !== undefined ? { required, } : {}),
  };

  const postalCode = postalCodeField({
    required,
  });

  const fields: Field[] = [
    {
      type: "row",
      fields: [provinceField, cityField],
    } as RowField,
    lineField,
    postalCode,
  ];

  if (recipient) {
    const recipientNameField: TextField = {
      name: "recipientName",
      type: "text",
      label: { fa: "نام گیرنده", en: "Recipient name", },
      ...(required !== undefined ? { required, } : {}),
    };

    const recipientMobile = iranMobileField({
      name: "recipientMobile",
      label: { fa: "همراه گیرنده", en: "Recipient mobile", },
      required,
    });

    fields.push({
      type: "row",
      fields: [recipientNameField, recipientMobile],
    } as RowField);
  }

  return {
    ...overrides,
    name,
    type: "group",
    label: overrides.label ?? options.label ?? defaultLabel,
    fields,
  } as GroupField;
}
