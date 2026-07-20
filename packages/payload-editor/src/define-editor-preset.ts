import { validateDefinition } from "./definition/validate-definition.js";

import type {
  DefineEditorPresetOptions,
  EditorFeatureConfig,
  EditorPreset
} from "./types.js";

const presets = new WeakSet<object>();

function snapshotFeatures (features: Readonly<EditorFeatureConfig>): EditorFeatureConfig {
  const snapshot = Object.fromEntries(Object.entries(features).map(([
    key,
    value
  ]) => {
    if (value && typeof value === "object") {
      const options = Object.fromEntries(Object.entries(value).map(([
        optionKey,
        optionValue
      ]) => [
        optionKey,
        Array.isArray(optionValue) ? Object.freeze([...optionValue]) : optionValue
      ]));
      return [
        key,
        Object.freeze(options)
      ];
    }
    return [
      key,
      value
    ];
  }));

  return Object.freeze(snapshot);
}

export function defineEditorPreset (options: DefineEditorPresetOptions): EditorPreset {
  if (typeof options !== "object" || options === null) validateDefinition(undefined);
  validateDefinition(options.features);
  const preset = Object.freeze({ features: snapshotFeatures(options.features), }) as EditorPreset;
  presets.add(preset);
  return preset;
}

export function isEditorPreset (value: unknown): value is EditorPreset {
  return typeof value === "object" && value !== null && presets.has(value);
}
