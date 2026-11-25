import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import apiCatalog from "../src/generated/api-catalog.json" with { type: "json" };

const packageRoutes = {
  logger: "logger",
  persian: "persian",
  healthcheck: "healthcheck/core",
  "healthcheck-node": "healthcheck/node",
  "healthcheck-bun": "healthcheck/bun",
  "healthcheck-next": "healthcheck/next",
  "healthcheck-prometheus": "healthcheck/prometheus",
  "healthcheck-otel": "healthcheck/otel",
  "healthcheck-payload": "healthcheck/payload",
  "payload-fields": "payload-fields",
  "payload-hooks": "payload-hooks",
  "payload-preset": "payload-preset",
  "payload-editor": "payload-editor",
  "payload-operations": "payload-operations",
  "payload-schema": "payload-schema",
};

test("canonical Markdown contains every public export", () => {
  const full = readFileSync(
    new URL("../public/llms-full.txt", import.meta.url),
    "utf8",
  );
  let symbolCount = 0;
  for (const entry of Object.values(apiCatalog)) {
    for (const symbol of entry.symbols) {
      symbolCount += 1;
      assert.match(
        full,
        new RegExp(`### \\\`${symbol.name.replaceAll("$", "\\$")}\\\``),
      );
      assert.match(
        full,
        new RegExp(symbol.sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
  }
  assert.ok(symbolCount > 163);
});

test("each package exposes all three canonical Markdown topics", () => {
  const topics = [
    "index",
    "guides",
    "api",
  ];
  for (const route of Object.values(packageRoutes)) {
    for (const topic of topics) {
      const file =
        topic === "index"
          ? `../public/packages/${route}/index.md`
          : `../public/packages/${route}/${topic}.md`;
      assert.equal(existsSync(new URL(file, import.meta.url)), true, file);
    }
  }
});

test("generated machine docs preserve package and install information", () => {
  const index = readFileSync(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  );
  const full = readFileSync(
    new URL("../public/llms-full.txt", import.meta.url),
    "utf8",
  );
  for (const entry of Object.values(apiCatalog)) {
    assert.match(
      index,
      new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.match(full, /pnpm add @nexload-sdk\/persian/);
  assert.match(full, /pnpm add @nexload-sdk\/healthcheck/);
  assert.match(full, /pnpm add @nexload-sdk\/payload-schema payload zod/);
  assert.match(
    full,
    /pnpm add @nexload-sdk\/payload-operations payload @payloadcms\/sdk zod/,
  );
  assert.match(full, /@nexload-sdk\/payload-operations\/server/);
  assert.doesNotMatch(full, /<ApiInventory|<PackageGrid|<InstallTabs/);
});

test("out-of-scope packages are absent from the public catalog index", () => {
  const index = readFileSync(
    new URL("../public/packages/index.md", import.meta.url),
    "utf8",
  );
  for (const name of [
    "@nexload-sdk/env",
    "@nexload-sdk/jwt",
    "@nexload-sdk/iconcraft",
    "@nexload-sdk/orpc-client",
  ]) {
    assert.doesNotMatch(
      index,
      new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});

test("package overviews include installation and scoped LLM bundles", () => {
  for (const [id, route] of Object.entries({ ...packageRoutes, "typescript-config": "typescript-config", "eslint-config": "eslint-config" })) {
    const overview = readFileSync(new URL(`../public/packages/${route}/index.md`, import.meta.url), "utf8");
    assert.match(overview, /## Installation/i, id);
    const bundle = new URL(`../public/packages/${route}/llms.txt`, import.meta.url);
    assert.ok(existsSync(bundle), id);
    const text = readFileSync(bundle, "utf8");
    const topics = id.endsWith("-config") ? ["overview", "guides"] : ["overview", "guides", "api"];
    for (const topic of topics) assert.ok(text.includes(`**Topic:** ${topic}`), `${id}: ${topic}`);
  }
});

test("installation matrix lists every public package", () => {
  const installation = readFileSync(new URL("../public/start/installation.md", import.meta.url), "utf8");
  for (const entry of Object.values(apiCatalog)) assert.ok(installation.includes(entry.name), entry.name);
  for (const name of ["@nexload-sdk/typescript-config", "@nexload-sdk/eslint-config"]) assert.ok(installation.includes(name), name);
});
