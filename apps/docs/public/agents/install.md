# Agent Setup & Quickstart | Nexload SDK

Install Nexload reasoning, engineering standards, and package Skills autonomously via One-Shot Prompt or selectively with the official skills CLI.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/install/
Nexload Agent Skills can be integrated into your workspace either autonomously via our **One-Shot Project Adoption Prompt** or manually using the **official skills CLI**.

***

## Choose Your Setup Method

### Autonomous Setup (One-Shot Prompt)

Copy the prompt below and send it directly to your AI coding assistant (Cursor, Claude Code, Antigravity, Windsurf, or Codex) inside your target project workspace.

### Designed for Frontier Reasoning Models

This prompt is structured for high-agency models (Claude 3.7 Sonnet, GPT-4.5/o1/o3, Gemini 2.5/3 Pro). It audits your stack, installs only matching skills, non-destructively merges with existing project rules, and queries skills.sh for relevant community tools.

```markdown
Act as a Principal Systems Architect. Inspect this repository, selectively install matching Nexload Agent Skills ("gecut/nexload-sdk"), integrate our project AGENTS.md, and recommend relevant non-Nexload ecosystem skills via skills.sh.

Execute these 5 phases autonomously:

### PHASE 1: STACK INFERENCE (INSPECT BEFORE ACTING)
Audit repository configuration files (package.json, tsconfig.json, docker-compose.yml, directories, lockfiles):
- Runtime & Engine: Node.js vs Bun | Monorepo vs Standalone.
- Frameworks & UI: Next.js (App/Pages router), React, Tailwind, Payload CMS.
- Reliability & Cloud: Health endpoints, Docker, Kubernetes/Dokploy probes.
- Quality Harness: Test runner (Vitest, Jest), linters, TypeScript strictness.

### PHASE 2: PRUNED SKILL INSTALLATION (COMPLEXITY MUST PAY RENT)
Install ONLY skills with confirmed leverage for this stack using official CLI (`npx skills add gecut/nexload-sdk --skill <name>`):
- Core Reasoning: `nexload-reasoning` (Always install).
  If complex system/refactor: add `nexload-reasoning-discovery`, `nexload-reasoning-investigation`, `nexload-reasoning-ideation`, `nexload-reasoning-design`, `nexload-reasoning-evaluation`, `nexload-reasoning-execution`.
- TypeScript / Library: `nexload-code` (If TS codebase) | `nexload-package` + `nexload-cto-review` (If publishing npm package/monorepo).
- React / Next.js: `nexload-react` + `nexload-design`.
- Reliability / Probes: `healthcheck-core` + runtime adapter (`healthcheck-nextjs-routes`, `healthcheck-node`, or `healthcheck-bun`).
- Payload CMS: `payload-fields-core` + (`payload-editor-core`, `payload-schema-use`, or `payload-operations-core` as needed).

### PHASE 3: NON-DESTRUCTIVE AGENTS.MD BINDING
Create or append to root `AGENTS.md` (never erase existing project conventions):
1. Embed The Inviolable Constitution:
   - Grounding: Runtime > Code > Official Docs > Inferences > Assumptions.
   - Inspect Before Ask: Zero queries for data present in codebase.
   - Problem Space: Feature requests are hypotheses, not constraints.
   - Divergence Firewall: Ideation never self-censors on implementation difficulty.
   - Complexity Rent: Reject speculative scalability; build for Now + 1.
   - Immutability: Never reopen settled ADRs without material contradictory evidence.
   - Verification: "Builds" !== "Works". Claim requires empirical test evidence.
   - Budget: Terminate reasoning when residual uncertainty has zero design impact.
2. Bind explicit triggers for installed skills and define Sparse Handoff (`[NEXLOAD HANDOFF]`).
3. Record exact repo build/lint/test commands.

### PHASE 4: VERIFICATION & AUDIT
Verify installed skill files in `.agents/skills/`. Report:
- Installed skills and precise leverage rationale.
- Intentionally pruned/skipped skills.
- Summary of additions to AGENTS.md.

### PHASE 5: ECOSYSTEM RECONNAISSANCE (SKILLS.SH NON-NEXLOAD SKILLS)
Query `skills.sh` via `npx skills find <stack-keyword>` or web search for non-Nexload community skills matching this stack (e.g., Tailwind, Prisma, Drizzle, Better Auth, Supabase, Vitest, Playwright, Zod, Git):
- Audit top packages matching detected technologies.
- Provide a curated recommendations table: Skill Name, Source (`owner/repo@skill`), Install Command (`npx skills add <source>`), and Target Leverage.
- Ask user confirmation before installing any external skills.
```

### Manual CLI Installation

Install skills individually into your project using the official `skills` CLI.

1. Inspect all available skills directly from GitHub:
   ```bash
   npx skills add gecut/nexload-sdk --list
   ```

2. Install the cognitive reasoning kernel:
   ```bash
   npx skills add gecut/nexload-sdk --skill nexload-reasoning
   ```

3. Install foundational engineering standards:
   ```bash
   npx skills add gecut/nexload-sdk --skill nexload-code
   ```

4. Install domain-specific packages as needed:
   ```bash
   # Next.js Health Routes
   npx skills add gecut/nexload-sdk --skill healthcheck-nextjs-routes

   # Payload CMS Fields
   npx skills add gecut/nexload-sdk --skill payload-fields-core
   ```

5. Keep skills updated over time:
   ```bash
   npx skills update
   ```

### Agent Target Scopes

```bash
npx skills add gecut/nexload-sdk --skill nexload-reasoning
```

***

## Quick Stack Recipes

To avoid installing unneeded skills, use these battle-tested combinations:

| Project Type | Recommended Core Skills | Why This Combination Works |
|---|---|---|
| **Next.js Full-Stack App** | `nexload-reasoning``nexload-code``nexload-react``nexload-design``healthcheck-nextjs-routes` | Combines structured reasoning with strict React render purity, semantic tokens, and zero-cache health endpoints for Kubernetes or Dokploy. |
| **Node.js / Bun Microservice** | `nexload-reasoning``nexload-code``healthcheck-core``healthcheck-node` (or `bun`) | Ensures boundary narrowing, monitors Linux cgroup resource limits, and prevents container OOM restarts. |
| **TypeScript Library / Monorepo** | `nexload-reasoning``nexload-code``nexload-package``nexload-cto-review` | Enforces dual CJS/ESM exports, minimal dependencies, bundle discipline, and principal reviewer-only signoff. |
| **Payload CMS Enterprise App** | `nexload-reasoning``nexload-code``payload-fields-core``payload-editor-core``payload-schema-use` | Enforces atomic field validation, deterministic rich-text presets, and single-source-of-truth Zod schema derivation. |
| **Complex Refactor / Migration** | `nexload-reasoning``nexload-reasoning-discovery``nexload-reasoning-design``nexload-reasoning-evaluation``nexload-reasoning-execution` | Full 6+1 cognitive graph pipeline to frame scope, design boundaries, stress-test trade-offs, and verify atomic delivery. |

***

## Next Steps

* [Cognitive Graph (Tier 1)](/agents/reasoning/) — Discover the 6+1 reasoning ecosystem: router, discovery, investigation, and design.

- [Engineering Standards (Tier 2)](/agents/engineering/) — Inspect rules for TypeScript boundary narrowing, React purity, and package releases.

* [Domain Specialists (Tier 3)](/agents/domain-skills/) — Browse specialized skills for @nexload-sdk/healthcheck and Payload CMS.

- [Governance & Protocols](/agents/protocols/) — Read the 8 inviolable laws of the Constitution and Sparse Pointer Handoff specifications.
