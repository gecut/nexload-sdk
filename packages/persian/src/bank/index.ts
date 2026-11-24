import { toEnglishDigits, toPersianDigits } from "../digits";
import {
  type InputValue,
  toInputString,
  type Validation,
} from "../shared/validation";
import { stripInvisible } from "../text";
import { type BankId, CARD_BINS, SHEBA_CODES } from "./banks";
export * from "./banks";
export type CardErrorReason = "empty" | "invalid_format" | "invalid_checksum";
export type ShebaErrorReason = CardErrorReason;
export const CARD_ERROR_MESSAGES_FA: Readonly<Record<CardErrorReason, string>> =
  {
    empty: "شماره کارت را وارد کنید.",
    invalid_format: "شماره کارت معتبر نیست.",
    invalid_checksum: "شماره کارت معتبر نیست.",
  };
export const SHEBA_ERROR_MESSAGES_FA: Readonly<
  Record<ShebaErrorReason, string>
> = {
  empty: "شماره شبا را وارد کنید.",
  invalid_format: "شماره شبا معتبر نیست.",
  invalid_checksum: "شماره شبا معتبر نیست.",
};
function clean(input: InputValue): string {
  return toEnglishDigits(stripInvisible(toInputString(input)))
    .replace(/[\s-]/g, "")
    .toUpperCase();
}
export function validateCardNumber(
  input: InputValue,
): Validation<string, CardErrorReason> {
  const v = clean(input);

  if (!v) return { ok: false, reason: "empty" };
  if (!/^\d{16}$/.test(v)) return { ok: false, reason: "invalid_format" };
  let sum = 0;

  for (let i = 0; i < 16; i++) {
    let n = Number(v[i]);

    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }

  return sum % 10 === 0
    ? { ok: true, value: v }
    : { ok: false, reason: "invalid_checksum" };
}
export function normalizeCardNumber(input: InputValue): string | null {
  const r = validateCardNumber(input);

  return r.ok ? r.value : null;
}
export function isValidCardNumber(input: InputValue): boolean {
  return validateCardNumber(input).ok;
}
export function formatCardNumber(
  input: InputValue,
  options: { digits?: "persian" | "latin"; separator?: string } = {},
): string | null {
  const v = normalizeCardNumber(input);

  if (!v) return null;
  const result = (v.match(/.{4}/g) ?? []).join(options.separator ?? " ");

  return options.digits === "persian" ? toPersianDigits(result) : result;
}
export function detectBankByCard(input: InputValue): BankId | null {
  const v = clean(input);

  if (!/^\d{6,16}$/.test(v)) return null;
  if (v.startsWith("621986") && /^(18|19)/.test(v.slice(6, 8))) return "blu";

  return CARD_BINS[v.slice(0, 6)] ?? null;
}
function sheba(input: InputValue): string {
  const v = clean(input);

  return /^\d{24}$/.test(v) ? `IR${v}` : v;
}
export function validateSheba(
  input: InputValue,
): Validation<string, ShebaErrorReason> {
  const v = sheba(input);

  if (!v) return { ok: false, reason: "empty" };
  if (!/^IR\d{24}$/.test(v)) return { ok: false, reason: "invalid_format" };
  const check = Number(v.slice(2, 4));

  if (check < 2 || check > 98) return { ok: false, reason: "invalid_checksum" };
  const digits = `${v.slice(4)}1827${v.slice(2, 4)}`;
  let remainder = 0;

  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;

  return remainder === 1
    ? { ok: true, value: v }
    : { ok: false, reason: "invalid_checksum" };
}
export function normalizeSheba(input: InputValue): string | null {
  const r = validateSheba(input);

  return r.ok ? r.value : null;
}
export function isValidSheba(input: InputValue): boolean {
  return validateSheba(input).ok;
}
export function formatSheba(input: InputValue): string | null {
  const v = normalizeSheba(input);

  return v ? (v.match(/.{1,4}/g) ?? []).join(" ") : null;
}
export function detectBankBySheba(input: InputValue): BankId | null {
  const v = sheba(input);

  return /^IR\d{24}$/.test(v) ? (SHEBA_CODES[v.slice(4, 7)] ?? null) : null;
}
