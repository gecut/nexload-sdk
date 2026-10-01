import assert from "node:assert/strict";
import test from "node:test";

import { getDateLib } from "react-day-picker/persian";

import { canonicalizeJalaliPickerDate } from "../dist/admin/jalali-picker-value.mjs";

test("normalizes month-only selection to the first Jalali day at noon", () => {
  const dateLib = getDateLib();
  const selected = dateLib.newDate(1403, 1, 15);
  const result = canonicalizeJalaliPickerDate(selected, "monthOnly");

  assert.equal(dateLib.format(result, "yyyy-MM-dd"), "1403-02-01");
  assert.equal(result.getHours(), 12);
  assert.equal(result.getMinutes(), 0);
  assert.equal(result.getSeconds(), 0);
  assert.equal(result.getMilliseconds(), 0);
});
