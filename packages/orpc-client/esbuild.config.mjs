import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler(
  "src/index.ts",
  "dist",
  process.cwd(),
  {
    bundle: false,
    format: "esm",
    platform: "node",
    target: "es2020",
    external: [],
  },
  false
);

bundler();
