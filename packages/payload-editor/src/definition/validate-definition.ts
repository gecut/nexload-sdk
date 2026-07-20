import { PayloadEditorConfigError } from "../errors.js";

import type { EditorFeatureConfig, HeadingSize } from "../types.js";

const featureKeys = new Set<keyof EditorFeatureConfig>([
  "paragraph",
  "heading",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "inlineCode",
  "link",
  "unorderedList",
  "orderedList",
  "blockquote",
  "horizontalRule",
  "upload",
  "relationship",
  "inlineToolbar",
  "fixedToolbar"
]);

const optionFeatureKeys = new Set([
  "heading",
  "link",
  "upload",
  "relationship"
]);
const headingSizes = new Set<HeadingSize>([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
]);

function invalidOptions (path: string): never {
  throw new PayloadEditorConfigError(
    "PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS", path, `Invalid feature options at ${path}.`
  );
}

function validateCollections (
  value: unknown, path: string
): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new PayloadEditorConfigError(
      "PAYLOAD_EDITOR_INVALID_COLLECTIONS", path, `Expected an array of collection slugs at ${path}.`
    );
  }
}

function validateRelationalOptions (
  value: Record<string, unknown>, path: string, extraAllowedKey?: string
): void {
  const allowedKeys = new Set([
    "allowedCollections",
    "maxDepth"
  ]);
  if (extraAllowedKey) allowedKeys.add(extraAllowedKey);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) invalidOptions(`${path}.${key}`);
  }
  if (value.allowedCollections !== undefined) {
    validateCollections(
      value.allowedCollections, `${path}.allowedCollections`
    );
  }
  if (value.maxDepth !== undefined && (!Number.isInteger(value.maxDepth) || Number(value.maxDepth) < 0)) {
    throw new PayloadEditorConfigError(
      "PAYLOAD_EDITOR_INVALID_MAX_DEPTH", `${path}.maxDepth`, `Expected a non-negative integer at ${path}.maxDepth.`
    );
  }
}

export function validateDefinition (
  value: unknown, path = "features"
): asserts value is Readonly<EditorFeatureConfig> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) invalidOptions(path);

  for (const [
    key,
    featureValue
  ] of Object.entries(value)) {
    if (!featureKeys.has(key as keyof EditorFeatureConfig)) {
      throw new PayloadEditorConfigError(
        "PAYLOAD_EDITOR_UNKNOWN_FEATURE", `${path}.${key}`, `Unknown editor feature at ${path}.${key}.`
      );
    }
    const featurePath = `${path}.${key}`;
    if (typeof featureValue === "boolean" || featureValue === undefined) continue;
    if (featureValue === null || typeof featureValue !== "object" || Array.isArray(featureValue)) {
      invalidOptions(featurePath);
    }
    if (!optionFeatureKeys.has(key)) invalidOptions(featurePath);

    const options = featureValue as Record<string, unknown>;
    if (key === "heading") {
      for (const optionKey of Object.keys(options)) {
        if (optionKey !== "sizes") invalidOptions(`${featurePath}.${optionKey}`);
      }
      if (
        options.sizes !== undefined
        && (!Array.isArray(options.sizes)
          || options.sizes.length === 0
          || options.sizes.some((size) => !headingSizes.has(size as HeadingSize)))
      ) {
        throw new PayloadEditorConfigError(
          "PAYLOAD_EDITOR_INVALID_HEADING_SIZES", `${featurePath}.sizes`, `Expected one or more valid heading sizes at ${featurePath}.sizes.`
        );
      }
      continue;
    }

    if (key === "link") {
      validateRelationalOptions(
        options, featurePath, "autoLink"
      );
      if (options.autoLink !== undefined && typeof options.autoLink !== "boolean") {
        invalidOptions(`${featurePath}.autoLink`);
      }
      continue;
    }

    validateRelationalOptions(
      options, featurePath
    );
  }
}
