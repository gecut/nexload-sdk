import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";

test("scalar factories apply canonical normalization and constraints", () => {
  assert.equal(field.text({ trim: true, lowercase: true, pattern: /^[a-z]+$/u }).schema.parse("  ABC "), "abc");
  assert.equal(field.textarea({ trim: true }).schema.parse(" body "), "body");
  assert.equal(field.slug().schema.parse("  Hello__جهان -- Test  "), "hello-جهان-test");
  assert.equal(field.number({ integer: true, safe: true, minimum: 2, multipleOf: 2 }).schema.parse(4), 4);
  assert.equal(field.money({ currency: "IRR" }).schema.parse(1_000), 1_000);
  assert.equal(field.boolean().schema.parse(true), true);
  assert.equal(field.date().schema.parse("2026-07-20T16:00:00+03:30"), "2026-07-20T12:30:00.000Z");
  assert.deepEqual(field.select({ values: ["draft", "live"], hasMany: true }).schema.parse(["live"]), ["live"]);
});

test("scalar factories reject invalid definitions", () => {
  assert.throws(
    () => field.text({ lowercase: true, uppercase: true }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );
  assert.throws(
    () => field.number({ minimum: 2, maximum: 1 }),
    (error) => isPayloadSchemaError(error, "INVALID_CONSTRAINT_RANGE"),
  );
  assert.throws(
    () => field.select({ values: [] }),
    (error) => isPayloadSchemaError(error, "EMPTY_SELECT_VALUES"),
  );
  assert.throws(
    () => field.select({ values: ["x", "x"] }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );
  assert.throws(() => field.date().schema.parse("2026-07-20T12:30:00"));
  assert.throws(() => field.money({ currency: "IRR" }).schema.parse(1.5));
});

test("schema customizers run last and preserve normalized input", () => {
  const schema = field.text({
    trim: true,
    lowercase: true,
    schema: (canonical) => canonical.refine((value) => value === "ready", "not ready"),
  }).schema;

  assert.equal(schema.parse(" READY "), "ready");
  assert.throws(() => schema.parse(" pending "));
});

test("money currency is safe inspection metadata only", () => {
  const entity = defineEntity({ name: "Price", fields: { amount: field.money({ currency: "IRR" }) } });
  assert.deepEqual(entity.inspect().fields.amount, {
    kind: "money",
    payloadType: "number",
    requiredInPayload: false,
    nullableInSchema: false,
    hasSchema: true,
    currency: "IRR",
  });
  assert.equal("currency" in entity.payload.field("amount"), false);
});
