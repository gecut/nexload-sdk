import assert from "node:assert/strict";
import test from "node:test";

import { IRT, formatJalaliDate, formatMoney, formatSlug, moneyField, parseMoneyToMinorUnits, slugField, withJalaliTimestamps } from "../dist/index.mjs";

test("normalizes Unicode slugs", () => {
  assert.equal(formatSlug("  كِتاب_جدید 😀 ۱۲ "), "کتاب-جدید-12");
});

test("parses exact Persian money", () => {
  assert.equal(parseMoneyToMinorUnits("۱۲۳٬۴۵۶", IRT), 123456);
  assert.equal(formatMoney(123456, IRT), "۱۲۳٬۴۵۶ تومان");
});

test("keeps money server contract integer-only", () => {
  const field = moneyField({ name: "price", currency: "IRT" });
  assert.equal(field.validate?.(12.5, { required: false }), "مبلغ باید یک عدد صحیح معتبر باشد.");
});

test("builds localized lock and collision-safe timestamps", () => {
  const [, lock] = slugField({ overrides: { slug: { localized: true } } });
  assert.equal(lock.localized, true);
  assert.throws(() => withJalaliTimestamps([{ name: "createdAtJalali", type: "text" }]));
});

test("formats invalid Jalali date as null", () => {
  assert.equal(formatJalaliDate("invalid"), null);
});
