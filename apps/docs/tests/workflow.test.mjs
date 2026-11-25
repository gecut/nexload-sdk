import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("push and pull request filters cover all documentation inputs", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/docs.yml", import.meta.url), "utf8");
  for (const paths of workflow.split("    paths:\n").slice(1)) {
    const block = paths.split(/\n(?!      -)/)[0];
    for (const glob of ["packages/**", "skills/**", "tools/**", "apps/docs/**", "pnpm-lock.yaml", "pnpm-workspace.yaml", ".changeset/**"]) assert.ok(block.includes(`"${glob}"`), glob);
  }
  assert.ok(workflow.includes("pnpm -C apps/docs test:site"));
});
