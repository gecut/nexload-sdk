import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/schema.ts";

test("canonical title and SKU fields normalize and validate live input", () => {
  assert.equal(evaluate(" tea ", "Title"), '"tea"');
  assert.equal(evaluate(" ab ", "SKU"), '"AB"');
  assert.ok(evaluate("x", "Title").length > 0);
  assert.notEqual(evaluate("x", "Title"), '"x"');
});
