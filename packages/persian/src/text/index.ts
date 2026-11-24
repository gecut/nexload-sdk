import { toEnglishDigits, toPersianDigits } from "../digits";
export { slugify } from "./slugify";
export function normalizePersianLetters(input: string | number | null | undefined): string {
  return (typeof input === "string" || typeof input === "number" ? String(input) : "").replace(/[يى]/g, "ی").replace(/(?:\u0643|\u06aa)/g, "ک");
}
export function stripInvisible(input: string | number | null | undefined): string {
  return (typeof input === "string" || typeof input === "number" ? String(input) : "").replace(
    /(?:\u061c|\u200b|\u200d|\u200e|\u200f|[\u202a-\u202e]|[\u2066-\u2069]|\ufeff)/gu,
    "",
  );
}
export function removeDiacritics(input: string | number | null | undefined): string {
  return (typeof input === "string" || typeof input === "number" ? String(input) : "").replace(/[\u064b-\u065f\u0670]/g, "");
}
export function normalizePersianText(
  input: string | number | null | undefined,
  options: { digits?: "keep" | "latin" | "persian" } = {},
): string {
  let result = normalizePersianLetters(stripInvisible((typeof input === "string" || typeof input === "number" ? String(input) : "").normalize("NFKC")))
    .replace(/\s+/g, " ")
    .replace(/\u200c+/g, "‌")
    .trim();

  if (options.digits === "latin") result = toEnglishDigits(result);
  if (options.digits === "persian")
    result = toPersianDigits(toEnglishDigits(result));

  return result;
}
export function toSearchKey(input: string | number | null | undefined): string {
  return removeDiacritics(normalizePersianText(input, { digits: "latin" }))
    .replace(/\u200c/g, " ")
    .toLowerCase();
}
