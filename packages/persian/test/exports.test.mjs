import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

test("every subpath builds in ESM and CJS", async () => {
  const require = createRequire(import.meta.url);

  for (const m of [
    "digits",
    "text",
    "mobile",
    "identity",
    "bank",
    "money",
    "date",
    "relative",
    "geo",
    "zod",
  ]) {
    assert.ok(
      Object.keys(await import(`../dist/${m}/index.mjs`)).length > 0,
      m,
    );
    assert.ok(Object.keys(require(`../dist/${m}/index.cjs`)).length > 0, m);
  }
});
test("root does not load zod", async () => {
  const root = await import("../dist/index.mjs");
  assert.equal(typeof root.normalizeIranMobile, "function");
  assert.equal("iranMobileSchema" in root, false);
  assert.doesNotMatch(
    readFileSync(new URL("../dist/index.mjs", import.meta.url), "utf8"),
    /from ["']zod["']/,
  );
});
test("no runtime dependencies", () => {
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.peerDependenciesMeta.zod.optional, true);
});
