import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatSlug, parseMoneyToMinorUnits, formatMoney, IRT, formatJalaliDate } from "../dist/index.js";

test("formatSlug is persian slugify", async () => {
  const { slugify } = await import("@nexload-sdk/persian/text");
  for (const s of ["  كِتاب_جدید 😀 ۱۲ ", "Hello  World!!", "يى--ك"]) assert.equal(formatSlug(s), slugify(s));
});
test("money helpers keep v3 output", () => {
  assert.equal(parseMoneyToMinorUnits("۱۲۳٬۴۵۶", IRT), 123456);
  assert.equal(formatMoney(123456, IRT), "۱۲۳٬۴۵۶ تومان");
});
test("formatJalaliDate formats in Tehran", () => {
  assert.equal(formatJalaliDate("2025-09-24T10:30:00Z", { dateStyle: "short", digits: "latin" }), "1404/07/02");
});
test("no local digit tables remain", () => {
  assert.doesNotMatch(readFileSync(new URL("../dist/index.js", import.meta.url), "utf8"), /۰۱۲۳۴۵۶۷۸۹/);
});
