import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };
const read = file => readFileSync(new URL(`../public/${file}`, import.meta.url), "utf8");

test("each package topic reaches its individual, family, topic and full bundles", () => {
  const index = read("llms.txt");
  for (const id of [...Object.keys(catalog), "typescript-config", "eslint-config"]) {
    const dir = catalog[id]?.sourcePath.replace(/^packages\//, "") ?? id;
    const family = id.startsWith("healthcheck") ? "healthcheck" : id.startsWith("payload-") ? "payload" : id.endsWith("-config") ? "tooling" : "core";
    const prefix = `packages/${dir}/`;
    assert.ok(read(prefix + "api.md").includes("**Topic:** api"));
    assert.ok(index.includes(`/nexload-sdk/${prefix}index.md`));
    for (const topic of ["optimization", "agents"]) {
      const page = read(`${prefix}${topic}.md`);
      for (const file of [`${prefix}llms.txt`, `llms-${family}.txt`, `llms-${topic}.txt`, "llms-full.txt"]) assert.ok(read(file).includes(page), file);
    }
  }
});

test("catalog includes every manifest entry and checked runtime example", () => {
  for (const { id, name, sourcePath, symbols } of Object.values(catalog)) {
    const manifest = JSON.parse(readFileSync(new URL(`../../../${sourcePath}/package.json`, import.meta.url)));
    for (const key of Object.keys(manifest.exports)) {
      if (key === "./package.json") continue;
      const path = key === "." ? name : name + key.slice(1);
      assert.ok(symbols.some(symbol => symbol.exportPaths.includes(path)), path);
    }
    assert.ok(readFileSync(new URL(`../examples/${id}.ts`, import.meta.url), "utf8").includes(name));
  }
});
