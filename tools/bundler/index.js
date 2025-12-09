import * as esbuild from "esbuild";
import * as child_process from "child_process";
import { sassPlugin } from "esbuild-sass-plugin";
import { promisify } from "util";
import { createRequire } from "module";
import { rm } from "fs/promises";
import path from "path";

export function createBundler(
  entryFile = "src/index.ts",
  outDir = "dist",
  baseDir = process.cwd(),
  esbuildOptions = {}
) {
  const pkgPath = path.join(baseDir, "package.json");
  const _require = createRequire(import.meta.url);
  const pkg = _require(pkgPath);

  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  const exec = promisify(child_process.exec);

  function esbuilder(options) {
    return esbuild.build({
      entryPoints: [entryFile].flat(),
      outdir: outDir,
      bundle: true,
      platform: "node",
      sourcemap: true,
      target: "es2020",
      plugins: [sassPlugin({ type: "style", })],
      minify: true, // Recommended for production build
      external: externals,
      banner: {
        js: `// ${pkg.name} v${pkg.version} (build ${new Date().toISOString()})`,
      },
      ...esbuildOptions,
      ...options,
    });
  }

  async function clean() {
    console.log("1. Cleaning dist directory...");
    await rm(outDir, { recursive: true, force: true });
  }

  async function build() {
    console.log("2. Building JS outputs (CJS & ESM) via esbuild...");

    await Promise.all([
      // --- 1. ESM Build (.mjs) ---
      esbuilder({
        format: "esm",
        outExtension: { ".js": ".mjs" },
        target: "es2020",
      }),

      // --- 2. CJS Build (.cjs) ---
      esbuilder({
        format: "cjs",
        outExtension: { ".js": ".cjs" },
        target: "node16",
      }),
    ]);

    console.log("3. Generating TypeScript declarations via tsc...");

    // --- 3. Type Generation (TSC) ---
    // We run the TypeScript compiler directly via the command line
    // to generate the .d.ts files based on tsconfig.json
    try {
      await exec("npx tsc --project tsconfig.json");
      console.log("Build successful!");
    } catch (error) {
      console.error("Type generation failed:", error.stderr);
      process.exit(1);
    }

    console.log("");
  }

  return () => {
    clean().then(() =>
      build().catch((err) => {
        console.error(err);
        process.exit(1);
      })
    );
  };
}
