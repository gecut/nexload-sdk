import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler(
  [
    "src/index.ts",
    "src/client/index.ts",
    "src/contract/index.ts",
    "src/errors/index.ts",
    "src/plugins/timeout/index.ts",
    "src/server/index.ts",
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
