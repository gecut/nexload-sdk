import type { NumberField } from "payload";

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
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return value.trim().replace(
    /[۰-۹٠-٩]/g, (digit) => String(Math.max(
      persian.indexOf(digit), arabic.indexOf(digit)
    ) % 10)
  )
    .replace(
      /[٬,\s]/g, ""
    )
    .replace(
      /٫/g, "."
    );
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
  const locale = display.locale ?? (display.digits === "latin" ? "fa-IR-u-nu-latn" : "fa-IR");
  const major = value / 10 ** definition.fractionDigits;
  const formatted = new Intl.NumberFormat(
    locale, { useGrouping: display.grouping ?? true, minimumFractionDigits: definition.fractionDigits, maximumFractionDigits: definition.fractionDigits, }
  ).format(major);
  return display.showCurrency ?? true ? `${formatted} ${definition.label}` : formatted;
}

export function moneyField (options: MoneyFieldOptions): NumberField {
  const overrides = options.overrides ?? {};
  if (overrides.name && overrides.name !== options.name) throw new Error("Money field name is protected.");
  if (overrides.type && overrides.type !== "number") throw new Error("Money field type is protected.");
  const currency = resolveCurrency(options.currency);
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
  const validate: NumberField["validate"] = (
    value: unknown, args: { required?: boolean } | undefined
  ) => {
    if (value === null || value === undefined || value === "") return args?.required ? "وارد کردن مبلغ الزامی است." : true;
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "مبلغ باید یک عدد صحیح معتبر باشد.";
    if (!options.allowNegative && value < 0) return "مبلغ منفی مجاز نیست.";
    if (options.minMinorUnits !== undefined && value < options.minMinorUnits) return "مبلغ کمتر از حد مجاز است.";
    if (options.maxMinorUnits !== undefined && value > options.maxMinorUnits) return "مبلغ بیشتر از حد مجاز است.";
    return consumerValidate
      ? (consumerValidate as (value: number, args: unknown) => string | true)(
        value, args
      )
      : true;
  };
  const display = {
    locale: "fa-IR", digits: "persian" as const, grouping: true, showCurrency: true, ...options.display,
  };
  return {
    ...overrides,
    name: options.name,
    type: "number",
    validate,
    admin: {
      ...overrides.admin,
      components: {
        ...overrides.admin?.components,
        Field: {
          path: "@nexload-sdk/payload-fields/admin/money-field#MoneyFieldComponent",
          clientProps: {
            currency,
            display,
            allowNegative: options.allowNegative ?? false,
          },
        },
      },
    },
    custom: { ...overrides.custom, nexload: { ...(overrides.custom?.nexload as object), money: currency, }, },
  } as NumberField;
}
