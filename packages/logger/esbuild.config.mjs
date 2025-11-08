import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler(["src/index.ts", "src/next-js.ts"]);

esbuildBundler();
