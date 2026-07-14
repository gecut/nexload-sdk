import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "apps/docs/src/content/docs");
const publicRoot = join(root, "apps/docs/public");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function plainMdx(body) {
  return body
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^import .*?;?\n/gm, "")
    .replace(/<\/?[A-Z][^>]*>/g, "")
    .replace(/<\/?[A-Z][^>]*\/>/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}

const files = walk(docsRoot).filter((path) => path.endsWith(".mdx")).sort();
const documents = files.map((file) => ({
  path: `/${relative(docsRoot, file).replace(/\/index\.mdx$/, "/").replace(/\.mdx$/, "/")}`.replace(/\/+/g, "/"),
  content: plainMdx(readFileSync(file, "utf8")).trim(),
}));
const index = [
  "# Nexload SDK",
  "",
  "Current documentation index for Nexload SDK packages and agent skills.",
  "",
  ...documents.map((document) => `- ${document.path}`),
  "",
].join("\n");
const full = documents.map((document) => `# ${document.path}\n\n${document.content}`).join("\n\n---\n\n");

mkdirSync(publicRoot, { recursive: true });
writeFileSync(join(publicRoot, "llms.txt"), index);
writeFileSync(join(publicRoot, "llms-full.txt"), `${full}\n`);
console.log(`Generated LLM indexes from ${documents.length} MDX pages.`);
