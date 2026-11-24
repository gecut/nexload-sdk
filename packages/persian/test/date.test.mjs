import assert from "node:assert/strict";
import { test } from "node:test";

import {
  endOfJalaliMonth,
  endOfJalaliYear,
  formatJalali,
  formatJalaliPattern,
  parseJalaliDate,
  startOfJalaliMonth,
  startOfJalaliYear,
  toValidDate,
} from "../dist/date/index.mjs";

const at = "2025-09-24T10:30:05Z"; // 1404/07/02 14:00:05 Tehran, Wednesday
test("ISO fractional seconds are truncated to milliseconds", () => {
  for (const fraction of ["1234", "123456", "123456789"]) {
    assert.equal(toValidDate(`2024-03-20T12:00:00.${fraction}`)?.toISOString(), "2024-03-20T08:30:00.123Z");
    assert.equal(toValidDate(`2024-03-20T12:00:00.${fraction}Z`)?.toISOString(), "2024-03-20T12:00:00.123Z");
    assert.equal(toValidDate(`2024-03-20T12:00:00.${fraction}+03:30`)?.toISOString(), "2024-03-20T08:30:00.123Z");
  }
  assert.equal(toValidDate("2024-03-20T12:00:00.1234567890Z"), null);
});
test("formatJalali", () => {
  assert.equal(formatJalali(at, { format: "short" }), "۱۴۰۴/۰۷/۰۲");
  assert.equal(formatJalali(at), "۲ مهر ۱۴۰۴");
  assert.equal(formatJalali(at, { format: "long" }), "چهارشنبه ۲ مهر ۱۴۰۴");
  assert.equal(
    formatJalali(at, { format: "short", time: "short", digits: "latin" }),
    "1404/07/02، 14:00",
  );
  assert.equal(formatJalali(at, { time: "medium" }), "۲ مهر ۱۴۰۴، ۱۴:۰۰:۰۵");
  assert.equal(formatJalali("garbage"), null);
  assert.equal(formatJalali(null), null);
});
test("formatJalaliPattern", () => {
  assert.equal(
    formatJalaliPattern(at, "yyyy-MM-dd HH:mm", { digits: "latin" }),
    "1404-07-02 14:00",
  );
  assert.equal(formatJalaliPattern(at, "'روز' d MMMM"), "روز ۲ مهر");
});
test("parseJalaliDate", () => {
  assert.equal(
    parseJalaliDate("۱۴۰۴/۰۷/۰۲")?.toISOString(),
    "2025-09-24T08:30:00.000Z",
  ); // noon Tehran
  assert.equal(
    parseJalaliDate("1404-7-2", { time: "14:00" })?.toISOString(),
    "2025-09-24T10:30:00.000Z",
  );
  assert.equal(parseJalaliDate("1404/12/30"), null);
  assert.equal(
    parseJalaliDate("1403/12/30")?.toISOString(),
    "2025-03-20T08:30:00.000Z",
  );
  assert.equal(parseJalaliDate("1404/07/02", { time: "25:00" }), null);
  assert.equal(parseJalaliDate("hello"), null);
});
test("bounds", () => {
  assert.equal(
    startOfJalaliMonth(at).toISOString(),
    "2025-09-22T20:30:00.000Z",
  ); // 1404/07/01 00:00 Tehran
  assert.equal(endOfJalaliMonth(at).toISOString(), "2025-10-22T20:29:59.999Z"); // 1404/07/30 23:59:59.999
  assert.equal(startOfJalaliYear(at).toISOString(), "2025-03-20T20:30:00.000Z");
  assert.equal(
    endOfJalaliYear("2024-06-01T00:00:00Z").toISOString(),
    "2025-03-20T20:29:59.999Z",
  ); // leap 1403 ends 12/30
});

test("ISO wall dates and offset variants", () => {
  assert.equal(formatJalali("2025-03-21", { timeZone: "America/Los_Angeles", format: "short", digits: "latin" }), "1404/01/01");
  assert.equal(toValidDate("2025-03-20 21:00:00+00")?.toISOString(), "2025-03-20T21:00:00.000Z");
  assert.equal(toValidDate("2025-03-20T21:00:00+0330")?.toISOString(), "2025-03-20T17:30:00.000Z");
  assert.equal(toValidDate("2025-03-20 21:00:00-05")?.toISOString(), "2025-03-21T02:00:00.000Z");
  assert.equal(toValidDate("2025-03-20T21:00:00+2460"), null);
  for (const year of ["1", "12", "123", "12345"]) assert.equal(parseJalaliDate(`${year}/01/01`), null);
  assert.ok(parseJalaliDate("0001/01/01"));
});
