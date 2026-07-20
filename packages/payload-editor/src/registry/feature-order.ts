import type { ManagedFeatureKey } from "./types.js";

export const featureOrder = [
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
] as const satisfies readonly ManagedFeatureKey[];
