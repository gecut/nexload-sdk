import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "apps/docs/src/content/docs");
const catalogPath = join(root, "apps/docs/src/lib/package-catalog.ts");
const apiCatalogPath = join(root, "apps/docs/src/generated/api-catalog.json");
const packageIds = [
  "healthcheck",
  "healthcheck-node",
  "healthcheck-bun",
  "healthcheck-next",
  "healthcheck-prometheus",
  "healthcheck-otel",
  "healthcheck-payload",
  "payload-fields",
  "payload-editor",
  "payload-schema",
];
const packageDirectories = {
  healthcheck: "packages/healthcheck/core",
  "healthcheck-node": "packages/healthcheck/node",
  "healthcheck-bun": "packages/healthcheck/bun",
  "healthcheck-next": "packages/healthcheck/next",
  "healthcheck-prometheus": "packages/healthcheck/prometheus",
  "healthcheck-otel": "packages/healthcheck/otel",
  "healthcheck-payload": "packages/healthcheck/payload",
  "payload-fields": "packages/payload-fields",
  "payload-editor": "packages/payload-editor",
  "payload-schema": "packages/payload-schema",
};
const topics = [
  "overview",
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
const excludedCatalogPackages = [
  "@nexload-sdk/env",
  "@nexload-sdk/logger",
  "@nexload-sdk/jwt",
  "@nexload-sdk/iconcraft",
  "@nexload-sdk/orpc-client",
  "@nexload-sdk/payload-hooks",
  "@nexload-sdk/eslint-config",
  "@nexload-sdk/typescript-config",
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function metadata(body) {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split("\n").flatMap((line) => {
    const field = line.match(/^([a-zA-Z][\w-]*):\s*(.+)$/);
    if (!field || field[2].startsWith("{")) return [];
    return [[field[1], field[2].replace(/^["']|["']$/g, "")]];
  }));
}

const failures = [];
const markdownFiles = walk(docsRoot).filter((path) => path.endsWith(".md"));
const mdxFiles = walk(docsRoot).filter((path) => path.endsWith(".mdx"));
const pages = mdxFiles.map((file) => {
  const body = readFileSync(file, "utf8");
  return { file, body, metadata: metadata(body) };
});

if (markdownFiles.length) failures.push(`Canonical docs must be MDX: ${markdownFiles.map((path) => relative(root, path)).join(", ")}`);
for (const page of pages) {
  const path = relative(root, page.file);
  if (!page.metadata.title) failures.push(`${path}: missing title.`);
  if (!page.metadata.description) failures.push(`${path}: missing description.`);
  if (!page.metadata.topic) failures.push(`${path}: missing topic metadata.`);
}

for (const packageId of packageIds) {
  const directory = join(docsRoot, packageDirectories[packageId]);
  const packagePages = pages.filter((page) => dirname(page.file) === directory);
  const seenTopics = packagePages.map((page) => page.metadata.topic).sort();
  if (packagePages.length !== topics.length) {
    failures.push(`${packageDirectories[packageId]}: expected ${topics.length} pages, found ${packagePages.length}.`);
  }
  for (const topic of topics) {
    if (!seenTopics.includes(topic)) failures.push(`${packageDirectories[packageId]}: missing ${topic} page.`);
  }
  for (const page of packagePages) {
    if (page.metadata.package !== packageId) failures.push(`${relative(root, page.file)}: package metadata must be ${packageId}.`);
  }
  const orders = packagePages.map((page) => page.body.match(/sidebar:\s*(?:\{\s*)?[\s\S]{0,50}?order:\s*(\d+)/)?.[1]).filter(Boolean);
  if (new Set(orders).size !== 10 || !topics.every((_, index) => orders.includes(String(index + 1)))) {
    failures.push(`${packageDirectories[packageId]}: sidebar orders must be unique 1 through 10.`);
  }
  const apiPage = packagePages.find((page) => page.metadata.topic === "api");
  if (!apiPage?.body.includes(`<ApiInventory packageId="${packageId}" />`)) {
    failures.push(`${packageDirectories[packageId]}: API page must render the complete ${packageId} inventory.`);
  }
  const examplePage = packagePages.find((page) => page.metadata.topic === "examples");
  if (!examplePage?.body.includes(`apps/docs/examples/${packageId}.ts`)) {
    failures.push(`${packageDirectories[packageId]}: examples page must link to its type-checked source.`);
  }
  const manifest = JSON.parse(readFileSync(join(root, packageDirectories[packageId], "package.json"), "utf8"));
  const migrationPage = packagePages.find((page) => page.metadata.topic === "migration");
  if (!migrationPage?.body.includes(manifest.version)) {
    failures.push(`${packageDirectories[packageId]}: migration page must name current version ${manifest.version}.`);
  }
  if (!migrationPage?.body.includes("CHANGELOG.md")) {
    failures.push(`${packageDirectories[packageId]}: migration page must link to its changelog.`);
  }
}

const catalog = readFileSync(catalogPath, "utf8");
for (const packageId of packageIds) {
  if (!catalog.includes(`id: "${packageId}"`)) failures.push(`Package catalog is missing ${packageId}.`);
}
for (const packageName of excludedCatalogPackages) {
  if (catalog.includes(packageName)) failures.push(`Out-of-scope package remains in docs catalog: ${packageName}.`);
}
const catalogIds = [...catalog.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);
if (catalogIds.length !== packageIds.length || new Set(catalogIds).size !== packageIds.length) {
  failures.push(`Package catalog must contain exactly ${packageIds.length} unique documented package ids.`);
}

if (!existsSync(apiCatalogPath)) {
  failures.push("Generated API catalog is missing.");
} else {
  const apiCatalog = JSON.parse(readFileSync(apiCatalogPath, "utf8"));
  for (const packageId of packageIds) {
    if (!apiCatalog[packageId]?.symbols?.length) failures.push(`API inventory is empty for ${packageId}.`);
  }
  if (Object.keys(apiCatalog).length !== packageIds.length) failures.push("API inventory must contain exactly the documented packages.");
}

const docsText = pages.map((page) => page.body).join("\n");
const staleClaims = [
  ["Docs planned", "Docs planned packages must not appear."],
  ["The repository ships 16", "Skill counts must be discovered, not hard-coded."],
  ["Pull requests exercise the minimum and current lanes", "Inactive compatibility matrix claim remains."],
  ["a separate `payload-editor` package is not part", "Stale Payload Editor migration claim remains."],
];
for (const [phrase, message] of staleClaims) {
  if (docsText.includes(phrase)) failures.push(message);
}
if (/immutable (?:IR|definition state)/iu.test(docsText)) failures.push("Payload Schema definition state must not be described as fully immutable.");
if (readFileSync(apiCatalogPath, "utf8").includes(root)) {
  failures.push("API signatures must not expose an absolute repository path.");
}

const exampleFiles = walk(join(root, "apps/docs/examples")).filter((path) => path.endsWith(".ts") && !path.endsWith("tsconfig.json"));
for (const packageId of packageIds) {
  if (!existsSync(join(root, `apps/docs/examples/${packageId}.ts`))) failures.push(`Missing type-checked example for ${packageId}.`);
}
if (exampleFiles.length !== packageIds.length) failures.push(`Expected exactly ${packageIds.length} package example files.`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Docs contract validated: ${packageIds.length} packages, ${pages.length} pages, ${topics.length} package topics.`);
