import type { TextField, TextFieldSingleValidation } from "payload";

import { text } from "payload/shared";

import { t } from "../i18n/messages";
import { assertProtected } from "./protect";

export type ValidatedTextKind = "mobile" | "landline" | "nationalCode" | "legalId" | "postalCode" | "card" | "sheba" | "ltr";
export type ValidatedTextOptions = {
  name: string;
  kind: ValidatedTextKind;
  label?: { fa: string; en: string };
  normalize: (input: string) => string | null;
  validate: (input: string) => { ok: true; value: string } | { ok: false; reason: string };
  messagePrefix: string;
  unique?: boolean;
  required?: boolean;
  overrides?: Partial<TextField>;
};

export function createValidatedTextField (options: ValidatedTextOptions): TextField {
  const overrides = options.overrides ?? {};
  assertProtected(overrides, options.name, "text", "Validated text field");
  const consumerValidate = overrides.validate;
  const validate: TextFieldSingleValidation = (value, args) => {
    const language = args?.req?.i18n?.language;

    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
      if (args?.required ?? options.required ?? overrides.required) return t(language, "required");
    } else {
      const result = options.validate(value);

      if (!result.ok) return t(language, `${options.messagePrefix}.${result.reason}`);
    }

    const defaultResult = text(value, args);

    if (defaultResult !== true) return defaultResult;

    return consumerValidate ? (consumerValidate as TextFieldSingleValidation)(value, args) : true;
  };

  const components = options.kind === "ltr"
    ? overrides.admin?.components
    : {
      ...overrides.admin?.components,
      Field: { path: "@nexload-sdk/payload-fields/admin/validated-text-field#ValidatedTextFieldComponent", clientProps: { kind: options.kind, }, },
      Cell: { path: "@nexload-sdk/payload-fields/admin/formatted-cell#FormattedCell", clientProps: { kind: options.kind, }, },
    };

  return {
    ...overrides,
    name: options.name,
    type: "text",
    label: overrides.label ?? options.label,
    unique: options.unique ?? overrides.unique,
    required: options.required ?? overrides.required,
    index: (options.unique ?? overrides.unique) ? true : overrides.index,
    validate,
    admin: {
      ...overrides.admin,
      rtl: false,
      ...(components ? { components, } : {}),
    },
    hooks: {
      ...overrides.hooks,
      beforeValidate: [
        ...(overrides.hooks?.beforeValidate ?? []),
        ({ value, }) => typeof value === "string" ? (options.normalize(value) ?? value) : value,
      ],
    },
    custom: {
      ...overrides.custom,
      nexload: {
        ...(overrides.custom?.nexload as object),
        text: { kind: options.kind, },
      },
    },
  } as TextField;
}
