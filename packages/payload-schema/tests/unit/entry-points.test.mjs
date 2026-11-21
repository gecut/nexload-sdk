import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireFromTest = createRequire(import.meta.url);
const esbuildPath = createRequire(requireFromTest.resolve("@nexload-sdk/bundler")).resolve("esbuild");
const esbuild = requireFromTest(esbuildPath);

function createEntity() {
  return defineEntity({
    name: "Article",
    fields: {
      title: field.text({ required: true, trim: true }),
    },
  });
}

test("root bundles for the browser", async () => {
  const result = await esbuild.build({
    entryPoints: [path.join(packageDirectory, "dist/index.js")],
    platform: "browser",
    bundle: true,
    write: false,
    logLevel: "silent",
  });

  assert.deepEqual(result.errors, []);
  const output = result.outputFiles.map(({ text }) => text).join("\n");
  assert.equal(output.includes("ValidationError"), false);
});

test("payloadFields compiles an entity", () => {
  const compiled = payloadFields(createEntity()).field("title");

  assert.equal(compiled.type, "text");
  assert.equal(compiled.hooks.beforeValidate.length, 1);
  assert.equal(typeof compiled.hooks.beforeValidate[0], "function");
});

test("payloadFields rejects non-entities", () => {
  for (const value of [{}, null, undefined, "Article", { ...createEntity() }, Object.create(createEntity())]) {
    assert.throws(
      () => payloadFields(value),
      (error) => isPayloadSchemaError(error)
        && error.code === "INVALID_ENTITY"
        && error.phase === "payload-compilation"
        && typeof error.data.receivedType === "string",
    );
  }
});

test("entity has no payload facade", () => {
  const entity = createEntity();

  assert.equal("payload" in entity, false);
  assert.deepEqual(Object.keys(entity).sort(), ["fields", "idSchema", "inspect", "name", "schema"]);
});
