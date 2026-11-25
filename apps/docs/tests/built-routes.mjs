import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import routes from "./legacy-routes.json" with { type: "json" };

const file = route => new URL(`../dist${route}index.html`, import.meta.url);

test("every original page and redirect resolves at the deployment base", () => {
  for (const route of routes.pages) assert.ok(existsSync(file(route)), route);
  for (const [old, current] of Object.entries(routes.redirects)) {
    const html = readFileSync(file(old), "utf8");
    assert.ok(html.includes(`content="0;url=/nexload-sdk${current}"`), old);
    assert.ok(html.includes(`rel="canonical" href="https://gecut.github.io/nexload-sdk${current}"`), old);
    assert.ok(!html.includes("/nexload-sdk/nexload-sdk/"), old);
    assert.ok(existsSync(file(current)), current);
  }
});

test("playgrounds have static instructions and exact package and topic bundle coverage", () => {
  const publicFile = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), "utf8");
  const expected = ["persian", "payload-schema", "healthcheck/core", "healthcheck/prometheus", "healthcheck/otel"];
  for (const path of expected) {
    const route = `packages/${path}/`;
    const page = publicFile(route + "playground.md");
    assert.ok(page.includes("Read the result"));
    assert.ok(page.includes(`/nexload-sdk/${route}api/`));
    assert.doesNotMatch(page, /<PersianPrice|<SchemaField|<HealthReport/);
    const family = path.startsWith("healthcheck/") ? "healthcheck" : path === "persian" ? "core" : "payload";
    for (const bundle of [route + "llms.txt", `llms-${family}.txt`, "llms-playground.txt", "llms-full.txt"]) assert.ok(publicFile(bundle).includes(page), bundle);
    assert.ok(publicFile(route + "playground/index.html").includes("<noscript>"));
  }
  for (const route of routes.pages.filter(route => /^\/packages\/.+\/$/.test(route) && !/\/(guides|api)\/$/.test(route))) {
    assert.equal(existsSync(file(route + "playground/")), expected.some(path => route === `/packages/${path}/`), route);
  }
});
