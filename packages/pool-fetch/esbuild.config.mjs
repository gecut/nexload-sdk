import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler("src/index.ts", "dist", process.cwd(), {
  target: "esnext",
});

esbuildBundler();
