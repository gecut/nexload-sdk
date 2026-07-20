import { createEditor, defineEditorPreset } from "@nexload-sdk/payload-editor";

const preset = defineEditorPreset({
  features: {
    heading: { sizes: ["h2", "h3"] },
    link: { allowedCollections: ["pages"], maxDepth: 0 },
  },
});

createEditor({ preset, features: { heading: true } });
createEditor({ features: { paragraph: true, inlineToolbar: true } });
