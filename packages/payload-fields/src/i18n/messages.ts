import { CARD_ERROR_MESSAGES_FA, SHEBA_ERROR_MESSAGES_FA } from "@nexload-sdk/persian/bank";
import { LANDLINE_ERROR_MESSAGES_FA, LEGAL_ID_ERROR_MESSAGES_FA, NATIONAL_CODE_ERROR_MESSAGES_FA, POSTAL_CODE_ERROR_MESSAGES_FA } from "@nexload-sdk/persian/identity";
import { MOBILE_ERROR_MESSAGES_FA } from "@nexload-sdk/persian/mobile";

export type Language = "fa" | "en";
export type MessageKey = "invalid" | "required" | "mobile.invalid" | "landline.invalid" | "nationalCode.invalid_format" | "nationalCode.repeated_digits" | "nationalCode.invalid_checksum" | "legalId.invalid_format" | "legalId.invalid_checksum" | "postalCode.invalid_format" | "postalCode.repeated_digits" | "card.invalid_format" | "card.invalid_checksum" | "sheba.invalid_format" | "sheba.invalid_checksum" | "money.integer" | "money.negative" | "money.min" | "money.max" | "date.invalid" | "date.min" | "date.max" | "dateRange.order" | "slug.taken" | "slug.unauthenticated" | "slug.forbidden" | "slug.invalidInput" | "slug.notFound" | "slug.failed" | "sortOrder.integer" | "ui.clear" | "ui.generateSlug" | "ui.lock" | "ui.edit";
export const messages: Record<Language, Record<MessageKey, string>> = {
  fa: {
    invalid: "مقدار وارد شده معتبر نیست.", required: "این فیلد الزامی است.", "mobile.invalid": MOBILE_ERROR_MESSAGES_FA.invalid, "landline.invalid": LANDLINE_ERROR_MESSAGES_FA.invalid,
    "nationalCode.invalid_format": NATIONAL_CODE_ERROR_MESSAGES_FA.invalid_format, "nationalCode.repeated_digits": NATIONAL_CODE_ERROR_MESSAGES_FA.repeated_digits, "nationalCode.invalid_checksum": NATIONAL_CODE_ERROR_MESSAGES_FA.invalid_checksum,
    "legalId.invalid_format": LEGAL_ID_ERROR_MESSAGES_FA.invalid_format, "legalId.invalid_checksum": LEGAL_ID_ERROR_MESSAGES_FA.invalid_checksum,
    "postalCode.invalid_format": POSTAL_CODE_ERROR_MESSAGES_FA.invalid_format, "postalCode.repeated_digits": POSTAL_CODE_ERROR_MESSAGES_FA.repeated_digits,
    "card.invalid_format": CARD_ERROR_MESSAGES_FA.invalid_format, "card.invalid_checksum": CARD_ERROR_MESSAGES_FA.invalid_checksum, "sheba.invalid_format": SHEBA_ERROR_MESSAGES_FA.invalid_format, "sheba.invalid_checksum": SHEBA_ERROR_MESSAGES_FA.invalid_checksum,
    "money.integer": "مبلغ باید یک عدد صحیح معتبر باشد.", "money.negative": "مبلغ منفی مجاز نیست.", "money.min": "مبلغ کمتر از حد مجاز است.", "money.max": "مبلغ بیشتر از حد مجاز است.",
    "date.invalid": "تاریخ معتبر نیست.", "date.min": "تاریخ کمتر از حد مجاز است.", "date.max": "تاریخ بیشتر از حد مجاز است.", "dateRange.order": "تاریخ پایان باید پس از تاریخ شروع باشد.",
    "slug.taken": "این اسلاگ قبلاً استفاده شده است.", "slug.unauthenticated": "برای تولید اسلاگ باید وارد شوید.", "slug.forbidden": "اجازه تولید اسلاگ را ندارید.", "slug.invalidInput": "ورودی تولید اسلاگ معتبر نیست.", "slug.notFound": "تولیدکننده اسلاگ پیدا نشد.", "slug.failed": "تولید اسلاگ با خطا مواجه شد.",
    "sortOrder.integer": "ترتیب باید عدد صحیح باشد.", "ui.clear": "پاک کردن", "ui.generateSlug": "تولید اسلاگ", "ui.lock": "قفل", "ui.edit": "ویرایش",
  },
  en: {
    invalid: "Invalid value.", required: "This field is required.", "mobile.invalid": "Invalid mobile number.", "landline.invalid": "Invalid phone number.", "nationalCode.invalid_format": "Invalid national code.", "nationalCode.repeated_digits": "Invalid national code.", "nationalCode.invalid_checksum": "Invalid national code.", "legalId.invalid_format": "Invalid legal ID.", "legalId.invalid_checksum": "Invalid legal ID.", "postalCode.invalid_format": "Invalid postal code.", "postalCode.repeated_digits": "Invalid postal code.", "card.invalid_format": "Invalid card number.", "card.invalid_checksum": "Invalid card number.", "sheba.invalid_format": "Invalid Sheba.", "sheba.invalid_checksum": "Invalid Sheba.", "money.integer": "Amount must be an integer.", "money.negative": "Negative amounts are not allowed.", "money.min": "Amount is below the minimum.", "money.max": "Amount exceeds the maximum.", "date.invalid": "Invalid date.", "date.min": "Date is before the minimum.", "date.max": "Date exceeds the maximum.", "dateRange.order": "End date must follow start date.", "slug.taken": "This slug is already taken.", "slug.unauthenticated": "Sign in to generate a slug.", "slug.forbidden": "You cannot generate a slug.", "slug.invalidInput": "Invalid slug input.", "slug.notFound": "Slug generator not found.", "slug.failed": "Slug generation failed.", "sortOrder.integer": "Order must be an integer.", "ui.clear": "Clear", "ui.generateSlug": "Generate slug", "ui.lock": "Lock", "ui.edit": "Edit",
  },
};
export function resolveLanguage (language: string | undefined): Language { return language?.startsWith("fa") ? "fa" : "en"; }
export function t (language: string | undefined, key: string): string {
  const dictionary = messages[resolveLanguage(language)];

  return Object.hasOwn(dictionary, key) ? dictionary[key as MessageKey] : dictionary.invalid;
}
