import { formatNumber, parseNumber } from "../digits";
export type CurrencyUnit = "IRR" | "IRT";
export type Money = Readonly<{ amount: number; unit: CurrencyUnit }>;
export type MoneyRounding = "error" | "floor" | "round" | "ceil";
export const CURRENCY_LABELS_FA: Readonly<Record<CurrencyUnit, string>> = {
  IRR: "ریال",
  IRT: "تومان",
};
function validUnit(unit: unknown): unit is CurrencyUnit {
  return unit === "IRR" || unit === "IRT";
}
export function money(amount: number, unit: CurrencyUnit): Money {
  if (!Number.isSafeInteger(amount) || !validUnit(unit)) throw new RangeError("Invalid amount");

  return Object.freeze({ amount, unit });
}
export function convertMoney(
  value: Money | null | undefined,
  to: CurrencyUnit,
  options: { rounding?: MoneyRounding } = {},
): Money {
  if (!value || typeof value !== "object" || !Number.isSafeInteger(value.amount) || !validUnit(value.unit) || !validUnit(to)) throw new RangeError("Invalid money");
  if (value.unit === to) return money(value.amount, to);
  if (to === "IRR") return money(value.amount * 10, to);
  const amount = value.amount / 10;
  const rounding = options.rounding ?? "error";

  if (rounding === "error" && !Number.isInteger(amount))
    throw new RangeError("Rounding required");

  return money(rounding === "error" ? amount : Math[rounding](amount), to);
}
export function parseMoney(
  input: string | number | null | undefined,
  unit: CurrencyUnit,
): Money | null {
  if (typeof input === "string" && /[.٫]/.test(input.replace(/[٬,\s]/g, ""))) return null;
  const value = parseNumber(input);

  return value !== null && Number.isSafeInteger(value)
    ? money(value, unit)
    : null;
}
export type MoneyFormatOptions = {
  digits?: "persian" | "latin";
  showUnit?: boolean;
  displayUnit?: CurrencyUnit;
  rounding?: MoneyRounding;
  zeroLabel?: string;
};
export function formatMoney(
  value: Money | null | undefined,
  options: MoneyFormatOptions = {},
): string | null {
  if (!value || typeof value !== "object" || !Number.isSafeInteger(value.amount) || !validUnit(value.unit)) return null;
  const fallback = options.rounding === undefined && value.unit === "IRR" && options.displayUnit === "IRT" && value.amount % 10 !== 0;
  const v = options.displayUnit && !fallback
    ? convertMoney(value, options.displayUnit, { rounding: options.rounding })
    : value;

  if (v.amount === 0 && options.zeroLabel !== undefined)
    return options.zeroLabel;
  const result = formatNumber(v.amount, { digits: options.digits });

  return options.showUnit === false
    ? result
    : `${result} ${CURRENCY_LABELS_FA[v.unit]}`;
}
