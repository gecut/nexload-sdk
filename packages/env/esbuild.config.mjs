import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler(["src/index.ts", "src/presets/index.ts"]);

esbuildBundler();
