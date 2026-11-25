import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

const read = (path) => readFileSync(new URL(`../public/${path}`, import.meta.url), "utf8");

test("choose by task covers runtime packages and compiler tooling", () => {
  const guide = read("start/choose-a-package.md");
  for (const id of [...Object.keys(catalog), "typescript-config", "eslint-config"]) {
    assert.ok(guide.includes(`@nexload-sdk/${id}`), id);
  }
  assert.ok(read("index.md").includes("Jalali date picker"));
});

test("unreleased overviews identify a working local install", () => {
  for (const id of ["persian", "payload-preset"]) {
    const page = read(`packages/${id}/index.md`);
    assert.match(page, /unreleased/i);
    assert.ok(page.includes(`@nexload-sdk/${id}@workspace:*`));
    assert.ok(!page.includes(`www.npmjs.com/package/@nexload-sdk/${id}`));
  }
});
