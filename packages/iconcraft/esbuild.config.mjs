import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler(["src/index.ts", "src/cli.ts"]);

esbuildBundler();
