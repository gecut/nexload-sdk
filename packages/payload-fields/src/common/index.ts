import type { NumberField, NumberFieldSingleValidation, TextField } from "payload";

import { number } from "payload/shared";

import { t } from "../i18n/messages";
import { assertProtected } from "../internal/protect";
import { createValidatedTextField } from "../internal/validated-text";

export type FieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  required?: boolean;
  unique?: boolean;
  overrides?: Partial<TextField>;
};

export type LtrTextFieldOptions = {
  name: string;
  label?: { fa: string; en: string };
  required?: boolean;
  unique?: boolean;
  monospace?: boolean;
  minLength?: number;
  maxLength?: number;
  overrides?: Partial<TextField>;
};

export function ltrTextField (options: LtrTextFieldOptions): TextField {
  const classes = ["nexload-ltr"];

  if (options.monospace) classes.push("nexload-ltr--mono");

  const existingClass = options.overrides?.admin?.className;
  const className = existingClass ? `${existingClass} ${classes.join(" ")}` : classes.join(" ");

  return createValidatedTextField({
    name: options.name,
    kind: "ltr",
    label: options.label,
    normalize: (val) => val,
    validate: (val) => ({ ok: true, value: val, }),
    messagePrefix: "ltr",
    unique: options.unique,
    required: options.required,
    overrides: {
      ...options.overrides,
      ...(options.minLength !== undefined ? { minLength: options.minLength, } : {}),
      ...(options.maxLength !== undefined ? { maxLength: options.maxLength, } : {}),
      admin: {
        ...options.overrides?.admin,
        className,
      },
    },
  });
}

export type SortOrderFieldOptions = {
  name?: string;
  label?: { fa: string; en: string };
  overrides?: Partial<NumberField>;
};

export function sortOrderField (options: SortOrderFieldOptions = {}): NumberField {
  const name = options.name ?? "sortOrder";
  const overrides = options.overrides ?? {};
  assertProtected(overrides, name, "number", "Sort order field");

  const defaultLabel = { fa: "ترتیب نمایش", en: "Sort order", };
  const consumerValidate = overrides.validate;

  const validate: NumberFieldSingleValidation = (value, args) => {
    const language = args?.req?.i18n?.language;

    if (value !== null && value !== undefined && (value as unknown) !== "") {
      const num = typeof value === "number" ? value : Number(value);

      if (!Number.isInteger(num)) return t(language, "sortOrder.integer");
    }

    const defaultResult = number(value, args);

    if (defaultResult !== true) return defaultResult;

    return consumerValidate ? (consumerValidate as NumberFieldSingleValidation)(value, args) : true;
  };

  return {
    ...overrides,
    name,
    type: "number",
    label: overrides.label ?? options.label ?? defaultLabel,
    defaultValue: overrides.defaultValue ?? 0,
    min: overrides.min ?? 0,
    index: overrides.index ?? true,
    validate,
    admin: {
      ...overrides.admin,
      position: overrides.admin?.position ?? "sidebar",
    },
  } as NumberField;
}
