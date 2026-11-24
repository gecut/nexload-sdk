import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CARD_BINS,
  detectBankByCard,
  detectBankBySheba,
  formatCardNumber,
  formatSheba,
  getBank,
  IRAN_BANKS,
  isValidSheba,
  normalizeCardNumber,
  normalizeSheba,
  SHEBA_CODES,
  validateCardNumber,
  validateSheba,
} from "../dist/bank/index.mjs";

test("card", () => {
  assert.equal(normalizeCardNumber("۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۳"), "6037991234567893");
  assert.deepEqual(validateCardNumber("6037997599999999"), {
    ok: false,
    reason: "invalid_checksum",
  });
  assert.deepEqual(validateCardNumber("603799"), {
    ok: false,
    reason: "invalid_format",
  });
  assert.equal(formatCardNumber("6037991234567893"), "6037 9912 3456 7893");
});
test("bank detection by card", () => {
  assert.equal(detectBankByCard("6037990000000000"), "melli");
  assert.equal(detectBankByCard("6219861034529007"), "saman");
  assert.equal(detectBankByCard("6219861812345675"), "blu");
  assert.equal(detectBankByCard("6219861900000000"), "blu");
  assert.equal(detectBankByCard("9999990000000000"), null);
  assert.equal(detectBankByCard("60"), null);
});
test("sheba", () => {
  assert.equal(
    normalizeSheba("ir20 0170 0000 0000 0123 4567 89"),
    "IR200170000000000123456789",
  );
  assert.equal(
    normalizeSheba("200170000000000123456789"),
    "IR200170000000000123456789",
  );
  assert.equal(isValidSheba("IR820540102680020817909002"), true);
  assert.deepEqual(validateSheba("IR210170000000000123456789"), {
    ok: false,
    reason: "invalid_checksum",
  });
  assert.deepEqual(validateSheba("IR12"), {
    ok: false,
    reason: "invalid_format",
  });
  assert.equal(detectBankBySheba("IR820540102680020817909002"), "parsian");
  assert.equal(detectBankBySheba("IR360120000000000987654321"), "mellat");
  assert.equal(
    formatSheba("IR200170000000000123456789"),
    "IR20 0170 0000 0000 0123 4567 89",
  );
});
test("bank table is consistent", () => {
  const ids = IRAN_BANKS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(getBank("melli").nameFa, "بانک ملی ایران");
});

function cardFromBin(bin) {
  const body = `${bin}123456789`;

  for (let check = 0; check < 10; check++) {
    const card = `${body}${check}`;

    if (validateCardNumber(card).ok) return card;
  }
  throw new Error("no Luhn digit");
}
function shebaFromCode(code) {
  const bban = `${code}0000000000123456789`.padEnd(22, "0").slice(0, 22);

  for (let check = 2; check < 99; check++) {
    const candidate = `IR${String(check).padStart(2, "0")}${bban}`;

    if (validateSheba(candidate).ok) return candidate;
  }
  throw new Error("no check digits");
}
test("every card BIN resolves to its bank with a Luhn-valid card", () => {
  const bins = Object.entries(CARD_BINS);
  assert.ok(bins.length >= 40);
  for (const [bin, id] of bins) {
    const card = cardFromBin(bin);
    assert.equal(validateCardNumber(card).ok, true, card);
    const expected = bin === "621986" ? "saman" : id;
    assert.equal(detectBankByCard(card), expected, bin);
  }
});
test("representative real-format cards", () => {
  assert.equal(detectBankByCard(cardFromBin("610433")), "mellat");
  assert.equal(detectBankByCard(cardFromBin("991975")), "mellat");
  assert.equal(detectBankByCard(cardFromBin("589210")), "sepah");
  assert.equal(detectBankByCard(cardFromBin("627353")), "tejarat");
  assert.equal(detectBankByCard(cardFromBin("585983")), "tejarat");
  assert.equal(detectBankByCard(cardFromBin("603769")), "saderat");
  assert.equal(detectBankByCard(cardFromBin("622106")), "parsian");
  assert.equal(detectBankByCard(cardFromBin("502229")), "pasargad");
  assert.equal(detectBankByCard(cardFromBin("585947")), "middle-east");
  assert.equal(detectBankByCard("۶۰۳۷۹۹۱۲۳۴۵۶۷۸۹۳"), "melli");
});
test("saman vs blu split on digits 7-8", () => {
  assert.equal(detectBankByCard("6219860000000000"), "saman");
  assert.equal(detectBankByCard("6219861700000000"), "saman");
  assert.equal(detectBankByCard("6219861800000000"), "blu");
  assert.equal(detectBankByCard("6219861900000000"), "blu");
  assert.equal(detectBankByCard("6219862000000000"), "saman");
  assert.equal(detectBankByCard("621986"), "saman");
});
test("merged and dissolved banks keep their id and mergedInto", () => {
  assert.equal(detectBankByCard(cardFromBin("636214")), "ayandeh");
  assert.equal(detectBankByCard(cardFromBin("639599")), "ghavamin");
  assert.equal(detectBankByCard(cardFromBin("505801")), "kosar");
  assert.equal(detectBankByCard(cardFromBin("507677")), "noor");
  assert.equal(detectBankByCard(cardFromBin("639370")), "mehr-eghtesad");
  assert.equal(getBank("ayandeh").mergedInto, "melli");
  assert.equal(getBank("noor").mergedInto, "melli");
  for (const id of ["ghavamin", "ansar", "hekmat-iranian", "kosar", "mehr-eghtesad"]) {
    assert.equal(getBank(id).mergedInto, "sepah", id);
  }
  assert.equal(getBank("melli").mergedInto, undefined);
  assert.equal(getBank("tosee").mergedInto, undefined);
  assert.equal(detectBankBySheba(shebaFromCode("062")), "ayandeh");
  assert.equal(detectBankBySheba(shebaFromCode("052")), "ghavamin");
  assert.equal(detectBankBySheba(shebaFromCode("051")), "tosee");
});
test("unknown or unresolved BINs return null", () => {
  assert.equal(detectBankByCard(cardFromBin("999999")), null);
  assert.equal(detectBankByCard(cardFromBin("604932")), null);
  assert.equal(detectBankByCard(cardFromBin("636797")), null);
  assert.equal(detectBankByCard(cardFromBin("581874")), null);
  assert.equal(detectBankByCard("12345"), null);
  assert.equal(detectBankBySheba(shebaFromCode("999")), null);
  assert.equal(detectBankBySheba(shebaFromCode("080")), null);
  assert.equal(detectBankBySheba(shebaFromCode("073")), null);
  assert.equal(detectBankBySheba("not a sheba"), null);
});
test("sheba codes resolve to banks", () => {
  const expected = {
    "010": "central-bank",
    "012": "mellat",
    "015": "sepah",
    "016": "keshavarzi",
    "017": "melli",
    "018": "tejarat",
    "019": "saderat",
    "020": "export-development",
    "022": "tosee-taavon",
    "054": "parsian",
    "056": "saman",
    "057": "pasargad",
    "075": "melal",
    "078": "middle-east",
    "095": "iran-venezuela",
  };

  for (const [code, id] of Object.entries(expected)) {
    assert.equal(detectBankBySheba(shebaFromCode(code)), id, code);
  }
  assert.equal(detectBankBySheba("ir36 0120 0000 0000 0987 6543 21"), "mellat");
  for (const [code, id] of Object.entries(SHEBA_CODES)) {
    assert.match(code, /^\d{3}$/);
    assert.equal(detectBankBySheba(shebaFromCode(code)), id, code);
  }
});
test("directory data is internally consistent", () => {
  const ids = new Set(IRAN_BANKS.map((b) => b.id));

  for (const bank of IRAN_BANKS) {
    if (bank.mergedInto) assert.ok(ids.has(bank.mergedInto), bank.id);
  }
  for (const [bin, id] of Object.entries(CARD_BINS)) {
    assert.match(bin, /^\d{6}$/);
    assert.ok(ids.has(id), bin);
  }
  for (const id of Object.values(SHEBA_CODES)) assert.ok(ids.has(id), id);
});
