import { createBundler } from "@nexload-sdk/bundler";
const entries = [
  "src/index.ts",
  "src/digits/index.ts",
  "src/text/index.ts",
  "src/mobile/index.ts",
  "src/identity/index.ts",
  "src/bank/index.ts",
  "src/money/index.ts",
  "src/date/index.ts",
  "src/relative/index.ts",
  "src/geo/index.ts",
  "src/zod/index.ts",
];
createBundler(entries, "dist", process.cwd(), {
  platform: "neutral",
  target: "es2022",
})();
