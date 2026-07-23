import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
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

function routeTarget(route) {
  const clean = route.replace(/\?.*$/, "");
  if (clean.endsWith(".md") || /\.[a-z0-9]+$/i.test(clean)) return join(dist, clean);
  return clean === "/" ? join(dist, "index.html") : join(dist, clean, "index.html");
}

function fragmentExists(file, fragment) {
  if (!fragment) return true;
  const html = readFileSync(file, "utf8");
  const decoded = decodeURIComponent(fragment);
  return html.includes(`id="${decoded}"`) || html.includes(`name="${decoded}"`);
}

function validateSourceUrl(href, failures) {
  const match = href.match(/^https:\/\/github\.com\/gecut\/nexload-sdk\/(?:blob|tree)\/main\/([^#?]+)(?:#L(\d+))?/);
  if (!match) return;
  const path = resolve(root, match[1]);
  if (!existsSync(path)) {
    failures.add(`Missing local source target: ${href}`);
    return;
  }
  if (match[2]) {
    const lineCount = readFileSync(path, "utf8").split("\n").length;
    if (Number(match[2]) > lineCount) failures.add(`Source line is outside file: ${href}`);
  }
}

const failures = new Set();
const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:mailto:|tel:|data:|javascript:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      validateSourceUrl(href, failures);
      continue;
    }
    if (href.startsWith("#")) {
      if (!fragmentExists(file, href.slice(1))) failures.add(`${file.replace(`${root}/`, "")} -> ${href}`);
      continue;
    }
    if (href.startsWith("/") && !href.startsWith(`${base}/`)) {
      failures.add(`${file.replace(`${root}/`, "")} -> internal link escapes site base: ${href}`);
      continue;
    }
    if (!href.startsWith(`${base}/`)) continue;
    const [path, fragment] = href.slice(base.length).split("#");
    const target = routeTarget(path || "/");
    if (!existsSync(target)) {
      failures.add(`${file.replace(`${root}/`, "")} -> ${href}`);
    } else if (fragment && target.endsWith(".html") && !fragmentExists(target, fragment)) {
      failures.add(`${file.replace(`${root}/`, "")} -> missing fragment ${href}`);
    }
  }
}

for (const required of ["404.html", "robots.txt", "social-card.svg", "sitemap-index.xml", "llms.txt", "llms-full.txt"]) {
  if (!existsSync(join(dist, required))) failures.add(`Missing required static output: ${required}`);
}

if (failures.size > 0) {
  console.error(`Broken docs links or assets:\n${[...failures].join("\n")}`);
  process.exit(1);
}
console.log(`Static docs crawl passed for ${htmlFiles.length} HTML files, including fragments and source targets.`);
