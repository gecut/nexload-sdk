import assert from "node:assert/strict";
import test from "node:test";

import { defaultIdSchema, defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";
import { z } from "zod";

test("default IDs and mono/poly relationship and upload shapes are canonical", () => {
  assert.equal(defaultIdSchema.parse("id"), "id");
  assert.equal(defaultIdSchema.parse(12), 12);
  assert.throws(() => defaultIdSchema.parse(""));

  assert.equal(field.relationship({ relationTo: "users" }).schema.parse("u1"), "u1");
  assert.deepEqual(field.relationship({ relationTo: "users", hasMany: true }).schema.parse([1, "u1"]), [1, "u1"]);
  assert.deepEqual(
    field.relationship({ relationTo: ["pages", "posts"] }).schema.parse({ relationTo: "posts", value: 2 }),
    { relationTo: "posts", value: 2 },
  );
  assert.deepEqual(
    field.upload({ relationTo: ["images", "files"], hasMany: true }).schema.parse([
      { relationTo: "images", value: "asset" },
    ]),
    [{ relationTo: "images", value: "asset" }],
  );
  assert.throws(() => field.relationship({ relationTo: "users" }).schema.parse({ id: "populated" }));
  assert.throws(
    () => field.upload({ relationTo: [] }),
    (error) => isPayloadSchemaError(error, "INVALID_RELATIONSHIP_CONFIGURATION"),
  );
});

test("entity relationshipIdSchema applies unless a field overrides it", () => {
  const entity = defineEntity({
    name: "Relations",
    relationshipIdSchema: z.string().uuid(),
    fields: {
      owner: field.relationship({ relationTo: "users" }),
      legacy: field.relationship({ relationTo: "users", idSchema: z.number().int().safe() }),
    },
  });

  assert.equal(entity.fields.owner.schema.safeParse(1).success, false);
  assert.equal(entity.fields.owner.schema.safeParse("550e8400-e29b-41d4-a716-446655440000").success, true);
  assert.equal(entity.fields.legacy.schema.safeParse(1).success, true);
});

test("group and array consumer schemas are strict and exclude Payload row IDs", () => {
  const group = field.group({ fields: { title: field.text({ trim: true }) } });
  const array = field.array({ minRows: 1, fields: { alt: field.text({ trim: true }) } });

  assert.deepEqual(group.schema.parse({ title: " x " }), { title: "x" });
  assert.throws(() => group.schema.parse({ title: "x", extra: true }));
  assert.deepEqual(array.schema.parse([{ alt: " x " }]), [{ alt: "x" }]);
  assert.throws(() => array.schema.parse([{ id: "row", alt: "x" }]));
});

test("schema-less descendants preserve Payload compilation and block canonical picking", () => {
  const entity = defineEntity({
    name: "Mixed",
    fields: {
      content: field.group({
        fields: {
          title: field.text(),
          raw: field.native({ payload: { type: "json" } }),
        },
      }),
    },
  });

  assert.equal(entity.fields.content.schema, undefined);
  assert.equal(entity.payload.field("content").fields.length, 2);
  assert.throws(
    () => entity.schema(({ pick }) => pick(["content"])),
    (error) => isPayloadSchemaError(error, "SCHEMA_UNAVAILABLE")
      && error.data.blockingFieldPath === "content.raw",
  );
});

test("deep schema blocking paths are absolute and not duplicated", () => {
  const entity = defineEntity({
    name: "DeepMixed",
    fields: {
      content: field.group({
        fields: {
          section: field.group({
            fields: { raw: field.native({ payload: { type: "json" } }) },
          }),
        },
      }),
    },
  });

  assert.throws(
    () => entity.schema(({ pick }) => pick(["content"])),
    (error) => isPayloadSchemaError(error, "SCHEMA_UNAVAILABLE")
      && error.data.blockingFieldPath === "content.section.raw",
  );
});
