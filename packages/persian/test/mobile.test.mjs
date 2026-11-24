import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatIranMobile,
  normalizeIranMobile,
  toE164Mobile,
  validateIranMobile,
} from "../dist/mobile/index.mjs";

test("normalizes every accepted shape", () => {
  for (const raw of [
    "09123456789",
    "+989123456789",
    "00989123456789",
    "989123456789",
    "9123456789",
    "۰۹۱۲ ۳۴۵ ۶۷۸۹",
    "(0912) 345-6789",
    "0912.345.6789",
    "‏۰۹۱۲۳۴۵۶۷۸۹‎",
    9123456789,
  ])
    assert.equal(normalizeIranMobile(raw), "09123456789", String(raw));
});
test("rejects invalid instead of echoing", () => {
  for (const raw of [
    "",
    null,
    undefined,
    "0912345678",
    "091234567890",
    "08123456789",
    "+98123",
    "abc",
    "+19123456789",
  ])
    assert.equal(normalizeIranMobile(raw), null, String(raw));
});
test("e164 and format", () => {
  assert.equal(toE164Mobile("۰۹۱۲۳۴۵۶۷۸۹"), "+989123456789");
  assert.equal(formatIranMobile("09123456789"), "0912 345 6789");
  assert.equal(
    formatIranMobile("09123456789", { digits: "persian", separator: "-" }),
    "۰۹۱۲-۳۴۵-۶۷۸۹",
  );
  assert.equal(formatIranMobile("bad"), null);
});
test("validate reasons", () => {
  assert.deepEqual(validateIranMobile("  "), { ok: false, reason: "empty" });
  assert.deepEqual(validateIranMobile("123"), { ok: false, reason: "invalid" });
  assert.deepEqual(validateIranMobile("+989123456789"), {
    ok: true,
    value: "09123456789",
  });
});
