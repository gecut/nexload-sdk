import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateSkills } from "./validate-skills.mjs";

const sections = [
  "Purpose", "Trigger boundary", "Source of truth", "Required inspection", "Decision flow",
  "Implementation workflow", "Invariants", "Security and edge cases", "Verification",
  "Reference routing", "Handoff requirements",
];
const categories = ["happy_path", "edge_case", "failure_security", "review_diagnosis", "near_miss_composition"];

function createFixture ({ packageName = "healthcheck", directoryName = "core" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "nexload-skills-"));
  const skillName = `${packageName}-${directoryName}`;
  const skill = join(root, packageName, directoryName);
  mkdirSync(join(skill, "references"), { recursive: true });
  mkdirSync(join(skill, "evals"));
  const body = [
    "---",
    `name: ${skillName}`,
    "description: Use when managing the complete healthcheck orchestration contract safely.",
    "---",
    "",
    ...sections.flatMap((section) => [
      `## ${section}`,
      section === "Reference routing"
        ? "Read [contract](references/contract.md), [playbook](references/playbook.md), and [failures](references/failure-modes.md)."
        : "Required guidance.",
      "",
    ]),
  ].join("\n");
  writeFileSync(join(skill, "SKILL.md"), body);
  for (const name of ["contract.md", "playbook.md", "failure-modes.md"]) writeFileSync(join(skill, "references", name), `# ${name}\n`);
  writeFileSync(join(skill, "evals", "evals.json"), JSON.stringify({
    skill_name: skillName,
    evals: categories.map((category, index) => ({
      id: index + 1,
      category,
      prompt: `Prompt ${index + 1}`,
      expected_output: "A verified implementation.",
      expectations: ["Inspects source.", "Runs verification."],
    })),
  }));
  writeFileSync(join(skill, "evals", "trigger-evals.json"), JSON.stringify(Array.from({ length: 20 }, (_, index) => ({
    query: `Query ${index + 1}`,
    should_trigger: index < 10,
  }))));
  return root;
}

test("accepts a complete structured skill", () => {
  const root = createFixture();
  try {
    assert.deepEqual(validateSkills({ root }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function createPortableFixture (root, { name = "portable-worker", description = "Delegate bounded execution to a CLI worker." } = {}) {
  const skill = join(root, "portable-worker");
  mkdirSync(skill, { recursive: true });
  writeFileSync(join(skill, "SKILL.md"), `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\nSupervise bounded work.\n`);
  return skill;
}

test("validates portable skills alongside nested package skills without requiring eval scaffolding", () => {
  const root = createFixture();
  try {
    const skill = createPortableFixture(root);
    assert.deepEqual(validateSkills({ root }), []);
    assert.deepEqual(validateSkills({ root, selected: "portable-worker" }), []);
    mkdirSync(join(skill, "references"));
    writeFileSync(join(skill, "references", "contract.md"), "# Contract\n");
    const entrypoint = join(skill, "SKILL.md");
    writeFileSync(entrypoint, `${readFileSync(entrypoint, "utf8")}\nRead [contract](references/contract.md).\n`);
    assert.deepEqual(validateSkills({ root }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects invalid portable frontmatter and broken references", () => {
  const root = createFixture();
  try {
    const skill = createPortableFixture(root, { name: "wrong-name", description: " " });
    const errors = validateSkills({ root });
    assert(errors.some((error) => error.includes("name must equal 'portable-worker'")));
    assert(errors.some((error) => error.includes("description must be between 1 and 1024")));
    createPortableFixture(root);
    const entrypoint = join(skill, "SKILL.md");
    writeFileSync(entrypoint, `${readFileSync(entrypoint, "utf8")}\nRead [missing](references/missing.md).\n`);
    assert(validateSkills({ root }).some((error) => error.includes("missing references directory")));
    mkdirSync(join(skill, "references"));
    assert(validateSkills({ root }).some((error) => error.includes("linked reference does not exist")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects path mismatches and orphan references", () => {
  const root = createFixture();
  try {
    const skill = join(root, "healthcheck", "core");
    writeFileSync(join(skill, "references", "orphan.md"), "# Orphan\n");
    writeFileSync(join(skill, "SKILL.md"), readFileSync(join(skill, "SKILL.md"), "utf8").replace("name: healthcheck-core", "name: wrong-name"));
    const errors = validateSkills({ root });
    assert(errors.some((error) => error.includes("name must equal 'healthcheck-core'")));
    assert(errors.some((error) => error.includes("orphan reference")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects unbalanced trigger evals", () => {
  const root = createFixture();
  try {
    const path = join(root, "healthcheck", "core", "evals", "trigger-evals.json");
    const entries = JSON.parse(readFileSync(path, "utf8"));
    writeFileSync(path, JSON.stringify(entries.map((entry) => ({ ...entry, should_trigger: true }))));
    assert(validateSkills({ root }).some((error) => error.includes("10 positive and 10 negative")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts the approved nexload skills", () => {
  for (const directoryName of ["code", "package", "react", "design", "cto-review"]) {
    const root = createFixture({ packageName: "nexload", directoryName });
    try {
      assert.deepEqual(validateSkills({ root }), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("rejects unapproved nexload-prefixed skills", () => {
  for (const directoryName of ["legacy", "cto-review-v2"]) {
    const root = createFixture({ packageName: "nexload", directoryName });
    try {
      assert(validateSkills({ root }).some((error) => error.includes(`deprecated skill name 'nexload-${directoryName}'`)));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});
