import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import apiCatalog from "../src/generated/api-catalog.json" with { type: "json" };

const packageRoutes = {
  healthcheck: "healthcheck/core",
  "healthcheck-node": "healthcheck/node",
  "healthcheck-bun": "healthcheck/bun",
  "healthcheck-next": "healthcheck/next",
  "healthcheck-prometheus": "healthcheck/prometheus",
  "healthcheck-otel": "healthcheck/otel",
  "healthcheck-payload": "healthcheck/payload",
  "payload-fields": "payload-fields",
  "payload-editor": "payload-editor",
  "payload-schema": "payload-schema",
};

test("canonical Markdown contains every public export", () => {
  const full = readFileSync(new URL("../public/llms-full.txt", import.meta.url), "utf8");
  let symbolCount = 0;
  for (const entry of Object.values(apiCatalog)) {
    for (const symbol of entry.symbols) {
      symbolCount += 1;
      assert.match(full, new RegExp(`### \\\`${symbol.name.replaceAll("$", "\\$")}\\\``));
      assert.match(full, new RegExp(symbol.sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
  assert.equal(symbolCount, 163);
});

test("each package exposes all ten canonical Markdown topics", () => {
  const topics = [
    "index",
    "installation",
    "quick-start",
    "concepts",
    "guides",
    "api",
    "examples",
    "troubleshooting",
    "migration",
    "compatibility",
  ];
  for (const route of Object.values(packageRoutes)) {
    for (const topic of topics) {
      const file = topic === "index"
        ? `../public/packages/${route}/index.md`
        : `../public/packages/${route}/${topic}.md`;
      assert.equal(existsSync(new URL(file, import.meta.url)), true, file);
    }
  }
});

test("generated machine docs preserve package and install information", () => {
  const index = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
  const full = readFileSync(new URL("../public/llms-full.txt", import.meta.url), "utf8");
  for (const entry of Object.values(apiCatalog)) {
    assert.match(index, new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(full, /pnpm add @nexload-sdk\/healthcheck/);
  assert.match(full, /pnpm add @nexload-sdk\/payload-schema payload zod/);
  assert.doesNotMatch(full, /<ApiInventory|<PackageGrid|<InstallTabs/);
});

test("out-of-scope packages are absent from the public catalog index", () => {
  const index = readFileSync(new URL("../public/packages/index.md", import.meta.url), "utf8");
  for (const name of [
    "@nexload-sdk/env",
    "@nexload-sdk/logger",
    "@nexload-sdk/jwt",
    "@nexload-sdk/iconcraft",
    "@nexload-sdk/orpc-client",
    "@nexload-sdk/payload-hooks",
  ]) {
    assert.doesNotMatch(index, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
