import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "apps/docs/dist");
const base = "/nexload-sdk";

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function isStaticAsset(path) {
  return /\/(?:_astro\/|favicon\.svg$|sitemap-index\.xml$)/.test(path);
}

const broken = new Set();

for (const file of walk(dist).filter((file) => file.endsWith(".html"))) {
  for (const match of readFileSync(file, "utf8").matchAll(/href="([^"]+)"/g)) {
    const href = match[1];

    if (!href.startsWith(`${base}/`) || href.includes("#") || isStaticAsset(href)) continue;

    const route = href.slice(base.length).replace(/\?.*$/, "");
    const target = route === "/" ? join(dist, "index.html") : join(dist, route, "index.html");

    if (!existsSync(target)) broken.add(`${file.replace(`${root}/`, "")} -> ${href}`);
  }
}

if (broken.size > 0) {
  console.error("Broken static docs links:\n" + [...broken].join("\n"));
  process.exit(1);
}

console.log("Static base-path page-link crawl passed.");
