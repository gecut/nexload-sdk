import { createBundler } from "@nexload-sdk/bundler";

const esbuildBundler = createBundler(["src/index.ts", "src/cli.ts"], "dist", process.cwd(), {
  banner: {
    js: "#!/usr/bin/env node",
  },
});

esbuildBundler();
