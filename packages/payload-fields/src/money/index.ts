import type { NumberField, NumberFieldSingleValidation } from "payload";

import { number } from "payload/shared";

import { formatNumber, parseNumber, toEnglishDigits } from "@nexload-sdk/persian/digits";

import { t } from "../i18n/messages";
import { assertProtected } from "../internal/protect";

export type MoneyCurrencyDefinition = {
  code: string
  label: string
  fractionDigits: number
};
export type MoneyCurrency = "IRR" | "IRT" | MoneyCurrencyDefinition;
export type MoneyDisplayOptions = {
  locale?: string
  digits?: "persian" | "latin"
  grouping?: boolean
  showCurrency?: boolean
};
export type MoneyFieldOptions = {
  name: string
  currency: MoneyCurrency
  minMinorUnits?: number
  maxMinorUnits?: number
  allowNegative?: boolean
  display?: MoneyDisplayOptions
  displayCurrency?: "IRR" | "IRT"
  label?: { fa: string, en: string }
  required?: boolean
  overrides?: Partial<NumberField>
};

export const IRR: Readonly<MoneyCurrencyDefinition> = { code: "IRR", label: "ریال", fractionDigits: 0, };
export const IRT: Readonly<MoneyCurrencyDefinition> = { code: "IRT", label: "تومان", fractionDigits: 0, };

export function resolveCurrency (currency: MoneyCurrency): MoneyCurrencyDefinition {
  const result = currency === "IRR" ? IRR : currency === "IRT" ? IRT : currency;

  if (
    !result.code.trim()
    || !result.label.trim()
    || !Number.isInteger(result.fractionDigits)
    || result.fractionDigits < 0
    || result.fractionDigits > 20
  ) throw new Error("Invalid money currency definition.");

  return result;
}

function normalizedNumber (value: string): string {
  return toEnglishDigits(value.trim()).replace(/[٬,\s]/g, "").replace(/٫/g, ".");
}

export function parseMoneyToMinorUnits (
  input: string, currency: MoneyCurrency
): number {
  const definition = resolveCurrency(currency);
  const value = normalizedNumber(input);

  if (!(/^-?\d+(?:\.\d+)?$/).test(value)) throw new TypeError("Invalid money input.");
  const negative = value.startsWith("-");
  const [
    whole,
    fraction = ""
  ] = (negative ? value.slice(1) : value).split(".");

  if (fraction.length > definition.fractionDigits) throw new RangeError("Money input has unsupported precision.");
  const digits = `${whole}${fraction.padEnd(
    definition.fractionDigits, "0"
  )}`.replace(
    /^0+(?=\d)/, ""
  ) || "0";
  const minor = Number(`${negative ? "-" : ""}${digits}`);

  if (!Number.isSafeInteger(minor)) throw new RangeError("Money value is outside the safe integer range.");

  return minor;
}

export function formatMoney (
  value: number | null | undefined,
  currency: MoneyCurrency,
  display: MoneyDisplayOptions = {}
): string | null {
  if (value === null || value === undefined) return null;
  if (!Number.isSafeInteger(value)) throw new RangeError("Money value is outside the safe integer range.");
  const definition = resolveCurrency(currency);
  const major = value / 10 ** definition.fractionDigits;
  const formatted = display.locale
    ? new Intl.NumberFormat(display.locale, { useGrouping: display.grouping ?? true, minimumFractionDigits: definition.fractionDigits, maximumFractionDigits: definition.fractionDigits, }).format(major)
    : formatNumber(major, { digits: display.digits, grouping: display.grouping, fractionDigits: definition.fractionDigits, });

  return display.showCurrency ?? true ? `${formatted} ${definition.label}` : formatted;
}

export function moneyField (options: MoneyFieldOptions): NumberField {
  const overrides = options.overrides ?? {};

  assertProtected(overrides, options.name, "number", "Money field");
  const currency = resolveCurrency(options.currency);

  if (options.displayCurrency && ((currency.code !== "IRR" && currency.code !== "IRT") || options.displayCurrency === currency.code)) throw new Error("Invalid money display currency.");

  if (
    options.minMinorUnits !== undefined
    && (
      !Number.isSafeInteger(options.minMinorUnits)
      || (
        options.maxMinorUnits !== undefined
        && options.minMinorUnits > options.maxMinorUnits
      )
    )
  ) throw new Error("Invalid money bounds.");
  if (options.maxMinorUnits !== undefined && !Number.isSafeInteger(options.maxMinorUnits)) throw new Error("Invalid money bounds.");
  const consumerValidate = overrides.validate;
  const validate: NumberFieldSingleValidation = (value, args) => {
    const language = args?.req?.i18n?.language;

    if (value === null || value === undefined) {
      if (args?.required ?? options.required ?? overrides.required) return t(language, "required");
    } else {
      if (typeof value !== "number" || !Number.isSafeInteger(value)) return t(language, "money.integer");
      if (!options.allowNegative && value < 0) return t(language, "money.negative");
      if (options.minMinorUnits !== undefined && value < options.minMinorUnits) return t(language, "money.min");
      if (options.maxMinorUnits !== undefined && value > options.maxMinorUnits) return t(language, "money.max");
    }
    const result = number(value, args);

    if (result !== true) return result;

    return consumerValidate ? (consumerValidate as NumberFieldSingleValidation)(value, args) : true;
  };
  const display = {
    locale: "fa-IR", digits: "persian" as const, grouping: true, showCurrency: true, ...options.display,
  };

  return {
    ...overrides,
    name: options.name,
    type: "number",
    validate,
    label: options.label ?? overrides.label,
    required: options.required ?? overrides.required,
    hooks: { ...overrides.hooks, beforeValidate: [ ...(overrides.hooks?.beforeValidate ?? []), ({ value }) => {
      if (typeof value !== "string") return value;
      if (!value.trim()) return null;
      const parsed = parseNumber(value);

      return parsed !== null && Number.isSafeInteger(parsed) ? parsed : value;
    } ] },
    admin: {
      ...overrides.admin,
      components: {
        ...overrides.admin?.components,
        Cell: { path: "@nexload-sdk/payload-fields/admin/money-cell#MoneyCell", clientProps: { currency, display, displayCurrency: options.displayCurrency } },
        Field: {
          path: "@nexload-sdk/payload-fields/admin/money-field#MoneyFieldComponent",
          clientProps: {
            currency,
            display,
            displayCurrency: options.displayCurrency,
            allowNegative: options.allowNegative ?? false,
          },
        },
      },
    },
    custom: { ...overrides.custom, nexload: { ...(overrides.custom?.nexload as object), money: currency, }, },
  } as NumberField;
}
