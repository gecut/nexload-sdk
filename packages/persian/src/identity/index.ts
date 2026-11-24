import { toEnglishDigits } from "../digits";
import {
  type InputValue,
  toInputString,
  type Validation,
} from "../shared/validation";
import { stripInvisible } from "../text";
type Common = "empty" | "invalid_format";
export type NationalCodeErrorReason =
  | Common
  | "repeated_digits"
  | "invalid_checksum";
export type LegalIdErrorReason = Common | "invalid_checksum";
export type PostalCodeErrorReason = Common | "repeated_digits";
export type LandlineErrorReason = "empty" | "invalid";
export const NATIONAL_CODE_ERROR_MESSAGES_FA: Readonly<
  Record<NationalCodeErrorReason, string>
> = {
  empty: "کد ملی را وارد کنید.",
  invalid_format: "کد ملی معتبر نیست.",
  repeated_digits: "کد ملی معتبر نیست.",
  invalid_checksum: "کد ملی معتبر نیست.",
};
export const LEGAL_ID_ERROR_MESSAGES_FA: Readonly<
  Record<LegalIdErrorReason, string>
> = {
  empty: "شناسه ملی را وارد کنید.",
  invalid_format: "شناسه ملی معتبر نیست.",
  invalid_checksum: "شناسه ملی معتبر نیست.",
};
export const POSTAL_CODE_ERROR_MESSAGES_FA: Readonly<
  Record<PostalCodeErrorReason, string>
> = {
  empty: "کد پستی را وارد کنید.",
  invalid_format: "کد پستی معتبر نیست.",
  repeated_digits: "کد پستی معتبر نیست.",
};
export const LANDLINE_ERROR_MESSAGES_FA: Readonly<
  Record<LandlineErrorReason, string>
> = { empty: "شماره تلفن را وارد کنید.", invalid: "شماره تلفن معتبر نیست." };
function clean(input: InputValue): string {
  return toEnglishDigits(stripInvisible(toInputString(input))).replace(
    /[\s-]/g,
    "",
  );
}
export function validateNationalCode(
  input: InputValue,
): Validation<string, NationalCodeErrorReason> {
  let v = clean(input);

  if (!v) return { ok: false, reason: "empty" };
  if (!/^\d{8,10}$/.test(v)) return { ok: false, reason: "invalid_format" };
  v = v.padStart(10, "0");
  if (/^(\d)\1{9}$/.test(v)) return { ok: false, reason: "repeated_digits" };
  let s = 0;

  for (let i = 0; i < 9; i++) s += Number(v[i]) * (10 - i);
  const r = s % 11;

  return Number(v[9]) === (r < 2 ? r : 11 - r)
    ? { ok: true, value: v }
    : { ok: false, reason: "invalid_checksum" };
}
export function normalizeNationalCode(input: InputValue): string | null {
  const r = validateNationalCode(input);

  return r.ok ? r.value : null;
}
export function isValidNationalCode(input: InputValue): boolean {
  return validateNationalCode(input).ok;
}
export function validateLegalId(
  input: InputValue,
): Validation<string, LegalIdErrorReason> {
  const v = clean(input);

  if (!v) return { ok: false, reason: "empty" };
  if (!/^\d{11}$/.test(v)) return { ok: false, reason: "invalid_format" };
  const d = Number(v[9]) + 2;
  const weights = [29, 27, 23, 19, 17, 29, 27, 23, 19, 17];
  let s = 0;

  for (let i = 0; i < 10; i++) s += (Number(v[i]) + d) * (weights[i] ?? 0);
  const r = s % 11;

  return Number(v[10]) === (r === 10 ? 0 : r)
    ? { ok: true, value: v }
    : { ok: false, reason: "invalid_checksum" };
}
export function normalizeLegalId(input: InputValue): string | null {
  const r = validateLegalId(input);

  return r.ok ? r.value : null;
}
export function isValidLegalId(input: InputValue): boolean {
  return validateLegalId(input).ok;
}
export function validatePostalCode(
  input: InputValue,
): Validation<string, PostalCodeErrorReason> {
  const v = clean(input);

  if (!v) return { ok: false, reason: "empty" };
  if (!/^\d{10}$/.test(v)) return { ok: false, reason: "invalid_format" };
  if (/^(\d)\1{9}$/.test(v)) return { ok: false, reason: "repeated_digits" };

  return { ok: true, value: v };
}
export function normalizePostalCode(input: InputValue): string | null {
  const r = validatePostalCode(input);

  return r.ok ? r.value : null;
}
export function isValidPostalCode(input: InputValue): boolean {
  return validatePostalCode(input).ok;
}
export function validateIranLandline(
  input: InputValue,
): Validation<string, LandlineErrorReason> {
  let v = clean(input);

  if (!v) return { ok: false, reason: "empty" };
  v = v.replace(/^(?:\+98|0098)(?=[1-8]\d{9}$)/, "0");

  return /^0[1-8]\d{9}$/.test(v)
    ? { ok: true, value: v }
    : { ok: false, reason: "invalid" };
}
export function normalizeIranLandline(input: InputValue): string | null {
  const r = validateIranLandline(input);

  return r.ok ? r.value : null;
}
export function isValidIranLandline(input: InputValue): boolean {
  return validateIranLandline(input).ok;
}
