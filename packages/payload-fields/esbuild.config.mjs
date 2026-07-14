import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler([
  "src/index.ts",
  "src/admin/slug-field.tsx",
  "src/admin/jalali-date-field.tsx",
  "src/admin/jalali-picker-value.ts",
  "src/admin/jalali-date-cell.tsx",
  "src/admin/money-field.tsx",
]);

bundler();
