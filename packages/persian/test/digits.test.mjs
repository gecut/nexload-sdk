import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatNumber,
  parseNumber,
  toEnglishDigits,
  toPersianDigits,
} from "../dist/digits/index.mjs";

test("toEnglishDigits converts Persian and Arabic-Indic digits only", () => {
  assert.equal(
    toEnglishDigits("۰۱۲۳۴۵۶۷۸۹ ٠١٢٣٤٥٦٧٨٩ abc"),
    "0123456789 0123456789 abc",
  );
});
test("toPersianDigits accepts numbers", () => {
  assert.equal(toPersianDigits(1404), "۱۴۰۴");
  assert.equal(toPersianDigits("a-12"), "a-۱۲");
});
test("parseNumber accepts Persian grouping and decimal", () => {
  assert.equal(parseNumber("۱۲۳٬۴۵۶"), 123456);
  assert.equal(parseNumber(" 1,234.5 "), 1234.5);
  assert.equal(parseNumber("۱۲٫۵"), 12.5);
  assert.equal(parseNumber("-۴۲"), -42);
  assert.equal(parseNumber("12 345"), 12345);
});
test("parseNumber rejects junk", () => {
  for (const bad of [
    "",
    "  ",
    "abc",
    "1e21",
    "--5",
    "1.2.3",
    "۱۲a",
    null,
    undefined,
    "Infinity",
  ])
    assert.equal(parseNumber(bad), null, String(bad));
});
test("parseNumber rejects grouping separators within the fractional part", () => {
  for (const value of ["1.0,1", "۱٫۰٬۱", "1.0 1"]) assert.equal(parseNumber(value), null, value);
});
test("formatNumber is deterministic", () => {
  assert.equal(formatNumber(1234567), "۱٬۲۳۴٬۵۶۷");
  assert.equal(formatNumber(1234567, { digits: "latin" }), "1,234,567");
  assert.equal(formatNumber(1234.5, { fractionDigits: 2 }), "۱٬۲۳۴٫۵۰");
  assert.equal(formatNumber(-1000, { grouping: false }), "-۱۰۰۰");
  assert.equal(formatNumber(0.25), "۰٫۲۵");
  for (const value of [NaN, Infinity, -Infinity, 1e21, -1e21, "bad", null, undefined]) assert.throws(() => formatNumber(value), RangeError);
  assert.equal(formatNumber(1e-21, { digits: "latin" }), "0.000000000000000000001");
  assert.equal(formatNumber(0.0000001, { digits: "latin" }), "0.0000001");
  assert.equal(formatNumber(2 ** 53 + 2, { digits: "latin" }), "9,007,199,254,740,994");
});
test("rejects unsafe integer text", () => {
  assert.equal(parseNumber("۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹"), null);
});
