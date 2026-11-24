import assert from "node:assert/strict";
import { test } from "node:test";

import {
  convertMoney,
  formatMoney,
  money,
  parseMoney,
} from "../dist/money/index.mjs";

test("money guards safe integers", () => {
  assert.deepEqual(money(1000, "IRT"), { amount: 1000, unit: "IRT" });
  assert.throws(() => money(1.5, "IRT"), RangeError);
  assert.throws(() => money(2 ** 53, "IRR"), RangeError);
  assert.equal(Object.isFrozen(money(1, "IRR")), true);
});
test("convert", () => {
  assert.deepEqual(convertMoney(money(1250, "IRT"), "IRR"), {
    amount: 12500,
    unit: "IRR",
  });
  assert.deepEqual(convertMoney(money(12500, "IRR"), "IRT"), {
    amount: 1250,
    unit: "IRT",
  });
  assert.throws(() => convertMoney(money(12505, "IRR"), "IRT"), RangeError);
  assert.deepEqual(
    convertMoney(money(12505, "IRR"), "IRT", { rounding: "floor" }),
    { amount: 1250, unit: "IRT" },
  );
  assert.deepEqual(
    convertMoney(money(12505, "IRR"), "IRT", { rounding: "ceil" }),
    { amount: 1251, unit: "IRT" },
  );
  assert.deepEqual(convertMoney(money(5, "IRT"), "IRT"), {
    amount: 5,
    unit: "IRT",
  });
});
test("parse", () => {
  assert.deepEqual(parseMoney("۱۲۳٬۴۵۶", "IRT"), {
    amount: 123456,
    unit: "IRT",
  });
  assert.equal(parseMoney("12.5", "IRT"), null);
  assert.equal(parseMoney("۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹", "IRR"), null);
  assert.equal(parseMoney("", "IRR"), null);
});
test("parseMoney rejects fractional text and unsafe integers", () => {
  for (const value of ["1000000000000000.0,1", "1000000000000000.01", "1.0", "۱٫۰۰", "9007199254740992"]) {
    assert.equal(parseMoney(value, "IRR"), null, value);
  }
  assert.deepEqual(parseMoney("9,007,199,254,740,991", "IRR"), { amount: 9007199254740991, unit: "IRR" });
});
test("format", () => {
  assert.equal(formatMoney(money(123456, "IRT")), "۱۲۳٬۴۵۶ تومان");
  assert.equal(
    formatMoney(money(123456, "IRR"), {
      displayUnit: "IRT",
      rounding: "round",
    }),
    "۱۲٬۳۴۶ تومان",
  );
  assert.equal(formatMoney(money(0, "IRT"), { zeroLabel: "رایگان" }), "رایگان");
  assert.equal(
    formatMoney(money(5000, "IRR"), { showUnit: false, digits: "latin" }),
    "5,000",
  );
});

test("formatMoney rejects invalid values before formatting", () => {
  for (const value of [{ amount: 1.5, unit: "IRR" }, { amount: 2 ** 53, unit: "IRT" }, { amount: 0, unit: "USD" }, {}]) {
    assert.equal(formatMoney(value, { zeroLabel: "free" }), null);
    assert.equal(formatMoney(value, { displayUnit: "IRT" }), null);
  }
});
