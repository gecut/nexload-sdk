import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { toMarkdown } from "mdast-util-to-markdown";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

import apiCatalog from "../src/generated/api-catalog.json" with { type: "json" };
import { apiPackages } from "./api-packages.mjs";

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(docsRoot, "../..");
const contentRoot = resolve(docsRoot, "src/content/docs");
const publicRoot = resolve(docsRoot, "public");
const generatedManifestPath = resolve(publicRoot, "markdown-manifest.json");
const checkOnly = process.argv.includes("--check");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function frontmatter(body) {
  const match = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error("Missing frontmatter.");
  const value = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (!field || !field[2] || field[2].startsWith("{")) continue;
    value[field[1]] = field[2].replace(/^["']|["']$/g, "");
  }
  return { value, content: body.slice(match[0].length) };
}

function routeFor(file) {
  const source = relative(contentRoot, file).replaceAll("\\", "/");
  if (source === "index.mdx") return "/";
  return `/${source.replace(/\/index\.mdx$/, "/").replace(/\.mdx$/, ".md")}`;
}

function outputFor(route) {
  if (route === "/") return resolve(publicRoot, "index.md");
  if (route.endsWith("/"))
    return resolve(publicRoot, route.slice(1), "index.md");
  return resolve(publicRoot, route.slice(1));
}

function attribute(node, name) {
  const value = node.attributes?.find(
    (candidate) => candidate.name === name,
  )?.value;
  return typeof value === "string" ? value : undefined;
}

function parseMarkdown(markdown) {
  return unified().use(remarkParse).parse(markdown).children;
}

function apiMarkdown(packageId) {
  const entry = apiCatalog[packageId];
  if (!entry) throw new Error(`Unknown API inventory package: ${packageId}`);
  const categories = [
    "functions",
    "classes",
    "constants",
    "interfaces",
    "types",
  ];
  return categories
    .flatMap((category) => {
      const symbols = entry.symbols.filter(
        (symbol) => symbol.category === category,
      );
      if (symbols.length === 0) return [];
      return [
        `## ${category[0].toUpperCase()}${category.slice(1)}`,
        "",
        ...symbols.flatMap((symbol) => [
          `### \`${symbol.name}\``,
          "",
          "```ts",
          symbol.signature,
          "```",
          "",
          `**Exported from:** ${symbol.exportPaths.map((path) => `\`${path}\``).join(", ")}`,
          "",
          symbol.description,
          "",
          `[Source](${symbol.sourceUrl})`,
          "",
        ]),
      ];
    })
    .join("\n");
}

const packageMetadata = Object.fromEntries(
  apiPackages.map((entry) => {
    const manifest = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, entry.sourcePath, "package.json"),
        "utf8",
      ),
    );
    return [
      entry.id,
      {
        ...entry,
        version: manifest.version,
        description: manifest.description,
      },
    ];
  }),
);

function packageHeroMarkdown(source) {
  const packageName = source.match(/packageByName\("([^"]+)"\)/)?.[1];
  const entry = Object.values(packageMetadata).find(
    (candidate) => candidate.name === packageName,
  );
  if (!entry) return "";
  return [
    `**Package:** \`${entry.name}\``,
    `**Current released version:** \`${entry.version}\``,
    entry.description ?? "",
    `[npm](https://www.npmjs.com/package/${entry.name}) · [Source](https://github.com/gecut/nexload-sdk/tree/main/${entry.sourcePath})`,
  ].join("\n\n");
}

function packageGridMarkdown(source) {
  const family = source.includes('family === "healthcheck"')
    ? "healthcheck"
    : source.includes('family === "payload"')
      ? "payload"
      : undefined;
  const entries = apiPackages.filter(
    (entry) =>
      !family ||
      (family === "healthcheck"
        ? entry.id.startsWith("healthcheck")
        : entry.id.startsWith("payload-")),
  );
  return entries
    .map((entry) => {
      const metadata = packageMetadata[entry.id];
      const route =
        entry.id === "healthcheck"
          ? "/packages/healthcheck/core/"
          : entry.id.startsWith("healthcheck-")
            ? `/packages/healthcheck/${entry.id.slice("healthcheck-".length)}/`
            : `/packages/${entry.id}/`;
      return `- [${entry.name}](${route}) — ${metadata.description ?? ""} (v${metadata.version})`;
    })
    .join("\n");
}

function transformChildren(children, source) {
  const output = [];
  for (const node of children ?? []) {
    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    )
      continue;
    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      const original = node.position
        ? source.slice(node.position.start.offset, node.position.end.offset)
        : "";
      if (node.name === "ApiInventory") {
        output.push(
          ...parseMarkdown(apiMarkdown(attribute(node, "packageId"))),
        );
        continue;
      }
      if (node.name === "PackageHero") {
        output.push(...parseMarkdown(packageHeroMarkdown(original)));
        continue;
      }
      if (node.name === "PackageGrid") {
        output.push(...parseMarkdown(packageGridMarkdown(original)));
        continue;
      }
      if (node.name === "SkillInstall") {
        const skill = attribute(node, "skill");
        output.push(
          ...parseMarkdown(
            `\`\`\`bash\nnpx skills add gecut/nexload-sdk --skill ${skill}\n\`\`\``,
          ),
        );
        continue;
      }
      if (node.name === "DocLinkCard") {
        const title = attribute(node, "title") ?? "Documentation";
        const href = attribute(node, "href") ?? "/";
        const description = attribute(node, "description") ?? "";
        output.push(...parseMarkdown(`- [${title}](${href}) — ${description}`));
        continue;
      }
      const nested = transformChildren(node.children, source);
      const label = attribute(node, "label") ?? attribute(node, "title");
      if (label && ["TabItem", "Card", "Aside"].includes(node.name)) {
        output.push({
          type: "heading",
          depth: 3,
          children: [{ type: "text", value: label }],
        });
      }
      output.push(...nested);
      continue;
    }
    if (node.children) node.children = transformChildren(node.children, source);
    output.push(node);
  }
  return output;
}

function canonicalDocument(file) {
  const body = readFileSync(file, "utf8");
  const { value, content } = frontmatter(body);
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content);
  tree.children = transformChildren(tree.children, content);
  const route = routeFor(file);
  const packageEntry = value.package
    ? packageMetadata[value.package]
    : undefined;
  const metadata = [
    `# ${value.title}`,
    "",
    value.description ?? "",
    "",
    `**Topic:** ${value.topic ?? "documentation"}`,
    packageEntry
      ? `**Package:** \`${packageEntry.name}\` v${packageEntry.version}`
      : undefined,
    `**Canonical page:** https://gecut.github.io/nexload-sdk${route === "/" ? "/" : route.replace(/\.md$/, "/")}`,
    "",
  ].filter((line) => line !== undefined);
  return {
    route,
    title: value.title,
    description: value.description ?? "",
    packageId: value.package,
    topic: value.topic ?? "documentation",
    content: `${metadata.join("\n")}${toMarkdown(tree).trim()}\n`,
  };
}

const documents = walk(contentRoot)
  .filter((path) => path.endsWith(".mdx"))
  .sort()
  .map(canonicalDocument);
const generatedFiles = documents.map((document) =>
  relative(publicRoot, outputFor(document.route)).replaceAll("\\", "/"),
);
const llmsIndex = [
  "# Nexload SDK documentation",
  "",
  `Current-version documentation for ${apiPackages.length} released Healthcheck and Payload CMS packages.`,
  "",
  ...documents.map((document) => {
    const metadata = document.packageId
      ? packageMetadata[document.packageId]
      : undefined;
    return (
      `- [${document.title}](${document.route}) — ${document.description}` +
      `${metadata ? ` [${metadata.name} v${metadata.version}]` : ""} [topic: ${document.topic}]`
    );
  }),
  "",
].join("\n");
const llmsFull = documents
  .map((document) => document.content)
  .join("\n---\n\n");
const manifest = `${JSON.stringify({ files: generatedFiles }, null, 2)}\n`;

function expectedFiles() {
  return [
    ...documents.map((document) => [
      outputFor(document.route),
      document.content,
    ]),
    [resolve(publicRoot, "llms.txt"), llmsIndex],
    [resolve(publicRoot, "llms-full.txt"), llmsFull],
    [generatedManifestPath, manifest],
  ];
}

if (checkOnly) {
  const stale = expectedFiles().filter(
    ([path, expected]) =>
      !existsSync(path) || readFileSync(path, "utf8") !== expected,
  );
  if (stale.length > 0) {
    console.error(
      `Generated Markdown is stale:\n${stale.map(([path]) => relative(repositoryRoot, path)).join("\n")}`,
    );
    process.exit(1);
  }
  console.log(
    `Markdown and LLM outputs match ${documents.length} source pages.`,
  );
} else {
  if (existsSync(generatedManifestPath)) {
    const previous = JSON.parse(readFileSync(generatedManifestPath, "utf8"));
    for (const file of previous.files ?? [])
      rmSync(resolve(publicRoot, file), { force: true });
  }
  for (const [path, content] of expectedFiles()) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  console.log(`Generated canonical Markdown for ${documents.length} pages.`);
}
