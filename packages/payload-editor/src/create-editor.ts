import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { isEditorPreset } from "./define-editor-preset.js";
import { mergeDefinition } from "./definition/merge-definition.js";
import { validateDefinition } from "./definition/validate-definition.js";
import { PayloadEditorConfigError } from "./errors.js";
import { getBuiltInPreset } from "./presets/definitions.js";
import { createManagedFeatures } from "./registry/feature-registry.js";

import type { CreateEditorOptions, EditorPreset, NativeEditorFeature } from "./types.js";

function appendExtensions (
  managed: NativeEditorFeature[],
  extensions: readonly NativeEditorFeature[] | undefined
): NativeEditorFeature[] {
  if (extensions === undefined) return managed;
  if (!Array.isArray(extensions)) {
    throw new PayloadEditorConfigError(
      "PAYLOAD_EDITOR_INVALID_EXTENSION", "extendFeatures", "Expected extendFeatures to be an array of Payload feature providers."
    );
  }

  const keys = new Set(managed.map((feature) => feature.key));
  const result = [...managed];
  for (const [
    index,
    extension
  ] of extensions.entries()) {
    const path = `extendFeatures[${index}]`;
    if (
      typeof extension !== "object"
      || extension === null
      || typeof extension.key !== "string"
      || !extension.key.trim()
      || !("feature" in extension)
      || (typeof extension.feature !== "object" && typeof extension.feature !== "function")
      || extension.feature === null
    ) {
      throw new PayloadEditorConfigError(
        "PAYLOAD_EDITOR_INVALID_EXTENSION", path, `Expected a Payload feature provider with a non-empty key at ${path}.`
      );
    }
    if (keys.has(extension.key)) {
      throw new PayloadEditorConfigError(
        "PAYLOAD_EDITOR_DUPLICATE_FEATURE", path, `Duplicate Payload feature key: ${extension.key}.`, "Disable the managed feature before adding a native replacement."
      );
    }
    keys.add(extension.key);
    result.push(extension);
  }
  return result;
}

export function createEditor (options: CreateEditorOptions): ReturnType<typeof lexicalEditor> {
  if (typeof options !== "object" || options === null || (!("preset" in options) && !("features" in options))) {
    throw new PayloadEditorConfigError(
      "PAYLOAD_EDITOR_DEFINITION_REQUIRED", "options", "An explicit preset or features definition is required."
    );
  }
  let preset: EditorPreset | undefined;
  if (typeof options.preset === "string") {
    preset = getBuiltInPreset(options.preset);
    if (!preset) {
      throw new PayloadEditorConfigError(
        "PAYLOAD_EDITOR_UNKNOWN_PRESET", "preset", `Unknown editor preset: ${options.preset}.`
      );
    }
  } else if (options.preset !== undefined) {
    if (!isEditorPreset(options.preset)) {
      throw new PayloadEditorConfigError(
        "PAYLOAD_EDITOR_UNKNOWN_PRESET", "preset", "Expected a built-in preset name or a preset created by defineEditorPreset."
      );
    }
    preset = options.preset;
  }

  if (options.features !== undefined) validateDefinition(options.features);
  const features = mergeDefinition(
    preset?.features, options.features
  );
  const providers = appendExtensions(
    createManagedFeatures(features), options.extendFeatures
  );

  return lexicalEditor({ admin: options.admin, features: providers, });
}
