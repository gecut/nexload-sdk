import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity, field } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

test("a canonical text field compiles and derives schemas through the public interface", () => {
  const entity = defineEntity({
    name: "Product",
    fields: {
      title: field.text({ required: true, trim: true, minLength: 3 }),
    },
  });

  assert.equal(entity.fields.title.schema.parse("  Chair  "), "Chair");
  const compiled = payloadFields(entity).field("title");
  assert.deepEqual({ ...compiled, hooks: undefined }, {
    name: "title",
    type: "text",
    required: true,
    minLength: 3,
    hooks: undefined,
  });
  assert.equal(compiled.hooks.beforeValidate.length, 1);
  assert.equal(typeof compiled.hooks.beforeValidate[0], "function");

  const schema = entity.schema(({ fields, z }) => z.strictObject({ title: fields.title }));
  assert.deepEqual(schema.parse({ title: "  Chair  " }), { title: "Chair" });
});

test("pick with optional: 'auto' keeps required fields required and makes optional fields optional", () => {
  const entity = defineEntity({
    name: "Article",
    fields: {
      title: field.text({ required: true }),
      bio: field.text(),
    },
  });

  const autoSchema = entity.schema(({ pick }) =>
    pick(["title", "bio"], { optional: "auto" })
  );
  assert.deepEqual(autoSchema.parse({ title: "x" }), { title: "x" });
  assert.throws(() => autoSchema.parse({ bio: "y" }));

  const requiredBioSchema = entity.schema(({ pick }) =>
    pick(["title", "bio"], { optional: "auto", required: ["bio"] })
  );
  assert.throws(() => requiredBioSchema.parse({ title: "x" }));
  assert.deepEqual(requiredBioSchema.parse({ title: "x", bio: "y" }), { title: "x", bio: "y" });

  assert.throws(() => autoSchema.parse({ title: "x", extra: "z" }));
  const nonStrictSchema = entity.schema(({ pick }) =>
    pick(["title", "bio"], { optional: "auto", strict: false })
  );
  assert.deepEqual(nonStrictSchema.parse({ title: "x", extra: "z" }), { title: "x" });
});
