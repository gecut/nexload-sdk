import { featureOrder } from "../registry/feature-order.js";

import type { EditorFeatureConfig } from "../types.js";

type FeatureValue = EditorFeatureConfig[keyof EditorFeatureConfig];

function cloneValue (value: FeatureValue): FeatureValue {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([
    key,
    option
  ]) => [
    key,
    Array.isArray(option) ? [...option] : option
  ])) as FeatureValue;
}

export function mergeDefinition (
  base: Readonly<EditorFeatureConfig> | undefined,
  overrides: Readonly<EditorFeatureConfig> | undefined
): EditorFeatureConfig {
  const merged: EditorFeatureConfig = {};

  for (const key of featureOrder) {
    const baseValue = base?.[key];
    const overrideValue = overrides?.[key];
    let value: FeatureValue;

    if (overrideValue === undefined) value = cloneValue(baseValue);
    else if (overrideValue === true || overrideValue === false) value = overrideValue;
    else if (baseValue && typeof baseValue === "object") {
      value = {
        ...baseValue,
        ...(cloneValue(overrideValue) as object),
      } as FeatureValue;
    } else value = cloneValue(overrideValue);

    if (value !== undefined) Object.assign(
      merged, { [key]: value, }
    );
  }

  return merged;
}
