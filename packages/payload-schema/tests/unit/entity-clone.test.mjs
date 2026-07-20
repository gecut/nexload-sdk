import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";

test("runtime root exports are intentionally small", async () => {
  const root = await import("../../dist/index.js");
  assert.deepEqual(Object.keys(root).sort(), [
    "PayloadSchemaError",
    "defaultIdSchema",
    "defineEntity",
    "field",
    "isPayloadSchemaError",
  ]);
});

test("payload facade preserves ordering and returns independent plain containers", () => {
  const opaque = new Map([["x", 1]]);
  const source = { admin: { condition: () => true, custom: { nested: [1] }, opaque } };
  const entity = defineEntity({
    name: "Clone",
    fields: {
      second: field.text({ payload: source }),
      first: field.number(),
    },
  });

  assert.deepEqual(entity.payload.all().map(({ name }) => name), ["second", "first"]);
  assert.deepEqual(entity.payload.pick(["first", "second"]).map(({ name }) => name), ["first", "second"]);
  const a = entity.payload.field("second");
  const b = entity.payload.field("second");
  a.admin.custom.nested.push(2);
  assert.deepEqual(b.admin.custom.nested, [1]);
  assert.equal(a.admin.opaque, opaque);
  assert.deepEqual(source.admin.custom.nested, [1]);
});

test("cloning never invokes getters", () => {
  let reads = 0;
  const admin = {};
  Object.defineProperty(admin, "description", {
    enumerable: true,
    get() {
      reads += 1;
      return "secret";
    },
  });
  const entity = defineEntity({ name: "Getter", fields: { title: field.text({ payload: { admin } }) } });
  const compiled = entity.payload.field("title");

  assert.equal(reads, 0);
  assert.equal(Object.getOwnPropertyDescriptor(compiled.admin, "description").get !== undefined, true);
  assert.equal(reads, 0);
});

test("hook getters are composed lazily without running during compilation", () => {
  let reads = 0;
  const payload = {};
  Object.defineProperty(payload, "hooks", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return { beforeValidate: [] };
    },
  });
  const entity = defineEntity({ name: "HookGetter", fields: { title: field.text({ payload }) } });
  const compiled = entity.payload.field("title");

  assert.equal(reads, 0);
  assert.equal(compiled.hooks.beforeValidate.length, 1);
  assert.equal(reads, 1);
});

test("schema derivation accepts arbitrary Zod schemas and picker order/options are explicit", () => {
  const entity = defineEntity({
    name: "Schemas",
    fields: { title: field.text(), count: field.number(), raw: field.native({ payload: { type: "json" } }) },
  });
  const primitive = entity.schema(({ fields }) => fields.title.transform((value) => value.length));
  const picked = entity.schema(({ pick }) => pick(["count", "title"], { optional: "all", required: ["title"] }));

  assert.equal(primitive.parse("abc"), 3);
  assert.deepEqual(Object.keys(picked.shape), ["count", "title"]);
  assert.deepEqual(picked.parse({ title: "x" }), { title: "x" });
  assert.throws(() => picked.parse({ title: "x", extra: true }));
  assert.throws(
    () => entity.payload.field("missing"),
    (error) => isPayloadSchemaError(error, "UNKNOWN_FIELD"),
  );
});

test("inspection is deterministic and contains no raw schema, config, function, or values", () => {
  const entity = defineEntity({
    name: "Inspect",
    fields: {
      owner: field.relationship({ relationTo: ["users", "teams"], hasMany: true }),
      nested: field.group({ fields: { raw: field.native({ payload: { type: "json" } }) } }),
    },
  });
  const json = JSON.stringify(entity.inspect());

  assert.deepEqual(JSON.parse(json), entity.inspect());
  assert.equal(json.includes("safeParse"), false);
  assert.equal(json.includes("hooks"), false);
  assert.equal(json.includes("defaultValue"), false);
});

test("reserved and invalid entity field names fail fast", () => {
  assert.throws(
    () => defineEntity({ name: "Reserved", fields: { hash: field.text() } }),
    (error) => isPayloadSchemaError(error, "RESERVED_FIELD_NAME"),
  );
  assert.throws(
    () => defineEntity({ name: "Invalid", fields: { "not.valid": field.text() } }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_NAME"),
  );
});
