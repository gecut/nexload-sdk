import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const required = [
  "core",
  "custom-checks",
  "next-route",
  "monitoring-exporters",
  "docker-cgroup",
  "payload-adapter",
  "diagnostics-security",
];

let failed = false;

for (const name of required) {
  const path = join(process.cwd(), "skills", name, "SKILL.md");

  if (!existsSync(path)) {
    console.warn(`warning: missing skill ${name}`);
    failed = true;
    continue;
  }

  const body = readFileSync(path, "utf8");
  if (!body.startsWith("---") || !body.includes("name:") || !body.includes("description:")) {
    console.warn(`warning: invalid skill frontmatter ${name}`);
    failed = true;
  }
}

if (failed) {
  console.warn("warning: healthcheck skill validation found issues");
} else {
  console.log("healthcheck skill validation passed");
}
