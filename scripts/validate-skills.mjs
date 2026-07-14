import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_FRONTMATTER = new Set(["name", "description"]);
const REQUIRED_SECTIONS = [
  "Purpose",
  "Trigger boundary",
  "Source of truth",
  "Required inspection",
  "Decision flow",
  "Implementation workflow",
  "Invariants",
  "Security and edge cases",
  "Verification",
  "Reference routing",
  "Handoff requirements",
];
const EVAL_CATEGORIES = new Set([
  "happy_path",
  "edge_case",
  "failure_security",
  "review_diagnosis",
  "near_miss_composition",
]);
const DEPRECATED_NAMES = new Set([
  "nexload-healthcheck-core",
  "nexload-healthcheck-custom-checks",
  "nexload-healthcheck-diagnostics-security",
  "nexload-healthcheck-docker-cgroup",
  "nexload-healthcheck-monitoring-exporters",
  "nexload-healthcheck-next-route",
  "nexload-healthcheck-payload-adapter",
  "healthcheck-docker-cgroup",
  "healthcheck-next-route",
  "healthcheck-payload-adapter",
]);

function lineCount (value) {
  return value.replace(/\n$/, "").split(/\r?\n/).length;
}

function parseScalar (raw, path, errors) {
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("\"") || value.startsWith("'")) {
    if (value[0] !== value.at(-1)) {
      errors.push(`${path}: unterminated quoted frontmatter value`);
      return "";
    }
    if (value.startsWith("'")) return value.slice(1, -1);
    try {
      return JSON.parse(value);
    } catch {
      errors.push(`${path}: invalid quoted frontmatter value`);
      return "";
    }
  }
  return value;
}

function parseFrontmatter (body, path, errors) {
  const lines = body.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0] !== "---") {
    errors.push(`${path}: frontmatter must start on the first line`);
    return { attributes: {}, content: body };
  }
  const closing = lines.indexOf("---", 1);
  if (closing < 0) {
    errors.push(`${path}: frontmatter is not closed`);
    return { attributes: {}, content: body };
  }
  const attributes = {};
  for (const [offset, line] of lines.slice(1, closing).entries()) {
    if (!line.trim()) continue;
    const match = /^([a-z][a-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!match) {
      errors.push(`${path}:${offset + 2}: unsupported frontmatter syntax`);
      continue;
    }
    const [, key, raw] = match;
    if (!ALLOWED_FRONTMATTER.has(key)) errors.push(`${path}: unsupported frontmatter key '${key}'`);
    if (key in attributes) errors.push(`${path}: duplicate frontmatter key '${key}'`);
    attributes[key] = parseScalar(raw, path, errors);
  }
  return { attributes, content: lines.slice(closing + 1).join("\n") };
}

function parseJson (path, errors) {
  if (!existsSync(path)) {
    errors.push(`${path}: missing required file`);
    return undefined;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${path}: invalid JSON (${error.message})`);
    return undefined;
  }
}

function validateEvals (skillDirectory, skillName, errors) {
  const path = join(skillDirectory, "evals", "evals.json");
  const document = parseJson(path, errors);
  if (!document) return;
  if (document.skill_name !== skillName) errors.push(`${path}: skill_name must equal '${skillName}'`);
  if (!Array.isArray(document.evals) || document.evals.length < 5) {
    errors.push(`${path}: evals must contain at least five scenarios`);
    return;
  }
  const ids = new Set();
  const categories = new Set();
  for (const [index, entry] of document.evals.entries()) {
    const label = `${path}:evals[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${label}: must be an object`);
      continue;
    }
    if (!Number.isInteger(entry.id) || ids.has(entry.id)) errors.push(`${label}: id must be a unique integer`);
    ids.add(entry.id);
    if (!EVAL_CATEGORIES.has(entry.category)) errors.push(`${label}: invalid or missing category`);
    categories.add(entry.category);
    if (typeof entry.prompt !== "string" || !entry.prompt.trim()) errors.push(`${label}: prompt is required`);
    if (typeof entry.expected_output !== "string" || !entry.expected_output.trim()) errors.push(`${label}: expected_output is required`);
    if (!Array.isArray(entry.expectations) || entry.expectations.length < 2 || entry.expectations.some((item) => typeof item !== "string" || !item.trim())) {
      errors.push(`${label}: expectations must contain at least two non-empty assertions`);
    }
    if (entry.files !== undefined) {
      if (!Array.isArray(entry.files) || entry.files.some((item) => typeof item !== "string" || !item.trim())) {
        errors.push(`${label}: files must be an array of relative paths`);
      } else {
        for (const file of entry.files) {
          const target = resolve(skillDirectory, file);
          if (relative(skillDirectory, target).startsWith("..") || !existsSync(target)) errors.push(`${label}: missing or unsafe file '${file}'`);
        }
      }
    }
  }
  for (const category of EVAL_CATEGORIES) {
    if (!categories.has(category)) errors.push(`${path}: missing '${category}' scenario`);
  }
}

function validateTriggerEvals (skillDirectory, errors) {
  const path = join(skillDirectory, "evals", "trigger-evals.json");
  const entries = parseJson(path, errors);
  if (!entries) return;
  if (!Array.isArray(entries) || entries.length !== 20) {
    errors.push(`${path}: must contain exactly 20 trigger queries`);
    return;
  }
  const queries = new Set();
  let positive = 0;
  let negative = 0;
  for (const [index, entry] of entries.entries()) {
    const label = `${path}:[${index}]`;
    if (!entry || typeof entry.query !== "string" || !entry.query.trim()) errors.push(`${label}: query is required`);
    else if (queries.has(entry.query.trim())) errors.push(`${label}: duplicate query`);
    else queries.add(entry.query.trim());
    if (entry?.should_trigger === true) positive += 1;
    else if (entry?.should_trigger === false) negative += 1;
    else errors.push(`${label}: should_trigger must be boolean`);
  }
  if (positive !== 10 || negative !== 10) errors.push(`${path}: must contain 10 positive and 10 negative queries`);
}

function validateReferences (skillDirectory, content, errors) {
  const directory = join(skillDirectory, "references");
  if (!existsSync(directory) || !statSync(directory).isDirectory()) {
    errors.push(`${directory}: missing references directory`);
    return;
  }
  const files = readdirSync(directory).filter((name) => statSync(join(directory, name)).isFile());
  if (files.length < 3 || files.some((name) => !name.endsWith(".md"))) errors.push(`${directory}: must contain at least three Markdown references`);
  const linked = new Set();
  const pattern = /\[[^\]]+\]\((references\/[^)#?\s]+\.md)(?:#[^)]+)?\)/g;
  for (const match of content.matchAll(pattern)) linked.add(match[1].slice("references/".length));
  for (const name of files) {
    const path = join(directory, name);
    if (lineCount(readFileSync(path, "utf8")) > 200) errors.push(`${path}: reference exceeds 200 lines`);
    if (!linked.has(name)) errors.push(`${path}: orphan reference not linked from SKILL.md`);
  }
  for (const name of linked) {
    if (!files.includes(name)) errors.push(`${join(directory, name)}: linked reference does not exist`);
  }
}

function validateSkill (root, packageName, directoryName, names, errors) {
  const skillDirectory = join(root, packageName, directoryName);
  const path = join(skillDirectory, "SKILL.md");
  if (!existsSync(path)) {
    errors.push(`${path}: missing required file`);
    return;
  }
  const body = readFileSync(path, "utf8");
  if (lineCount(body) > 200) errors.push(`${path}: SKILL.md exceeds 200 lines`);
  const { attributes, content } = parseFrontmatter(body, path, errors);
  const expectedName = `${packageName}-${directoryName}`;
  if (!KEBAB_CASE.test(packageName) || !KEBAB_CASE.test(directoryName)) errors.push(`${path}: package and directory names must use kebab-case`);
  if (attributes.name !== expectedName) errors.push(`${path}: name must equal '${expectedName}'`);
  if (DEPRECATED_NAMES.has(attributes.name) || attributes.name?.startsWith("nexload-")) errors.push(`${path}: deprecated skill name '${attributes.name}'`);
  if (names.has(attributes.name)) errors.push(`${path}: duplicate skill name '${attributes.name}'`);
  else if (attributes.name) names.add(attributes.name);
  if (typeof attributes.description !== "string" || attributes.description.length < 40 || attributes.description.length > 600) {
    errors.push(`${path}: description must be between 40 and 600 characters`);
  }
  for (const section of REQUIRED_SECTIONS) {
    if (!new RegExp(`^## ${section}$`, "m").test(content)) errors.push(`${path}: missing '## ${section}' section`);
  }
  validateReferences(skillDirectory, content, errors);
  validateEvals(skillDirectory, attributes.name, errors);
  validateTriggerEvals(skillDirectory, errors);
}

export function validateSkills ({ root, selected } = {}) {
  const skillsRoot = root ?? join(process.cwd(), "skills");
  const errors = [];
  if (!existsSync(skillsRoot)) return [`${skillsRoot}: missing skills root`];
  const packageNames = selected ? [selected] : readdirSync(skillsRoot).filter((name) => statSync(join(skillsRoot, name)).isDirectory());
  const names = new Set();
  for (const packageName of packageNames) {
    const packageDirectory = join(skillsRoot, packageName);
    if (!existsSync(packageDirectory) || !statSync(packageDirectory).isDirectory()) {
      errors.push(`${packageDirectory}: missing skill package`);
      continue;
    }
    for (const directoryName of readdirSync(packageDirectory).filter((name) => statSync(join(packageDirectory, name)).isDirectory())) {
      validateSkill(skillsRoot, packageName, directoryName, names, errors);
    }
  }
  return errors;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const selected = process.argv[2];
  const errors = validateSkills({ selected });
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log(selected ? `${selected} skills validated` : "all skills validated");
  }
}
