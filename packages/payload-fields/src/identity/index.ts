import type { TextField } from "payload";

import {
  normalizeLegalId,
  normalizeNationalCode,
  normalizePostalCode,
  validateLegalId,
  validateNationalCode,
  validatePostalCode,
} from "@nexload-sdk/persian/identity";

import type { FieldOptions } from "../common";

import { createValidatedTextField } from "../internal/validated-text";

export type NationalCodeFieldOptions = FieldOptions;

export function nationalCodeField (options: NationalCodeFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "nationalCode",
    kind: "nationalCode",
    label: options.label ?? { fa: "کد ملی", en: "National code", },
    normalize: normalizeNationalCode,
    validate: validateNationalCode,
    messagePrefix: "nationalCode",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}

export type LegalIdFieldOptions = FieldOptions;

export function legalIdField (options: LegalIdFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "legalId",
    kind: "legalId",
    label: options.label ?? { fa: "شناسه ملی", en: "Legal ID", },
    normalize: normalizeLegalId,
    validate: validateLegalId,
    messagePrefix: "legalId",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}

export type PostalCodeFieldOptions = FieldOptions;

export function postalCodeField (options: PostalCodeFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "postalCode",
    kind: "postalCode",
    label: options.label ?? { fa: "کد پستی", en: "Postal code", },
    normalize: normalizePostalCode,
    validate: validatePostalCode,
    messagePrefix: "postalCode",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}
