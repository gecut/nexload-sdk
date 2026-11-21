import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { field } from "../../dist/index.js";

test("every built-in field schema survives z.encode", () => {
  const cases = [
    ["text trim", field.text({ trim: true }), "a"],
    ["text lowercase", field.text({ lowercase: true }), "a"],
    ["text uppercase", field.text({ uppercase: true }), "A"],
    ["textarea trim", field.textarea({ trim: true }), "a"],
    ["slug", field.slug(), "a-b"],
    ["date", field.date(), "2026-01-01T00:00:00.000Z"],
    ["number", field.number(), 1],
    ["money", field.money({ currency: "IRR" }), 1000],
    ["boolean", field.boolean(), true],
    ["select", field.select({ values: ["a"] }), "a"],
    ["relationship", field.relationship({ relationTo: "x" }), "abc"],
  ];

  for (const [label, definition, sample] of cases) {
    assert.doesNotThrow(() => z.encode(definition.schema, sample), label);
  }
});

test("normalization results are unchanged", () => {
  assert.equal(field.slug().schema.parse("  Cordless__Drill  "), "cordless-drill");
  assert.equal(field.text({ trim: true, lowercase: true }).schema.parse("  AB "), "ab");
  assert.equal(field.date().schema.parse("2026-01-01T03:30:00+03:30"), "2026-01-01T00:00:00.000Z");
});
