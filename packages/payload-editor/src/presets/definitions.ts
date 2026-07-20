import { defineEditorPreset } from "../define-editor-preset.js";

import type { EditorPreset, EditorPresetName } from "../types.js";

const compact = defineEditorPreset({
  features: {
    paragraph: true,
    bold: true,
    italic: true,
    link: { maxDepth: 1, },
    inlineToolbar: true,
  },
});

const standard = defineEditorPreset({
  features: {
    paragraph: true,
    bold: true,
    italic: true,
    underline: true,
    link: { maxDepth: 1, },
    unorderedList: true,
    orderedList: true,
    blockquote: true,
    inlineToolbar: true,
    fixedToolbar: true,
  },
});

const structuredContent = defineEditorPreset({
  features: {
    paragraph: true,
    heading: {
      sizes: [
        "h2",
        "h3",
        "h4"
      ],
    },
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    link: { maxDepth: 1, },
    unorderedList: true,
    orderedList: true,
    blockquote: true,
    horizontalRule: true,
    upload: { maxDepth: 1, },
    inlineToolbar: true,
    fixedToolbar: true,
  },
});

const article = defineEditorPreset({
  features: {
    ...structuredContent.features,
    heading: {
      sizes: [
        "h2",
        "h3",
        "h4",
        "h5"
      ],
    },
    inlineCode: true,
    relationship: { maxDepth: 1, },
  },
});

const productDescription = defineEditorPreset({
  features: {
    paragraph: true,
    heading: {
      sizes: [
        "h2",
        "h3"
      ],
    },
    bold: true,
    italic: true,
    link: { maxDepth: 1, },
    unorderedList: true,
    orderedList: true,
    upload: { maxDepth: 1, },
    inlineToolbar: true,
    fixedToolbar: true,
  },
});

const builtInPresets: Readonly<Record<EditorPresetName, EditorPreset>> = Object.freeze({
  compact,
  standard,
  "structured-content": structuredContent,
  article,
  "product-description": productDescription,
});

export function getBuiltInPreset (name: string): EditorPreset | undefined {
  return Object.hasOwn(
    builtInPresets, name
  )
    ? builtInPresets[name as EditorPresetName]
    : undefined;
}
