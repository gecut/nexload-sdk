import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const skillDir = path.join(rootDir, "skills/nexload/cto-review");

console.log("=== RUNNING NEXLOAD CTO REVIEW V2 VALIDATION SUITE ===\n");

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

// 1. Verify SKILL.md
console.log("\n[1] Checking SKILL.md Orchestration Contract...");
const skillPath = path.join(skillDir, "SKILL.md");
assert(fs.existsSync(skillPath), "SKILL.md exists");

const skillContent = fs.readFileSync(skillPath, "utf8");
const skillLines = skillContent.split("\n");
assert(skillLines.length < 200, `SKILL.md line count is ${skillLines.length} (< 200 lines target)`);

assert(skillContent.startsWith("---\n"), "Frontmatter starts with ---");
const fmEnd = skillContent.indexOf("\n---\n", 4);
assert(fmEnd !== -1, "Frontmatter properly closed");
const frontmatter = skillContent.slice(4, fmEnd);
assert(/name:\s*nexload-cto-review/.test(frontmatter), "Frontmatter name is nexload-cto-review");
assert(/description:\s*".+"/.test(frontmatter), "Frontmatter description is non-empty string");

const requiredSections = [
  "## Purpose",
  "## Trigger boundary",
  "## Source of truth",
  "## Required inspection",
  "## Decision flow",
  "## Implementation workflow",
  "## Invariants",
  "## Security and edge cases",
  "## Verification",
  "## Reference routing",
  "## Handoff requirements",
];

for (const sec of requiredSections) {
  assert(skillContent.includes(sec), `SKILL.md contains canonical section '${sec}'`);
}

// Check review modes and key v2 concepts in SKILL.md
assert(skillContent.includes("`proposal`"), "SKILL.md defines `proposal` mode");
assert(skillContent.includes("`implementation`"), "SKILL.md defines `implementation` mode");
assert(skillContent.includes("`change`"), "SKILL.md defines `change` mode");
assert(skillContent.includes("`readiness`"), "SKILL.md defines `readiness` mode");
assert(skillContent.includes("Two-Pass Judgment"), "SKILL.md defines Two-Pass Judgment");
assert(skillContent.includes("Instruction Authority"), "SKILL.md defines Instruction Authority");
assert(skillContent.includes("Factual Authority"), "SKILL.md defines Factual Authority");

// 2. Verify References
console.log("\n[2] Checking 3 References Architecture...");
const refsDir = path.join(skillDir, "references");
const refFiles = fs.readdirSync(refsDir).filter((f) => f.endsWith(".md")).sort();

const expectedRefs = [
  "architecture-and-decision-lenses.md",
  "priority-verdict-and-output.md",
  "scope-evidence-and-review-contract.md",
];

assert(
  JSON.stringify(refFiles) === JSON.stringify(expectedRefs),
  `Exactly 3 expected references present: ${refFiles.join(", ")}`
);

for (const ref of expectedRefs) {
  assert(skillContent.includes(ref), `SKILL.md links to reference '${ref}'`);
  const content = fs.readFileSync(path.join(refsDir, ref), "utf8");
  assert(content.length > 500, `Reference '${ref}' is non-trivial (${content.length} bytes)`);
}

// Deep inspect reference content
const scopeRef = fs.readFileSync(path.join(refsDir, "scope-evidence-and-review-contract.md"), "utf8");
assert(scopeRef.includes("Evidence Anchors"), "scope-evidence defines Evidence Anchors");
assert(scopeRef.includes("Evidence Freshness"), "scope-evidence defines Evidence Freshness");
assert(scopeRef.includes("Facts vs. Inferences"), "scope-evidence defines Facts vs. Inferences");
assert(scopeRef.includes("Finding Admission Test"), "scope-evidence defines Finding Admission Test");
assert(scopeRef.includes("Investigation Stop Rule"), "scope-evidence defines Investigation Stop Rule");
assert(scopeRef.includes("Re-Review Protocol"), "scope-evidence defines Re-Review Protocol");
assert(scopeRef.includes("Manipulation Resistance"), "scope-evidence defines Manipulation Resistance");

const priorityRef = fs.readFileSync(path.join(refsDir, "priority-verdict-and-output.md"), "utf8");
assert(priorityRef.includes("P0 — Blocker"), "priority-verdict defines P0 Blocker");
assert(priorityRef.includes("P1 — Material"), "priority-verdict defines P1 Material");
assert(priorityRef.includes("P2 — Improvement"), "priority-verdict defines P2 Improvement");
assert(priorityRef.includes("Reversibility"), "priority-verdict defines Reversibility calibration");
assert(priorityRef.includes("Blast Radius"), "priority-verdict defines Blast Radius calibration");
assert(priorityRef.includes("`Blocked`"), "priority-verdict defines `Blocked` verdict");
assert(priorityRef.includes("`Rejected`"), "priority-verdict defines `Rejected` verdict");
assert(priorityRef.includes("`Withheld`"), "priority-verdict defines `Withheld` verdict");
assert(priorityRef.includes("Discrete Precision Rule"), "priority-verdict defines Discrete Precision Rule");
assert(priorityRef.includes("Finding Schema"), "priority-verdict defines Finding Schema");
assert(priorityRef.includes("Role-Boundary Scan"), "priority-verdict defines Role-Boundary Scan");

const archRef = fs.readFileSync(path.join(refsDir, "architecture-and-decision-lenses.md"), "utf8");
assert(archRef.includes("Two-Pass Judgment Discipline"), "arch-lenses defines Two-Pass Judgment Discipline");
assert(archRef.includes("Complexity Ledger"), "arch-lenses defines Complexity Ledger");
assert(archRef.includes("Three-Question Complexity Test"), "arch-lenses defines Three-Question Complexity Test");
assert(archRef.includes("11 Core CTO Decision Lenses"), "arch-lenses defines 11 Core CTO Decision Lenses");
assert(archRef.includes("Specialist Routing"), "arch-lenses defines Specialist Routing");

// 3. Verify Trigger Evals
console.log("\n[3] Checking trigger-evals.json Contract...");
const triggerPath = path.join(skillDir, "evals/trigger-evals.json");
assert(fs.existsSync(triggerPath), "trigger-evals.json exists");
const triggerData = JSON.parse(fs.readFileSync(triggerPath, "utf8"));
assert(Array.isArray(triggerData) && triggerData.length === 20, `trigger-evals has exactly 20 cases (found ${triggerData.length})`);
const trueTriggers = triggerData.filter((t) => t.should_trigger === true);
const falseTriggers = triggerData.filter((t) => t.should_trigger === false);
assert(trueTriggers.length === 10, `Exactly 10 positive triggers (found ${trueTriggers.length})`);
assert(falseTriggers.length === 10, `Exactly 10 negative triggers (found ${falseTriggers.length})`);

// 4. Verify Evals and Fixtures
console.log("\n[4] Checking evals.json & Fixtures Contract...");
const evalsPath = path.join(skillDir, "evals/evals.json");
assert(fs.existsSync(evalsPath), "evals.json exists");
const evalsData = JSON.parse(fs.readFileSync(evalsPath, "utf8"));
assert(evalsData.skill_name === "nexload-cto-review", "evals.json skill_name matches");
assert(Array.isArray(evalsData.evals) && evalsData.evals.length >= 13, `evals.json has comprehensive cases (found ${evalsData.evals.length})`);

const expectedCategories = new Set([
  "happy_path",
  "edge_case",
  "failure_security",
  "review_diagnosis",
  "near_miss_composition",
]);
const foundCategories = new Set(evalsData.evals.map((e) => e.category));
for (const cat of expectedCategories) {
  assert(foundCategories.has(cat), `evals.json covers category '${cat}'`);
}

// Verify each referenced fixture directory exists
const fixturesDir = path.join(skillDir, "evals/fixtures");
const expectedFixtures = [
  "approved-clean-package",
  "approved-valid-abstraction",
  "minor-public-api-issue",
  "speculative-plugin-system",
  "browser-runtime-boundary",
  "wrong-business-invariant",
  "missing-decisive-evidence",
  "stale-verification",
  "misleading-repository-docs",
  "change-with-existing-debt",
  "re-review-fixed-findings",
  "false-security-positive",
  "conflicting-authorities",
];

for (const fix of expectedFixtures) {
  const p = path.join(fixturesDir, fix);
  assert(fs.existsSync(p) && fs.statSync(p).isDirectory(), `Fixture directory '${fix}' exists`);
  const files = fs.readdirSync(p);
  assert(files.length >= 2, `Fixture '${fix}' has multi-file contents (${files.length} files)`);
}

// 5. Verify Role-Boundary (No leaked implementation code)
console.log("\n[5] Scanning for Role-Boundary Invariant Violations...");
const leakRegexes = [
  /```(?:ts|typescript|js|javascript)\n(?:export\s+)?class\s+[A-Za-z0-9]+\s*\{[\s\S]*?\}/,
  /```(?:bash|sh)\npnpm\s+add\s+/,
  /diff\s+--git/,
  /@@\s+-[0-9]+,[0-9]+\s+\+[0-9]+,[0-9]+\s+@@/,
];

for (const file of [skillPath, ...expectedRefs.map((r) => path.join(refsDir, r))]) {
  const content = fs.readFileSync(file, "utf8");
  for (const regex of leakRegexes) {
    assert(!regex.test(content), `No leaked implementation/diff found in ${path.basename(file)}`);
  }
}

// 6. Summary
console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL TESTS PASSED! nexload-cto-review v2 is fully verified and compliant.");
  process.exit(0);
} else {
  console.error(`❌ VALIDATION FAILED with ${failures} error(s).`);
  process.exit(1);
}
