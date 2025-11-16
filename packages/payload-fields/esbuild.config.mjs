import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler([
  "src/index.ts",

  "src/date/date-cell.tsx",
  "src/date/date-picker.tsx",

  "src/slug/slug-field.tsx",
]);

bundler();
