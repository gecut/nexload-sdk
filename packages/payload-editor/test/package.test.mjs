import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const packageRoot = new URL("..", import.meta.url);
const distRoot = new URL("../dist/", import.meta.url);

test("ships one server-safe ESM root within the bundle budget", async () => {
  const manifest = JSON.parse(await readFile(new URL("package.json", packageRoot), "utf8"));
  const files = await readdir(distRoot);
  const bundle = await readFile(new URL("index.js", distRoot), "utf8");
  const bundleStat = await stat(new URL("index.js", distRoot));

  assert.equal(manifest.type, "module");
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  assert.equal("require" in manifest.exports["."], false);
  assert.equal(files.some((file) => file.endsWith(".cjs") || file.endsWith(".mjs")), false);
  assert.equal(bundleStat.size <= 50 * 1024, true, `root bundle is ${bundleStat.size} bytes`);
  assert.equal(bundle.includes("@payloadcms/richtext-lexical"), true);
  assert.equal(bundle.includes("react/jsx-runtime"), false);
  assert.equal(bundle.includes("@payloadcms/ui"), false);
  assert.equal(bundle.includes("document."), false);
  assert.equal(bundle.includes("window."), false);
});
