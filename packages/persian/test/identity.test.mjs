import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isValidLegalId,
  isValidNationalCode,
  normalizeIranLandline,
  normalizeNationalCode,
  normalizePostalCode,
  validateLegalId,
  validateNationalCode,
  validatePostalCode,
} from "../dist/identity/index.mjs";

test("national code", () => {
  assert.equal(normalizeNationalCode("۰۴۹۹-۳۷۰-۸۹۹"), "0499370899");
  assert.equal(normalizeNationalCode(84575948), "0084575948");
  assert.equal(isValidNationalCode("0013542419"), true);
  assert.deepEqual(validateNationalCode("1111111111"), {
    ok: false,
    reason: "repeated_digits",
  });
  assert.deepEqual(validateNationalCode("0499370898"), {
    ok: false,
    reason: "invalid_checksum",
  });
  assert.deepEqual(validateNationalCode("12345"), {
    ok: false,
    reason: "invalid_format",
  });
  assert.deepEqual(validateNationalCode(null), { ok: false, reason: "empty" });
  assert.equal(normalizeNationalCode("‏0499370899 "), "0499370899");
});
test("legal id", () => {
  assert.equal(isValidLegalId("10320894878"), true);
  assert.equal(isValidLegalId("14007650912"), true);
  assert.deepEqual(validateLegalId("10320894877"), {
    ok: false,
    reason: "invalid_checksum",
  });
  assert.deepEqual(validateLegalId("1032089487"), {
    ok: false,
    reason: "invalid_format",
  });
});
test("postal code", () => {
  assert.equal(normalizePostalCode("۱۹۹۱۹-۱۳۵۴۱"), "1991913541");
  assert.deepEqual(validatePostalCode("0000000000"), {
    ok: false,
    reason: "repeated_digits",
  });
  assert.deepEqual(validatePostalCode("123"), {
    ok: false,
    reason: "invalid_format",
  });
});
test("landline", () => {
  assert.equal(normalizeIranLandline("021-88776655"), "02188776655");
  assert.equal(normalizeIranLandline("+982188776655"), "02188776655");
  assert.equal(normalizeIranLandline("09123456789"), null);
});
