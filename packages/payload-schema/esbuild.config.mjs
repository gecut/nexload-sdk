import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler(
  [
    "src/index.ts",
    "src/payload/index.ts",
  ],
  "dist",
  process.cwd(),
  {
    chunkNames: "internal/[name]-[hash]",
    platform: "neutral",
    splitting: true,
    target: "es2022",
  },
  false,
);

bundler();
