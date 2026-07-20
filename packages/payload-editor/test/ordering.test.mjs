import assert from "node:assert/strict";
import test from "node:test";

import { createEditor } from "../dist/index.js";
import { resolveEditor } from "./helpers.mjs";

test("produces deterministic Payload order regardless of caller key order", async () => {
  const first = await resolveEditor(createEditor({
    features: {
      fixedToolbar: true,
      link: true,
      italic: true,
      paragraph: true,
      heading: true,
      bold: true,
    },
  }));
  const second = await resolveEditor(createEditor({
    features: {
      paragraph: true,
      heading: true,
      bold: true,
      italic: true,
      link: true,
      fixedToolbar: true,
    },
  }));

  const firstKeys = first.features.map((feature) => feature.key);
  const secondKeys = second.features.map((feature) => feature.key);
  assert.deepEqual(firstKeys, secondKeys);
  assert.deepEqual(firstKeys, [
    "toolbarFixed",
    "link",
    "italic",
    "bold",
    "heading",
    "paragraph",
  ]);
});
