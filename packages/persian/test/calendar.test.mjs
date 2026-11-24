import assert from "node:assert/strict";
import { test } from "node:test";

import {
  fromJalali,
  gregorianToJalali,
  isJalaliLeapYear,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
  toJalali,
} from "../dist/date/index.mjs";
test("calendar conversion and leap years", () => {
  assert.deepEqual(gregorianToJalali(2025, 9, 24), {
    year: 1404,
    month: 7,
    day: 2,
  });
  assert.deepEqual(jalaliToGregorian(1403, 12, 30), {
    year: 2025,
    month: 3,
    day: 20,
  });
  assert.equal(isJalaliLeapYear(1403), true);
  assert.equal(isJalaliLeapYear(1404), false);
});
test("instant in Tehran", () => {
  assert.deepEqual(toJalali("2025-09-24T10:30:05Z"), {
    year: 1404,
    month: 7,
    day: 2,
    hour: 14,
    minute: 0,
    second: 5,
    millisecond: 0,
    weekday: 4,
  });
  assert.equal(
    fromJalali({ year: 1404, month: 7, day: 2, hour: 14 }).toISOString(),
    "2025-09-24T10:30:00.000Z",
  );
});
test("rejects invalid Gregorian dates and out-of-range years", () => {
  assert.throws(() => gregorianToJalali(2025, 2, 31), RangeError);
  assert.throws(() => gregorianToJalali(4000, 1, 1), RangeError);
});

test("nowruz vectors", () => {
  const cases = [
    [1300, "1921-03-21"],
    [1360, "1981-03-21"],
    [1393, "2014-03-21"],
    [1399, "2020-03-20"],
    [1400, "2021-03-21"],
    [1403, "2024-03-20"],
    [1404, "2025-03-21"],
    [1405, "2026-03-21"],
    [1408, "2029-03-20"],
    [1410, "2031-03-21"],
  ];

  for (const [jy, iso] of cases) {
    const g = jalaliToGregorian(jy, 1, 1);
    assert.equal(
      `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`,
      iso,
      String(jy),
    );
  }
});
test("gregorian to jalali vectors", () => {
  assert.deepEqual(gregorianToJalali(1981, 8, 17), {
    year: 1360,
    month: 5,
    day: 26,
  });
  assert.deepEqual(gregorianToJalali(2013, 1, 10), {
    year: 1391,
    month: 10,
    day: 21,
  });
  assert.deepEqual(gregorianToJalali(2014, 8, 4), {
    year: 1393,
    month: 5,
    day: 13,
  });
  assert.deepEqual(gregorianToJalali(2025, 9, 24), {
    year: 1404,
    month: 7,
    day: 2,
  });
});
test("leap years 1395–1420", () => {
  const leaps = [];

  for (let y = 1395; y <= 1420; y++) if (isJalaliLeapYear(y)) leaps.push(y);
  assert.deepEqual(leaps, [1395, 1399, 1403, 1408, 1412, 1416, 1420]);
  assert.equal(jalaliMonthLength(1403, 12), 30);
  assert.equal(jalaliMonthLength(1404, 12), 29);
  assert.equal(jalaliMonthLength(1404, 7), 30);
  assert.equal(isValidJalaliDate(1404, 12, 30), false);
  assert.equal(isValidJalaliDate(1403, 12, 30), true);
  assert.equal(isValidJalaliDate(1404, 13, 1), false);
});
test("round trip 1300–1500 matches ICU", () => {
  const icu = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  for (
    let t = Date.UTC(1921, 2, 21);
    t < Date.UTC(2121, 2, 21);
    t += 86_400_000
  ) {
    const d = new Date(t);
    const p = Object.fromEntries(
      icu
        .formatToParts(d)
        .filter((x) => x.type !== "literal")
        .map((x) => [x.type, parseInt(x.value, 10)]),
    );
    const j = gregorianToJalali(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
    assert.deepEqual(j, { year: p.year, month: p.month, day: p.day });
    assert.deepEqual(jalaliToGregorian(j.year, j.month, j.day), {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    });
  }
});
test("toJalali reads Tehran wall time", () => {
  const j = toJalali("2025-09-24T10:30:00Z");
  assert.deepEqual(
    [j.year, j.month, j.day, j.hour, j.minute, j.weekday],
    [1404, 7, 2, 14, 0, 4],
  );
  assert.equal(
    toJalali(new Date("2025-09-24T10:30:00Z"), { timeZone: "UTC" }).hour,
    10,
  );
  assert.throws(() => toJalali("not a date"), RangeError);
});
test("fromJalali", () => {
  assert.equal(
    fromJalali({ year: 1404, month: 7, day: 2, hour: 14 }).toISOString(),
    "2025-09-24T10:30:00.000Z",
  );
  assert.equal(
    fromJalali({ year: 1404, month: 7, day: 2 }).toISOString(),
    "2025-09-23T20:30:00.000Z",
  ); // midnight Tehran
  assert.throws(
    () => fromJalali({ year: 1404, month: 12, day: 30 }),
    RangeError,
  );
  assert.throws(
    () => fromJalali({ year: 1404, month: 1, day: 1, hour: 24 }),
    RangeError,
  );
});
test("historic Tehran DST", () => {
  // 2021-03-22 00:00–01:00 local did not exist (1400/01/02); move forward by the gap (00:30 → 01:30 +04:30).
  assert.equal(
    fromJalali({
      year: 1400,
      month: 1,
      day: 2,
      hour: 0,
      minute: 30,
    }).toISOString(),
    "2021-03-21T21:00:00.000Z",
  );
  // 2021-09-21 23:00–24:00 local happened twice (1400/06/30); take the earlier instant.
  assert.equal(
    fromJalali({
      year: 1400,
      month: 6,
      day: 30,
      hour: 23,
      minute: 30,
    }).toISOString(),
    "2021-09-21T19:00:00.000Z",
  );
});
