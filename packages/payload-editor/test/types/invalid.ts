import { createEditor } from "@nexload-sdk/payload-editor";

// @ts-expect-error An explicit definition is required.
createEditor();

// @ts-expect-error Unknown semantic features are rejected.
createEditor({ features: { code: true } });

// @ts-expect-error Heading sizes are a closed union.
createEditor({ features: { heading: { sizes: ["title"] } } });

// @ts-expect-error null is never a feature state.
createEditor({ features: { bold: null } });
