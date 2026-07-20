import assert from "node:assert/strict";
import test from "node:test";

import { createServerFeature } from "@payloadcms/richtext-lexical";

import {
  PayloadEditorConfigError,
  createEditor,
} from "../dist/index.js";
import { resolveEditor } from "./helpers.mjs";

const CustomFeature = createServerFeature({ key: "custom", feature: {} });

test("appends native extensions and passes admin configuration", async () => {
  const admin = { hideGutter: true };
  const adapter = await resolveEditor(createEditor({
    admin,
    features: { paragraph: true },
    extendFeatures: [CustomFeature()],
  }));

  assert.equal(adapter.features.some((feature) => feature.key === "custom"), true);
  assert.deepEqual(adapter.FieldComponent.serverProps.admin, admin);
});

test("rejects managed and native duplicate feature keys before Payload", () => {
  assert.throws(
    () => createEditor({
      features: { paragraph: true },
      extendFeatures: [CustomFeature(), CustomFeature()],
    }),
    (error) => error instanceof PayloadEditorConfigError
      && error.code === "PAYLOAD_EDITOR_DUPLICATE_FEATURE"
      && error.path === "extendFeatures[1]",
  );

  const ParagraphReplacement = createServerFeature({ key: "paragraph", feature: {} });
  assert.throws(
    () => createEditor({
      features: { paragraph: true },
      extendFeatures: [ParagraphReplacement()],
    }),
    (error) => error instanceof PayloadEditorConfigError
      && error.code === "PAYLOAD_EDITOR_DUPLICATE_FEATURE",
  );
});
