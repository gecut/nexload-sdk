import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity, field } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

test("canonical hook of text(), text({ required: true }), a group child, and an array child handle null and parse values", async () => {
  const entity = defineEntity({
    name: "CanonicalHookFixture",
    fields: {
      optional: field.text(),
      required: field.text({ required: true }),
      meta: field.group({
        fields: {
          note: field.text(),
        },
      }),
      rows: field.array({
        fields: {
          hint: field.text(),
        },
      }),
    },
  });

  const fields = payloadFields(entity);
  const optionalField = fields.field("optional");
  const requiredField = fields.field("required");
  const metaField = fields.field("meta");
  const groupChild = metaField.fields.find((f) => f.name === "note");
  const rowsField = fields.field("rows");
  const arrayChild = rowsField.fields.find((f) => f.name === "hint");

  const optionalHook = optionalField.hooks.beforeValidate.at(-1);
  const requiredHook = requiredField.hooks.beforeValidate.at(-1);
  const groupChildHook = groupChild.hooks.beforeValidate.at(-1);
  const arrayChildHook = arrayChild.hooks.beforeValidate.at(-1);

  assert.equal(typeof optionalHook, "function");
  assert.equal(typeof requiredHook, "function");
  assert.equal(typeof groupChildHook, "function");
  assert.equal(typeof arrayChildHook, "function");

  assert.equal(await optionalHook({ value: null, path: ["optional"], req: {} }), null);
  assert.equal(await requiredHook({ value: null, path: ["required"], req: {} }), null);
  assert.equal(await groupChildHook({ value: null, path: ["meta", "note"], req: {} }), null);
  assert.equal(await arrayChildHook({ value: null, path: ["rows", 0, "hint"], req: {} }), null);

  assert.equal(await optionalHook({ value: undefined, path: ["optional"], req: {} }), undefined);
  assert.equal(await optionalHook({ value: "abc", path: ["optional"], req: {} }), "abc");
  await assert.rejects(
    async () => {
      await optionalHook({ value: 123, path: ["optional"], req: {} });
    },
    (error) => {
      assert.equal(error?.name, "ValidationError");
      return true;
    },
  );
});
