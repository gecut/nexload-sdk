import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

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
  assert.equal("currency" in payloadFields(entity).field("amount"), false);
});

test("date field runtime hook accepts Date objects, converts to UTC ISO, and enforces constraints", async () => {
  const entity = defineEntity({
    name: "DateRuntimeFixture",
    fields: {
      publishedAt: field.date(),
      boundedAt: field.date({
        minimum: "2026-01-01T00:00:00Z",
        maximum: "2026-12-31T23:59:59Z",
        schema: (canonical) => canonical.refine((v) => v.startsWith("2026-06"), "must be June"),
      }),
      optionalAt: field.date({ nullable: true }),
    },
  });

  const fields = payloadFields(entity);
  const publishedHook = fields.field("publishedAt").hooks.beforeValidate.at(-1);
  const boundedHook = fields.field("boundedAt").hooks.beforeValidate.at(-1);
  const optionalHook = fields.field("optionalAt").hooks.beforeValidate.at(-1);

  // Point 1: Valid Date converted to UTC ISO string
  const validDate = new Date("2026-01-01T00:00:00Z");
  assert.equal(
    await publishedHook({ value: validDate, path: ["publishedAt"], req: {} }),
    "2026-01-01T00:00:00.000Z",
  );

  // Point 1: ISO strings keep working unchanged
  assert.equal(
    await publishedHook({ value: "2026-07-20T16:00:00+03:30", path: ["publishedAt"], req: {} }),
    "2026-07-20T12:30:00.000Z",
  );

  // Point 1: Date objects respect minimum, maximum, and options.schema refinement
  assert.equal(
    await boundedHook({ value: new Date("2026-06-15T12:00:00Z"), path: ["boundedAt"], req: {} }),
    "2026-06-15T12:00:00.000Z",
  );
  await assert.rejects(
    async () => {
      await boundedHook({ value: new Date("2025-06-15T12:00:00Z"), path: ["boundedAt"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const issue = error.data?.errors?.find((e) => e.path === "boundedAt");
      assert.ok(issue, "expected error at boundedAt");
      assert.equal(issue.message, "Date is before minimum");
      return true;
    },
  );
  await assert.rejects(
    async () => {
      await boundedHook({ value: new Date("2027-06-15T12:00:00Z"), path: ["boundedAt"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const issue = error.data?.errors?.find((e) => e.path === "boundedAt");
      assert.ok(issue, "expected error at boundedAt");
      assert.equal(issue.message, "Date is after maximum");
      return true;
    },
  );
  await assert.rejects(
    async () => {
      await boundedHook({ value: new Date("2026-07-15T12:00:00Z"), path: ["boundedAt"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const issue = error.data?.errors?.find((e) => e.path === "boundedAt");
      assert.ok(issue, "expected error at boundedAt");
      assert.equal(issue.message, "must be June");
      return true;
    },
  );

  // Point 1: Nullable date hook handles null
  assert.equal(
    await optionalHook({ value: null, path: ["optionalAt"], req: {} }),
    null,
  );
  assert.equal(
    await optionalHook({ value: new Date("2026-01-01T00:00:00Z"), path: ["optionalAt"], req: {} }),
    "2026-01-01T00:00:00.000Z",
  );

  // Point 2: Invalid Date rejected with "Invalid date"
  await assert.rejects(
    async () => {
      await publishedHook({ value: new Date("nope"), path: ["publishedAt"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const issue = error.data?.errors?.find((e) => e.path === "publishedAt");
      assert.ok(issue, "expected error at publishedAt");
      assert.equal(issue.message, "Invalid date");
      return true;
    },
  );

  // Nullable date hook still rejects new Date("nope") with "Invalid date"
  await assert.rejects(
    async () => {
      await optionalHook({ value: new Date("nope"), path: ["optionalAt"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const issue = error.data?.errors?.find((e) => e.path === "optionalAt");
      assert.ok(issue, "expected error at optionalAt");
      assert.equal(issue.message, "Invalid date");
      return true;
    },
  );

  // Spoofed Date object rejected as ValidationError, not TypeError
  await assert.rejects(
    async () => {
      await publishedHook({
        value: { [Symbol.toStringTag]: "Date" },
        path: ["publishedAt"],
        req: {},
      });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      assert.notEqual(error?.name, "TypeError");
      const issue = error.data?.errors?.find((e) => e.path === "publishedAt");
      assert.ok(issue, "expected error at publishedAt");
      assert.equal(issue.message, "Invalid input: expected string, received object");
      return true;
    },
  );

  // Point 3: Canonical schema rejects Date objects and accepts only ISO strings
  const derived = entity.schema(({ pick }) => pick(["publishedAt"]));
  assert.throws(
    () => entity.fields.publishedAt.schema.parse(new Date("2026-01-01T00:00:00Z")),
    (error) => {
      assert.equal(error?.name, "ZodError");
      assert.match(error.message, /expected string, received Date/u);
      return true;
    },
  );
  assert.throws(
    () => derived.parse({ publishedAt: new Date("2026-01-01T00:00:00Z") }),
    (error) => {
      assert.equal(error?.name, "ZodError");
      assert.match(error.message, /expected string, received Date/u);
      return true;
    },
  );
  assert.equal(
    entity.fields.publishedAt.schema.parse("2026-01-01T00:00:00Z"),
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(
    derived.parse({ publishedAt: "2026-01-01T00:00:00Z" }).publishedAt,
    "2026-01-01T00:00:00.000Z",
  );
});
