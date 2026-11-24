import { toEnglishDigits, toPersianDigits } from "../digits";
import {
  type InputValue,
  toInputString,
  type Validation,
} from "../shared/validation";
import { stripInvisible } from "../text";
export type MobileErrorReason = "empty" | "invalid";
export const MOBILE_ERROR_MESSAGES_FA: Readonly<
  Record<MobileErrorReason, string>
> = { empty: "شماره همراه را وارد کنید.", invalid: "شماره همراه معتبر نیست." };
export function validateIranMobile(
  input: InputValue,
): Validation<string, MobileErrorReason> {
  const raw = stripInvisible(toInputString(input)).trim();

  if (!raw) return { ok: false, reason: "empty" };
  let value = toEnglishDigits(raw).replace(/[\s().-]/g, "");
  value = value.replace(/^(?:\+98|0098|98)(?=9\d{9}$)/, "0");
  if (/^9\d{9}$/.test(value)) value = `0${value}`;

  return /^09\d{9}$/.test(value)
    ? { ok: true, value }
    : { ok: false, reason: "invalid" };
}
export function normalizeIranMobile(input: InputValue): string | null {
  const result = validateIranMobile(input);

  return result.ok ? result.value : null;
}
export function isValidIranMobile(input: InputValue): boolean {
  return validateIranMobile(input).ok;
}
export function toE164Mobile(input: InputValue): string | null {
  const value = normalizeIranMobile(input);

  return value ? `+98${value.slice(1)}` : null;
}
export function formatIranMobile(
  input: InputValue,
  options: { digits?: "persian" | "latin"; separator?: string } = {},
): string | null {
  const value = normalizeIranMobile(input);

  if (!value) return null;
  const result = [value.slice(0, 4), value.slice(4, 7), value.slice(7)].join(
    options.separator ?? " ",
  );

  return options.digits === "persian" ? toPersianDigits(result) : result;
}
