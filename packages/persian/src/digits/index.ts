export function toEnglishDigits(input: string | number | null | undefined): string {
  return (typeof input === "string" || typeof input === "number" ? String(input) : "").replace(/[۰-۹٠-٩]/g, (c) =>
    String(c.charCodeAt(0) - (c >= "۰" ? 1776 : 1632)),
  );
}
export function toPersianDigits(input: string | number | null | undefined): string {
  return (typeof input === "string" || typeof input === "number" ? String(input) : "").replace(/[0-9]/g, (c) =>
    String.fromCharCode(1776 + Number(c)),
  );
}
export function parseNumber(input: string | number | null | undefined): number | null {
  if (typeof input !== "string" && typeof input !== "number") return null;
  const normalized = toEnglishDigits(input).trim();

  if (/[.٫][^]*[٬,\s]/.test(normalized)) return null;
  const value = normalized
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");

  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return null;
  const result = Number(value);

  return Number.isFinite(result) && Math.abs(result) <= Number.MAX_SAFE_INTEGER
    ? result
    : null;
}
export type NumberFormatOptions = {
  digits?: "persian" | "latin";
  grouping?: boolean;
  fractionDigits?: number;
};
function decimalString(value: number): string {
  const text = String(value);
  const [coefficient = "", exponent] = text.split("e");

  if (exponent === undefined) return text;
  const negative = coefficient.startsWith("-");
  const digits = coefficient.replace("-", "").replace(".", "");
  const point = 1 + Number(exponent);
  const unsigned = point <= 0
    ? `0.${"0".repeat(-point)}${digits}`
    : point >= digits.length
      ? digits + "0".repeat(point - digits.length)
      : `${digits.slice(0, point)}.${digits.slice(point)}`;

  return negative ? `-${unsigned}` : unsigned;
}
export function formatNumber(
  value: string | number | null | undefined,
  options: NumberFormatOptions = {},
): string {
  const parsed = typeof value === "number" ? value : parseNumber(value);

  if (parsed === null || !Number.isFinite(parsed) || Math.abs(parsed) >= 1e21) throw new RangeError("Invalid number");
  const f = options.fractionDigits;
  const raw = f === undefined ? decimalString(parsed) : new Intl.NumberFormat("en-US", {
    useGrouping: false,
    minimumFractionDigits: f,
    maximumFractionDigits: f,
  }).format(parsed);
  const [integer = "", fraction] = raw.split(".");
  const persian = options.digits !== "latin";
  const grouped =
    options.grouping === false
      ? integer
      : integer.replace(/\B(?=(\d{3})+(?!\d))/g, persian ? "٬" : ",");
  const result =
    grouped + (fraction === undefined ? "" : (persian ? "٫" : ".") + fraction);

  return persian ? toPersianDigits(result) : result;
}
