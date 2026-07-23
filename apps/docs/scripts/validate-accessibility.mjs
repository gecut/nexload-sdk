import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const failures = [];
const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const label = file.replace(dist, "");
  const isRedirect = /http-equiv="refresh"/i.test(html);

  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${label}: missing page title`);
  if (!isRedirect && !/<html\b[^>]*\blang="[^"]+"/i.test(html)) failures.push(`${label}: missing document language`);
  if (!isRedirect && !/<main\b/i.test(html)) failures.push(`${label}: missing main landmark`);

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]*"/i.test(image[0])) failures.push(`${label}: image without alt text`);
  }

  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) failures.push(`${label}: duplicate ids ${[...new Set(duplicates)].join(", ")}`);

  for (const button of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const text = button[2].replace(/<[^>]+>/g, "").trim();
    if (!text && !/\b(?:aria-label|title)="[^"]+"/i.test(button[1])) {
      failures.push(`${label}: button without an accessible name`);
    }
  }
}

if (failures.length) {
  console.error(`Accessibility contract failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`Accessibility contract passed for ${htmlFiles.length} HTML files.`);
