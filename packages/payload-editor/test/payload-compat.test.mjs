import assert from "node:assert/strict";
import test from "node:test";

import { buildConfig } from "payload";

import { createEditor } from "../dist/index.js";

test("satisfies real root and field Payload rich-text contracts", async () => {
  const config = await buildConfig({
    secret: "payload-editor-contract-test-secret-value",
    editor: createEditor({ preset: "standard" }),
    collections: [{
      slug: "pages",
      fields: [{
        name: "content",
        type: "richText",
        editor: createEditor({ preset: "article" }),
      }],
    }],
  });

  const field = config.collections[0].fields.find((candidate) => candidate.name === "content");
  assert.equal(config.editor.features.some((feature) => feature.key === "paragraph"), true);
  assert.equal(field.editor.features.some((feature) => feature.key === "relationship"), true);
});
