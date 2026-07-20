import assert from "node:assert/strict";
import test from "node:test";

import {
  PayloadEditorConfigError,
  createEditor,
  defineEditorPreset,
} from "../dist/index.js";

test("rejects invalid definitions with stable path-aware errors", () => {
  assert.throws(
    () => createEditor(),
    (error) => error instanceof PayloadEditorConfigError
      && error.code === "PAYLOAD_EDITOR_DEFINITION_REQUIRED"
      && error.path === "options",
  );

  assert.throws(
    () => defineEditorPreset({ features: { heading: null } }),
    (error) => error instanceof PayloadEditorConfigError
      && error.code === "PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS"
      && error.path === "features.heading",
  );
});

test("rejects unknown and malformed semantic values", () => {
  const cases = [
    [{ preset: "unknown" }, "PAYLOAD_EDITOR_UNKNOWN_PRESET", "preset"],
    [{ features: { code: true } }, "PAYLOAD_EDITOR_UNKNOWN_FEATURE", "features.code"],
    [{ features: { heading: { sizes: ["title"] } } }, "PAYLOAD_EDITOR_INVALID_HEADING_SIZES", "features.heading.sizes"],
    [{ features: { link: { allowedCollections: [""] } } }, "PAYLOAD_EDITOR_INVALID_COLLECTIONS", "features.link.allowedCollections"],
    [{ features: { upload: { maxDepth: -1 } } }, "PAYLOAD_EDITOR_INVALID_MAX_DEPTH", "features.upload.maxDepth"],
    [{ features: {}, extendFeatures: [{ key: "custom" }] }, "PAYLOAD_EDITOR_INVALID_EXTENSION", "extendFeatures[0]"],
  ];

  for (const [options, code, path] of cases) {
    assert.throws(
      () => createEditor(options),
      (error) => error instanceof PayloadEditorConfigError
        && error.code === code
        && error.path === path,
    );
  }
});
