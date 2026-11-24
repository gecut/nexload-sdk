import assert from "node:assert/strict";
import { test } from "node:test";

import {
  normalizePersianLetters,
  normalizePersianText,
  removeDiacritics,
  slugify,
  stripInvisible,
  toSearchKey,
} from "../dist/text/index.mjs";

test("normalizePersianLetters", () =>
  assert.equal(normalizePersianLetters("يى كڪ"), "یی کک"));
test("stripInvisible keeps ZWNJ", () =>
  assert.equal(stripInvisible("‏می‌روم​‍﻿⁧x⁩"), "می‌رومx"));
test("removeDiacritics", () =>
  assert.equal(removeDiacritics("كِتابٌ"), "كتاب"));
test("normalizePersianText", () => {
  assert.equal(
    normalizePersianText("  علي   كريم‌‌زاده ۱۲ "),
    "علی کریم‌زاده ۱۲",
  );
  assert.equal(normalizePersianText("۱۲ abc", { digits: "latin" }), "12 abc");
  assert.equal(normalizePersianText("12", { digits: "persian" }), "۱۲");
});
test("toSearchKey", () =>
  assert.equal(toSearchKey("  مـی‌روم ABC ۱۲ "), "مـی روم abc 12"));
test("slugify equals legacy formatSlug", () => {
  assert.equal(slugify("  كِتاب_جدید 😀 ۱۲ "), "کتاب-جدید-12");
  assert.equal(slugify("Hello  World!!"), "Hello-World");
  assert.equal(slugify("--a--b--"), "a-b");
  assert.equal(slugify("يى"), "یی");
  assert.equal(slugify(""), "");
});
