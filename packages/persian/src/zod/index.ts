import { z } from "zod";

import type { Validation } from "../shared/validation";

import {
  CARD_ERROR_MESSAGES_FA,
  SHEBA_ERROR_MESSAGES_FA,
  validateCardNumber,
  validateSheba,
} from "../bank";
import { parseJalaliDate } from "../date";
import {
  LANDLINE_ERROR_MESSAGES_FA,
  LEGAL_ID_ERROR_MESSAGES_FA,
  NATIONAL_CODE_ERROR_MESSAGES_FA,
  POSTAL_CODE_ERROR_MESSAGES_FA,
  validateIranLandline,
  validateLegalId,
  validateNationalCode,
  validatePostalCode,
} from "../identity";
import {
  MOBILE_ERROR_MESSAGES_FA,
  toE164Mobile,
  validateIranMobile,
} from "../mobile";
import { type CurrencyUnit, money } from "../money";
type Options = { message?: string };
function schema<R extends string>(
  validate: (value: string) => Validation<string, R>,
  messages: Readonly<Record<R, string>>,
  options: Options = {},
) {
  return z.string().transform((value, ctx) => {
    const result = validate(value);

    if (!result.ok) {
      ctx.addIssue({
        code: "custom",
        message: options.message ?? messages[result.reason],
      });

      return z.NEVER;
    }

    return result.value;
  });
}
export function iranMobileSchema(
  options: Options & { format?: "national" | "e164" } = {},
) {
  return schema(
    validateIranMobile,
    MOBILE_ERROR_MESSAGES_FA,
    options,
  ).transform((value) =>
    options.format === "e164" ? (toE164Mobile(value) ?? value) : value,
  );
}
export function nationalCodeSchema(options?: Options) {
  return schema(validateNationalCode, NATIONAL_CODE_ERROR_MESSAGES_FA, options);
}
export function legalIdSchema(options?: Options) {
  return schema(validateLegalId, LEGAL_ID_ERROR_MESSAGES_FA, options);
}
export function postalCodeSchema(options?: Options) {
  return schema(validatePostalCode, POSTAL_CODE_ERROR_MESSAGES_FA, options);
}
export function iranLandlineSchema(options?: Options) {
  return schema(validateIranLandline, LANDLINE_ERROR_MESSAGES_FA, options);
}
export function cardNumberSchema(options?: Options) {
  return schema(validateCardNumber, CARD_ERROR_MESSAGES_FA, options);
}
export function shebaSchema(options?: Options) {
  return schema(validateSheba, SHEBA_ERROR_MESSAGES_FA, options);
}
export function jalaliDateSchema(
  options: Options & { time?: string; timeZone?: string } = {},
) {
  return z.string().transform((value, ctx) => {
    const result = parseJalaliDate(value, options);

    if (!result) {
      ctx.addIssue({
        code: "custom",
        message: options.message ?? "تاریخ معتبر نیست.",
      });

      return z.NEVER;
    }

    return result;
  });
}
export function moneySchema(unit: CurrencyUnit, options: Options = {}) {
  return z.number().transform((value, ctx) => {
    if (!Number.isSafeInteger(value) || value < 0) {
      ctx.addIssue({
        code: "custom",
        message: options.message ?? "مبلغ معتبر نیست.",
      });

      return z.NEVER;
    }

    return money(value, unit);
  });
}
