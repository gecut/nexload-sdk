import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler([
  "src/index.ts",
  "src/schema/index.ts",
  "src/i18n/messages.ts",
  "src/internal/validated-text.ts",
  "src/admin/validated-text-field.tsx",
  "src/admin/formatted-cell.tsx",
  "src/slug/index.ts",
  "src/date/index.ts",
  "src/money/index.ts",
  "src/admin/slug-field.tsx",
  "src/admin/jalali-date-field.tsx",
  "src/admin/jalali-date-cell.tsx",
  "src/admin/money-field.tsx",
  "src/admin/money-cell.tsx",
], "dist", process.cwd(), {}, false);

bundler();
