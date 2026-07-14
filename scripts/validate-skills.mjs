import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "skills");
const selected = process.argv[2];
const packages = selected ? [selected] : readdirSync(root).filter((entry) => existsSync(join(root, entry)));
let failed = false;
for (const packageName of packages) {
  const directory = join(root, packageName);
  if (!existsSync(directory)) { console.warn(`missing skill package ${packageName}`); failed = true; continue; }
  for (const name of readdirSync(directory)) {
    const path = join(directory, name, "SKILL.md");
    if (!existsSync(path)) { console.warn(`missing skill ${packageName}/${name}`); failed = true; continue; }
    const body = readFileSync(path, "utf8");
    if (!body.startsWith("---") || !body.includes("name:") || !body.includes("description:")) { console.warn(`invalid skill ${packageName}/${name}`); failed = true; }
  }
}
if (failed) process.exitCode = 1;
else console.log(selected ? `${selected} skills validated` : "all skills validated");
