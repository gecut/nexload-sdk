import { detectBankByCard, detectBankBySheba, formatCardNumber, formatSheba, validateCardNumber, validateSheba } from "@nexload-sdk/persian/bank";
import { formatJalali } from "@nexload-sdk/persian/date";
import { validateNationalCode } from "@nexload-sdk/persian/identity";
import { formatIranMobile, toE164Mobile, validateIranMobile } from "@nexload-sdk/persian/mobile";
import { formatMoney, parseMoney } from "@nexload-sdk/persian/money";

export const PERSIAN_MODES = ["IRR", "IRT", "mobile", "national-code", "card", "sheba", "jalali"] as const;

const lines = (...items: Array<string | null | undefined>): string =>
  items.filter((item): item is string => typeof item === "string" && item.length > 0).join("\n");

function price(input: string, displayUnit: "IRR" | "IRT"): string {
  const value = parseMoney(input, "IRR");
  if (!value) return "Enter a whole number of rials.";
  return formatMoney(value, { displayUnit }) ?? "Amount outside the supported range.";
}

export function evaluate(input: string, mode: string): string {
  switch (mode) {
    case "IRT": return price(input, "IRT");
    case "mobile": {
      const result = validateIranMobile(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Canonical: ${result.value}`, `E.164: ${toE164Mobile(result.value)}`, `Display: ${formatIranMobile(result.value)}`);
    }
    case "national-code": {
      const result = validateNationalCode(input);
      return result.ok ? lines("Valid", `Canonical: ${result.value}`) : `Invalid: ${result.reason}`;
    }
    case "card": {
      const result = validateCardNumber(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Display: ${formatCardNumber(result.value)}`, `Bank: ${detectBankByCard(result.value) ?? "unknown"}`);
    }
    case "sheba": {
      const result = validateSheba(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Display: ${formatSheba(result.value)}`, `Bank: ${detectBankBySheba(result.value) ?? "unknown"}`);
    }
    case "jalali": {
      const short = formatJalali(input, { format: "short", timeZone: "Asia/Tehran" });
      if (!short) return "Enter an ISO date such as 2024-03-20T12:00:00+03:30.";
      return lines(`Short: ${short}`, `Long: ${formatJalali(input, { format: "long", timeZone: "Asia/Tehran" })}`);
    }
    default: return price(input, "IRR");
  }
}
