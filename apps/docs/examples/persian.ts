import { formatNumber } from "@nexload-sdk/persian/digits";
import { normalizePersianText } from "@nexload-sdk/persian/text";
import { normalizeIranMobile } from "@nexload-sdk/persian/mobile";
import { validateNationalCode } from "@nexload-sdk/persian/identity";
import { validateSheba } from "@nexload-sdk/persian/bank";
import { formatMoney, money } from "@nexload-sdk/persian/money";
import { formatJalali } from "@nexload-sdk/persian/date";
import { formatRelativeTime } from "@nexload-sdk/persian/relative";
import { findProvince } from "@nexload-sdk/persian/geo";
import { iranMobileSchema } from "@nexload-sdk/persian/zod";

export const example = {
  number: formatNumber(12345),
  text: normalizePersianText("كالا"),
  mobile: normalizeIranMobile("۰۹۱۲۳۴۵۶۷۸۹"),
  identity: validateNationalCode("۰۰۸۴۵۷۵۹۴۸"),
  sheba: validateSheba("IR820540102680020817909002"),
  money: formatMoney(money(12500, "IRR")),
  date: formatJalali("2024-03-20T12:00:00+03:30"),
  relative: formatRelativeTime("2024-03-20T12:00:00+03:30"),
  province: findProvince("تهران"),
  schema: iranMobileSchema().safeParse("۰۹۱۲۳۴۵۶۷۸۹"),
};
