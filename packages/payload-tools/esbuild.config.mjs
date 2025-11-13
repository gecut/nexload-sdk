import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler([
  "src/index.ts",
  "src/editor/index.ts",
  "src/hooks/index.ts",

  "src/fields/date/index.ts",
  "src/fields/date/date-cell.tsx",
  "src/fields/date/date-picker.tsx",

  "src/fields/slug/index.ts",
  "src/fields/slug/slug-field.tsx",
]);

esbuildBundler();
