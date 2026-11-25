import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

test("all agent pages supply scoped context, real skills and prompts", () => {
  for (const path of [...Object.values(catalog).map(x => x.sourcePath), "tools/eslint-config", "tools/typescript-config"]) {
    const route = path.replace(/^(?:packages|tools)\//, "");
    const page = readFileSync(new URL(`../src/content/docs/packages/${route}/agents.mdx`, import.meta.url), "utf8");
    assert.ok(page.includes(`/nexload-sdk/packages/${route}/llms.txt`));
    for (const title of ["Install matching skills", "Project AGENTS.md", "Package context", "Prompts"]) assert.ok(page.includes(`## ${title}`));
    const matches = [...page.matchAll(/blob\/main\/(skills\/[\w/-]+\/SKILL\.md)/g)];
    assert.ok(matches.length > 0);
    for (const [, path] of matches) {
      const skill = readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
      const name = /^name: (.+)$/m.exec(skill)[1];
      assert.ok(page.includes(`npx skills add gecut/nexload-sdk --skill ${name}`));
    }
  }
});
