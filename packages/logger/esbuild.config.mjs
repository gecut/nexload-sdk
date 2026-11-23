import { fileURLToPath } from "node:url";

import { createBundler } from "@nexload-sdk/bundler";

const browserContext = fileURLToPath(
  new URL("./src/context.browser.ts", import.meta.url),
);

const browserEntry = {
  name: "logger-browser-entry",
  setup(build) {
    if (build.initialOptions.format !== "esm") return;

    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      await build.esbuild.build({
        entryPoints: ["src/index.browser.ts"],
        outfile: "dist/index.browser.mjs",
        bundle: true,
        platform: "browser",
        format: "esm",
        sourcemap: true,
        alias: { pino: "pino/browser.js" },
        define: { process: "browserProcess" },
        inject: [browserContext],
        plugins: [{
          name: "logger-browser-context",
          setup(browser) {
            browser.onResolve({ filter: /^\.\/context\.node$/ }, () => ({
              path: browserContext,
            }));
          },
        }],
      });
    });
  },
};

createBundler(["src/index.ts", "src/testing.ts"], "dist", process.cwd(), {
  plugins: [browserEntry],
})();
