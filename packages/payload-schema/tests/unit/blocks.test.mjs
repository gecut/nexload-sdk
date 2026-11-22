import assert from "node:assert/strict";
import test from "node:test";

import { ValidationError } from "payload";
import { z } from "zod";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

test("field.blocks compilation and canonical hooks", () => {
  const entity = defineEntity({
    name: "Page",
    fields: {
      layout: field.blocks({
        required: true,
        minRows: 1,
        maxRows: 10,
        blocks: {
          hero: {
            fields: {
              title: field.text({ required: true }),
            },
          },
          quote: {
            fields: {
              body: field.text({ required: true }),
            },
          },
        },
      }),
    },
  });

  const compiled = payloadFields(entity).field("layout");

  assert.equal(compiled.type, "blocks");
  assert.equal(compiled.name, "layout");
  assert.equal(compiled.required, true);
  assert.equal(compiled.minRows, 1);
  assert.equal(compiled.maxRows, 10);
  assert.equal(compiled.blocks.length, 2);

  const heroBlock = compiled.blocks.find((b) => b.slug === "hero");
  const quoteBlock = compiled.blocks.find((b) => b.slug === "quote");
  assert.ok(heroBlock);
  assert.ok(quoteBlock);

  assert.equal(heroBlock.fields.length, 1);
  assert.equal(heroBlock.fields[0].name, "title");
  assert.equal(typeof heroBlock.fields[0].hooks?.beforeValidate?.[0], "function");

  assert.equal(quoteBlock.fields.length, 1);
  assert.equal(quoteBlock.fields[0].name, "body");
  assert.equal(typeof quoteBlock.fields[0].hooks?.beforeValidate?.[0], "function");

  assert.equal(typeof compiled.hooks?.beforeValidate?.[0], "function");
});

test("canonical blocks schema parses valid rows, preserves id and blockName, rejects unknown keys and unknown blockType", () => {
  const entity = defineEntity({
    name: "LayoutEntity",
    fields: {
      layout: field.blocks({
        minRows: 1,
        blocks: {
          hero: {
            fields: {
              title: field.text({ required: true }),
            },
          },
          quote: {
            fields: {
              body: field.text({ required: true }),
            },
          },
        },
      }),
    },
  });

  const schema = entity.fields.layout.schema;
  assert.ok(schema);

  const validRows = [
    { blockType: "hero", title: "x" },
    { blockType: "quote", body: "y", id: "abc", blockName: null },
  ];
  assert.deepEqual(schema.parse(validRows), validRows);

  assert.throws(
    () => schema.parse([{ blockType: "nope", title: "x" }]),
    /invalid_value|invalid_union/u,
  );

  assert.throws(
    () => schema.parse([{ blockType: "hero" }]),
  );

  assert.throws(
    () => schema.parse([{ blockType: "hero", title: "x", extra: true }]),
  );

  assert.throws(
    () => schema.parse([]),
  );

  const encoded = z.encode(schema, validRows);
  assert.deepEqual(encoded, validRows);
  assert.deepEqual(schema.parse(encoded), validRows);
});

test("blocks field nullable option applies to canonical schema", () => {
  const nullableEntity = defineEntity({
    name: "NullableBlocks",
    fields: {
      layout: field.blocks({
        nullable: true,
        blocks: {
          hero: {
            fields: {
              title: field.text(),
            },
          },
        },
      }),
    },
  });

  assert.equal(nullableEntity.fields.layout.schema.parse(null), null);

  const nonNullableEntity = defineEntity({
    name: "NonNullableBlocks",
    fields: {
      layout: field.blocks({
        blocks: {
          hero: {
            fields: {
              title: field.text(),
            },
          },
        },
      }),
    },
  });

  assert.throws(() => nonNullableEntity.fields.layout.schema.parse(null));
});

test("blocks field runtime container hook validates array and blockType, preserves row data and passes null", async () => {
  const entity = defineEntity({
    name: "RuntimeContainer",
    fields: {
      layout: field.blocks({
        minRows: 1,
        maxRows: 2,
        blocks: {
          hero: {
            fields: {
              title: field.text({ required: true }),
            },
          },
          quote: {
            fields: {
              body: field.text({ required: true }),
            },
          },
        },
      }),
    },
  });

  const compiled = payloadFields(entity).field("layout");
  const containerHook = compiled.hooks.beforeValidate.at(-1);

  assert.equal(await containerHook({ value: null, path: ["layout"], req: {} }), null);
  assert.equal(await containerHook({ value: undefined, path: ["layout"], req: {} }), undefined);

  const row = [{ blockType: "hero", title: "Valid Title" }];
  const result = await containerHook({ value: row, path: ["layout"], req: {} });
  assert.deepEqual(result, row);

  const twoRows = [
    { blockType: "hero", title: "Valid Title" },
    { blockType: "quote", body: "Valid Quote" },
  ];
  assert.deepEqual(await containerHook({ value: twoRows, path: ["layout"], req: {} }), twoRows);

  const invalidChildRow = [{ blockType: "hero", title: 123 }];
  const containerResult = await containerHook({ value: invalidChildRow, path: ["layout"], req: {} });
  assert.deepEqual(containerResult, invalidChildRow);

  await assert.rejects(
    async () => containerHook({ value: [{ blockType: "nope", title: "x" }], path: ["layout"], req: {} }),
    (error) => error instanceof ValidationError,
  );

  await assert.rejects(
    async () => containerHook({ value: "not-an-array", path: ["layout"], req: {} }),
    (error) => error instanceof ValidationError,
  );

  await assert.rejects(
    async () => containerHook({ value: [], path: ["layout"], req: {} }),
    (error) => error instanceof ValidationError,
  );

  await assert.rejects(
    async () => containerHook({
      value: [
        { blockType: "hero", title: "1" },
        { blockType: "hero", title: "2" },
        { blockType: "hero", title: "3" },
      ],
      path: ["layout"],
      req: {},
    }),
    (error) => error instanceof ValidationError,
  );
});

test("blocks definition-time validation errors", () => {
  assert.throws(
    () => field.blocks({ blocks: {} }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );

  assert.throws(
    () => field.blocks({ minRows: 5, maxRows: 2, blocks: { hero: { fields: {} } } }),
    (error) => isPayloadSchemaError(error, "INVALID_CONSTRAINT_RANGE"),
  );

  assert.throws(
    () => field.blocks({ blocks: { "": { fields: {} } } }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );

  assert.throws(
    () => field.blocks({ blocks: { "   ": { fields: {} } } }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );

  assert.throws(
    () => field.blocks({
      blocks: {
        hero: {
          fields: {},
          payload: { slug: "custom-slug" },
        },
      },
    }),
    (error) => isPayloadSchemaError(error, "RESERVED_PAYLOAD_OPTION") && error.data.option === "slug",
  );

  assert.throws(
    () => field.blocks({
      blocks: {
        hero: {
          fields: {},
          payload: { fields: [] },
        },
      },
    }),
    (error) => isPayloadSchemaError(error, "RESERVED_PAYLOAD_OPTION") && error.data.option === "fields",
  );

  assert.throws(
    () => defineEntity({
      name: "ReservedBlocksOption",
      fields: {
        layout: field.blocks({
          blocks: { hero: { fields: {} } },
          payload: { blocks: [] },
        }),
      },
    }),
    (error) => isPayloadSchemaError(error, "RESERVED_PAYLOAD_OPTION") && error.data.option === "blocks",
  );
});

test("schema-less block child makes blocks canonical schema undefined and blocks pick", () => {
  const entity = defineEntity({
    name: "MixedBlocks",
    fields: {
      layout: field.blocks({
        blocks: {
          hero: {
            fields: {
              title: field.text(),
              raw: field.native({ payload: { type: "json" } }),
            },
          },
        },
      }),
    },
  });

  assert.equal(entity.fields.layout.schema, undefined);

  const compiled = payloadFields(entity).field("layout");
  assert.equal(compiled.blocks[0].fields.length, 2);

  assert.throws(
    () => entity.schema(({ pick }) => pick(["layout"])),
    (error) => isPayloadSchemaError(error, "SCHEMA_UNAVAILABLE")
      && error.data.blockingFieldPath === "layout.hero.raw",
  );
});

test("two blocks with same child name report distinct fieldPath values in error data", async () => {
  const entity = defineEntity({
    name: "Page",
    fields: {
      layout: field.blocks({
        blocks: {
          hero: {
            fields: {
              text: field.text({ required: true }),
            },
          },
          quote: {
            fields: {
              text: field.text({ required: true }),
            },
          },
        },
      }),
    },
  });

  const compiled = payloadFields(entity).field("layout");
  const heroBlock = compiled.blocks.find((b) => b.slug === "hero");
  const quoteBlock = compiled.blocks.find((b) => b.slug === "quote");

  const heroTextHook = heroBlock.fields.find((f) => f.name === "text").hooks.beforeValidate.at(-1);
  const quoteTextHook = quoteBlock.fields.find((f) => f.name === "text").hooks.beforeValidate.at(-1);

  await assert.rejects(
    async () => heroTextHook({ value: 123, path: [], req: {} }),
    (error) => error instanceof ValidationError && error.data?.errors?.[0]?.path === "layout.hero.text",
  );

  await assert.rejects(
    async () => quoteTextHook({ value: 123, path: [], req: {} }),
    (error) => error instanceof ValidationError && error.data?.errors?.[0]?.path === "layout.quote.text",
  );
});

test("nested group inside block preserves child blockingFieldPath", () => {
  const entity = defineEntity({
    name: "PageWithNestedGroupInBlock",
    fields: {
      layout: field.blocks({
        blocks: {
          hero: {
            fields: {
              grp: field.group({
                fields: {
                  child: field.native({ payload: { type: "json" } }),
                },
              }),
            },
          },
        },
      }),
    },
  });

  assert.equal(entity.fields.layout.schema, undefined);

  assert.throws(
    () => entity.schema(({ pick }) => pick(["layout"])),
    (error) => isPayloadSchemaError(error, "SCHEMA_UNAVAILABLE")
      && error.data.blockingFieldPath === "layout.hero.grp.child",
  );
});
