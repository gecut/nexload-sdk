import fs from 'node:fs';
import path from 'node:path';

const skillsDir = path.resolve('skills/nexload-reasoning');

const expectedSkills = [
  'nexload-reasoning',
  'nexload-reasoning-discovery',
  'nexload-reasoning-investigation',
  'nexload-reasoning-ideation',
  'nexload-reasoning-design',
  'nexload-reasoning-evaluation',
  'nexload-reasoning-execution',
];

const requiredCategories = [
  'positive_trigger',
  'negative_trigger',
  'near_miss',
  'behavioral_regression',
];

let failed = false;

console.log('=== AUDITING NEXLOAD REASONING ECOSYSTEM ===\n');

for (const skillName of expectedSkills) {
  const dir = path.join(skillsDir, skillName);
  console.log(`Checking ${skillName}...`);

  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory missing: ${dir}`);
    failed = true;
    continue;
  }

  // 1. Check SKILL.md
  const skillFile = path.join(dir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    console.error(`❌ SKILL.md missing in ${skillName}`);
    failed = true;
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const lines = content.split('\n');

  // Check line count (< 400 lines)
  if (lines.length >= 400) {
    console.error(`❌ ${skillName}/SKILL.md exceeded line limit: ${lines.length} lines (must be < 400)`);
    failed = true;
  } else {
    console.log(`  ✓ SKILL.md line count: ${lines.length} lines (< 400)`);
  }

  // Check frontmatter
  if (!content.startsWith('---\n')) {
    console.error(`❌ ${skillName}/SKILL.md missing frontmatter start`);
    failed = true;
  }

  const frontmatterEnd = content.indexOf('\n---\n', 4);

  if (frontmatterEnd === -1) {
    console.error(`❌ ${skillName}/SKILL.md missing frontmatter end`);
    failed = true;
  }

  const frontmatter = content.slice(4, frontmatterEnd);
  const nameMatch = frontmatter.match(/name:\s*([^\n]+)/);

  if (!nameMatch || nameMatch[1].trim() !== skillName) {
    console.error(`❌ ${skillName}/SKILL.md frontmatter name mismatch: found "${nameMatch?.[1]}", expected "${skillName}"`);
    failed = true;
  } else {
    console.log(`  ✓ Frontmatter name matches directory: ${skillName}`);
  }

  const descMatch = frontmatter.match(/description:\s*([^\n]+)/);

  if (!descMatch || !descMatch[1].trim()) {
    console.error(`❌ ${skillName}/SKILL.md frontmatter description missing`);
    failed = true;
  } else {
    console.log(`  ✓ Frontmatter description present`);
  }

  // 2. Check references
  const refsDir = path.join(dir, 'references');

  if (!fs.existsSync(refsDir)) {
    console.error(`❌ ${skillName}/references missing`);
    failed = true;
  } else {
    const refFiles = fs.readdirSync(refsDir).filter(f => f.endsWith('.md'));

    if (refFiles.length < 3) {
      console.error(`❌ ${skillName}/references contains only ${refFiles.length} files (expected 3)`);
      failed = true;
    } else {
      console.log(`  ✓ References: ${refFiles.length} deep-dive documents (${refFiles.join(', ')})`);
    }

    // Check each reference exists if linked in SKILL.md
    for (const refFile of refFiles) {
      if (!content.includes(refFile)) {
        console.warn(`  ⚠️ Warning: reference ${refFile} not explicitly linked in ${skillName}/SKILL.md`);
      }
    }
  }

  // 3. Check evals/evals.json
  const evalsFile = path.join(dir, 'evals', 'evals.json');

  if (!fs.existsSync(evalsFile)) {
    console.error(`❌ ${skillName}/evals/evals.json missing`);
    failed = true;
  } else {
    try {
      const evalsJson = JSON.parse(fs.readFileSync(evalsFile, 'utf8'));

      if (evalsJson.skill_name !== skillName) {
        console.error(`❌ ${skillName} evals.json skill_name mismatch: found "${evalsJson.skill_name}", expected "${skillName}"`);
        failed = true;
      }
      if (!Array.isArray(evalsJson.test_cases) || evalsJson.test_cases.length < 4) {
        console.error(`❌ ${skillName} evals.json has fewer than 4 test cases: ${evalsJson.test_cases?.length}`);
        failed = true;
      } else {
        const foundCategories = new Set(evalsJson.test_cases.map(tc => tc.category));

        for (const cat of requiredCategories) {
          if (!foundCategories.has(cat)) {
            console.error(`❌ ${skillName} evals.json missing category "${cat}"`);
            failed = true;
          }
        }
        for (const tc of evalsJson.test_cases) {
          if (!tc.id || !tc.prompt || !tc.expected_routing || !Array.isArray(tc.behavioral_assertions) || tc.behavioral_assertions.length === 0) {
            console.error(`❌ ${skillName} test case ${tc.id} incomplete schema`);
            failed = true;
          }
        }
        console.log(`  ✓ Evals: ${evalsJson.test_cases.length} test cases with valid schema and all 4 required categories`);
      }
    } catch (err) {
      console.error(`❌ ${skillName} evals.json invalid JSON: ${err.message}`);
      failed = true;
    }
  }

  console.log('');
}

if (failed) {
  console.error('❌ AUDIT FAILED!');
  process.exit(1);
} else {
  console.log('✅ ALL 7 SKILLS PASSED STRICT COMPLIANCE AUDIT!');
}
