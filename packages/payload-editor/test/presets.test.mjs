import assert from "node:assert/strict";
import test from "node:test";

import { createEditor } from "../dist/index.js";
import { featureMap, resolveEditor } from "./helpers.mjs";

test("keeps article preset membership and merges semantic overrides", async () => {
  const adapter = await resolveEditor(createEditor({
    preset: "article",
    features: {
      heading: { sizes: ["h2", "h3"] },
      relationship: false,
      upload: { allowedCollections: ["media"], maxDepth: 0 },
    },
  }));
  const features = featureMap(adapter);

  assert.deepEqual([...features.keys()].sort(), [
    "blockquote",
    "bold",
    "heading",
    "horizontalRule",
    "inlineCode",
    "italic",
    "link",
    "orderedList",
    "paragraph",
    "strikethrough",
    "toolbarFixed",
    "toolbarInline",
    "underline",
    "unorderedList",
    "upload",
  ].sort());
  assert.deepEqual(features.get("heading"), { enabledHeadingSizes: ["h2", "h3"] });
  assert.deepEqual(features.get("upload"), { enabledCollections: ["media"], maxDepth: 0 });
  assert.equal(features.has("relationship"), false);
});

test("true resets preset options to adapter defaults", async () => {
  const adapter = await resolveEditor(createEditor({
    preset: "article",
    features: { heading: true, link: { autoLink: false } },
  }));
  const features = featureMap(adapter);

  assert.equal(features.get("heading"), undefined);
  assert.equal(features.get("link").disableAutoLinks, true);
  assert.equal(features.get("link").maxDepth, 1);
});

test("keeps every built-in preset membership stable", async () => {
  const expected = {
    compact: ["bold", "italic", "link", "paragraph", "toolbarInline"],
    standard: ["blockquote", "bold", "italic", "link", "orderedList", "paragraph", "toolbarFixed", "toolbarInline", "underline", "unorderedList"],
    "structured-content": ["blockquote", "bold", "heading", "horizontalRule", "italic", "link", "orderedList", "paragraph", "strikethrough", "toolbarFixed", "toolbarInline", "underline", "unorderedList", "upload"],
    article: ["blockquote", "bold", "heading", "horizontalRule", "inlineCode", "italic", "link", "orderedList", "paragraph", "relationship", "strikethrough", "toolbarFixed", "toolbarInline", "underline", "unorderedList", "upload"],
    "product-description": ["bold", "heading", "italic", "link", "orderedList", "paragraph", "toolbarFixed", "toolbarInline", "unorderedList", "upload"],
  };

  for (const [preset, keys] of Object.entries(expected)) {
    const adapter = await resolveEditor(createEditor({ preset }));
    assert.deepEqual(adapter.features.map((feature) => feature.key).sort(), [...keys].sort());
  }
});

test("creates fresh Payload providers without mutating overrides", async () => {
  const features = { heading: { sizes: ["h2"] } };
  const first = await resolveEditor(createEditor({ features }));
  const second = await resolveEditor(createEditor({ features }));

  assert.notEqual(first.features[0], second.features[0]);
  assert.deepEqual(features, { heading: { sizes: ["h2"] } });
});
