import type { TextField } from "payload";

import { normalizeIranLandline, validateIranLandline } from "@nexload-sdk/persian/identity";
import { normalizeIranMobile, toE164Mobile, validateIranMobile } from "@nexload-sdk/persian/mobile";

import type { FieldOptions } from "../common";

import { createValidatedTextField } from "../internal/validated-text";

export type IranMobileFieldOptions = FieldOptions & {
  storage?: "national" | "e164";
};

export function iranMobileField (options: IranMobileFieldOptions = {}): TextField {
  const normalize = options.storage === "e164" ? toE164Mobile : normalizeIranMobile;

  return createValidatedTextField({
    name: options.name ?? "mobile",
    kind: "mobile",
    label: options.label ?? { fa: "همراه", en: "Mobile", },
    normalize,
    validate: validateIranMobile,
    messagePrefix: "mobile",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}

export type IranLandlineFieldOptions = FieldOptions;

export function iranLandlineField (options: IranLandlineFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "landline",
    kind: "landline",
    label: options.label ?? { fa: "تلفن ثابت", en: "Landline", },
    normalize: normalizeIranLandline,
    validate: validateIranLandline,
    messagePrefix: "landline",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}
