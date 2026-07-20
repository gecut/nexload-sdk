import { createBundler } from "@nexload-sdk/bundler";

const bundler = createBundler("src/index.ts", "dist", process.cwd(), {}, false);

bundler();
