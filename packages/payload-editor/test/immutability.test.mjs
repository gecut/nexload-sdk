import assert from "node:assert/strict";
import test from "node:test";

import { defineEditorPreset } from "../dist/index.js";

test("snapshots a reusable preset without mutating caller input", () => {
  const sizes = ["h2", "h3"];
  const features = { heading: { sizes } };
  const preset = defineEditorPreset({ features });

  sizes.push("h4");
  features.heading.sizes = ["h1"];

  assert.deepEqual(preset.features, { heading: { sizes: ["h2", "h3"] } });
  assert.equal(Object.isFrozen(preset), true);
  assert.equal(Object.isFrozen(preset.features), true);
  assert.deepEqual(features, { heading: { sizes: ["h1"] } });
});
