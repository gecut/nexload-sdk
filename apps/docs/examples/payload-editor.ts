import { createEditor } from "@nexload-sdk/payload-editor";

export const editor = createEditor({
  preset: "structured-content",
  features: {
    heading: { sizes: ["h2", "h3"] },
    upload: { allowedCollections: ["media"], maxDepth: 1 },
  },
});
