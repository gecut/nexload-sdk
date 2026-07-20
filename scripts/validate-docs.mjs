import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "apps/docs/src/content/docs");
const documentedRoots = [
  "packages/healthcheck",
  "packages/payload-fields",
  "packages/payload-editor",
  "agents",
  "community",
  "start",
  "index.mdx",
  "packages/index.mdx",
];
const inventory = {
  "@nexload-sdk/healthcheck": {
    source: "packages/healthcheck/core/src",
    symbols: ["createHealthManager", "defineHealthCheck", "defineMetricCollector", "shutdownCheck", "memoryCheck", "httpCheck", "toHealthJson", "stringifyHealthJson"],
  },
  "@nexload-sdk/healthcheck-node": {
    source: "packages/healthcheck/node/src",
    symbols: ["nodeRuntimeAdapter", "containerResourceCheck", "tcpCheck", "dnsCheck", "processMetricsCollector"],
  },
  "@nexload-sdk/healthcheck-next": {
    source: "packages/healthcheck/next/src",
    symbols: ["createNextHealthRoute", "createNextMetricsRoute"],
  },
  "@nexload-sdk/healthcheck-prometheus": {
    source: "packages/healthcheck/prometheus/src",
    symbols: ["toPrometheusText", "toOpenMetricsText"],
  },
  "@nexload-sdk/healthcheck-otel": {
    source: "packages/healthcheck/otel/src",
    symbols: ["toOtelResourceAttributes", "toOtelMetricRecords"],
  },
  "@nexload-sdk/healthcheck-payload": {
    source: "packages/healthcheck/payload/src",
    symbols: ["payloadHealthCheck"],
  },
  "@nexload-sdk/payload-fields": {
    source: "packages/payload-fields/src",
    symbols: ["slugField", "formatSlug", "jalaliDateField", "withJalaliTimestamps", "formatJalaliDate", "moneyField", "parseMoneyToMinorUnits", "formatMoney", "payloadFieldsPlugin"],
  },
  "@nexload-sdk/payload-editor": {
    source: "packages/payload-editor/src",
    symbols: ["createEditor", "defineEditorPreset", "PayloadEditorConfigError"],
  },
};

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const allDocs = walk(docsRoot);
const markdownFiles = allDocs.filter((path) => path.endsWith(".md"));
const mdxFiles = allDocs.filter((path) => path.endsWith(".mdx"));
const failures = [];

if (markdownFiles.length) failures.push(`Canonical docs must be MDX: ${markdownFiles.map((path) => relative(root, path)).join(", ")}`);
if (!mdxFiles.length) failures.push("No MDX documentation files found.");

for (const file of mdxFiles) {
  const body = readFileSync(file, "utf8");
  if (!body.startsWith("---")) failures.push(`${relative(root, file)} is missing frontmatter.`);
  if (!/^title:\s*.+$/m.test(body)) failures.push(`${relative(root, file)} is missing title.`);
  if (!/^description:\s*.+$/m.test(body)) failures.push(`${relative(root, file)} is missing description.`);
}

for (const expected of documentedRoots) {
  if (!existsSync(join(docsRoot, expected))) failures.push(`Missing canonical docs root: ${expected}`);
}

const docsText = mdxFiles.map((file) => readFileSync(file, "utf8")).join("\n");
for (const [packageName, entry] of Object.entries(inventory)) {
  const sourceFiles = walk(join(root, entry.source)).filter((path) => path.endsWith(".ts"));
  const source = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  for (const symbol of entry.symbols) {
    if (!source.includes(symbol)) failures.push(`${packageName}: ${symbol} was not found in source.`);
    if (!docsText.includes(symbol)) failures.push(`${packageName}: ${symbol} is missing from curated MDX API coverage.`);
  }
}

const publicManifestPaths = [
  ...walk(join(root, "packages")),
  ...walk(join(root, "tools")),
]
  .filter((path) => path.endsWith("package.json"));
const catalogSource = readFileSync(join(root, "apps/docs/src/lib/package-catalog.ts"), "utf8");
for (const manifestPath of publicManifestPaths) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.private) continue;
  const sourcePath = relative(root, join(manifestPath, "..")).replaceAll("\\", "/");
  if (!catalogSource.includes(`sourcePath: "${sourcePath}"`)) {
    failures.push(`${manifest.name} is missing from the package catalog.`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Docs content validated (${mdxFiles.length} MDX pages).`);
}
