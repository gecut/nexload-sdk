export type Validation<TValue, TReason extends string> =
  | { ok: true; value: TValue }
  | { ok: false; reason: TReason };
export type InputValue = string | number | null | undefined;
export function toInputString(input: InputValue): string {
  return typeof input === "string" ? input : typeof input === "number" && Number.isSafeInteger(input) ? String(input) : "";
}
