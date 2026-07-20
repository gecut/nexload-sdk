import assert from "node:assert/strict";
import test from "node:test";

import { ValidationError } from "payload";
import { z } from "zod";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";

test("consumer beforeValidate hooks run before the canonical adapter", async () => {
  const calls = [];
  const consumerHook = ({ value }) => {
    calls.push("consumer");
    return ` ${value} `;
  };
  const entity = defineEntity({
    name: "Hooks",
    fields: { title: field.text({ trim: true, lowercase: true, payload: { hooks: { beforeValidate: [consumerHook] } } }) },
  });
  const hooks = entity.payload.field("title").hooks.beforeValidate;

  let value = "READY";
  for (const hook of hooks) value = await hook({ value, path: ["title"], req: {} });
  assert.equal(value, "ready");
  assert.deepEqual(calls, ["consumer"]);
  assert.equal(hooks[0], consumerHook);
});

test("the adapter passes undefined and maps Zod issues to Payload ValidationError paths", async () => {
  const entity = defineEntity({ name: "Adapter", fields: { alt: field.text({ minLength: 3 }) } });
  const hook = entity.payload.field("alt").hooks.beforeValidate.at(-1);

  assert.equal(await hook({ value: undefined, path: ["gallery", 0, "alt"], req: {} }), undefined);
  await assert.rejects(
    Promise.resolve().then(() => hook({ value: "x", path: ["gallery", 0, "alt"], req: {} })),
    (error) => error instanceof ValidationError
      && error.data.errors[0].path === "gallery.0.alt",
  );
});

test("async canonical schemas are reported on first exercised sync parse", () => {
  const entity = defineEntity({
    name: "Async",
    fields: { title: field.native({ payload: { type: "text" }, schema: z.string().refine(async () => true) }) },
  });
  const hook = entity.payload.field("title").hooks.beforeValidate.at(-1);

  assert.throws(
    () => hook({ value: "x", path: ["title"], req: {} }),
    (error) => isPayloadSchemaError(error, "ASYNC_CANONICAL_SCHEMA_UNSUPPORTED") && error.phase === "definition",
  );
});

test("native validate is preserved and layout fields are rejected", () => {
  const validate = () => true;
  const entity = defineEntity({
    name: "Native",
    fields: { code: field.native({ payload: { type: "code", validate } }) },
  });
  assert.equal(entity.payload.field("code").validate, validate);

  assert.throws(
    () => defineEntity({ name: "Layout", fields: { row: field.native({ payload: { type: "row", fields: [] } }) } }),
    (error) => isPayloadSchemaError(error, "INVALID_PAYLOAD_FIELD"),
  );
});

test("container adapters preserve row IDs and leave child parsing to Payload traversal", async () => {
  let childParses = 0;
  const entity = defineEntity({
    name: "Traversal",
    fields: {
      gallery: field.array({
        fields: {
          alt: field.text({ schema: (schema) => schema.transform((value) => {
            childParses += 1;
            return value.trim();
          }) }),
        },
      }),
    },
  });
  const gallery = entity.payload.field("gallery");
  const rows = [{ id: "payload-row", alt: " image " }];
  const parentValue = await gallery.hooks.beforeValidate.at(-1)({ value: rows, path: ["gallery"], req: {} });

  assert.deepEqual(parentValue, rows);
  assert.equal(childParses, 0);
  const childValue = await gallery.fields[0].hooks.beforeValidate.at(-1)({
    value: parentValue[0].alt,
    path: ["gallery", 0, "alt"],
    req: {},
  });
  assert.equal(childValue, "image");
  assert.equal(childParses, 1);
  assert.equal(parentValue[0].id, "payload-row");
});
