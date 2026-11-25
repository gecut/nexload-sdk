import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/persian.ts";

test("price modes accept both digit sets, handle indivisible rials and reject fractions", () => {
  assert.equal(evaluate("۱۲۵۰۰", "IRT"), evaluate("١٢٥٠٠", "IRT"));
  assert.equal(evaluate("12500", "IRT"), "۱٬۲۵۰ تومان");
  assert.equal(evaluate("12501", "IRT"), "۱۲٬۵۰۱ ریال");
  for (const input of ["", "12.0", "9007199254740992"]) assert.equal(evaluate(input, "IRR"), "Enter a whole number of rials.");
  assert.equal(evaluate("12500", "unknown"), evaluate("12500", "IRR"));
});

test("identity, bank and date modes return the SDK result", () => {
  assert.equal(evaluate("۰۹۱۲۳۴۵۶۷۸۹", "mobile"), "Valid\nCanonical: 09123456789\nE.164: +989123456789\nDisplay: 0912 345 6789");
  assert.equal(evaluate("", "mobile"), "Invalid: empty");
  assert.equal(evaluate("0812", "mobile"), "Invalid: invalid");
  assert.equal(evaluate("۰۰۸۴۵۷۵۹۴۸", "national-code"), "Valid\nCanonical: 0084575948");
  assert.equal(evaluate("0084575949", "national-code"), "Invalid: invalid_checksum");
  assert.equal(evaluate("۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۳", "card"), "Valid\nDisplay: 6037 9912 3456 7893\nBank: melli");
  assert.equal(evaluate("6037991234567890", "card"), "Invalid: invalid_checksum");
  assert.equal(evaluate("IR820540102680020817909002", "sheba"), "Valid\nDisplay: IR82 0540 1026 8002 0817 9090 02\nBank: parsian");
  assert.equal(evaluate("IR820540102680020817909003", "sheba"), "Invalid: invalid_checksum");
  assert.equal(evaluate("2024-03-20T12:00:00+03:30", "jalali"), "Short: ۱۴۰۳/۰۱/۰۱\nLong: چهارشنبه ۱ فروردین ۱۴۰۳");
  assert.equal(evaluate("nope", "jalali"), "Enter an ISO date such as 2024-03-20T12:00:00+03:30.");
});
