import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

test("every package links to source-backed production choices", () => {
  const sources = [...Object.values(catalog), ...["typescript-config", "eslint-config"].map(id => ({ sourcePath: `tools/${id}`, id }))];
  for (const { sourcePath, id } of sources) {
    const dir = sourcePath.replace(/^(?:packages|tools)\//, "");
    const read = name => readFileSync(new URL(`../src/content/docs/packages/${dir}/${name}.mdx`, import.meta.url), "utf8");
    const page = read("optimization");
    assert.ok(page.includes(`package: ${id}\n`));
    assert.ok(page.includes("topic: optimization"));
    assert.ok(page.includes(`/main/${sourcePath}/README.md`));
    assert.ok(page.split("\n## ").length >= 4);
    assert.ok(read("index").includes("./optimization/"));
  }
});
