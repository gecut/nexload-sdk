import type { TextField } from "payload";

import {
  normalizeCardNumber,
  normalizeSheba,
  validateCardNumber,
  validateSheba,
} from "@nexload-sdk/persian/bank";

import type { FieldOptions } from "../common";

import { createValidatedTextField } from "../internal/validated-text";

export type BankCardFieldOptions = FieldOptions;

export function bankCardField (options: BankCardFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "cardNumber",
    kind: "card",
    label: options.label ?? { fa: "شماره کارت", en: "Card number", },
    normalize: normalizeCardNumber,
    validate: validateCardNumber,
    messagePrefix: "card",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}

export type ShebaFieldOptions = FieldOptions;

export function shebaField (options: ShebaFieldOptions = {}): TextField {
  return createValidatedTextField({
    name: options.name ?? "sheba",
    kind: "sheba",
    label: options.label ?? { fa: "شماره شبا", en: "Sheba (IBAN)", },
    normalize: normalizeSheba,
    validate: validateSheba,
    messagePrefix: "sheba",
    unique: options.unique,
    required: options.required,
    overrides: options.overrides,
  });
}
