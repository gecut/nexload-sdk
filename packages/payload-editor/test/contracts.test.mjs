import assert from "node:assert/strict";
import test from "node:test";

import { createEditor, defineEditorPreset } from "../dist/index.js";

test("creates an explicit custom Payload editor through the public interface", () => {
  const preset = defineEditorPreset({
    features: {
      paragraph: true,
      bold: true,
    },
  });

  const editor = createEditor({ preset });

  assert.equal(typeof editor, "function");
});
