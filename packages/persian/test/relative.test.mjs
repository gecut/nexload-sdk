import assert from "node:assert/strict";
import { test } from "node:test";

import { findProvince, IRAN_PROVINCES } from "../dist/geo/index.mjs";
import { formatRelativeTime } from "../dist/relative/index.mjs";

const now = new Date("2025-09-24T10:30:00Z");
test("relative past and future", () => {
  assert.equal(
    formatRelativeTime(new Date(now - 10_000), { now }),
    "همین حالا",
  );
  assert.equal(
    formatRelativeTime(new Date(now - 5 * 60_000), { now }),
    "۵ دقیقه پیش",
  );
  assert.equal(
    formatRelativeTime(new Date(now - 3 * 3_600_000), { now, digits: "latin" }),
    "3 ساعت پیش",
  );
  assert.equal(
    formatRelativeTime(new Date(now - 2 * 86_400_000), { now }),
    "۲ روز پیش",
  );
  assert.equal(
    formatRelativeTime(new Date(+now + 10 * 60_000), { now }),
    "۱۰ دقیقه دیگر",
  );
  assert.equal(
    formatRelativeTime(new Date(now - 30 * 86_400_000), { now }),
    "۳ شهریور ۱۴۰۴",
  );
  assert.equal(formatRelativeTime("bad", { now }), null);
});
test("provinces", () => {
  assert.equal(IRAN_PROVINCES.length, 31);
  assert.equal(new Set(IRAN_PROVINCES.map((p) => p.code)).size, 31);
  assert.equal(findProvince("tehran")?.nameFa, "تهران");
  assert.equal(findProvince(" آذربايجان  شرقي ")?.code, "east-azerbaijan");
  assert.equal(findProvince("Atlantis"), null);
});

test("relative minute starts at one", () => { for (const seconds of [45, 59]) { assert.equal(formatRelativeTime(new Date(now - seconds * 1000), { now }), "۱ دقیقه پیش"); assert.equal(formatRelativeTime(new Date(+now + seconds * 1000), { now }), "۱ دقیقه دیگر"); } });
