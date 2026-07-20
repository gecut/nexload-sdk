import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity, field } from "../../dist/index.js";

test("a canonical text field compiles and derives schemas through the public interface", () => {
  const entity = defineEntity({
    name: "Product",
    fields: {
      title: field.text({ required: true, trim: true, minLength: 3 }),
    },
  });

  assert.equal(entity.fields.title.schema.parse("  Chair  "), "Chair");
  const compiled = entity.payload.field("title");
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
