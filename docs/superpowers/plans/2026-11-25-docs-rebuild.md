# Documentation Site Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Help a community developer choose the smallest SDK package for a storefront problem, try eligible APIs and use them correctly.

**Architecture:** Keep the static Astro and Starlight site. Put problem selection before the package catalog, retain canonical routes and publish the same package guidance to humans and agents. Use small browser-only modules behind server-rendered forms for the three interactive examples.

**Tech Stack:** Astro 6, Starlight 0.40, Flexoki, MDX, strict TypeScript, native custom elements, Node’s test runner, TypeScript compiler API, unified/remark, pnpm 10.26.0, Turbo and headless Chromium via Playwright.

**Spec:** `docs/superpowers/specs/2026-11-25-docs-rebuild-brief.md`

## Reviewer changes (2026-11-25)

- Task 5 widened from a price-only form to a Persian input lab: `IRR`, `IRT`, `mobile`, `national-code`, `card`, `sheba`, `jalali`. Expected strings in `tests/persian-lab.test.mjs` were produced by running the code against the built `@nexload-sdk/persian`. The minified lab bundle is about 14 KB, inside the 32 KB browser budget in Task 8.
- Logger and payload-operations playgrounds stay deferred as decided below.

## Global Constraints

- Execute inline as a single Gemini handoff using `superpowers:executing-plans`. All implementation commits belong on `main`. The planning turn creates only this file.
- Preserve unrelated working changes, the user’s baseline, and deployed paths under `https://gecut.github.io/nexload-sdk`.
- Use English for the existing English public site. Accept Persian input. Keep human-readable directions independent of the surrounding page direction.
- Source package claims from public source, manifests, README guidance and skill trigger text. A pending Changeset describes workspace behavior ahead of a registry release.
- No publishing, package source changes, version bumps, hand edits to generated output or changes to enola policy.
- No `console.*` in new application code. Load `skills/logger/SKILL.md` before reviewing logging or error handling. All playground operations are local and need no logging.
- Use Node 22.18+ on the Node 22 line for native TypeScript stripping and Astro. Initialize dependencies with pnpm 10.26.0. Only the browser test harness adds a third-party dependency.

## Review Focus

- A newcomer following a registry install for a 0.0.0 package must see the workspace-only install and release status in the machine copy too. Task 1.
- A static Pages request to a retired URL must reach a real canonical page with exactly one base prefix. Task 8.
- Persian and Arabic digits, indivisible rials, decimals and unsafe integers must produce the SDK’s result or a readable validation message. Task 5.
- A shared mobile URL must restore a bounded input, discard an unknown mode and remain usable with keyboard navigation. Task 8.
- A server-rendered form must supply instructions with JavaScript disabled and load only the browser code needed for the interactive route. Task 8.

---

## Decisions

| Question | Decision and reason |
| --- | --- |
| 1. Information architecture | Lead with the task chooser, then the stack recipe and the existing family sidebar. Keep all 66 content URLs. Package order is overview/quick start, guides, API or configuration reference, optimization, agent usage, and an optional playground. Existing inbound links keep working without redirect chains. |
| 2. Technology | Native custom-element islands use Astro-processed client scripts. There is no renderer runtime, code compilation, iframe or SSR evaluation of browser globals. Native form controls supply labels, focus and keyboard behavior. |
| 3. Eligibility | Ship a Persian input lab (price, mobile, national code, card, Sheba, Jalali date), root-only Payload Schema validation, and one Healthcheck report with JSON, Prometheus, OpenMetrics and OTel views. These run actual SDK code without an account, network, server or mock transport. Defer logger because its browser sink lacks a supported in-page record inspector; defer operations because a mock transport obscures the server contract. Exclude Node/Bun/Next/Payload adapters, admin components, hooks, editor, preset and configuration packages because their meaningful integrations require hosted runtimes or build tools. |
| 4. Discovery | Lead with Persian pricing, Jalali admin dates, shared product validation and readiness. Distinguish plain Persian utilities from Payload field UI and link observable results from the landing page. The chooser assigns each of 17 jobs one package. |
| 5. Machine outputs | Keep MDX authoritative for prose and the compiler authoritative for runtime API signatures. Include new topics in package/family/full bundles, create three topic bundles, link actual Markdown files from the index and cover missing workspace examples and admin exports. |
| 6. Internal knowledge | Use the repository docs to locate owners and verify scope. Keep internal roadmaps, agent protocol details and architecture in the repository. Link relevant public source and skill manifests from package guidance. |
| 7. CI | Watch package, skill, tooling and workspace inputs for both push and PR. Keep existing build/deploy conditions. Test source logic, generated artifacts, prebuilt HTML redirects and real Chromium interactions. |
| 8. International input and sharing | Leave input direction automatic, preserve Unicode, format money through the SDK and isolate text direction in results. A share link encodes at most 120 characters and the selected mode in a fragment. Typing does not rewrite browser history. |

## Execution setup

- [ ] Run `git status --short --branch` and `git branch --show-current`. Expected branch `main`. Record unrelated dirty paths before staging anything.
- [ ] Read `AGENTS.md`, `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `docs/README.md` and `docs/workflows/AGENT-GUIDELINES.md` plus the spec. The package and skill sources needed for each edit appear in the page register below.
- [ ] Inspect `apps/docs` with enola `explore` or the local CLI, then run `enola doctor`. Reuse the session baseline. Only run `enola baseline pin` if doctor reports no baseline. Do not re-pin someone else’s baseline.
- [ ] Run `pnpm install --frozen-lockfile` followed by `pnpm exec turbo run build --filter="./packages/**"` from the repo root. Expected exit 0. This supplies workspace declarations for the examples on a clean checkout.
- [ ] Run `pnpm -C apps/docs test` and record the baseline. A failing baseline needs a named failing assertion in the handoff.

## File map

Exact authored files, grouped by reviewable change. Page responsibilities, metadata and sources follow. An existing file can participate in more than one commit.

**Task 1 — Problem-first entry and release truth**

- `apps/docs/src/content/docs/index.mdx`
- `apps/docs/src/content/docs/start/choose-a-package.mdx`
- `apps/docs/astro.config.mjs`
- `apps/docs/src/content/docs/start/introduction.mdx`
- `apps/docs/src/content/docs/packages/index.mdx`
- `apps/docs/src/content/docs/start/installation.mdx`
- `apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx`
- `apps/docs/src/content/docs/packages/persian/index.mdx`
- `apps/docs/src/content/docs/packages/payload-preset/index.mdx`
- `apps/docs/src/components/docs/PackageHero.astro`
- `apps/docs/src/components/docs/PackageGrid.astro`
- `apps/docs/scripts/generate-markdown.mjs`
- `apps/docs/tests/contracts.test.mjs`
- `apps/docs/tests/discovery.test.mjs`

**Task 2 — Source-backed optimization pages**

- `apps/docs/src/content.config.ts`
- `apps/docs/src/content/docs/packages/logger/optimization.mdx`
- `apps/docs/src/content/docs/packages/logger/index.mdx`
- `apps/docs/src/content/docs/packages/persian/optimization.mdx`
- `apps/docs/src/content/docs/packages/persian/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/core/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/node/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/bun/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/next/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/payload/optimization.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/index.mdx`
- `apps/docs/src/content/docs/packages/payload-fields/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-fields/index.mdx`
- `apps/docs/src/content/docs/packages/payload-schema/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-schema/index.mdx`
- `apps/docs/src/content/docs/packages/payload-operations/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-operations/index.mdx`
- `apps/docs/src/content/docs/packages/payload-hooks/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-hooks/index.mdx`
- `apps/docs/src/content/docs/packages/payload-preset/optimization.mdx`
- `apps/docs/src/content/docs/packages/payload-preset/index.mdx`
- `apps/docs/src/content/docs/packages/eslint-config/optimization.mdx`
- `apps/docs/src/content/docs/packages/eslint-config/index.mdx`
- `apps/docs/src/content/docs/packages/typescript-config/optimization.mdx`
- `apps/docs/src/content/docs/packages/typescript-config/index.mdx`
- `apps/docs/tests/optimization.test.mjs`

**Task 3 — Package-specific agent setup**

- `apps/docs/src/content/docs/packages/logger/agents.mdx`
- `apps/docs/src/content/docs/packages/logger/index.mdx`
- `apps/docs/src/content/docs/packages/persian/agents.mdx`
- `apps/docs/src/content/docs/packages/persian/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/core/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/bun/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/node/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/next/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/payload/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/agents.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`
- `apps/docs/src/content/docs/packages/payload-fields/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-fields/index.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-editor/index.mdx`
- `apps/docs/src/content/docs/packages/payload-operations/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-operations/index.mdx`
- `apps/docs/src/content/docs/packages/payload-schema/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-schema/index.mdx`
- `apps/docs/src/content/docs/packages/payload-preset/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-preset/index.mdx`
- `apps/docs/src/content/docs/packages/payload-hooks/agents.mdx`
- `apps/docs/src/content/docs/packages/payload-hooks/index.mdx`
- `apps/docs/src/content/docs/packages/typescript-config/agents.mdx`
- `apps/docs/src/content/docs/packages/typescript-config/index.mdx`
- `apps/docs/src/content/docs/packages/eslint-config/agents.mdx`
- `apps/docs/src/content/docs/packages/eslint-config/index.mdx`
- `apps/docs/tests/agent-pages.test.mjs`
- `apps/docs/src/content/docs/agents/index.mdx`

**Task 4 — Machine-readable topic coverage and public entrypoints**

- `apps/docs/scripts/generate-markdown.mjs`
- `apps/docs/scripts/api-packages.mjs`
- `apps/docs/scripts/generate-api.mjs`
- `apps/docs/examples/tsconfig.json`
- `apps/docs/examples/payload-schema.ts`
- `apps/docs/examples/healthcheck.ts`
- `apps/docs/examples/payload-hooks.ts`
- `apps/docs/examples/payload-preset.ts`
- `apps/docs/tests/bundles.test.mjs`
- `apps/docs/src/content/docs/packages/eslint-config/api.mdx`
- `apps/docs/src/content/docs/packages/typescript-config/api.mdx`

**Task 5 — Try Persian inputs in the browser**

- `apps/docs/package.json`
- `apps/docs/src/components/playgrounds/LabControls.astro`
- `apps/docs/src/lib/playgrounds/register.ts`
- `apps/docs/src/lib/playgrounds/persian.ts`
- `apps/docs/src/components/playgrounds/PersianPrice.astro`
- `apps/docs/src/content/docs/packages/persian/playground.mdx`
- `apps/docs/src/content/docs/packages/persian/index.mdx`
- `apps/docs/tests/persian-lab.test.mjs`

**Task 6 — Try canonical field validation**

- `apps/docs/package.json`
- `apps/docs/src/lib/playgrounds/schema.ts`
- `apps/docs/src/components/playgrounds/SchemaField.astro`
- `apps/docs/src/content/docs/packages/payload-schema/playground.mdx`
- `apps/docs/src/content/docs/packages/payload-schema/index.mdx`
- `apps/docs/tests/schema-lab.test.mjs`

**Task 7 — Run readiness and inspect its exporters**

- `apps/docs/package.json`
- `apps/docs/src/lib/playgrounds/health.ts`
- `apps/docs/src/components/playgrounds/HealthReport.astro`
- `apps/docs/src/content/docs/packages/healthcheck/core/playground.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/playground.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/playground.mdx`
- `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`
- `apps/docs/tests/health-lab.test.mjs`
- `apps/docs/src/content/docs/index.mdx`

**Task 8 — CI, browser smoke tests and legacy URLs**

- `apps/docs/tests/legacy-routes.json`
- `apps/docs/tests/built-routes.mjs`
- `apps/docs/playwright.config.mjs`
- `apps/docs/browser/playgrounds.spec.mjs`
- `apps/docs/package.json`
- `.github/workflows/docs.yml`
- `apps/docs/tests/workflow.test.mjs`

**Generated and dependency-managed files.** `apps/docs/src/generated/api-catalog.json` comes from `content:api:write`. `apps/docs/public/markdown-manifest.json` lists every generated page and every scoped/family/topic bundle. Each page below maps to a Markdown file by replacing `apps/docs/src/content/docs/` with `apps/docs/public/` and `.mdx` with `.md`. Keep `public/llms.txt`, `public/llms-full.txt`, all four family files and all 17 package `llms.txt` files. The new topic files live at `apps/docs/public/llms-optimization.txt`, `apps/docs/public/llms-agents.txt` and `apps/docs/public/llms-playground.txt`. Let pnpm update `pnpm-lock.yaml` whenever the docs manifest gains dependencies. Exclude local Astro cache and browser reports from implementation commits.

## Page register

One entry per final page. Each frontmatter cell uses YAML flow mapping syntax and gives **all** final keys, including nested sidebar keys. In the headings column, levels follow the number after H. The page title supplies H1. Static headings from embedded components, including categorized API signatures, are identified separately. Existing MDX supplies retained text, code blocks and anchors. The task payloads specify every change.

| File | Frontmatter | Section headings in order | Content sources |
| --- | --- | --- | --- |
| `apps/docs/src/content/docs/agents/domain-skills.mdx` | `{"title": "Domain Specialists (Tier 3) \| Nexload SDK", "description": "Production package skills for Healthcheck, Payload CMS, and Persian data.", "sidebar": {"order": 5}, "topic": "agents"}` | H2 1. Healthcheck & Observability Skills → H3 Core & Runtime Probes → H3 Custom Checks, Security & Exporters → H2 2. Payload CMS Specialist Skills → H3 Semantic Field Factories (`@nexload-sdk/payload-fields`) → H3 Rich Text & Lexical Editor (`@nexload-sdk/payload-editor`) → H3 Schemas & Custom Operations → H2 3. Persian Data → H2 Next Steps | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/agents/engineering.mdx` | `{"title": "Engineering Standards (Tier 2) \| Nexload SDK", "description": "Enforce rigorous TypeScript narrowing, package export integrity, React render purity, layout design preservation, and CTO review.", "sidebar": {"order": 4}, "topic": "agents"}` | H2 The Foundational Engineering Skills → H3 1. TypeScript Implementation Standard (`nexload-code`) → H3 2. Publishable Package Integrity (`nexload-package`) → H3 3. React & Next.js Render Purity (`nexload-react`) → H3 4. Layout & Design System Preservation (`nexload-design`) → H3 5. Principal CTO Architectural Review (`nexload-cto-review`) → H2 Standards Capability Matrix | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/agents/index.mdx` | `{"title": "AI Agent Skills: Overview & Mental Model \| Nexload SDK", "description": "Equip Cursor, Claude Code, Antigravity, and Codex with automated knowledge of Nexload SDK standards, preventing hallucinations and ensuring zero-shot compliance.", "sidebar": {"order": 1}, "topic": "agents"}` | H2 How Nexload Skills Compose (The 3-Tier Mental Model) → H2 Explore the Agent Ecosystem → H2 Use an agent with a package | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/agents/install.mdx` | `{"title": "Agent Setup & Quickstart \| Nexload SDK", "description": "Install Nexload reasoning, engineering standards, and package Skills autonomously via One-Shot Prompt or selectively with the official skills CLI.", "sidebar": {"order": 2}, "topic": "agents"}` | H2 Choose Your Setup Method → H2 Quick Stack Recipes → H2 Next Steps | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/agents/protocols.mdx` | `{"title": "Governance & Protocols \| Nexload SDK", "description": "The 8 Inviolable Laws of the Constitution and Sparse Pointer Handoff Protocol for multi-agent workflows.", "sidebar": {"order": 6}, "topic": "agents"}` | H2 The Inviolable Constitution → H3 1. Evidence Hierarchy (Grounding Gate) → H3 2. Inspect Before Ask (Question Gate) → H3 3. Problem Space Framing → H3 4. Divergence Firewall → H3 5. Complexity Must Pay Rent → H3 6. Preservation of Settled Decisions → H3 7. Claim-Matched Verification → H3 8. Dynamic Reasoning Budget → H2 Sparse Pointer Handoff Protocol → H3 Example: Discovery to Design Transition → H2 Next Steps | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/agents/reasoning.mdx` | `{"title": "Cognitive Graph Reasoning (Tier 1) \| Nexload SDK", "description": "Orchestrate deep AI reasoning with the 6+1 cognitive graph: Kernel router and specialized discovery, investigation, ideation, design, evaluation, and execution skills.", "sidebar": {"order": 3}, "topic": "agents"}` | H2 The 6+1 Cognitive Graph Topology → H2 1. The Kernel: Router & Depth Controller → H3 `nexload-reasoning` → H2 2. The 6 Reasoning Specialists → H3 Discovery Specialist (`nexload-reasoning-discovery`) → H3 Investigation Specialist (`nexload-reasoning-investigation`) → H3 Ideation Specialist (`nexload-reasoning-ideation`) → H3 Design Specialist (`nexload-reasoning-design`) → H3 Evaluation Specialist (`nexload-reasoning-evaluation`) → H3 Execution Specialist (`nexload-reasoning-execution`) → H2 Capability & Trigger Matrix | `docs/skills/DOMAIN-SKILLS.md` · `docs/skills/ENGINEERING-STANDARDS.md` · `docs/skills/REASONING-ECOSYSTEM.md` |
| `apps/docs/src/content/docs/community/support.mdx` | `{"title": "Support and contribution", "description": "Use GitHub Issues for Nexload SDK bug reports, documentation corrections, and feature requests.", "sidebar": {"order": 3}, "topic": "community"}` | H2 Report a useful issue | `apps/docs/src/content/docs/community/support.mdx` · `README.md` |
| `apps/docs/src/content/docs/index.mdx` | `{"title": "Build an Iranian storefront with Nexload SDK", "description": "Find TypeScript packages for Persian data, Payload CMS and service health.", "sidebar": {"order": 1}, "topic": "ecosystem"}` | H2 What are you building? → H2 Try it before installing → H2 Start a project → H2 Work with an agent | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/packages/eslint-config/agents.mdx` | `{"title": "eslint-config — Agent usage", "description": "Configure a coding agent for @nexload-sdk/eslint-config.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "eslint-config", "topic": "agents"}` | H2 Install matching skills → H3 nexload-code → H3 nexload-package → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/nexload/code/SKILL.md` · `skills/nexload/package/SKILL.md` · `tools/eslint-config/README.md` |
| `apps/docs/src/content/docs/packages/eslint-config/api.mdx` | `{"title": "eslint-config — Configuration reference", "description": "Exported configuration entries for @nexload-sdk/eslint-config.", "sidebar": {"label": "Configuration reference", "order": 3}, "package": "eslint-config", "topic": "api"}` | H2 Public entries → H2 Usage | `tools/eslint-config/README.md` · `tools/eslint-config/package.json` · `tools/eslint-config/src/index.ts` |
| `apps/docs/src/content/docs/packages/eslint-config/guides.mdx` | `{"title": "Configuration Guides & Recipes", "description": "Type-aware linting with projectService, customizing factory rules, and migrating from legacy .eslintrc.", "sidebar": {"label": "Configuration Guides & Recipes", "order": 2}, "package": "eslint-config", "topic": "guides"}` | H2 Type-Aware Linting with `projectService` → H3 Benefits of `projectService` → H2 Customizing Rules with `nexloadConfig` → H2 Prettier Integration & Zero Conflicts → H2 Migrating from Legacy `.eslintrc.js` → H3 Step 1: Remove Deprecated Dependencies → H3 Step 2: Delete Old Config & Ignore Files → H3 Step 3: Create `eslint.config.mjs` → H3 Step 4: Update Package Scripts → H3 Step 5: Run Automated Fixes | `tools/eslint-config/README.md` · `tools/eslint-config/package.json` · `tools/eslint-config/src/index.ts` |
| `apps/docs/src/content/docs/packages/eslint-config/index.mdx` | `{"title": "Overview & Quick Start", "description": "Strict, zero-compromise ESLint 9 Flat Config enforcing clean architecture, deterministic imports, and zero-any rules.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "eslint-config", "topic": "overview"}` | H2 10-Second Code Snippet → H2 The Enforced Mental Model → H3 1. Mandatory Kebab-Case Filenames (`unicorn/filename-case`) → H3 2. Deterministic Perfectionist Imports (`perfectionist/sort-imports`) → H3 3. Absolute Zero-`any` Policy (`@typescript-eslint/no-explicit-any`) → H3 4. Semantic Whitespace Padding (`@stylistic/padding-line-between-statements`) → H3 5. Floating Promise Prevention (`@typescript-eslint/no-floating-promises`) → H2 Available Presets & Factory → H2 Installation & Requirements → H2 Next steps | `tools/eslint-config/README.md` · `tools/eslint-config/package.json` · `tools/eslint-config/src/index.ts` |
| `apps/docs/src/content/docs/packages/eslint-config/optimization.mdx` | `{"title": "eslint-config — Optimization", "description": "Production choices for @nexload-sdk/eslint-config.", "sidebar": {"label": "Optimization", "order": 4}, "package": "eslint-config", "topic": "optimization"}` | H2 Choose the runtime preset → H2 Keep type-aware linting enabled → H2 Sources | `tools/eslint-config/README.md` · `tools/eslint-config/package.json` · `tools/eslint-config/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/bun/agents.mdx` | `{"title": "healthcheck-bun — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-bun.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-bun", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-core → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/core/SKILL.md` · `packages/healthcheck/bun/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/bun/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference and runtime compatibility matrix for Healthcheck Bun.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-bun", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/bun/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/bun/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/bun/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Monitoring Bun.serve() HTTP servers, tracking active WebSocket connections, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-bun", "topic": "guides"}` | H2 Monitoring `Bun.serve()` Servers → H2 Troubleshooting & Common Pitfalls → H3 1. `bunServerMetricsCheck` Requires a Valid Server Instance → H3 2. Runtime Name Output | `packages/healthcheck/bun/README.md` · `packages/healthcheck/bun/package.json` · `packages/healthcheck/bun/src/index.ts` · `apps/docs/examples/healthcheck-bun.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx` | `{"title": "Overview & Quick Start", "description": "Bun runtime adapter and server metrics health check integration for Bun HTTP services.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-bun", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/bun/README.md` · `packages/healthcheck/bun/package.json` · `packages/healthcheck/bun/src/index.ts` · `apps/docs/examples/healthcheck-bun.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/bun/optimization.mdx` | `{"title": "healthcheck-bun — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-bun.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-bun", "topic": "optimization"}` | H2 Interpret missing memory limits → H2 Restrict diagnostic routes → H2 Sources | `packages/healthcheck/bun/README.md` · `packages/healthcheck/bun/package.json` · `packages/healthcheck/bun/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/core/agents.mdx` | `{"title": "healthcheck — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-core → H3 healthcheck-custom-checks → H3 healthcheck-diagnostics-security → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/core/SKILL.md` · `skills/healthcheck/custom-checks/SKILL.md` · `skills/healthcheck/diagnostics-security/SKILL.md` · `packages/healthcheck/core/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/core/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Complete public API symbol reference, types, and runtime compatibility matrix for Healthcheck Core.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/core/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/core/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/core/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Authoring custom checks, configuring timeouts and retries, status aggregation rules, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck", "topic": "guides"}` | H2 Authoring Custom Checks → H2 Status Aggregation Model → H2 The Liveness Cascade Anti-Pattern → H2 Troubleshooting & Common Pitfalls → H3 1. Check Is Timing Out Intermittently → H3 2. Service Restart Loop During Deployments → H3 3. Sensitive Credentials Leaking in Health Reports | `packages/healthcheck/core/README.md` · `packages/healthcheck/core/package.json` · `packages/healthcheck/core/src/index.ts` · `apps/docs/examples/healthcheck.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx` | `{"title": "Overview & Quick Start", "description": "Runtime-neutral service healthcheck manager for liveness, readiness, startup, and diagnostics orchestration.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Core Concepts: The Four Scopes → H2 Quick Start: Creating a Production Manager → H2 Next Steps → H2 Next steps | `packages/healthcheck/core/README.md` · `packages/healthcheck/core/package.json` · `packages/healthcheck/core/src/index.ts` · `apps/docs/examples/healthcheck.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/core/optimization.mdx` | `{"title": "healthcheck — Optimization", "description": "Production choices for @nexload-sdk/healthcheck.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck", "topic": "optimization"}` | H2 Reserve liveness for the process → H2 Protect diagnostics → H2 Sources | `packages/healthcheck/core/README.md` · `packages/healthcheck/core/package.json` · `packages/healthcheck/core/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/core/playground.mdx` | `{"title": "healthcheck — Playground", "description": "Inspect a local readiness report.", "sidebar": {"label": "Playground", "order": 6}, "package": "healthcheck", "topic": "playground"}` | H2 Try it → H2 Read the result | `apps/docs/src/lib/playgrounds/health.ts` · `packages/healthcheck/core/README.md` · `packages/healthcheck/core/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/next/agents.mdx` | `{"title": "healthcheck-next — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-next.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-next", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-nextjs-routes → H3 healthcheck-diagnostics-security → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/nextjs-routes/SKILL.md` · `skills/healthcheck/diagnostics-security/SKILL.md` · `packages/healthcheck/next/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/next/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference and compatibility matrix for Healthcheck Next.js.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-next", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/next/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/next/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/next/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Setting up liveness, readiness, and protected diagnostics routes in Next.js App Router.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-next", "topic": "guides"}` | H2 Dual Route Pattern (Liveness & Readiness) → H2 Protecting Diagnostics Endpoints → H2 Troubleshooting & Common Pitfalls → H3 1. Next.js Static Compilation Stale Responses → H3 2. Edge Runtime Incompatibility with Node Checks | `packages/healthcheck/next/README.md` · `packages/healthcheck/next/package.json` · `packages/healthcheck/next/src/index.ts` · `apps/docs/examples/healthcheck-next.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/next/index.mdx` | `{"title": "Overview & Quick Start", "description": "Production-ready no-store, zero-cache health and readiness route handlers for Next.js App Router.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-next", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/next/README.md` · `packages/healthcheck/next/package.json` · `packages/healthcheck/next/src/index.ts` · `apps/docs/examples/healthcheck-next.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/next/optimization.mdx` | `{"title": "healthcheck-next — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-next.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-next", "topic": "optimization"}` | H2 Trust a controlled proxy → H2 Choose one authorization scheme → H2 Sources | `packages/healthcheck/next/README.md` · `packages/healthcheck/next/package.json` · `packages/healthcheck/next/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/node/agents.mdx` | `{"title": "healthcheck-node — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-node.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-node", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-container-resources → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/container-resources/SKILL.md` · `packages/healthcheck/node/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/node/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference, functions, and compatibility matrix for Healthcheck Node.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-node", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/node/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/node/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/node/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Configuring container resource checks in Docker/Kubernetes, TCP/DNS network probes, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-node", "topic": "guides"}` | H2 Container Resource Checks in Kubernetes / Docker → H2 TCP & DNS Dependency Probes → H2 Troubleshooting & Common Pitfalls → H3 1. `cgroup` Resource Check Reports "Degraded" on Non-Linux Hosts → H3 2. TCP Probe Leaks Sockets | `packages/healthcheck/node/README.md` · `packages/healthcheck/node/package.json` · `packages/healthcheck/node/src/index.ts` · `apps/docs/examples/healthcheck-node.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/node/index.mdx` | `{"title": "Overview & Quick Start", "description": "Node.js runtime adapter, cgroup v1/v2 container metrics, process metrics, and TCP/DNS health checks.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-node", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/node/README.md` · `packages/healthcheck/node/package.json` · `packages/healthcheck/node/src/index.ts` · `apps/docs/examples/healthcheck-node.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/node/optimization.mdx` | `{"title": "healthcheck-node — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-node.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-node", "topic": "optimization"}` | H2 Restrict container details → H2 Check deployment platform → H2 Sources | `packages/healthcheck/node/README.md` · `packages/healthcheck/node/package.json` · `packages/healthcheck/node/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/agents.mdx` | `{"title": "healthcheck-otel — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-otel.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-otel", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-monitoring-exporters → H3 healthcheck-diagnostics-security → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/monitoring-exporters/SKILL.md` · `skills/healthcheck/diagnostics-security/SKILL.md` · `packages/healthcheck/otel/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference and compatibility matrix for Healthcheck OpenTelemetry.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-otel", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/otel/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/otel/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Attaching health metrics to OpenTelemetry spans, semantic conventions, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-otel", "topic": "guides"}` | H2 Attaching Health Reports to OpenTelemetry Spans → H2 Troubleshooting & Common Pitfalls → H3 1. Attribute Type Mapping → H3 2. Standalone Operation | `packages/healthcheck/otel/README.md` · `packages/healthcheck/otel/package.json` · `packages/healthcheck/otel/src/index.ts` · `apps/docs/examples/healthcheck-otel.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx` | `{"title": "Overview & Quick Start", "description": "Export healthcheck reports as OpenTelemetry metrics, log attributes, and span metadata.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-otel", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/otel/README.md` · `packages/healthcheck/otel/package.json` · `packages/healthcheck/otel/src/index.ts` · `apps/docs/examples/healthcheck-otel.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/optimization.mdx` | `{"title": "healthcheck-otel — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-otel.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-otel", "topic": "optimization"}` | H2 Bound attribute cardinality → H2 Publish custom values through collectors → H2 Sources | `packages/healthcheck/otel/README.md` · `packages/healthcheck/otel/package.json` · `packages/healthcheck/otel/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/otel/playground.mdx` | `{"title": "healthcheck-otel — Playground", "description": "Inspect a local readiness report.", "sidebar": {"label": "Playground", "order": 6}, "package": "healthcheck-otel", "topic": "playground"}` | H2 Try it → H2 Read the result | `apps/docs/src/lib/playgrounds/health.ts` · `packages/healthcheck/otel/README.md` · `packages/healthcheck/otel/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/payload/agents.mdx` | `{"title": "healthcheck-payload — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-payload.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-payload", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-payload → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/payload/SKILL.md` · `packages/healthcheck/payload/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/payload/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference and compatibility matrix for Healthcheck Payload.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-payload", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/payload/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/payload/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/payload/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Probing Payload collections, database latency, lightweight health queries, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-payload", "topic": "guides"}` | H2 Lightweight Readiness Probing → H2 Troubleshooting & Common Pitfalls → H3 1. `PAYLOAD_QUERY_FAILED` → H3 2. Readiness Probe Is Slow (>1 second) → H3 3. Never Assign Payload Database Check to Liveness | `packages/healthcheck/payload/README.md` · `packages/healthcheck/payload/package.json` · `packages/healthcheck/payload/src/index.ts` · `apps/docs/examples/healthcheck-payload.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx` | `{"title": "Overview & Quick Start", "description": "Verify Payload CMS database connectivity, collection accessibility, and initialization state.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-payload", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/payload/README.md` · `packages/healthcheck/payload/package.json` · `packages/healthcheck/payload/src/index.ts` · `apps/docs/examples/healthcheck-payload.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/payload/optimization.mdx` | `{"title": "healthcheck-payload — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-payload.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-payload", "topic": "optimization"}` | H2 Bound readiness query cost → H2 Interpret probe failures → H2 Sources | `packages/healthcheck/payload/README.md` · `packages/healthcheck/payload/package.json` · `packages/healthcheck/payload/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/agents.mdx` | `{"title": "healthcheck-prometheus — Agent usage", "description": "Configure a coding agent for @nexload-sdk/healthcheck-prometheus.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "healthcheck-prometheus", "topic": "agents"}` | H2 Install matching skills → H3 healthcheck-monitoring-exporters → H3 healthcheck-diagnostics-security → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/healthcheck/monitoring-exporters/SKILL.md` · `skills/healthcheck/diagnostics-security/SKILL.md` · `packages/healthcheck/prometheus/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference and compatibility matrix for Healthcheck Prometheus.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "healthcheck-prometheus", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Runtime Compatibility Matrix | `packages/healthcheck/prometheus/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/healthcheck/prometheus/README.md` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Configuring Prometheus endpoints, metric labels, Grafana alerts, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "healthcheck-prometheus", "topic": "guides"}` | H2 Exposing the `/metrics` Endpoint → H2 Generated Metrics Reference → H2 Troubleshooting & Common Pitfalls → H3 1. Prometheus Scraper Reports `text format parse error` → H3 2. High Cardinality Labels | `packages/healthcheck/prometheus/README.md` · `packages/healthcheck/prometheus/package.json` · `packages/healthcheck/prometheus/src/index.ts` · `apps/docs/examples/healthcheck-prometheus.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx` | `{"title": "Overview & Quick Start", "description": "Serialize healthcheck reports into Prometheus text exposition and OpenMetrics format without heavy SDKs.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "healthcheck-prometheus", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H2 Next Steps → H2 Next steps | `packages/healthcheck/prometheus/README.md` · `packages/healthcheck/prometheus/package.json` · `packages/healthcheck/prometheus/src/index.ts` · `apps/docs/examples/healthcheck-prometheus.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/optimization.mdx` | `{"title": "healthcheck-prometheus — Optimization", "description": "Production choices for @nexload-sdk/healthcheck-prometheus.", "sidebar": {"label": "Optimization", "order": 4}, "package": "healthcheck-prometheus", "topic": "optimization"}` | H2 Use supported labels → H2 Export collector metrics → H2 Sources | `packages/healthcheck/prometheus/README.md` · `packages/healthcheck/prometheus/package.json` · `packages/healthcheck/prometheus/src/index.ts` |
| `apps/docs/src/content/docs/packages/healthcheck/prometheus/playground.mdx` | `{"title": "healthcheck-prometheus — Playground", "description": "Inspect a local readiness report.", "sidebar": {"label": "Playground", "order": 6}, "package": "healthcheck-prometheus", "topic": "playground"}` | H2 Try it → H2 Read the result | `apps/docs/src/lib/playgrounds/health.ts` · `packages/healthcheck/prometheus/README.md` · `packages/healthcheck/prometheus/src/index.ts` |
| `apps/docs/src/content/docs/packages/index.mdx` | `{"title": "Package catalog", "description": "Browse the Nexload SDK packages documented on this site.", "sidebar": {"order": 1}, "topic": "ecosystem"}` | H2 Core Primitives → H2 Healthcheck → H2 Payload CMS → H2 Developer Tooling & Standards → H2 Documentation policy | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/packages/logger/agents.mdx` | `{"title": "logger — Agent usage", "description": "Configure a coding agent for @nexload-sdk/logger.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "logger", "topic": "agents"}` | H2 Install matching skills → H3 logger → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/logger/SKILL.md` · `packages/logger/README.md` |
| `apps/docs/src/content/docs/packages/logger/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public logger signatures, examples, and runtime compatibility.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "logger", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Exported API Summary → H3 Public Types → H3 Testing Subpath → H2 Runtime Compatibility Matrix | `packages/logger/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/logger/README.md` |
| `apps/docs/src/content/docs/packages/logger/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Configure the logger per runtime and use request context, trace headers, redaction, and error serialization.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "logger", "topic": "guides"}` | H2 Configure Once per Runtime → H3 Next.js Instrumentation → H2 Request Context and Trace Propagation → H3 Edge and Browser → H2 Redaction → H3 Path Coverage → H2 Errors → H3 Serialized Fields → H2 Testing → H2 Libraries → H2 Logging Architecture → H2 Troubleshooting & Migration from v4 → H3 1. Global Setup and Children's Bindings → H3 2. Renderers and Level Filters → H3 3. Tests and Error Fields | `packages/logger/README.md` · `packages/logger/package.json` · `packages/logger/src/index.ts` · `apps/docs/examples/logger.ts` |
| `apps/docs/src/content/docs/packages/logger/index.mdx` | `{"title": "Overview & Quick Start", "description": "Configure-once structured logging with request context, trace propagation, and safe defaults.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "logger", "topic": "overview"}` | H2 10-Second Code Snippet → H2 Installation & Peer Dependencies → H3 Compatibility Requirements → H2 When to Use Logger → H2 Quick Start: Configure a Service → H2 Next Steps → H2 Next steps | `packages/logger/README.md` · `packages/logger/package.json` · `packages/logger/src/index.ts` · `apps/docs/examples/logger.ts` |
| `apps/docs/src/content/docs/packages/logger/optimization.mdx` | `{"title": "logger — Optimization", "description": "Production choices for @nexload-sdk/logger.", "sidebar": {"label": "Optimization", "order": 4}, "package": "logger", "topic": "optimization"}` | H2 Extend redaction for deeper objects → H2 Configure once → H2 Sources | `packages/logger/README.md` · `packages/logger/package.json` · `packages/logger/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-editor/agents.mdx` | `{"title": "payload-editor — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-editor.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-editor", "topic": "agents"}` | H2 Install matching skills → H3 payload-editor-core → H3 payload-editor-presets → H3 payload-editor-extensions → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-editor/core/SKILL.md` · `skills/payload-editor/presets/SKILL.md` · `skills/payload-editor/extensions/SKILL.md` · `packages/payload-editor/README.md` |
| `apps/docs/src/content/docs/packages/payload-editor/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference, editor functions, and compatibility matrix for Payload Editor.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-editor", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Functions Reference → H2 Runtime Compatibility Matrix | `packages/payload-editor/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-editor/README.md` |
| `apps/docs/src/content/docs/packages/payload-editor/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Selecting presets, defining organization standards, extending with native Lexical blocks, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-editor", "topic": "guides"}` | H2 Built-In Presets Catalog → H2 Defining an Organization Preset → H2 Extending with Native Lexical Blocks → H2 Troubleshooting & Common Pitfalls → H3 1. Editor Renders with Default Payload Controls Instead of Preset → H3 2. Heading Sizes In Toolbar Don't Match Override → H3 3. Missing Peer Dependency Error | `packages/payload-editor/README.md` · `packages/payload-editor/package.json` · `packages/payload-editor/src/index.ts` · `apps/docs/examples/payload-editor.ts` |
| `apps/docs/src/content/docs/packages/payload-editor/index.mdx` | `{"title": "Overview & Quick Start", "description": "Deterministic semantic configuration, presets, and feature sets for Payload CMS's Lexical editor.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-editor", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H3 Compatibility Requirements → H2 Feature State Semantics → H2 Next Steps → H2 Next steps | `packages/payload-editor/README.md` · `packages/payload-editor/package.json` · `packages/payload-editor/src/index.ts` · `apps/docs/examples/payload-editor.ts` |
| `apps/docs/src/content/docs/packages/payload-editor/optimization.mdx` | `{"title": "payload-editor — Optimization", "description": "Production choices for @nexload-sdk/payload-editor.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-editor", "topic": "optimization"}` | H2 Replace managed features explicitly → H2 Keep relational depth bounded → H2 Sources | `packages/payload-editor/README.md` · `packages/payload-editor/package.json` · `packages/payload-editor/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-fields/agents.mdx` | `{"title": "payload-fields — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-fields.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-fields", "topic": "agents"}` | H2 Install matching skills → H3 payload-fields-core → H3 payload-fields-slug → H3 payload-fields-jalali-date → H3 payload-fields-money → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-fields/core/SKILL.md` · `skills/payload-fields/slug/SKILL.md` · `skills/payload-fields/jalali-date/SKILL.md` · `skills/payload-fields/money/SKILL.md` · `packages/payload-fields/README.md` |
| `apps/docs/src/content/docs/packages/payload-fields/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public API symbol reference, factory function signatures, and compatibility matrix for Payload Fields.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-fields", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Exported Factories Summary → H2 Schema Adapter (`@nexload-sdk/payload-fields/schema`) → H2 Compatibility Helpers → H2 Runtime Compatibility Matrix | `packages/payload-fields/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-fields/README.md` |
| `apps/docs/src/content/docs/packages/payload-fields/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Deep recipes for managed Unicode slugs, Jalali date ranges, integer money fields, Iranian contact & identity, addresses, and schema integration.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-fields", "topic": "guides"}` | H2 Managed Unicode Slugs → H3 Uniqueness & Collision Suffixing → H3 Slug Locking Mechanism → H2 Jalali (Persian Solar) Datepicker & Date Ranges → H3 Date Storage Guarantees → H2 Safe-Integer Money Fields → H3 API Strings & Plugin Requirement → H2 Iranian Contact & Identity Fields → H3 Validation & Localization → H2 Iranian Address Group → H2 Schema Adapter (`@nexload-sdk/payload-fields/schema`) → H2 Troubleshooting & Common Pitfalls → H3 1. Custom Admin Controls Fallback to Plain Inputs → H3 2. Money Strings Rejected by REST or Local API → H3 3. Duplicate Slug Migration Errors | `packages/payload-fields/README.md` · `packages/payload-fields/package.json` · `packages/payload-fields/src/index.ts` · `apps/docs/examples/payload-fields.ts` |
| `apps/docs/src/content/docs/packages/payload-fields/index.mdx` | `{"title": "Overview & Quick Start", "description": "Semantic Payload field factories for Unicode slugs, Jalali dates, integer money, Iranian contact & identity fields, and addresses.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-fields", "topic": "overview"}` | H2 10-Second Code Snippet → H2 Installation & Peer Dependencies → H3 Compatibility Requirements → H2 Storage & Contract Rules → H3 1. Slugs & SlugLock → H3 2. Jalali Dates & Ranges → H3 3. Money Values & Plugin Requirement → H3 4. Bilingual Validation Messages → H3 5. Schema Adapter Scope → H2 Quick Start: Adding Plugin for Slug Generators & String Money → H2 Next Steps → H2 Next steps | `packages/payload-fields/README.md` · `packages/payload-fields/package.json` · `packages/payload-fields/src/index.ts` · `apps/docs/examples/payload-fields.ts` |
| `apps/docs/src/content/docs/packages/payload-fields/optimization.mdx` | `{"title": "payload-fields — Optimization", "description": "Production choices for @nexload-sdk/payload-fields.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-fields", "topic": "optimization"}` | H2 Normalize strings before field hooks → H2 Send integers from numeric clients → H2 Sources | `packages/payload-fields/README.md` · `packages/payload-fields/package.json` · `packages/payload-fields/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-hooks/agents.mdx` | `{"title": "payload-hooks — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-hooks.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-hooks", "topic": "agents"}` | H2 Install matching skills → H3 payload-preset → H3 payload-collection-design → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-preset/SKILL.md` · `skills/payload/collection-design/SKILL.md` · `packages/payload-hooks/README.md` |
| `apps/docs/src/content/docs/packages/payload-hooks/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public audit plugin and legacy hook exports.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-hooks", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Exported Factories Summary | `packages/payload-hooks/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-hooks/README.md` |
| `apps/docs/src/content/docs/packages/payload-hooks/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Audit options, events, privacy, and migration.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-hooks", "topic": "guides"}` | H2 Audit options → H2 Events → H2 Boundaries → H2 Migrate from `logOperation` | `packages/payload-hooks/README.md` · `packages/payload-hooks/package.json` · `packages/payload-hooks/src/index.ts` · `apps/docs/examples/payload-hooks.ts` |
| `apps/docs/src/content/docs/packages/payload-hooks/index.mdx` | `{"title": "Overview & Quick Start", "description": "Audit Payload collection operations with structured log events.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-hooks", "topic": "overview"}` | H2 Installation → H2 Quick Start → H2 Next steps | `packages/payload-hooks/README.md` · `packages/payload-hooks/package.json` · `packages/payload-hooks/src/index.ts` · `apps/docs/examples/payload-hooks.ts` |
| `apps/docs/src/content/docs/packages/payload-hooks/optimization.mdx` | `{"title": "payload-hooks — Optimization", "description": "Production choices for @nexload-sdk/payload-hooks.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-hooks", "topic": "optimization"}` | H2 Declare the auth collection → H2 Interpret write events in context → H2 Sources | `packages/payload-hooks/README.md` · `packages/payload-hooks/package.json` · `packages/payload-hooks/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-operations/agents.mdx` | `{"title": "payload-operations — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-operations.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-operations", "topic": "agents"}` | H2 Install matching skills → H3 payload-operations-core → H3 payload-operations-client → H3 payload-operations-server → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-operations/core/SKILL.md` · `skills/payload-operations/client/SKILL.md` · `skills/payload-operations/server/SKILL.md` · `packages/payload-operations/README.md` |
| `apps/docs/src/content/docs/packages/payload-operations/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Complete public API symbol reference, entrypoint exports, and runtime compatibility matrix for Payload Operations.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-operations", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Exported Subpaths → H2 Runtime Compatibility Matrix | `packages/payload-operations/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-operations/README.md` |
| `apps/docs/src/content/docs/packages/payload-operations/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Advanced multi-resource contract patterns, Payload server endpoints with RBAC, transport plugins, safe error matching, Next.js server actions, and troubleshooting.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-operations", "topic": "guides"}` | H2 Multi-Resource Operations Tree → H2 Role-Based Access Control (RBAC) & Overrides → H3 Request Body Size Limiting (`maxBodyBytes`) → H2 Database Transactions & Local API Handlers → H2 Codec Wire Model & Serialization → H3 Codec Safety Rule for Outputs → H3 Handling Dates with `z.codec` → H2 Client Transport Plugins → H3 1. Built-in Timeout Plugin → H3 2. Custom Authorization Bearer Plugin → H3 3. Distributed Tracing & Metrics Plugin → H3 4. Pure Operations Client (Without Payload SDK) → H2 Safe Error Pattern-Matching → H2 Next.js App Router Integration (Server Actions) → H2 Troubleshooting & Common Pitfalls → H3 1. `INPUT_VALIDATION_FAILED` (No Network Request Sent) → H3 2. Endpoint Responds with 401 or 403 → H3 3. Route Returns 404 Not Found → H3 4. Browser CORS Pre-flight (`OPTIONS`) Failure → H3 5. Domain Error Was Downgraded to Internal Error → H3 6. Endpoint Responds with 413 Payload Too Large → H3 7. Server Responds with 500 During Response Encoding → H2 Migrating to 2.0 → H3 New in 2.0 → H3 Breaking Changes & Migration Steps → H4 1. `createCMSClient` moved to `@nexload-sdk/payload-operations/cms` → H4 2. `timeoutPlugin` moved to `@nexload-sdk/payload-operations/plugins/timeout` → H4 3. `createOperationsClient` is public in `@nexload-sdk/payload-operations/client` → H4 4. Client sends original input value → H4 5. `access.default` is required in `createPayloadEndpoints` → H4 6. Handler return type is `z.output<output>` and is encoded → H4 7. Output and error-data schemas must be codec-safe → H4 8. Zod floor raised to `>=4.1.0 <5.0.0` → H4 9. `@payloadcms/sdk` is an optional peer dependency → H4 10. Request body size limit (`maxBodyBytes`) → H2 Migration from Legacy Custom Handlers | `packages/payload-operations/README.md` · `packages/payload-operations/package.json` · `packages/payload-operations/src/index.ts` · `apps/docs/examples/payload-operations.ts` |
| `apps/docs/src/content/docs/packages/payload-operations/index.mdx` | `{"title": "Overview & Quick Start", "description": "Type-safe custom application operations for Payload CMS with shared Zod contracts and client SDK.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-operations", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H3 Compatibility Requirements → H2 Core Concepts & Architecture → H3 1. The Contract Model (`@nexload-sdk/payload-operations/contract`) → H3 2. Dual Boundary Validation & Codec Wire Model → H3 3. Server Endpoints Mount (`@nexload-sdk/payload-operations/server`) → H2 Quick Start: End-to-End Implementation → H3 Step 1: Define the Shared Contract → H3 Step 2: Implement Handlers in Payload Config → H3 Step 3: Instantiate and Call from Client → H2 Next Steps → H2 Next steps | `packages/payload-operations/README.md` · `packages/payload-operations/package.json` · `packages/payload-operations/src/index.ts` · `apps/docs/examples/payload-operations.ts` |
| `apps/docs/src/content/docs/packages/payload-operations/optimization.mdx` | `{"title": "payload-operations — Optimization", "description": "Production choices for @nexload-sdk/payload-operations.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-operations", "topic": "optimization"}` | H2 Keep outputs encodable → H2 Preserve access control → H2 Sources | `packages/payload-operations/README.md` · `packages/payload-operations/package.json` · `packages/payload-operations/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-preset/agents.mdx` | `{"title": "payload-preset — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-preset.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-preset", "topic": "agents"}` | H2 Install matching skills → H3 payload-preset → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-preset/SKILL.md` · `packages/payload-preset/README.md` |
| `apps/docs/src/content/docs/packages/payload-preset/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Public preset exports and runtime constraints.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-preset", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Exported Factories Summary | `packages/payload-preset/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-preset/README.md` |
| `apps/docs/src/content/docs/packages/payload-preset/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Options, merge rules, ordering, and logging for the Payload preset.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-preset", "topic": "guides"}` | H2 Options → H2 Persian merge rules → H2 Logger bridge → H2 Audit boundaries | `packages/payload-preset/README.md` · `packages/payload-preset/package.json` · `packages/payload-preset/src/index.ts` · `apps/docs/examples/payload-preset.ts` |
| `apps/docs/src/content/docs/packages/payload-preset/index.mdx` | `{"title": "Overview & Quick Start", "description": "Compose Payload configuration with Nexload defaults.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-preset", "topic": "overview"}` | H2 Installation → H2 Quick Start → H2 Next steps | `packages/payload-preset/README.md` · `packages/payload-preset/package.json` · `packages/payload-preset/src/index.ts` · `apps/docs/examples/payload-preset.ts` |
| `apps/docs/src/content/docs/packages/payload-preset/optimization.mdx` | `{"title": "payload-preset — Optimization", "description": "Production choices for @nexload-sdk/payload-preset.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-preset", "topic": "optimization"}` | H2 Initialize logging first → H2 Choose plugin ownership → H2 Sources | `packages/payload-preset/README.md` · `packages/payload-preset/package.json` · `packages/payload-preset/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-schema/agents.mdx` | `{"title": "payload-schema — Agent usage", "description": "Configure a coding agent for @nexload-sdk/payload-schema.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "payload-schema", "topic": "agents"}` | H2 Install matching skills → H3 payload-schema-use → H3 payload-schema-develop → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/payload-schema/use/SKILL.md` · `skills/payload-schema/develop/SKILL.md` · `packages/payload-schema/README.md` |
| `apps/docs/src/content/docs/packages/payload-schema/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Complete public API symbol reference, field factory signatures, entry points, and runtime compatibility matrix for Payload Schema.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "payload-schema", "topic": "api"}` | ApiInventory groups and linked symbol names → H2 Entry Points & Signatures → H3 Root Entry: `@nexload-sdk/payload-schema` → H3 Payload Compilation Entry: `@nexload-sdk/payload-schema/payload` → H2 Field Factory Reference → H2 Runtime Compatibility Matrix | `packages/payload-schema/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/payload-schema/README.md` |
| `apps/docs/src/content/docs/packages/payload-schema/guides.mdx` | `{"title": "Production Guides & Recipes", "description": "Exhaustive field modeling catalog, static vs dynamic defaults, polymorphic relationships, advanced schema derivation, collection layout integration, troubleshooting, and 3.0 migration.", "sidebar": {"label": "Production Guides & Recipes", "order": 2}, "package": "payload-schema", "topic": "guides"}` | H2 The Complete 15-Field Factory Catalog → H2 Static Defaults vs. Dynamic Defaults → H2 Advanced Schema Derivation Patterns → H3 1. Picking Fields with Strictness and `optional: "auto"` → H3 2. Custom Field Transformations → H3 3. Cross-Field Refinements → H3 4. Inferring TypeScript Types → H2 Payload Collection Layout Integration → H2 Intrinsic Normalization & Runtime Semantics → H3 Normalization on Writes → H3 Null Semantics → H3 Date Objects → H3 Codec Safety → H2 Known Limitations → H2 Troubleshooting & Diagnostics → H3 1. `SCHEMA_UNAVAILABLE` → H3 2. `INVALID_ENTITY` → H3 3. `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED` → H3 4. Safe Introspection with `inspect()` → H3 5. Error Handling Helper → H2 Migrating to 3.0 → H3 New in 3.0 → H3 Breaking Changes → H3 1. Payload Compilation Moved to `/payload` Subpath → H3 2. Zod Peer Dependency Floor Raised to 4.1 → H3 3. Null Passes Canonical Validation Hooks → H3 4. Date Objects Accepted by Date Hook → H3 5. Built-in Normalizations Are Codec-Safe (`.overwrite`) → H3 6. Composite Children Without `required: true` Are Optional and Nullable → H3 7. Reserved Child Field Names in Blocks | `packages/payload-schema/README.md` · `packages/payload-schema/package.json` · `packages/payload-schema/src/index.ts` · `apps/docs/examples/payload-schema.ts` |
| `apps/docs/src/content/docs/packages/payload-schema/index.mdx` | `{"title": "Overview & Quick Start", "description": "Define canonical field validation and normalization once, then reuse it across Payload CMS fields and Zod schemas.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "payload-schema", "topic": "overview"}` | H2 10-Second Code Snippet → H2 What You Get → H2 Installation & Requirements → H3 Compatibility Requirements → H2 Core Concepts & Invariants → H3 1. One Intrinsic Contract → H3 2. Dual Boundary Compilation → H3 3. Synchronous Canonical Schemas → H3 4. Non-Goals → H2 Quick Start: Building a Complete Entity → H2 Next Steps → H2 Next steps | `packages/payload-schema/README.md` · `packages/payload-schema/package.json` · `packages/payload-schema/src/index.ts` · `apps/docs/examples/payload-schema.ts` |
| `apps/docs/src/content/docs/packages/payload-schema/optimization.mdx` | `{"title": "payload-schema — Optimization", "description": "Production choices for @nexload-sdk/payload-schema.", "sidebar": {"label": "Optimization", "order": 4}, "package": "payload-schema", "topic": "optimization"}` | H2 Choose optionality for projections → H2 Preserve block metadata → H2 Sources | `packages/payload-schema/README.md` · `packages/payload-schema/package.json` · `packages/payload-schema/src/index.ts` |
| `apps/docs/src/content/docs/packages/payload-schema/playground.mdx` | `{"title": "payload-schema — Playground", "description": "Validate product input.", "sidebar": {"label": "Playground", "order": 6}, "package": "payload-schema", "topic": "playground"}` | H2 Try it → H2 Read the result | `apps/docs/src/lib/playgrounds/schema.ts` · `packages/payload-schema/README.md` · `packages/payload-schema/src/index.ts` |
| `apps/docs/src/content/docs/packages/persian/agents.mdx` | `{"title": "persian — Agent usage", "description": "Configure a coding agent for @nexload-sdk/persian.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "persian", "topic": "agents"}` | H2 Install matching skills → H3 persian → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/persian/SKILL.md` · `packages/persian/README.md` |
| `apps/docs/src/content/docs/packages/persian/api.mdx` | `{"title": "API Reference & Compatibility", "description": "Persian and Iranian utilities.", "sidebar": {"label": "API Reference & Compatibility", "order": 3}, "package": "persian", "topic": "api"}` | ApiInventory groups and linked symbol names | `packages/persian/src/index.ts` · `apps/docs/scripts/api-packages.mjs` · `apps/docs/src/generated/api-catalog.json` · `packages/persian/README.md` |
| `apps/docs/src/content/docs/packages/persian/guides.mdx` | `{"title": "Guides & Recipes", "description": "Persian and Iranian utilities.", "sidebar": {"label": "Guides & Recipes", "order": 2}, "package": "persian", "topic": "guides"}` | H2 Digits → H2 Text → H2 Mobile → H2 Identity → H2 Bank → H2 Money → H2 Date → H2 Relative time → H2 Geography → H2 Zod → H2 Forms: normalize, store, display → H2 Canonical forms → H2 Validation errors | `packages/persian/README.md` · `packages/persian/package.json` · `packages/persian/src/index.ts` · `apps/docs/examples/persian.ts` |
| `apps/docs/src/content/docs/packages/persian/index.mdx` | `{"title": "Overview & Quick Start", "description": "Persian and Iranian utilities.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "persian", "topic": "overview"}` | H2 Installation → H2 Compatibility → H2 When to use → H2 Next steps | `packages/persian/README.md` · `packages/persian/package.json` · `packages/persian/src/index.ts` · `apps/docs/examples/persian.ts` |
| `apps/docs/src/content/docs/packages/persian/optimization.mdx` | `{"title": "persian — Optimization", "description": "Production choices for @nexload-sdk/persian.", "sidebar": {"label": "Optimization", "order": 4}, "package": "persian", "topic": "optimization"}` | H2 Keep currency units explicit → H2 Check the calendar boundary → H2 Sources | `packages/persian/README.md` · `packages/persian/package.json` · `packages/persian/src/index.ts` |
| `apps/docs/src/content/docs/packages/persian/playground.mdx` | `{"title": "persian — Playground", "description": "Format a storefront price.", "sidebar": {"label": "Playground", "order": 6}, "package": "persian", "topic": "playground"}` | H2 Try it → H2 Read the result | `apps/docs/src/lib/playgrounds/persian.ts` · `packages/persian/README.md` · `packages/persian/src/index.ts` · `packages/persian/src/money/index.ts` |
| `apps/docs/src/content/docs/packages/typescript-config/agents.mdx` | `{"title": "typescript-config — Agent usage", "description": "Configure a coding agent for @nexload-sdk/typescript-config.", "sidebar": {"label": "Agent usage", "order": 5}, "package": "typescript-config", "topic": "agents"}` | H2 Install matching skills → H3 nexload-code → H3 nexload-package → H2 Project AGENTS.md → H2 Package context → H2 Prompts | `skills/nexload/code/SKILL.md` · `skills/nexload/package/SKILL.md` · `tools/typescript-config/README.md` |
| `apps/docs/src/content/docs/packages/typescript-config/api.mdx` | `{"title": "typescript-config — Configuration reference", "description": "Exported configuration entries for @nexload-sdk/typescript-config.", "sidebar": {"label": "Configuration reference", "order": 3}, "package": "typescript-config", "topic": "api"}` | H2 Public entries → H2 Usage | `tools/typescript-config/README.md` · `tools/typescript-config/package.json` · `tools/typescript-config/base.json` |
| `apps/docs/src/content/docs/packages/typescript-config/guides.mdx` | `{"title": "Configuration Guides & Recipes", "description": "Monorepo project references, overriding compiler options safely, and library declaration builds.", "sidebar": {"label": "Configuration Guides & Recipes", "order": 2}, "package": "typescript-config", "topic": "guides"}` | H2 Monorepo Setup with Project References → H3 1. Root `tsconfig.json` → H3 2. Workspace Package `tsconfig.json` → H2 Overriding Compiler Options Safely → H3 Safe to Customize → H3 Never Weaken → H2 Migrating from Legacy `tsconfig.json` | `tools/typescript-config/README.md` · `tools/typescript-config/package.json` · `tools/typescript-config/base.json` |
| `apps/docs/src/content/docs/packages/typescript-config/index.mdx` | `{"title": "Overview & Quick Start", "description": "Strict, modern TypeScript configurations for Node.js, React, Next.js, and Vite applications.", "sidebar": {"label": "Overview & Quick Start", "order": 1}, "package": "typescript-config", "topic": "overview"}` | H2 10-Second Code Snippet → H2 Available Presets Catalog → H2 Core Guarantees & Strictness Flags → H2 Installation & Requirements → H2 Next steps | `tools/typescript-config/README.md` · `tools/typescript-config/package.json` · `tools/typescript-config/base.json` |
| `apps/docs/src/content/docs/packages/typescript-config/optimization.mdx` | `{"title": "typescript-config — Optimization", "description": "Production choices for @nexload-sdk/typescript-config.", "sidebar": {"label": "Optimization", "order": 4}, "package": "typescript-config", "topic": "optimization"}` | H2 Extend the runtime preset → H2 Retain checked indexed access → H2 Sources | `tools/typescript-config/README.md` · `tools/typescript-config/package.json` · `tools/typescript-config/base.json` |
| `apps/docs/src/content/docs/standards/agent-setup-prompt.mdx` | `{"title": "Autonomous Agent Config Setup Prompt", "description": "A battle-tested copy-pasteable prompt that empowers any AI agent in any repository to configure and enforce strict ESLint 9 Flat Config and TypeScript 5.", "sidebar": {"label": "Agent Setup Prompt", "order": 2}, "topic": "ecosystem"}` | H2 The Universal Setup Prompt → H3 Phase 5: Modernize package.json Scripts → H3 Phase 6: Codebase Normalization & Safe Remediation → H3 Phase 7: Verification → H2 Agent Capability Checklist | `docs/skills/ENGINEERING-STANDARDS.md` · `skills/nexload/package/SKILL.md` · `skills/nexload/code/SKILL.md` |
| `apps/docs/src/content/docs/standards/file-structure.mdx` | `{"title": "Canonical File & Directory Structure Standard", "description": "Architectural directory layout archetypes, naming conventions, and file placement rules for engineering teams and autonomous agents.", "sidebar": {"label": "File & Directory Structure", "order": 1}, "topic": "ecosystem"}` | H2 Core Architectural Principles → H2 The Four Production Archetypes → H3 Archetype 1: Zero-Dependency Core Library → H3 Archetype 2: Multi-Platform / Adapter Package → H3 Archetype 3: React UI & Feature Slice Architecture → H3 Archetype 4: Payload CMS Server vs. Admin Boundaries → H2 File Naming & Extension Matrix → H2 Anti-Patterns to Avoid | `docs/skills/ENGINEERING-STANDARDS.md` · `skills/nexload/package/SKILL.md` · `skills/nexload/code/SKILL.md` |
| `apps/docs/src/content/docs/start/choose-a-package.mdx` | `{"title": "Choose a package by task", "description": "Match a storefront, CMS, service or tooling problem to its smallest SDK dependency.", "sidebar": {"order": 2}, "topic": "ecosystem"}` | H2 Localize a storefront → H2 Model and operate a CMS → H2 Observe a service → H2 Set up project tooling | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/start/glossary.mdx` | `{"title": "Architecture Glossary: Terms & Invariants", "description": "Shared terms used across Healthcheck and Payload package documentation.", "sidebar": {"order": 3}, "topic": "ecosystem"}` | H2 Healthcheck → H2 Payload | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/start/installation.mdx` | `{"title": "Installation and compatibility", "description": "Package managers, module formats, and peer dependencies."}` | H2 Package managers → H2 Module formats and peer dependencies | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/start/introduction.mdx` | `{"title": "Introduction: Ecosystem & Architecture", "description": "Understand the Nexload SDK package model, documentation policy, and recommended learning path.", "sidebar": {"order": 1}, "topic": "ecosystem"}` | H2 Recommended path → H2 Documentation policy → H2 Shared terms | `docs/README.md` · `docs/packages/OVERVIEW.md` · `apps/docs/src/lib/package-catalog.ts` |
| `apps/docs/src/content/docs/start/payload-packages.mdx` | `{"title": "Payload Suite Overview", "description": "Compose the Payload packages by responsibility.", "sidebar": {"order": 4}, "topic": "ecosystem"}` | H2 Recommended configuration | `docs/packages/PAYLOAD-SUITE.md` · `packages/payload-preset/README.md` · `packages/payload-fields/README.md` · `packages/logger/README.md` · `packages/healthcheck/payload/README.md` · `packages/persian/README.md` |
| `apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx` | `{"title": "E-commerce stack", "description": "Compose Payload, health checks, logging, and Persian utilities."}` | Page title and body | `docs/packages/PAYLOAD-SUITE.md` · `packages/payload-preset/README.md` · `packages/payload-fields/README.md` · `packages/logger/README.md` · `packages/healthcheck/payload/README.md` · `packages/persian/README.md` |

The custom error page `apps/docs/src/pages/404.astro` keeps frontmatter `{ title: "Page not found", description: "The requested Nexload SDK documentation page does not exist.", editUrl: false, pagefind: false, template: "splash" }`, its H1 and its three recovery links. It is outside the content collection.

## URL contract

The complete pre-rebuild mapping is the literal `apps/docs/tests/legacy-routes.json` in Task 8. Its `pages` array maps each of 66 existing URLs to itself. Its `redirects` object expands all 137 old-to-canonical pairs, including the seven suffixes for each of the eleven retired package families. Prepend `/nexload-sdk` to both sides. Keep these redirects in `apps/docs/astro.config.mjs`; the only config diff changes sidebar discovery. HTML and the Markdown mirrors have distinct URLs. Existing public Markdown and LLM paths continue to serve at the same locations. `/404.html` stays the static error document.

## Task instructions

Work from the repository root. For each task the payloads below are exact full new contents or unified diffs against the **previous completed task**. Existing components that change are given in full. Apply test files first, record red, then apply production payloads. For new page content use the literal MDX. Regenerate public artifacts before the green check. Commit only the task’s files and its generated output; if a path already has unrelated edits, stage only your hunks. Never stage the planning brief, this plan or an entire working tree.

### Task 1: Problem-first entry and release truth

**Files:** `apps/docs/src/content/docs/index.mdx`, `apps/docs/src/content/docs/start/choose-a-package.mdx`, `apps/docs/astro.config.mjs`, `apps/docs/src/content/docs/start/introduction.mdx`, `apps/docs/src/content/docs/packages/index.mdx`, `apps/docs/src/content/docs/start/installation.mdx`, `apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx`, `apps/docs/src/content/docs/packages/persian/index.mdx`, `apps/docs/src/content/docs/packages/payload-preset/index.mdx`, `apps/docs/src/components/docs/PackageHero.astro`, `apps/docs/src/components/docs/PackageGrid.astro`, `apps/docs/scripts/generate-markdown.mjs`, `apps/docs/tests/contracts.test.mjs`, `apps/docs/tests/discovery.test.mjs`.

**Interfaces:**

- Consumes The existing 17 package routes, workspace manifests and current Changesets.
- Produces A task chooser with 17 owners and release-aware installation copy in HTML and Markdown.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/contracts.test.mjs`

```diff
--- a/apps/docs/tests/contracts.test.mjs
+++ b/apps/docs/tests/contracts.test.mjs
@@ -77,5 +77,5 @@
     );
   }
-  assert.match(full, /pnpm add @nexload-sdk\/persian/);
+  assert.match(full, /pnpm add '@nexload-sdk\/persian@workspace:\*'/);
   assert.match(full, /pnpm add @nexload-sdk\/healthcheck/);
   assert.match(full, /pnpm add @nexload-sdk\/payload-schema payload zod/);
```

`apps/docs/tests/discovery.test.mjs`

```mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

const read = (path) => readFileSync(new URL(`../public/${path}`, import.meta.url), "utf8");

test("choose by task covers runtime packages and compiler tooling", () => {
  const guide = read("start/choose-a-package.md");
  for (const id of [...Object.keys(catalog), "typescript-config", "eslint-config"]) {
    assert.ok(guide.includes(`@nexload-sdk/${id}`), id);
  }
  assert.ok(read("index.md").includes("Jalali date picker"));
});

test("unreleased overviews identify a working local install", () => {
  for (const id of ["persian", "payload-preset"]) {
    const page = read(`packages/${id}/index.md`);
    assert.match(page, /unreleased/i);
    assert.ok(page.includes(`@nexload-sdk/${id}@workspace:*`));
    assert.ok(!page.includes(`www.npmjs.com/package/@nexload-sdk/${id}`));
  }
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/discovery.test.mjs)`. Expected nonzero exit for missing chooser owners and workspace-only installs. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/src/content/docs/index.mdx`

````diff
--- a/apps/docs/src/content/docs/index.mdx
+++ b/apps/docs/src/content/docs/index.mdx
@@ -1,5 +1,5 @@
 ---
-title: "Nexload SDK: Service Observability & Payload CMS Superpowers"
-description: "Production-grade TypeScript toolkits for Service Observability and Payload CMS superpowers. Modular, independently installable packages."
+title: Build an Iranian storefront with Nexload SDK
+description: Find TypeScript packages for Persian data, Payload CMS and service health.
 sidebar:
   order: 1
@@ -7,107 +7,18 @@
 ---
 
-import { Card, CardGrid, Code, LinkButton, Tabs, TabItem } from "@astrojs/starlight/components";
-import PackageGrid from "../../components/docs/PackageGrid.astro";
-import { packageCatalog } from "../../lib/package-catalog";
+Nexload SDK provides independently installable TypeScript packages for Iranian e-commerce on Payload CMS and Next.js.
 
-**Production-grade TypeScript toolkits for Service Observability and Payload CMS superpowers.**
+## What are you building?
 
-Nexload SDK is a collection of modular, independent packages engineered for mission-critical TypeScript systems. Install only the specific package your service requires—zero mandatory lock-in, zero runtime bloat.
+- [Format Persian digits and prices](/nexload-sdk/packages/persian/).
+- [Add a Jalali date picker to a collection](/nexload-sdk/packages/payload-fields/).
+- [Validate product fields across server and client](/nexload-sdk/packages/payload-schema/).
+- [Check whether your storefront can accept traffic](/nexload-sdk/packages/healthcheck/core/).
 
-<p class="sl-flex sl-flex-wrap sl-gap-2">
-  <LinkButton href="/nexload-sdk/start/choose-a-package/" icon="right-arrow">
-    Choose a package
-  </LinkButton>
-  <LinkButton href="/nexload-sdk/packages/" variant="secondary">
-    Browse all packages
-  </LinkButton>
-  <LinkButton href="/nexload-sdk/agents/" variant="minimal" icon="bot">
-    AI Coding Agent Skills
-  </LinkButton>
-</p>
+## Start a project
 
----
+[Choose a package by task](/nexload-sdk/start/choose-a-package/) or follow the [e-commerce stack recipe](/nexload-sdk/start/recipes/ecommerce-stack/).
 
-## Immediate 10-Second Quick Start
+## Work with an agent
 
-<Tabs>
-  <TabItem label="Payload Schema (Validation & Sync)">
-```ts
-import { defineEntity, field } from "@nexload-sdk/payload-schema";
-import { payloadFields } from "@nexload-sdk/payload-schema/payload";
-import { z } from "zod";
-
-// Define intrinsic fields once: Payload collection fields + reusable Zod schemas
-export const product = defineEntity({
-  name: "Product",
-  fields: {
-    title: field.text({ required: true, trim: true, minLength: 3 }),
-    slug: field.slug({ required: true }),
-    price: field.money({ currency: "USD", required: true }),
-    stock: field.number({ integer: true, safe: true, defaultValue: 0 }),
-  },
-});
-
-// Export to Payload Collection (Node / Payload config only)
-export const Products = { slug: "products", fields: payloadFields(product).all() };
-
-// Derive Next.js / API form schema
-export const createProductDTO = product.schema(({ pick }) =>
-  pick(["title", "slug", "price", "stock"], { optional: "auto" })
-);
-```
-  </TabItem>
-  <TabItem label="Healthcheck Core (Kubernetes / Dokploy)">
-```ts
-import { createHealthManager, memoryCheck, shutdownCheck } from "@nexload-sdk/healthcheck";
-
-export const health = createHealthManager({
-  service: { name: "api-service", version: "1.0.0" },
-  checks: [
-    shutdownCheck(),
-    memoryCheck({ heapUsedPercent: 90 }),
-  ],
-});
-
-// Execute non-blocking probe (200 OK / 503 Unhealthy)
-const report = await health.run("readiness");
-console.log(report.status); // "ok" | "degraded" | "unhealthy"
-```
-  </TabItem>
-</Tabs>
-
----
-
-## Two Core Ecosystem Pillars
-
-<CardGrid>
-  <Card title="Observability & Health Engine" icon="shield">
-    Lightweight, runtime-neutral health orchestration. Multi-scope probes (`liveness`, `readiness`, `startup`, `diagnostics`), cgroup v1/v2 container limits, Next.js App Router zero-cache route handlers, Prometheus text exposition, and OpenTelemetry semantic attributes.
-    <div style="margin-top: 1rem;">
-      <a href="/nexload-sdk/packages/healthcheck/core/">Explore Healthcheck Core →</a>
-    </div>
-  </Card>
-
-  <Card title="Payload CMS Superpowers" icon="puzzle">
-    Deterministic, enterprise extensions for Payload CMS 3. Managed Unicode slugs with lock protection, Jalali (Persian Solar) datepickers, minor-unit money arithmetic, declarative Lexical presets, dual Zod-to-Payload schema derivation, and type-safe RPC operations.
-    <div style="margin-top: 1rem;">
-      <a href="/nexload-sdk/start/payload-packages/">Explore Payload Suite →</a>
-    </div>
-  </Card>
-</CardGrid>
-
----
-
-## Healthcheck Packages
-
-<PackageGrid
-  entries={packageCatalog.filter((entry) => entry.family === "healthcheck")}
-/>
-
----
-
-## Payload CMS Packages
-
-<PackageGrid
-  entries={packageCatalog.filter((entry) => entry.family === "payload")}
-/>
+[Install a skill](/nexload-sdk/agents/install/) and open the agent guide for the package you use.
````

`apps/docs/src/content/docs/start/choose-a-package.mdx`

```diff
--- a/apps/docs/src/content/docs/start/choose-a-package.mdx
+++ b/apps/docs/src/content/docs/start/choose-a-package.mdx
@@ -1,5 +1,5 @@
 ---
-title: "Choose a Package: Interactive Decision Guide"
-description: Match a structured logging, service health, or Payload CMS task to a Nexload SDK package.
+title: Choose a package by task
+description: Match a storefront, CMS, service or tooling problem to its smallest SDK dependency.
 sidebar:
   order: 2
@@ -7,34 +7,40 @@
 ---
 
-## Core Primitives
+## Localize a storefront
 
-| You need to… | Install |
+| I want to… | Start here |
 | --- | --- |
-| record structured events and correlate requests across services | [`@nexload-sdk/logger`](/nexload-sdk/packages/logger/) |
+| Normalize Persian digits and display a price | [`@nexload-sdk/persian`](/nexload-sdk/packages/persian/) |
+| Edit Jalali dates, slugs and prices in Payload Admin | [`@nexload-sdk/payload-fields`](/nexload-sdk/packages/payload-fields/) |
+| Configure a Persian Payload admin | [`@nexload-sdk/payload-preset`](/nexload-sdk/packages/payload-preset/) |
 
-## Healthcheck packages
+## Model and operate a CMS
 
-| You need to…                                                  | Install                                                                                |
-| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
-| define checks, collectors, scopes, reports, and serialization | [`@nexload-sdk/healthcheck`](/nexload-sdk/packages/healthcheck/core/)                  |
-| inspect Node processes, cgroups, TCP, or DNS                  | [`@nexload-sdk/healthcheck-node`](/nexload-sdk/packages/healthcheck/node/)             |
-| identify Bun and observe a `Bun.serve` server                 | [`@nexload-sdk/healthcheck-bun`](/nexload-sdk/packages/healthcheck/bun/)               |
-| expose Next.js App Router health or metrics handlers          | [`@nexload-sdk/healthcheck-next`](/nexload-sdk/packages/healthcheck/next/)             |
-| render Prometheus or OpenMetrics text                         | [`@nexload-sdk/healthcheck-prometheus`](/nexload-sdk/packages/healthcheck/prometheus/) |
-| convert reports into OpenTelemetry-friendly records           | [`@nexload-sdk/healthcheck-otel`](/nexload-sdk/packages/healthcheck/otel/)             |
-| include a small Payload Local API query in readiness          | [`@nexload-sdk/healthcheck-payload`](/nexload-sdk/packages/healthcheck/payload/)       |
+| I want to… | Start here |
+| --- | --- |
+| Share product validation between a form and Payload | [`@nexload-sdk/payload-schema`](/nexload-sdk/packages/payload-schema/) |
+| Configure a Lexical article editor | [`@nexload-sdk/payload-editor`](/nexload-sdk/packages/payload-editor/) |
+| Audit writes to an explicit collection | [`@nexload-sdk/payload-hooks`](/nexload-sdk/packages/payload-hooks/) |
+| Call a typed CMS operation | [`@nexload-sdk/payload-operations`](/nexload-sdk/packages/payload-operations/) |
 
-Node probes do not create an HTTP endpoint. Use your framework or the Next.js package for route handlers. Prometheus and OpenTelemetry are separate integrations; install only the output format you use.
+## Observe a service
 
-## Payload packages
+| I want to… | Start here |
+| --- | --- |
+| Correlate a request with its log events | [`@nexload-sdk/logger`](/nexload-sdk/packages/logger/) |
+| Decide when a shop can accept traffic | [`@nexload-sdk/healthcheck`](/nexload-sdk/packages/healthcheck/core/) |
+| Inspect Node processes and container limits | [`@nexload-sdk/healthcheck-node`](/nexload-sdk/packages/healthcheck/node/) |
+| Inspect a Bun server | [`@nexload-sdk/healthcheck-bun`](/nexload-sdk/packages/healthcheck/bun/) |
+| Expose health routes in Next.js | [`@nexload-sdk/healthcheck-next`](/nexload-sdk/packages/healthcheck/next/) |
+| Check that Payload can read a collection | [`@nexload-sdk/healthcheck-payload`](/nexload-sdk/packages/healthcheck/payload/) |
+| Scrape health metrics as text | [`@nexload-sdk/healthcheck-prometheus`](/nexload-sdk/packages/healthcheck/prometheus/) |
+| Convert a report into OpenTelemetry records | [`@nexload-sdk/healthcheck-otel`](/nexload-sdk/packages/healthcheck/otel/) |
 
-| You need to…                                                              | Install                                                                        |
-| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
-| add managed slugs, Jalali date UI, or integer minor-unit money fields     | [`@nexload-sdk/payload-fields`](/nexload-sdk/packages/payload-fields/)         |
-| compile semantic editor intent into Payload Lexical features              | [`@nexload-sdk/payload-editor`](/nexload-sdk/packages/payload-editor/)         |
-| share canonical field validation between Payload and Zod contracts        | [`@nexload-sdk/payload-schema`](/nexload-sdk/packages/payload-schema/)         |
-| expose typed contract-first custom operations through Payload and its SDK | [`@nexload-sdk/payload-operations`](/nexload-sdk/packages/payload-operations/) |
+## Set up project tooling
 
-Read [Choose a Payload package](/nexload-sdk/start/payload-packages/) when two of these packages appear to overlap.
+| I want to… | Start here |
+| --- | --- |
+| Choose a TypeScript compiler preset | [`@nexload-sdk/typescript-config`](/nexload-sdk/packages/typescript-config/) |
+| Configure ESLint for the project runtime | [`@nexload-sdk/eslint-config`](/nexload-sdk/packages/eslint-config/) |
 
-Build a Payload CMS project with these packages using the [e-commerce stack recipe](/nexload-sdk/start/recipes/ecommerce-stack/).
+[Compose the e-commerce stack](/nexload-sdk/start/recipes/ecommerce-stack/).
```

`apps/docs/astro.config.mjs`

```diff
--- a/apps/docs/astro.config.mjs
+++ b/apps/docs/astro.config.mjs
@@ -146,8 +146,8 @@
       sidebar: [
         {
-          label: "Getting Started",
-          items: [
+          label: "Start with a task",
+          items: [
+            { label: "Choose a package by task", slug: "start/choose-a-package" },
             { label: "Introduction", slug: "start/introduction" },
-            { label: "Choose a Package", slug: "start/choose-a-package" },
             { label: "Installation", slug: "start/installation" },
             { label: "E-commerce Stack", slug: "start/recipes/ecommerce-stack" },
```

`apps/docs/src/content/docs/start/introduction.mdx`

```diff
--- a/apps/docs/src/content/docs/start/introduction.mdx
+++ b/apps/docs/src/content/docs/start/introduction.mdx
@@ -20,7 +20,7 @@
 ## Documentation policy
 
-- The site covers exactly eleven current, stable packages.
+- The catalog covers runtime packages and shared tooling presets.
 - Versions and peer ranges come from the live workspace manifests.
-- The shown versions are released on npm.
+- Examples follow workspace source. Pending Changesets can describe APIs ahead of npm.
 - Historical versioned pages are not hosted.
 - Package changelogs and migration pages own upgrade guidance.
```

`apps/docs/src/content/docs/packages/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/index.mdx
+++ b/apps/docs/src/content/docs/packages/index.mdx
@@ -10,5 +10,5 @@
 import { packageCatalog } from "../../../lib/package-catalog";
 
-This site documents stable Nexload SDK packages. Each package has its own installation, quick start, concepts, guides, API inventory, examples, troubleshooting, migration, and compatibility path.
+Start with a package overview for installation and first use. Follow its guides for examples and configuration.
 
 ## Core Primitives
@@ -44,3 +44,3 @@
 ## Documentation policy
 
-The site describes the current released version shown on each package page. Historical versioned pages are not hosted. Use each package changelog and migration page when upgrading.
+Versions come from workspace manifests. Check pending Changesets before using an example with a registry release.
```

`apps/docs/src/content/docs/start/installation.mdx`

```diff
--- a/apps/docs/src/content/docs/start/installation.mdx
+++ b/apps/docs/src/content/docs/start/installation.mdx
@@ -8,5 +8,5 @@
 ## Package managers
 
-Install packages with pnpm, npm, yarn, or Bun. Each package overview provides commands for all four. Install required peers in your application; optional peers are needed only for the integration that uses them.
+Install packages with pnpm, npm, yarn, or Bun. Unreleased packages require a local consumer in the SDK workspace. Install required peers in your application; optional peers are needed only for the integration that uses them.
 
 ## Module formats and peer dependencies
```

`apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx`

````diff
--- a/apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx
+++ b/apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx
@@ -6,6 +6,8 @@
 This example connects one Payload CMS project to SDK logging, field factories, a readiness check, and Persian money formatting. Configure a Payload database adapter, secret, and auth collection for your deployment.
 
+Run this command inside a consumer project in the SDK workspace. The recipe uses unreleased packages and pending APIs.
+
 ```bash
-pnpm add @nexload-sdk/logger @nexload-sdk/healthcheck @nexload-sdk/healthcheck-payload @nexload-sdk/payload-preset @nexload-sdk/payload-fields @nexload-sdk/persian payload @payloadcms/translations react react-dom
+pnpm add '@nexload-sdk/logger@workspace:*' '@nexload-sdk/healthcheck@workspace:*' '@nexload-sdk/healthcheck-payload@workspace:*' '@nexload-sdk/payload-preset@workspace:*' '@nexload-sdk/payload-fields@workspace:*' '@nexload-sdk/persian@workspace:*' payload @payloadcms/translations react react-dom
 ```
````

`apps/docs/src/content/docs/packages/persian/index.mdx`

````diff
--- a/apps/docs/src/content/docs/packages/persian/index.mdx
+++ b/apps/docs/src/content/docs/packages/persian/index.mdx
@@ -9,5 +9,4 @@
 ---
 
-import InstallTabs from "../../../../components/docs/InstallTabs.astro";
 import PackageHero from "../../../../components/docs/PackageHero.astro";
 import { packageByName } from "../../../../lib/package-catalog";
@@ -29,5 +28,9 @@
 ## Installation
 
-<InstallTabs packages="@nexload-sdk/persian" />
+This package is unreleased. From a consumer in this SDK workspace:
+
+```bash
+pnpm add '@nexload-sdk/persian@workspace:*'
+```
 
 For the optional `./zod` subpath, install `zod` separately.
````

`apps/docs/src/content/docs/packages/payload-preset/index.mdx`

````diff
--- a/apps/docs/src/content/docs/packages/payload-preset/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-preset/index.mdx
@@ -9,5 +9,4 @@
 ---
 
-import InstallTabs from "../../../../components/docs/InstallTabs.astro";
 import PackageHero from "../../../../components/docs/PackageHero.astro";
 import { packageByName } from "../../../../lib/package-catalog";
@@ -17,9 +16,12 @@
 `nexloadPreset()` composes Persian admin defaults, the SDK logger bridge, field hooks, and collection audit logging. It is ESM only and runs in Node.js Payload configuration.
 
-**Upcoming release:** this page documents `@nexload-sdk/payload-preset` 1.0.0, which ships with the next Changesets release and is not on npm yet.
 
 ## Installation
 
-<InstallTabs packages="@nexload-sdk/payload-preset @nexload-sdk/logger payload @payloadcms/translations" />
+This package is unreleased. From a consumer in this SDK workspace:
+
+```bash
+pnpm add '@nexload-sdk/payload-preset@workspace:*' '@nexload-sdk/logger@workspace:*' payload @payloadcms/translations
+```
 
 ## Quick Start
@@ -38,3 +40,2 @@
 
 Configure the logger before `buildConfig()`. Define collections explicitly, including the auth collection. See [guides](./guides/) and the [API reference](./api/).
-
````

`apps/docs/src/components/docs/PackageHero.astro`

```astro
---
import loggerManifest from "../../../../../packages/logger/package.json";

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { Badge, LinkButton } from "@astrojs/starlight/components";

import DocsStatus from "./DocsStatus.astro";

import type { PackageCatalogEntry } from "../../lib/package-catalog";
import { packageCatalog } from "../../lib/package-catalog";
import { withBase } from "../../lib/paths";

interface Props {
  entry: PackageCatalogEntry;
  eyebrow?: string;
}

const { entry, eyebrow = "Nexload SDK package" } = Astro.props;
const { manifest } = entry;
const npmUrl = `https://www.npmjs.com/package/${manifest.name}`;
const repositoryUrl = loggerManifest.repository.url.replace(/\.git$/, "");
const sourceUrl = `${repositoryUrl}/tree/main/${entry.sourcePath}`;
// Locate the workspace root from the build cwd so the check works from the repo root or apps/docs.
function findWorkspaceRoot(start: string): string | undefined {
  for (let directory = start; ; directory = dirname(directory)) {
    if (existsSync(resolve(directory, "pnpm-workspace.yaml"))) return directory;
    if (dirname(directory) === directory) return undefined;
  }
}
const workspaceRoot = findWorkspaceRoot(process.cwd());
const hasChangelog = workspaceRoot !== undefined
  && existsSync(resolve(workspaceRoot, entry.sourcePath, "CHANGELOG.md"));
const dependencyNames = new Set(Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }));
const dependencies = packageCatalog.filter((candidate) => dependencyNames.has(candidate.manifest.name));
const siblings = packageCatalog.filter((candidate) => candidate.family === entry.family);
---

<header class="package-hero">
  <p class="package-hero__eyebrow">{eyebrow}</p>
  <div class="package-hero__title-row">
    <h2>{manifest.name}</h2>
    <Badge text={`v${manifest.version}`} />

    <DocsStatus status={manifest.version === "0.0.0" ? "upcoming" : entry.releaseStatus} />
  </div>
  <p>{manifest.description}</p>
  <p>Examples follow workspace source. Check pending Changesets against your installed version.</p>
  <div class="package-hero__badges" aria-label="Runtime compatibility">
    {entry.runtimes.map((runtime) => <Badge text={runtime} />)}
  </div>
  <div class="package-hero__actions">
    {manifest.version !== "0.0.0" && <LinkButton href={npmUrl} variant="primary" icon="external">View on npm</LinkButton>}
    <LinkButton href={sourceUrl} variant="secondary" icon="github">Browse source</LinkButton>
    {hasChangelog && <LinkButton href={`${sourceUrl.replace("/tree/", "/blob/")}/CHANGELOG.md`} variant="secondary" icon="document">Changelog</LinkButton>}
  </div>
  {dependencies.length > 0 && <p><strong>SDK dependencies:</strong> {dependencies.map((dependency, index) => <>{index > 0 && ", "}<a href={withBase(dependency.docsPath)}>{dependency.manifest.name}</a></>)}</p>}
  <nav class="package-hero__switcher" aria-label={`${entry.family} package documentation`}>
    <strong>Related packages:</strong>
    {siblings.map((candidate) => candidate.id === entry.id
      ? <span aria-current="page">{candidate.label}</span>
      : <a href={withBase(candidate.docsPath)}>{candidate.label}</a>)}
  </nav>
</header>
```

`apps/docs/src/components/docs/PackageGrid.astro`

```astro
---
import { CardGrid } from "@astrojs/starlight/components";

import DocsStatus from "./DocsStatus.astro";

import type { PackageCatalogEntry } from "../../lib/package-catalog";
import { withBase } from "../../lib/paths";

interface Props {
  entries: readonly PackageCatalogEntry[];
}

const { entries } = Astro.props;
---

<CardGrid>
  {entries.map((entry) => (
    <a class="package-grid__documented" href={withBase(entry.docsPath)}>
      <h3>{entry.label}</h3>
      <p>{entry.manifest.description}</p>
      <p><code>{entry.manifest.name}</code></p>
      <DocsStatus status={entry.manifest.version === "0.0.0" ? "upcoming" : entry.releaseStatus} />
    </a>
  ))}
</CardGrid>
```

`apps/docs/scripts/generate-markdown.mjs`

```diff
--- a/apps/docs/scripts/generate-markdown.mjs
+++ b/apps/docs/scripts/generate-markdown.mjs
@@ -134,7 +134,7 @@
   return [
     `**Package:** \`${entry.name}\``,
-    `**Current released version:** \`${entry.version}\``,
+    `**Workspace version:** \`${entry.version}\`${entry.version === "0.0.0" ? " (unreleased)" : ""}`,
     entry.description ?? "",
-    `[npm](https://www.npmjs.com/package/${entry.name}) · [Source](https://github.com/gecut/nexload-sdk/tree/main/${entry.sourcePath})`,
+    `${entry.version === "0.0.0" ? "" : `[npm](https://www.npmjs.com/package/${entry.name}) · `}[Source](https://github.com/gecut/nexload-sdk/tree/main/${entry.sourcePath})`,
   ].join("\n\n");
 }
@@ -156,7 +156,8 @@
       ? "payload"
       : undefined;
-  const entries = apiPackages.filter(
+  const tooling = source.includes('family === "tooling"');
+  const entries = Object.values(packageMetadata).filter(
     (entry) =>
-      !family ||
+      tooling ? ["typescript-config", "eslint-config"].includes(entry.id) : !family ||
       (family === "healthcheck"
         ? entry.id.startsWith("healthcheck")
@@ -167,5 +168,5 @@
       const metadata = packageMetadata[entry.id];
       const route = `/packages/${packageRouteDir(entry.id)}/`;
-      return `- [${entry.name}](${route}) — ${metadata.description ?? ""} (v${metadata.version})`;
+      return `- [${entry.name}](${docsBase}${route}) — ${metadata.description ?? ""} (v${metadata.version}${metadata.version === "0.0.0" ? ", unreleased" : ""})`;
     })
     .join("\n");
```

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/discovery.test.mjs tests/contracts.test.mjs)`. Expected zero failing tests.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/src/content/docs/index.mdx \
  apps/docs/src/content/docs/start/choose-a-package.mdx \
  apps/docs/astro.config.mjs \
  apps/docs/src/content/docs/start/introduction.mdx \
  apps/docs/src/content/docs/packages/index.mdx \
  apps/docs/src/content/docs/start/installation.mdx \
  apps/docs/src/content/docs/start/recipes/ecommerce-stack.mdx \
  apps/docs/src/content/docs/packages/persian/index.mdx \
  apps/docs/src/content/docs/packages/payload-preset/index.mdx \
  apps/docs/src/components/docs/PackageHero.astro \
  apps/docs/src/components/docs/PackageGrid.astro \
  apps/docs/scripts/generate-markdown.mjs \
  apps/docs/tests/contracts.test.mjs \
  apps/docs/tests/discovery.test.mjs \
  apps/docs/public
git diff --cached --stat
git commit -m "docs: lead with storefront tasks and identify workspace releases"
```

### Task 2: Source-backed optimization pages

**Files:** `apps/docs/src/content.config.ts`, `apps/docs/src/content/docs/packages/logger/optimization.mdx`, `apps/docs/src/content/docs/packages/logger/index.mdx`, `apps/docs/src/content/docs/packages/persian/optimization.mdx`, `apps/docs/src/content/docs/packages/persian/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/core/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/node/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/bun/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/next/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/payload/optimization.mdx`, `apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`, `apps/docs/src/content/docs/packages/payload-editor/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-editor/index.mdx`, `apps/docs/src/content/docs/packages/payload-fields/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-fields/index.mdx`, `apps/docs/src/content/docs/packages/payload-schema/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-schema/index.mdx`, `apps/docs/src/content/docs/packages/payload-operations/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-operations/index.mdx`, `apps/docs/src/content/docs/packages/payload-hooks/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-hooks/index.mdx`, `apps/docs/src/content/docs/packages/payload-preset/optimization.mdx`, `apps/docs/src/content/docs/packages/payload-preset/index.mdx`, `apps/docs/src/content/docs/packages/eslint-config/optimization.mdx`, `apps/docs/src/content/docs/packages/eslint-config/index.mdx`, `apps/docs/src/content/docs/packages/typescript-config/optimization.mdx`, `apps/docs/src/content/docs/packages/typescript-config/index.mdx`, `apps/docs/tests/optimization.test.mjs`.

**Interfaces:**

- Consumes Package README Caveats, Runtime and Configuration sections, plus the linked implementation. Tooling uses its shipped configuration.
- Produces Seventeen optimization pages, ordered fourth in package navigation.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/optimization.test.mjs`

```mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

test("every package links to source-backed production choices", () => {
  const sources = [...Object.values(catalog), ...["typescript-config", "eslint-config"].map(id => ({ sourcePath: `tools/${id}`, id }))];
  for (const { sourcePath, id } of sources) {
    const dir = sourcePath.replace(/^(?:packages|tools)\//, "");
    const read = name => readFileSync(new URL(`../src/content/docs/packages/${dir}/${name}.mdx`, import.meta.url), "utf8");
    const page = read("optimization");
    assert.ok(page.includes(`package: ${id}\n`));
    assert.ok(page.includes("topic: optimization"));
    assert.ok(page.includes(`/main/${sourcePath}/README.md`));
    assert.ok(page.split("\n## ").length >= 4);
    assert.ok(read("index").includes("./optimization/"));
  }
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/optimization.test.mjs)`. Expected nonzero exit for missing optimization.mdx. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/src/content.config.ts`

```diff
--- a/apps/docs/src/content.config.ts
+++ b/apps/docs/src/content.config.ts
@@ -39,4 +39,6 @@
             "concepts",
             "guides",
+            "optimization",
+            "playground",
             "api",
             "examples",
```

`apps/docs/src/content/docs/packages/logger/optimization.mdx`

```mdx
---
title: "logger — Optimization"
description: "Production choices for @nexload-sdk/logger."
sidebar:
  label: "Optimization"
  order: 4
package: logger
topic: optimization
---

## Extend redaction for deeper objects

Default redaction covers keys at the top level and one level below it. Add explicit paths for sensitive fields deeper in the object.

## Configure once

Call `configureLogger()` at startup. A subsequent call without `force: true` keeps the existing configuration.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/index.ts).
```

`apps/docs/src/content/docs/packages/logger/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/logger/index.mdx
+++ b/apps/docs/src/content/docs/packages/logger/index.mdx
@@ -69,2 +69,6 @@
 - Explore [Production Guides & Recipes](./guides/) for Next.js startup, trace propagation, redaction, and migration.
 - Check the [API Reference & Compatibility](./api/) for the root and testing exports.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/persian/optimization.mdx`

```mdx
---
title: "persian — Optimization"
description: "Production choices for @nexload-sdk/persian."
sidebar:
  label: "Optimization"
  order: 4
package: persian
topic: optimization
---

## Keep currency units explicit

Use integer amounts and specify IRR or IRT. `parseMoney` rejects decimal strings and unsafe integers.

## Check the calendar boundary

Supported Jalali years run from 1 to 3176. Conversion functions can throw a RangeError outside this range.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/persian/src/index.ts).
```

`apps/docs/src/content/docs/packages/persian/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/persian/index.mdx
+++ b/apps/docs/src/content/docs/packages/persian/index.mdx
@@ -53,2 +53,6 @@
 
 See [guides](./guides/) and the [API inventory](./api/).
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/core/optimization.mdx`

```mdx
---
title: "healthcheck — Optimization"
description: "Production choices for @nexload-sdk/healthcheck."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck
topic: optimization
---

## Reserve liveness for the process

Keep database, cache and remote HTTP checks in readiness when dependency outages should stop traffic without restarting the process.

## Protect diagnostics

Expose a minimal public probe. Restrict detailed reports and metrics to authorized callers.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
@@ -114,2 +114,6 @@
 - Explore [Production Guides & Custom Checks](./guides/) for database checks, timeout policies, and status aggregation rules.
 - View the complete [API Reference & Signatures](./api/) for all exported symbols and configuration types.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/node/optimization.mdx`

```mdx
---
title: "healthcheck-node — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-node."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-node
topic: optimization
---

## Restrict container details

Use private or authenticated endpoints for process metrics and container resources. Reports can include process identifiers and cgroup paths.

## Check deployment platform

Use container limits only where the platform supplies the required cgroup data.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/node/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/node/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/node/index.mdx
@@ -73,2 +73,6 @@
 - Explore [Production Guides & Container Recipes](./guides/) for Docker limits, TCP checks, and troubleshooting.
 - Check the [API Reference & Signatures](./api/) for all exported checks and adapters.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/bun/optimization.mdx`

```mdx
---
title: "healthcheck-bun — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-bun."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-bun
topic: optimization
---

## Interpret missing memory limits

The Bun adapter reads process memory when available and returns null for container limits. The memory check reports degraded with this adapter.

## Restrict diagnostic routes

Protect endpoints that expose Bun runtime and server metrics.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx
@@ -63,2 +63,6 @@
 - Explore [Production Guides & Server Recipes](./guides/) for Bun HTTP servers, WebSocket counters, and troubleshooting.
 - Check the [API Reference & Signatures](./api/) for all exported checks and adapters.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/next/optimization.mdx`

```mdx
---
title: "healthcheck-next — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-next."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-next
topic: optimization
---

## Trust a controlled proxy

IP and CIDR filtering support IPv4 and require trustProxy. Enable it only when the reverse proxy strips and sets the configured header.

## Choose one authorization scheme

Select bearer token or basic authentication per route. Both use the Authorization header.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/next/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/next/index.mdx
@@ -69,2 +69,6 @@
 - Explore [Production Guides & Route Recipes](./guides/) for liveness vs readiness routes, proxy authorization, and troubleshooting.
 - Check the [API Reference & Signatures](./api/) for all exported route creators and options.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/prometheus/optimization.mdx`

```mdx
---
title: "healthcheck-prometheus — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-prometheus."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-prometheus
topic: optimization
---

## Use supported labels

Use low-cardinality labels from the exporter allowlist. Unsupported labels are dropped.

## Export collector metrics

Use a metric collector for custom series. Metrics attached to individual checks stay in the JSON report.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
@@ -57,2 +57,6 @@
 - Explore [Production Guides & Scraping Setup](./guides/) for metric names, label conventions, and scraping routes.
 - Check the [API Reference & Signatures](./api/) for exporter configuration options.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/otel/optimization.mdx`

```mdx
---
title: "healthcheck-otel — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-otel."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-otel
topic: optimization
---

## Bound attribute cardinality

Keep user IDs, request IDs and raw error text out of collector labels. These labels become metric attributes.

## Publish custom values through collectors

Read exported values from report.metrics. Check-local metrics stay in the JSON report.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/otel/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
@@ -55,2 +55,6 @@
 - Explore [Production Guides & OTel Recipes](./guides/) for span attachment and telemetry conventions.
 - Check the [API Reference & Signatures](./api/) for exporter options.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/healthcheck/payload/optimization.mdx`

```mdx
---
title: "healthcheck-payload — Optimization"
description: "Production choices for @nexload-sdk/healthcheck-payload."
sidebar:
  label: "Optimization"
  order: 4
package: healthcheck-payload
topic: optimization
---

## Bound readiness query cost

Choose a small collection, use depth zero and supply a narrow where clause for frequent polls.

## Interpret probe failures

The Payload query check is critical for readiness and noncritical for diagnostics. A failed query reports PAYLOAD_QUERY_FAILED.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts).
```

`apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx
@@ -62,2 +62,6 @@
 - Explore [Production Guides & Queries](./guides/) for collection verification, timeout tuning, and troubleshooting.
 - Check the [API Reference & Signatures](./api/) for check configuration options.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-editor/optimization.mdx`

```mdx
---
title: "payload-editor — Optimization"
description: "Production choices for @nexload-sdk/payload-editor."
sidebar:
  label: "Optimization"
  order: 4
package: payload-editor
topic: optimization
---

## Replace managed features explicitly

Disable a managed feature before adding its native replacement. Duplicate keys across features and extendFeatures fail during configuration.

## Keep relational depth bounded

Relational preset features default to a maximum depth of one. Account for this when choosing link, upload or relationship features.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-editor/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-editor/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-editor/index.mdx
@@ -94,2 +94,6 @@
 - Explore [Production Guides & Presets](./guides/) for custom organization presets, blocks features, and troubleshooting.
 - Check the [API Reference & Signatures](./api/) for all supported features and options.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-fields/optimization.mdx`

```mdx
---
title: "payload-fields — Optimization"
description: "Production choices for @nexload-sdk/payload-fields."
sidebar:
  label: "Optimization"
  order: 4
package: payload-fields
topic: optimization
---

## Normalize strings before field hooks

Install payloadFieldsPlugin() when REST or Local API callers send money values as strings. It normalizes Persian digits and separators before Payload parses number fields.

## Send integers from numeric clients

Pass minor-unit integers when the client already owns numeric conversion.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-fields/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-fields/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-fields/index.mdx
@@ -149,2 +149,6 @@
 
 The field factories use [Persian utilities](/nexload-sdk/packages/persian/) for shared normalization and validation.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-schema/optimization.mdx`

```mdx
---
title: "payload-schema — Optimization"
description: "Production choices for @nexload-sdk/payload-schema."
sidebar:
  label: "Optimization"
  order: 4
package: payload-schema
topic: optimization
---

## Choose optionality for projections

A plain pick(keys) makes all picked keys required. Set the optional option when the projection should respect optional fields.

## Preserve block metadata

Reserve id, blockName and blockType in block definitions. Reusing those names throws INVALID_FIELD_CONFIGURATION.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-schema/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-schema/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-schema/index.mdx
@@ -159,2 +159,6 @@
 - Explore [Production Recipes & Modeling Guides](./guides/) for the full 15-field catalog, polymorphic relationships, static vs dynamic defaults, error diagnostics, and the 3.0 migration guide.
 - View the complete [API Reference & Field Catalog](./api/) for all factory options and signatures.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-operations/optimization.mdx`

```mdx
---
title: "payload-operations — Optimization"
description: "Production choices for @nexload-sdk/payload-operations."
sidebar:
  label: "Optimization"
  order: 4
package: payload-operations
topic: optimization
---

## Keep outputs encodable

Use a codec or overwrite for output and declared error data that need conversion. A one-way transform cannot be encoded by the server.

## Preserve access control

Pass overrideAccess: false and req when a handler calls a Payload Local API on behalf of the caller.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-operations/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-operations/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-operations/index.mdx
@@ -247,2 +247,6 @@
 - Explore [Production Guides & Recipes](./guides/) for multi-resource trees, plugins, transactions, and Next.js Server Actions.
 - View the complete [API Reference & Signatures](./api/) for all exported types and functions.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-hooks/optimization.mdx`

```mdx
---
title: "payload-hooks — Optimization"
description: "Production choices for @nexload-sdk/payload-hooks."
sidebar:
  label: "Optimization"
  order: 4
package: payload-hooks
topic: optimization
---

## Declare the auth collection

Declare an auth collection in the config to include it in auditing. Payload creates its implicit users collection after plugins run.

## Interpret write events in context

Write events from afterChange and afterDelete run before the database transaction commits.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-hooks/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-hooks/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-hooks/index.mdx
@@ -33,2 +33,6 @@
 Reads are off by default; auth is on for auth collections. See [guides](./guides/) for event names, options, and transaction caveats. Payload `>=3.85.0 <4.0.0` is a peer dependency; the hooks run in Node.js Payload configuration.
 
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/payload-preset/optimization.mdx`

```mdx
---
title: "payload-preset — Optimization"
description: "Production choices for @nexload-sdk/payload-preset."
sidebar:
  label: "Optimization"
  order: 4
package: payload-preset
topic: optimization
---

## Initialize logging first

Call configureLogger() before buildConfig(). Supply a destination when Payload should use the configured output stream.

## Choose plugin ownership

Disable a preset option when the project registers the corresponding plugin itself.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/index.ts).
```

`apps/docs/src/content/docs/packages/payload-preset/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-preset/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-preset/index.mdx
@@ -40,2 +40,6 @@
 
 Configure the logger before `buildConfig()`. Define collections explicitly, including the auth collection. See [guides](./guides/) and the [API reference](./api/).
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/eslint-config/optimization.mdx`

```mdx
---
title: "eslint-config — Optimization"
description: "Production choices for @nexload-sdk/eslint-config."
sidebar:
  label: "Optimization"
  order: 4
package: eslint-config
topic: optimization
---

## Choose the runtime preset

Use nexloadConfig with the options for the project runtime. Compose exported presets when explicit ordering is needed.

## Keep type-aware linting enabled

Use the shared base rules for type-aware checks and inline type imports.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/tools/eslint-config/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/tools/eslint-config/src/index.ts).
```

`apps/docs/src/content/docs/packages/eslint-config/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/eslint-config/index.mdx
+++ b/apps/docs/src/content/docs/packages/eslint-config/index.mdx
@@ -84,2 +84,6 @@
 
 Peer requirements: `eslint >= 9.0.0`, `typescript >= 5.0.0`.
+
+## Next steps
+
+[Optimization](./optimization/)
```

`apps/docs/src/content/docs/packages/typescript-config/optimization.mdx`

```mdx
---
title: "typescript-config — Optimization"
description: "Production choices for @nexload-sdk/typescript-config."
sidebar:
  label: "Optimization"
  order: 4
package: typescript-config
topic: optimization
---

## Extend the runtime preset

Extend node.json for a backend package, react.json for a React library or next.json for a Next.js app.

## Retain checked indexed access

Inherit strict and noUncheckedIndexedAccess from base.json when customizing project includes and output paths.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/tools/typescript-config/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/tools/typescript-config/base.json).
```

`apps/docs/src/content/docs/packages/typescript-config/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/typescript-config/index.mdx
+++ b/apps/docs/src/content/docs/packages/typescript-config/index.mdx
@@ -68,2 +68,6 @@
 
 Peer requirement: `typescript >= 5.0.0`.
+
+## Next steps
+
+[Optimization](./optimization/)
```

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/optimization.test.mjs)`. Expected zero failing tests.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/src/content.config.ts \
  apps/docs/src/content/docs/packages/logger/optimization.mdx \
  apps/docs/src/content/docs/packages/logger/index.mdx \
  apps/docs/src/content/docs/packages/persian/optimization.mdx \
  apps/docs/src/content/docs/packages/persian/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/core/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/core/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/node/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/node/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/bun/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/next/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/next/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/payload/optimization.mdx \
  apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx \
  apps/docs/src/content/docs/packages/payload-editor/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-editor/index.mdx \
  apps/docs/src/content/docs/packages/payload-fields/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-fields/index.mdx \
  apps/docs/src/content/docs/packages/payload-schema/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-schema/index.mdx \
  apps/docs/src/content/docs/packages/payload-operations/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-operations/index.mdx \
  apps/docs/src/content/docs/packages/payload-hooks/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-hooks/index.mdx \
  apps/docs/src/content/docs/packages/payload-preset/optimization.mdx \
  apps/docs/src/content/docs/packages/payload-preset/index.mdx \
  apps/docs/src/content/docs/packages/eslint-config/optimization.mdx \
  apps/docs/src/content/docs/packages/eslint-config/index.mdx \
  apps/docs/src/content/docs/packages/typescript-config/optimization.mdx \
  apps/docs/src/content/docs/packages/typescript-config/index.mdx \
  apps/docs/tests/optimization.test.mjs \
  apps/docs/public
git diff --cached --stat
git commit -m "docs: document production choices for every package"
```

### Task 3: Package-specific agent setup

**Files:** `apps/docs/src/content/docs/packages/logger/agents.mdx`, `apps/docs/src/content/docs/packages/logger/index.mdx`, `apps/docs/src/content/docs/packages/persian/agents.mdx`, `apps/docs/src/content/docs/packages/persian/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/core/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/bun/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/node/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/next/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/payload/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/agents.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`, `apps/docs/src/content/docs/packages/payload-fields/agents.mdx`, `apps/docs/src/content/docs/packages/payload-fields/index.mdx`, `apps/docs/src/content/docs/packages/payload-editor/agents.mdx`, `apps/docs/src/content/docs/packages/payload-editor/index.mdx`, `apps/docs/src/content/docs/packages/payload-operations/agents.mdx`, `apps/docs/src/content/docs/packages/payload-operations/index.mdx`, `apps/docs/src/content/docs/packages/payload-schema/agents.mdx`, `apps/docs/src/content/docs/packages/payload-schema/index.mdx`, `apps/docs/src/content/docs/packages/payload-preset/agents.mdx`, `apps/docs/src/content/docs/packages/payload-preset/index.mdx`, `apps/docs/src/content/docs/packages/payload-hooks/agents.mdx`, `apps/docs/src/content/docs/packages/payload-hooks/index.mdx`, `apps/docs/src/content/docs/packages/typescript-config/agents.mdx`, `apps/docs/src/content/docs/packages/typescript-config/index.mdx`, `apps/docs/src/content/docs/packages/eslint-config/agents.mdx`, `apps/docs/src/content/docs/packages/eslint-config/index.mdx`, `apps/docs/tests/agent-pages.test.mjs`, `apps/docs/src/content/docs/agents/index.mdx`.

**Interfaces:**

- Consumes Installed skill names and descriptions from the 36 skill manifests; consumer versus maintainer boundaries.
- Produces Seventeen agent pages with exact trigger text, commands, scoped context and two prompts each.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/agent-pages.test.mjs`

```mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };

test("all agent pages supply scoped context, real skills and prompts", () => {
  for (const path of [...Object.values(catalog).map(x => x.sourcePath), "tools/eslint-config", "tools/typescript-config"]) {
    const route = path.replace(/^(?:packages|tools)\//, "");
    const page = readFileSync(new URL(`../src/content/docs/packages/${route}/agents.mdx`, import.meta.url), "utf8");
    assert.ok(page.includes(`/nexload-sdk/packages/${route}/llms.txt`));
    for (const title of ["Install matching skills", "Project AGENTS.md", "Package context", "Prompts"]) assert.ok(page.includes(`## ${title}`));
    const matches = [...page.matchAll(/blob\/main\/(skills\/[\w/-]+\/SKILL\.md)/g)];
    assert.ok(matches.length > 0);
    for (const [, path] of matches) {
      const skill = readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
      const name = /^name: (.+)$/m.exec(skill)[1];
      assert.ok(page.includes(`npx skills add gecut/nexload-sdk --skill ${name}`));
    }
  }
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/agent-pages.test.mjs)`. Expected nonzero exit for missing agents.mdx. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/src/content/docs/packages/logger/agents.mdx`

````mdx
---
title: "logger — Agent usage"
description: "Configure a coding agent for @nexload-sdk/logger."
sidebar:
  label: "Agent usage"
  order: 5
package: logger
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### logger

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/logger/SKILL.md)

```text
MUST be loaded before writing, changing or reviewing ANY log call, console.* call, catch block, error handling, job/worker, outbound HTTP/provider call, route handler or observability code in a project that uses @nexload-sdk/logger. Decides whether a log is needed, its level, event name and fields, and what must never be logged. Do not use for metrics/health endpoints (use healthcheck skills).
```

```bash
npx skills add gecut/nexload-sdk --skill logger
```

## Project AGENTS.md

```markdown
Before adding, changing or reviewing any log call, console call, catch block, job/worker or outbound call, load the installed logger skill and follow its Decision flow. Use @nexload-sdk/logger for application and package logging. Never use console.* in package or app source.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/logger/llms.txt).

## Prompts

```text
Correlate a request with its log events. Use @nexload-sdk/logger and logger. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/logger integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/logger/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/logger/index.mdx
+++ b/apps/docs/src/content/docs/packages/logger/index.mdx
@@ -73,2 +73,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/persian/agents.mdx`

````mdx
---
title: "persian — Agent usage"
description: "Configure a coding agent for @nexload-sdk/persian."
sidebar:
  label: "Agent usage"
  order: 5
package: persian
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### persian

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/persian/SKILL.md)

```text
Use when a project handles Persian, Farsi, or Iranian input or output, including mobile numbers, کد ملی (national code), postal codes, landlines, card numbers, Sheba/IBAN, Rial/Toman prices, Jalali/Shamsi dates, relative time, Persian digits, ي/ك normalization, slugs, provinces, or Zod validation of these values.
```

```bash
npx skills add gecut/nexload-sdk --skill persian
```

## Project AGENTS.md

```markdown
For @nexload-sdk/persian, load persian when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/persian/llms.txt).

## Prompts

```text
Normalize Persian digits and display a price. Use @nexload-sdk/persian and persian. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/persian integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/persian/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/persian/index.mdx
+++ b/apps/docs/src/content/docs/packages/persian/index.mdx
@@ -57,2 +57,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/core/agents.mdx`

````mdx
---
title: "healthcheck — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/core/SKILL.md)

```text
Use when integrating or changing the runtime-neutral @nexload-sdk/healthcheck manager, scopes, profiles, aggregation, serialization, built-in checks, collectors, retries, timeouts, shutdown lifecycle, or report contracts. Do not use for framework route wiring, exporter formatting, or one custom check in isolation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-core
```

### healthcheck-custom-checks

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/custom-checks/SKILL.md)

```text
Use when implementing or reviewing an individual custom @nexload-sdk/healthcheck check or metric collector, including check-versus-collector choice, AbortSignal propagation, scope criticality, raw metrics, stable errors, timeout and retry safety, side effects, and focused tests. Do not use for manager-only setup or a shipped adapter.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-custom-checks
```

### healthcheck-diagnostics-security

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/diagnostics-security/SKILL.md)

```text
Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-diagnostics-security
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck, load healthcheck-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/core/llms.txt).

## Prompts

```text
Decide when a shop can accept traffic. Use @nexload-sdk/healthcheck and healthcheck-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
@@ -118,2 +118,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/bun/agents.mdx`

````mdx
---
title: "healthcheck-bun — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-bun."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-bun
topic: agents
---

## Install matching skills

Use the shared healthcheck skill for check design. There is no dedicated Bun skill.

### healthcheck-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/core/SKILL.md)

```text
Use when integrating or changing the runtime-neutral @nexload-sdk/healthcheck manager, scopes, profiles, aggregation, serialization, built-in checks, collectors, retries, timeouts, shutdown lifecycle, or report contracts. Do not use for framework route wiring, exporter formatting, or one custom check in isolation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-core
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-bun, load healthcheck-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/bun/llms.txt).

## Prompts

```text
Inspect a Bun server. Use @nexload-sdk/healthcheck-bun and healthcheck-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-bun integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx
@@ -67,2 +67,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/node/agents.mdx`

````mdx
---
title: "healthcheck-node — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-node."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-node
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-container-resources

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/container-resources/SKILL.md)

```text
Use when implementing, debugging, or reviewing @nexload-sdk/healthcheck-node container resource detection and policy across Docker, Kubernetes, Dokploy, Linux cgroup v1/v2, memory and swap limits, CPU quota/cpuset, fractional CPU, source/confidence evidence, readiness thresholds, collector selection, or cgroup test fixtures.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-container-resources
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-node, load healthcheck-container-resources when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/node/llms.txt).

## Prompts

```text
Inspect Node processes and container limits. Use @nexload-sdk/healthcheck-node and healthcheck-container-resources. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-node integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/node/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/node/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/node/index.mdx
@@ -77,2 +77,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/next/agents.mdx`

````mdx
---
title: "healthcheck-next — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-next."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-next
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-nextjs-routes

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/nextjs-routes/SKILL.md)

```text
Use when wiring @nexload-sdk/healthcheck-next into Next.js App Router liveness, readiness, startup, diagnostics, or metrics route modules, including a server-only manager singleton, GET/HEAD behavior, scope and status policy, no-store route constants, response formats, and fail-closed route protection. Do not use for non-Next servers.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-nextjs-routes
```

### healthcheck-diagnostics-security

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/diagnostics-security/SKILL.md)

```text
Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-diagnostics-security
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-next, load healthcheck-nextjs-routes when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/next/llms.txt).

## Prompts

```text
Expose health routes in Next.js. Use @nexload-sdk/healthcheck-next and healthcheck-nextjs-routes. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-next integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/next/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/next/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/next/index.mdx
@@ -73,2 +73,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/payload/agents.mdx`

````mdx
---
title: "healthcheck-payload — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-payload."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-payload
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-payload

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/payload/SKILL.md)

```text
Use when integrating or reviewing @nexload-sdk/healthcheck-payload for Payload CMS dependency readiness, including the deterministic payload.find query contract, small limit and zero depth, optional where filters, expectedMinDocuments and empty-collection semantics, timeout normalization, readiness criticality, failure privacy, and adapter tests.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-payload
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-payload, load healthcheck-payload when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/payload/llms.txt).

## Prompts

```text
Check that Payload can read a collection. Use @nexload-sdk/healthcheck-payload and healthcheck-payload. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-payload integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx
@@ -66,2 +66,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/prometheus/agents.mdx`

````mdx
---
title: "healthcheck-prometheus — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-prometheus."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-prometheus
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-monitoring-exporters

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/monitoring-exporters/SKILL.md)

```text
Use when converting an existing HealthReport with @nexload-sdk/healthcheck-prometheus or @nexload-sdk/healthcheck-otel, including Prometheus/OpenMetrics text, OTel resource attributes and metric records, collector-only export boundaries, prefixes, metric names, HELP descriptions, label allowlists, dropped labels, deterministic output, and cardinality review.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-monitoring-exporters
```

### healthcheck-diagnostics-security

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/diagnostics-security/SKILL.md)

```text
Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-diagnostics-security
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-prometheus, load healthcheck-monitoring-exporters when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/prometheus/llms.txt).

## Prompts

```text
Scrape health metrics as text. Use @nexload-sdk/healthcheck-prometheus and healthcheck-monitoring-exporters. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-prometheus integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
@@ -61,2 +61,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/healthcheck/otel/agents.mdx`

````mdx
---
title: "healthcheck-otel — Agent usage"
description: "Configure a coding agent for @nexload-sdk/healthcheck-otel."
sidebar:
  label: "Agent usage"
  order: 5
package: healthcheck-otel
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### healthcheck-monitoring-exporters

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/monitoring-exporters/SKILL.md)

```text
Use when converting an existing HealthReport with @nexload-sdk/healthcheck-prometheus or @nexload-sdk/healthcheck-otel, including Prometheus/OpenMetrics text, OTel resource attributes and metric records, collector-only export boundaries, prefixes, metric names, HELP descriptions, label allowlists, dropped labels, deterministic output, and cardinality review.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-monitoring-exporters
```

### healthcheck-diagnostics-security

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/diagnostics-security/SKILL.md)

```text
Use when deciding or reviewing public versus private health exposure, diagnostics details, metrics access, JSON redaction, error and stack suppression, bearer or Basic authentication, IPv4/CIDR allowlists, trusted proxy headers, no-store policy, or sensitive and high-cardinality health data. Compose with the route or exporter skill that owns implementation.
```

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-diagnostics-security
```

## Project AGENTS.md

```markdown
For @nexload-sdk/healthcheck-otel, load healthcheck-monitoring-exporters when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/healthcheck/otel/llms.txt).

## Prompts

```text
Convert a report into OpenTelemetry records. Use @nexload-sdk/healthcheck-otel and healthcheck-monitoring-exporters. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/healthcheck-otel integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
@@ -59,2 +59,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-fields/agents.mdx`

````mdx
---
title: "payload-fields — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-fields."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-fields
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### payload-fields-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-fields/core/SKILL.md)

```text
Use when integrating or reviewing the overall @nexload-sdk/payload-fields factory architecture, including options-object compatibility, protected field names/types/components, safe overrides, hook composition, Payload Import Map subpaths, server versus Admin client boundaries, plugin registration decisions, major-version migration, or package-wide validation. Use a specialized sibling for one slug, Jalali, or money contract.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-fields-core
```

### payload-fields-slug

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-fields/slug/SKILL.md)

```text
Use when adding, debugging, migrating, or reviewing @nexload-sdk/payload-fields managed slugs, including the slug/lock tuple and spread usage, Unicode/Persian normalization, lock and localization synchronization, nested source paths, regeneration on source changes, source clearing and manual edits, protected Admin wiring, or registered server-side generator authentication, access, input validation, and final normalization.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-fields-slug
```

### payload-fields-jalali-date

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-fields/jalali-date/SKILL.md)

```text
Use when adding, migrating, debugging, or reviewing @nexload-sdk/payload-fields Jalali date behavior, including native ISO persistence, Persian presentation, display timezone boundaries, dayOnly/dayAndTime/timeOnly/monthOnly picker modes, canonical local noon, Jalali month normalization, null/clear behavior, virtual Jalali timestamps, Admin UI limitations, or date-focused tests.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-fields-jalali-date
```

### payload-fields-money

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-fields/money/SKILL.md)

```text
Use when adding, migrating, debugging, or reviewing @nexload-sdk/payload-fields money behavior, including integer minor-unit persistence and APIs, explicit major-unit parsing, IRR/IRT or custom currency fraction digits, Persian/Arabic numeric input, safe integers and precision, negative policy, min/max bounds, display formatting, consumer validation order, Admin behavior, or money data migration.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-fields-money
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-fields, load payload-fields-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-fields/llms.txt).

## Prompts

```text
Edit Jalali dates, slugs and prices in Payload Admin. Use @nexload-sdk/payload-fields and payload-fields-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-fields integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-fields/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-fields/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-fields/index.mdx
@@ -153,2 +153,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-editor/agents.mdx`

````mdx
---
title: "payload-editor — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-editor."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-editor
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### payload-editor-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/core/SKILL.md)

```text
Use when integrating, changing, or reviewing the @nexload-sdk/payload-editor public interface, semantic feature definitions, merge and error contracts, Payload version compatibility, ESM packaging, or package-wide validation. Use the preset or extensions sibling when that is the primary task.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-core
```

### payload-editor-presets

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/presets/SKILL.md)

```text
Use when selecting, defining, reviewing, or changing @nexload-sdk/payload-editor built-in or custom presets, including feature membership, heading policy, relational depth defaults, override merge behavior, immutability, and SemVer impact.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-presets
```

### payload-editor-extensions

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/extensions/SKILL.md)

```text
Use when adding, replacing, diagnosing, or reviewing native Payload Lexical feature providers through @nexload-sdk/payload-editor extendFeatures, including Blocks, duplicate keys, provider order, dependencies, server/client serialization, and project ownership.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-extensions
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-editor, load payload-editor-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-editor/llms.txt).

## Prompts

```text
Configure a Lexical article editor. Use @nexload-sdk/payload-editor and payload-editor-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-editor integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-editor/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-editor/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-editor/index.mdx
@@ -98,2 +98,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-operations/agents.mdx`

````mdx
---
title: "payload-operations — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-operations."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-operations
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### payload-operations-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-operations/core/SKILL.md)

```text
Use for defining, reviewing, or diagnosing @nexload-sdk/payload-operations contracts, operation trees, Zod codec boundaries, Date handling via z.codec, declared errors, safe results, type inference, public subpaths, and package-wide compatibility. Use the client or server sibling when transport or Payload endpoints are the primary concern.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-operations-core
```

### payload-operations-client

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-operations/client/SKILL.md)

```text
Use for implementing, integrating, reviewing, or diagnosing the @nexload-sdk/payload-operations clients: createOperationsClient from ./client (pure RPC client), createCMSClient from ./cms (PayloadSDK integration), operation calls, base URL and path handling, request headers, transport plugins, timeoutPlugin from ./plugins/timeout, response decoding via z.decodeAsync, and browser-safe client packaging.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-operations-client
```

### payload-operations-server

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-operations/server/SKILL.md)

```text
Use for implementing, integrating, reviewing, or diagnosing @nexload-sdk/payload-operations on Payload: createPayloadEndpoints, complete handler trees, required access.default, request body limits via maxBodyBytes, request parsing, CORS and OPTIONS, declared errors, output encoding via z.encodeAsync, request-scoped Local API use, and server-safe failures.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-operations-server
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-operations, load payload-operations-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-operations/llms.txt).

## Prompts

```text
Call a typed CMS operation. Use @nexload-sdk/payload-operations and payload-operations-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-operations integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-operations/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-operations/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-operations/index.mdx
@@ -251,2 +251,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-schema/agents.mdx`

````mdx
---
title: "payload-schema — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-schema."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-schema
topic: agents
---

## Install matching skills

Use payload-schema-use in consumer projects. Install payload-schema-develop only when maintaining the SDK package.

### payload-schema-use

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-schema/use/SKILL.md)

```text
Use for consumer-side work with @nexload-sdk/payload-schema: defining entities, choosing built-in factories versus field.native, deriving canonical input schemas, compiling fields via payloadFields from @nexload-sdk/payload-schema/payload, integrating compiled fields into collections, handling null semantics and Date objects, or diagnosing normalization and schema-availability failures. Do not use for package internals or generic Payload work.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-schema-use
```

### payload-schema-develop

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-schema/develop/SKILL.md)

```text
Use for internal development or review of @nexload-sdk/payload-schema itself: factories, private field seeds and compilation under /payload, canonical beforeValidate adapter, null semantics, Date normalization, blocks containers, cloning, structured errors, public type inference, package fixtures, packed distribution, browser-safe root verification, compatibility evidence, or release-impact analysis. Do not use for consumer entity migration or generic Payload/Zod work.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-schema-develop
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-schema, load payload-schema-use when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-schema/llms.txt).

## Prompts

```text
Share product validation between a form and Payload. Use @nexload-sdk/payload-schema and payload-schema-use. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-schema integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-schema/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-schema/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-schema/index.mdx
@@ -163,2 +163,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-preset/agents.mdx`

````mdx
---
title: "payload-preset — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-preset."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-preset
topic: agents
---

## Install matching skills

Install the skills whose triggers match the task.

### payload-preset

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-preset/SKILL.md)

```text
Use when configuring or reviewing Payload CMS configuration with @nexload-sdk/payload-preset, composing Persian admin defaults, logger bridge, field hooks, or collection audit logging with auditPlugin. Decides between preset and standalone plugins, validates options and defaults, verifies plugin order and non-interference with collection fields, or migrates from deprecated logOperation. Do not use for field schema definitions (use payload-schema) or single field customizations (use payload-fields).
```

```bash
npx skills add gecut/nexload-sdk --skill payload-preset
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-preset, load payload-preset when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-preset/llms.txt).

## Prompts

```text
Configure a Persian Payload admin. Use @nexload-sdk/payload-preset and payload-preset. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-preset integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-preset/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-preset/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-preset/index.mdx
@@ -44,2 +44,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/payload-hooks/agents.mdx`

````mdx
---
title: "payload-hooks — Agent usage"
description: "Configure a coding agent for @nexload-sdk/payload-hooks."
sidebar:
  label: "Agent usage"
  order: 5
package: payload-hooks
topic: agents
---

## Install matching skills

Use the preset skill for its audit-plugin integration and collection design for Payload boundaries. There is no dedicated hooks skill.

### payload-preset

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-preset/SKILL.md)

```text
Use when configuring or reviewing Payload CMS configuration with @nexload-sdk/payload-preset, composing Persian admin defaults, logger bridge, field hooks, or collection audit logging with auditPlugin. Decides between preset and standalone plugins, validates options and defaults, verifies plugin order and non-interference with collection fields, or migrates from deprecated logOperation. Do not use for field schema definitions (use payload-schema) or single field customizations (use payload-fields).
```

```bash
npx skills add gecut/nexload-sdk --skill payload-preset
```

### payload-collection-design

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload/collection-design/SKILL.md)

```text
Design, name, review, and refactor Payload CMS collections and PostgreSQL-backed data relationships. Use whenever choosing embedded fields versus Globals or collections, modeling cardinality and ownership, defining junction collections, naming resources and fields, selecting indexes and constraints, setting deletion behavior, preserving historical snapshots, or auditing a Payload schema for data-model correctness.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-collection-design
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-hooks, load payload-preset when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-hooks/llms.txt).

## Prompts

```text
Audit writes to an explicit collection. Use @nexload-sdk/payload-hooks and payload-preset. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-hooks integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/payload-hooks/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-hooks/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-hooks/index.mdx
@@ -37,2 +37,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/typescript-config/agents.mdx`

````mdx
---
title: "typescript-config — Agent usage"
description: "Configure a coding agent for @nexload-sdk/typescript-config."
sidebar:
  label: "Agent usage"
  order: 5
package: typescript-config
topic: agents
---

## Install matching skills

These are shared engineering skills.

### nexload-code

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/nexload/code/SKILL.md)

```text
Use when internal TypeScript behavior, refactoring, or repository-wide file naming is the primary task in Nexload: scope discipline, readable functions and modules, type or trust-boundary safety, lifecycle ownership, abstraction value, dependency restraint, internal imports, or honest verification. Route package API compatibility to nexload-package and framework or specialist policy to the owning sibling skill.
```

```bash
npx skills add gecut/nexload-sdk --skill nexload-code
```

### nexload-package

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/nexload/package/SKILL.md)

```text
Use when the primary task changes or evaluates the shipped contract of a publishable Nexload TypeScript package: ownership, public exports and subpaths, entrypoint runtime isolation, core/adapter direction where shared policy exists, metadata, dependencies or peers, packed artifacts, package-scoped compatibility, or README/API alignment. Do not use for internal-only code, React behavior, visual styling, repository-wide runtime standards, or release execution.
```

```bash
npx skills add gecut/nexload-sdk --skill nexload-package
```

## Project AGENTS.md

```markdown
For @nexload-sdk/typescript-config, load nexload-code when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/typescript-config/llms.txt).

## Prompts

```text
Choose a TypeScript compiler preset. Use @nexload-sdk/typescript-config and nexload-code. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/typescript-config integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/typescript-config/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/typescript-config/index.mdx
+++ b/apps/docs/src/content/docs/packages/typescript-config/index.mdx
@@ -72,2 +72,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/packages/eslint-config/agents.mdx`

````mdx
---
title: "eslint-config — Agent usage"
description: "Configure a coding agent for @nexload-sdk/eslint-config."
sidebar:
  label: "Agent usage"
  order: 5
package: eslint-config
topic: agents
---

## Install matching skills

These are shared engineering skills.

### nexload-code

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/nexload/code/SKILL.md)

```text
Use when internal TypeScript behavior, refactoring, or repository-wide file naming is the primary task in Nexload: scope discipline, readable functions and modules, type or trust-boundary safety, lifecycle ownership, abstraction value, dependency restraint, internal imports, or honest verification. Route package API compatibility to nexload-package and framework or specialist policy to the owning sibling skill.
```

```bash
npx skills add gecut/nexload-sdk --skill nexload-code
```

### nexload-package

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/nexload/package/SKILL.md)

```text
Use when the primary task changes or evaluates the shipped contract of a publishable Nexload TypeScript package: ownership, public exports and subpaths, entrypoint runtime isolation, core/adapter direction where shared policy exists, metadata, dependencies or peers, packed artifacts, package-scoped compatibility, or README/API alignment. Do not use for internal-only code, React behavior, visual styling, repository-wide runtime standards, or release execution.
```

```bash
npx skills add gecut/nexload-sdk --skill nexload-package
```

## Project AGENTS.md

```markdown
For @nexload-sdk/eslint-config, load nexload-code when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/eslint-config/llms.txt).

## Prompts

```text
Configure ESLint for the project runtime. Use @nexload-sdk/eslint-config and nexload-code. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/eslint-config integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
````

`apps/docs/src/content/docs/packages/eslint-config/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/eslint-config/index.mdx
+++ b/apps/docs/src/content/docs/packages/eslint-config/index.mdx
@@ -88,2 +88,4 @@
 
 [Optimization](./optimization/)
+
+[Agent usage](./agents/)
```

`apps/docs/src/content/docs/agents/index.mdx`

```diff
--- a/apps/docs/src/content/docs/agents/index.mdx
+++ b/apps/docs/src/content/docs/agents/index.mdx
@@ -89,2 +89,22 @@
   />
 </CardGrid>
+
+## Use an agent with a package
+
+- [@nexload-sdk/eslint-config](/nexload-sdk/packages/eslint-config/agents/)
+- [@nexload-sdk/healthcheck](/nexload-sdk/packages/healthcheck/core/agents/)
+- [@nexload-sdk/healthcheck-bun](/nexload-sdk/packages/healthcheck/bun/agents/)
+- [@nexload-sdk/healthcheck-next](/nexload-sdk/packages/healthcheck/next/agents/)
+- [@nexload-sdk/healthcheck-node](/nexload-sdk/packages/healthcheck/node/agents/)
+- [@nexload-sdk/healthcheck-otel](/nexload-sdk/packages/healthcheck/otel/agents/)
+- [@nexload-sdk/healthcheck-payload](/nexload-sdk/packages/healthcheck/payload/agents/)
+- [@nexload-sdk/healthcheck-prometheus](/nexload-sdk/packages/healthcheck/prometheus/agents/)
+- [@nexload-sdk/logger](/nexload-sdk/packages/logger/agents/)
+- [@nexload-sdk/payload-editor](/nexload-sdk/packages/payload-editor/agents/)
+- [@nexload-sdk/payload-fields](/nexload-sdk/packages/payload-fields/agents/)
+- [@nexload-sdk/payload-hooks](/nexload-sdk/packages/payload-hooks/agents/)
+- [@nexload-sdk/payload-operations](/nexload-sdk/packages/payload-operations/agents/)
+- [@nexload-sdk/payload-preset](/nexload-sdk/packages/payload-preset/agents/)
+- [@nexload-sdk/payload-schema](/nexload-sdk/packages/payload-schema/agents/)
+- [@nexload-sdk/persian](/nexload-sdk/packages/persian/agents/)
+- [@nexload-sdk/typescript-config](/nexload-sdk/packages/typescript-config/agents/)
```

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/agent-pages.test.mjs)`. Expected zero failing tests.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/src/content/docs/packages/logger/agents.mdx \
  apps/docs/src/content/docs/packages/logger/index.mdx \
  apps/docs/src/content/docs/packages/persian/agents.mdx \
  apps/docs/src/content/docs/packages/persian/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/core/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/core/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/bun/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/bun/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/node/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/node/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/next/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/next/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/payload/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/payload/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/agents.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx \
  apps/docs/src/content/docs/packages/payload-fields/agents.mdx \
  apps/docs/src/content/docs/packages/payload-fields/index.mdx \
  apps/docs/src/content/docs/packages/payload-editor/agents.mdx \
  apps/docs/src/content/docs/packages/payload-editor/index.mdx \
  apps/docs/src/content/docs/packages/payload-operations/agents.mdx \
  apps/docs/src/content/docs/packages/payload-operations/index.mdx \
  apps/docs/src/content/docs/packages/payload-schema/agents.mdx \
  apps/docs/src/content/docs/packages/payload-schema/index.mdx \
  apps/docs/src/content/docs/packages/payload-preset/agents.mdx \
  apps/docs/src/content/docs/packages/payload-preset/index.mdx \
  apps/docs/src/content/docs/packages/payload-hooks/agents.mdx \
  apps/docs/src/content/docs/packages/payload-hooks/index.mdx \
  apps/docs/src/content/docs/packages/typescript-config/agents.mdx \
  apps/docs/src/content/docs/packages/typescript-config/index.mdx \
  apps/docs/src/content/docs/packages/eslint-config/agents.mdx \
  apps/docs/src/content/docs/packages/eslint-config/index.mdx \
  apps/docs/tests/agent-pages.test.mjs \
  apps/docs/src/content/docs/agents/index.mdx \
  apps/docs/public
git diff --cached --stat
git commit -m "docs: add scoped agent workflows for each package"
```

### Task 4: Machine-readable topic coverage and public entrypoints

**Files:** `apps/docs/scripts/generate-markdown.mjs`, `apps/docs/scripts/api-packages.mjs`, `apps/docs/scripts/generate-api.mjs`, `apps/docs/examples/tsconfig.json`, `apps/docs/examples/payload-schema.ts`, `apps/docs/examples/healthcheck.ts`, `apps/docs/examples/payload-hooks.ts`, `apps/docs/examples/payload-preset.ts`, `apps/docs/tests/bundles.test.mjs`, `apps/docs/src/content/docs/packages/eslint-config/api.mdx`, `apps/docs/src/content/docs/packages/typescript-config/api.mdx`.

**Interfaces:**

- Consumes Package/topic frontmatter and public export maps, including Payload Admin-only TSX entries.
- Produces Expanded package/family bundles; llms-optimization.txt, llms-agents.txt and llms-playground.txt; 15 checked examples.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/bundles.test.mjs`

```mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import catalog from "../src/generated/api-catalog.json" with { type: "json" };
const read = file => readFileSync(new URL(`../public/${file}`, import.meta.url), "utf8");

test("each package topic reaches its individual, family, topic and full bundles", () => {
  const index = read("llms.txt");
  for (const id of [...Object.keys(catalog), "typescript-config", "eslint-config"]) {
    const dir = catalog[id]?.sourcePath.replace(/^packages\//, "") ?? id;
    const family = id.startsWith("healthcheck") ? "healthcheck" : id.startsWith("payload-") ? "payload" : id.endsWith("-config") ? "tooling" : "core";
    const prefix = `packages/${dir}/`;
    assert.ok(read(prefix + "api.md").includes("**Topic:** api"));
    assert.ok(index.includes(`/nexload-sdk/${prefix}index.md`));
    for (const topic of ["optimization", "agents"]) {
      const page = read(`${prefix}${topic}.md`);
      for (const file of [`${prefix}llms.txt`, `llms-${family}.txt`, `llms-${topic}.txt`, "llms-full.txt"]) assert.ok(read(file).includes(page), file);
    }
  }
});

test("catalog includes every manifest entry and checked runtime example", () => {
  for (const { id, name, sourcePath, symbols } of Object.values(catalog)) {
    const manifest = JSON.parse(readFileSync(new URL(`../../../${sourcePath}/package.json`, import.meta.url)));
    for (const key of Object.keys(manifest.exports)) {
      if (key === "./package.json") continue;
      const path = key === "." ? name : name + key.slice(1);
      assert.ok(symbols.some(symbol => symbol.exportPaths.includes(path)), path);
    }
    assert.ok(readFileSync(new URL(`../examples/${id}.ts`, import.meta.url), "utf8").includes(name));
  }
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/bundles.test.mjs)`. Expected nonzero exit for missing topic bundle and admin entrypoints. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/scripts/generate-markdown.mjs`

```diff
--- a/apps/docs/scripts/generate-markdown.mjs
+++ b/apps/docs/scripts/generate-markdown.mjs
@@ -297,5 +297,5 @@
   .map(canonicalDocument);
 const scopedBundles = Object.values(packageMetadata).map((entry) => {
-  const pages = documents.filter((document) => document.packageId === entry.id && ["overview", "guides", "api"].includes(document.topic));
+  const pages = documents.filter((document) => document.packageId === entry.id);
   return [resolve(publicRoot, "packages", packageRouteDir(entry.id), "llms.txt"), pages.map((page) => page.content).join("\n---\n\n")];
 });
@@ -303,7 +303,11 @@
 const familyBundles = ["core", "healthcheck", "payload", "tooling"].map((family) => [
   resolve(publicRoot, `llms-${family}.txt`),
-  documents.filter((document) => document.packageId && familyOf(document.packageId) === family && ["overview", "guides", "api"].includes(document.topic)).map((page) => page.content).join("\n---\n\n"),
+  documents.filter((document) => document.packageId && familyOf(document.packageId) === family).map((page) => page.content).join("\n---\n\n"),
 ]);
-const generatedFiles = [...scopedBundles, ...familyBundles].map(([path]) => relative(publicRoot, path).replaceAll("\\", "/")).concat(documents.map((document) =>
+const topicBundles = ["optimization", "agents", "playground"].map((topic) => [
+  resolve(publicRoot, `llms-${topic}.txt`),
+  documents.filter((page) => page.packageId && page.topic === topic).map((page) => page.content).join("\n---\n\n"),
+]);
+const generatedFiles = [...scopedBundles, ...familyBundles, ...topicBundles].map(([path]) => relative(publicRoot, path).replaceAll("\\", "/")).concat(documents.map((document) =>
   relative(publicRoot, outputFor(document.route)).replaceAll("\\", "/"),
 ));
@@ -313,5 +317,5 @@
   `Current-version documentation for ${Object.keys(packageMetadata).length} Nexload SDK packages.`,
   "",
-  ...[...scopedBundles, ...familyBundles].map(([path]) => {
+  ...[...scopedBundles, ...familyBundles, ...topicBundles].map(([path]) => {
     const file = relative(publicRoot, path).replaceAll("\\", "/");
     return `- [${file}](${docsBase}/${file})`;
@@ -323,5 +327,5 @@
       : undefined;
     return (
-      `- [${document.title}](${docsBase}${document.route}) — ${document.description}` +
+      `- [${document.title}](${docsBase}/${relative(publicRoot, outputFor(document.route)).replaceAll("\\", "/")}) — ${document.description}` +
       `${metadata ? ` [${metadata.name} v${metadata.version}]` : ""} [topic: ${document.topic}]`
     );
@@ -342,4 +346,5 @@
     ...scopedBundles,
     ...familyBundles,
+    ...topicBundles,
     [resolve(publicRoot, "llms.txt"), llmsIndex],
     [resolve(publicRoot, "llms-full.txt"), llmsFull],
```

`apps/docs/scripts/api-packages.mjs`

```diff
--- a/apps/docs/scripts/api-packages.mjs
+++ b/apps/docs/scripts/api-packages.mjs
@@ -94,4 +94,11 @@
         entry: "../../packages/payload-fields/src/money/index.ts",
       },
+      { exportPath: "@nexload-sdk/payload-fields/admin/formatted-cell", entry: "../../packages/payload-fields/src/admin/formatted-cell.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/jalali-date-cell", entry: "../../packages/payload-fields/src/admin/jalali-date-cell.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/jalali-date-field", entry: "../../packages/payload-fields/src/admin/jalali-date-field.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/money-cell", entry: "../../packages/payload-fields/src/admin/money-cell.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/money-field", entry: "../../packages/payload-fields/src/admin/money-field.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/slug-field", entry: "../../packages/payload-fields/src/admin/slug-field.tsx" },
+      { exportPath: "@nexload-sdk/payload-fields/admin/validated-text-field", entry: "../../packages/payload-fields/src/admin/validated-text-field.tsx" },
       {
         exportPath: "@nexload-sdk/payload-fields/schema",
```

`apps/docs/scripts/generate-api.mjs`

```diff
--- a/apps/docs/scripts/generate-api.mjs
+++ b/apps/docs/scripts/generate-api.mjs
@@ -162,4 +162,5 @@
         ),
       ),
+      jsx: ts.JsxEmit.ReactJSX,
       target: ts.ScriptTarget.ESNext,
       skipLibCheck: true,
```

`apps/docs/examples/tsconfig.json`

```diff
--- a/apps/docs/examples/tsconfig.json
+++ b/apps/docs/examples/tsconfig.json
@@ -9,4 +9,7 @@
     "noEmit": true,
     "paths": {
+      "@nexload-sdk/payload-preset": ["../../packages/payload-preset/src/index.ts"],
+      "@nexload-sdk/payload-hooks": ["../../packages/payload-hooks/src/index.ts"],
+      "@nexload-sdk/payload-schema/payload": ["../../packages/payload-schema/src/payload/index.ts"],
       "@nexload-sdk/persian": ["../../packages/persian/src/index.ts"],
       "@nexload-sdk/persian/*": ["../../packages/persian/src/*/index.ts"],
```

`apps/docs/examples/payload-schema.ts`

```diff
--- a/apps/docs/examples/payload-schema.ts
+++ b/apps/docs/examples/payload-schema.ts
@@ -5,5 +5,4 @@
   PayloadSchemaError,
 } from "@nexload-sdk/payload-schema";
-// @ts-ignore -- resolved via package exports at runtime in Node/Payload config
 import { payloadFields } from "@nexload-sdk/payload-schema/payload";
 import { z } from "zod";
```

`apps/docs/examples/healthcheck.ts`

```diff
--- a/apps/docs/examples/healthcheck.ts
+++ b/apps/docs/examples/healthcheck.ts
@@ -12,3 +12,3 @@
 
 const report = await health.run("readiness");
-console.log(stringifyHealthJson(report));
+export const json = stringifyHealthJson(report);
```

`apps/docs/examples/payload-hooks.ts`

```ts
import { auditPlugin } from "@nexload-sdk/payload-hooks";

export const audit = auditPlugin({ collections: ["orders"] });
```

`apps/docs/examples/payload-preset.ts`

```ts
import { nexloadPreset } from "@nexload-sdk/payload-preset";

export const plugins = nexloadPreset({ audit: false });
```

`apps/docs/src/content/docs/packages/eslint-config/api.mdx`

```mdx
---
title: "eslint-config — Configuration reference"
description: "Exported configuration entries for @nexload-sdk/eslint-config."
sidebar:
  label: "Configuration reference"
  order: 3
package: eslint-config
topic: api
---

## Public entries

- `.`
- `./base`
- `./base.js`
- `./node`
- `./node.js`
- `./react`
- `./react.js`
- `./nextjs`
- `./nextjs.js`
- `./payload`
- `./payload.js`
- `./*`
- `./*.js`

## Usage

Use the default nexloadConfig factory or compose named presets for base, node, react, nextjs and payload. The .js aliases resolve through the package export map.

[Package manifest](https://github.com/gecut/nexload-sdk/blob/main/tools/eslint-config/package.json).
```

`apps/docs/src/content/docs/packages/typescript-config/api.mdx`

```mdx
---
title: "typescript-config — Configuration reference"
description: "Exported configuration entries for @nexload-sdk/typescript-config."
sidebar:
  label: "Configuration reference"
  order: 3
package: typescript-config
topic: api
---

## Public entries

- `./base.json`
- `./node.json`
- `./react.json`
- `./next.json`
- `./vite.json`

## Usage

Set extends to the package name followed by a preset subpath, for example @nexload-sdk/typescript-config/next.json. Set include and output paths in the consuming project.

[Package manifest](https://github.com/gecut/nexload-sdk/blob/main/tools/typescript-config/package.json).
```

- [ ] **Refresh signatures.** Run `pnpm -C apps/docs content:api:write`. Expected a generated catalog for the 15 runtime packages. Run `pnpm -C apps/docs content:examples`. Expected exit 0 with no TypeScript diagnostics.

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/bundles.test.mjs tests/contracts.test.mjs)`. Expected zero failing tests.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/scripts/generate-markdown.mjs \
  apps/docs/scripts/api-packages.mjs \
  apps/docs/scripts/generate-api.mjs \
  apps/docs/examples/tsconfig.json \
  apps/docs/examples/payload-schema.ts \
  apps/docs/examples/healthcheck.ts \
  apps/docs/examples/payload-hooks.ts \
  apps/docs/examples/payload-preset.ts \
  apps/docs/tests/bundles.test.mjs \
  apps/docs/src/content/docs/packages/eslint-config/api.mdx \
  apps/docs/src/content/docs/packages/typescript-config/api.mdx \
  apps/docs/public \
  apps/docs/src/generated/api-catalog.json
git diff --cached --stat
git commit -m "feat(docs): extend machine-readable topics and public API checks"
```

### Task 5: Try Persian inputs in the browser

**Files:** `apps/docs/package.json`, `apps/docs/src/components/playgrounds/LabControls.astro`, `apps/docs/src/lib/playgrounds/register.ts`, `apps/docs/src/lib/playgrounds/persian.ts`, `apps/docs/src/components/playgrounds/PersianPrice.astro`, `apps/docs/src/content/docs/packages/persian/playground.mdx`, `apps/docs/src/content/docs/packages/persian/index.mdx`, `apps/docs/tests/persian-lab.test.mjs`.

**Interfaces:**

- Consumes `@nexload-sdk/persian` subpaths `money`, `mobile`, `identity`, `bank` and `date`; static Starlight markup.
- Produces registerLab(tag, evaluate), LabControls and the PersianPrice island. The share link stores at most 120 input characters in its URL fragment.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/persian-lab.test.mjs`

```mjs
import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/persian.ts";

test("price modes accept both digit sets, handle indivisible rials and reject fractions", () => {
  assert.equal(evaluate("۱۲۵۰۰", "IRT"), evaluate("١٢٥٠٠", "IRT"));
  assert.equal(evaluate("12500", "IRT"), "۱٬۲۵۰ تومان");
  assert.equal(evaluate("12501", "IRT"), "۱۲٬۵۰۱ ریال");
  for (const input of ["", "12.0", "9007199254740992"]) assert.equal(evaluate(input, "IRR"), "Enter a whole number of rials.");
  assert.equal(evaluate("12500", "unknown"), evaluate("12500", "IRR"));
});

test("identity, bank and date modes return the SDK result", () => {
  assert.equal(evaluate("۰۹۱۲۳۴۵۶۷۸۹", "mobile"), "Valid\nCanonical: 09123456789\nE.164: +989123456789\nDisplay: 0912 345 6789");
  assert.equal(evaluate("", "mobile"), "Invalid: empty");
  assert.equal(evaluate("0812", "mobile"), "Invalid: invalid");
  assert.equal(evaluate("۰۰۸۴۵۷۵۹۴۸", "national-code"), "Valid\nCanonical: 0084575948");
  assert.equal(evaluate("0084575949", "national-code"), "Invalid: invalid_checksum");
  assert.equal(evaluate("۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۳", "card"), "Valid\nDisplay: 6037 9912 3456 7893\nBank: melli");
  assert.equal(evaluate("6037991234567890", "card"), "Invalid: invalid_checksum");
  assert.equal(evaluate("IR820540102680020817909002", "sheba"), "Valid\nDisplay: IR82 0540 1026 8002 0817 9090 02\nBank: parsian");
  assert.equal(evaluate("IR820540102680020817909003", "sheba"), "Invalid: invalid_checksum");
  assert.equal(evaluate("2024-03-20T12:00:00+03:30", "jalali"), "Short: ۱۴۰۳/۰۱/۰۱\nLong: چهارشنبه ۱ فروردین ۱۴۰۳");
  assert.equal(evaluate("nope", "jalali"), "Enter an ISO date such as 2024-03-20T12:00:00+03:30.");
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/persian-lab.test.mjs)`. Expected nonzero exit for missing persian.ts. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/package.json`

```diff
--- a/apps/docs/package.json
+++ b/apps/docs/package.json
@@ -17,4 +17,5 @@
   },
   "dependencies": {
+    "@nexload-sdk/persian": "workspace:*",
     "@astrojs/starlight": "^0.40.0",
     "astro": "^6.4.8"
```

`apps/docs/src/components/playgrounds/LabControls.astro`

```astro
---
interface Props { label: string; sample: string; mode: string; modes: string[] }
const { label, sample, mode, modes } = Astro.props;
---
<fieldset>
  <legend>Try a sample</legend>
  <label>{label}<input value={sample} maxlength="120" dir="auto" autocomplete="off" /></label>
  <label>Output mode
    <select>{modes.map(item => <option value={item} selected={item === mode}>{item}</option>)}</select>
  </label>
  <output aria-live="polite" aria-atomic="true" dir="auto"></output>
  <a hidden>Share these settings</a>
  <noscript>Enable JavaScript to change the sample and see the result.</noscript>
</fieldset>

<style>
  fieldset, label { display: grid; gap: 0.5rem; min-inline-size: 0; }
  fieldset { padding: 1rem; }
  input, select, output { max-inline-size: 100%; min-inline-size: 0; font: inherit; }
  output { white-space: pre-wrap; overflow-wrap: anywhere; unicode-bidi: plaintext; }
  a[hidden] { display: none; }
</style>
```

`apps/docs/src/lib/playgrounds/register.ts`

```ts
type Evaluate = (input: string, mode: string) => string | Promise<string>;

export function registerLab(tag: string, evaluate: Evaluate): void {
  if (customElements.get(tag)) return;
  customElements.define(tag, class extends HTMLElement {
    connectedCallback(): void {
      const field = this.querySelector("input");
      const menu = this.querySelector("select");
      const output = this.querySelector("output");
      const share = this.querySelector("a");
      if (!field || !menu || !output || !share) return;
      const sample = field.defaultValue;
      const defaultMode = menu.value;
      let revision = 0;
      const update = async (): Promise<void> => {
        const token = ++revision;
        const input = field.value;
        const mode = menu.value;
        const url = new URL(location.href);
        url.hash = "try?" + new URLSearchParams({ input, mode }).toString();
        share.href = url.href;
        share.hidden = false;
        const result = await evaluate(input, mode);
        if (token === revision) output.textContent = result;
      };
      const restore = (): void => {
        const state = new URLSearchParams(location.hash.startsWith("#try?") ? location.hash.slice(5, 2053) : "");
        field.value = (state.get("input") ?? sample).slice(0, 120);
        const mode = state.get("mode");
        menu.value = Array.from(menu.options).some(option => option.value === mode) ? String(mode) : defaultMode;
        void update();
      };
      this.oninput = () => { void update(); };
      window.addEventListener("hashchange", restore, { signal: this.lifecycle.signal });
      restore();
    }

    private lifecycle = new AbortController();

    disconnectedCallback(): void {
      this.lifecycle.abort();
      this.lifecycle = new AbortController();
      this.oninput = null;
    }
  });
}
```

`apps/docs/src/lib/playgrounds/persian.ts`

```ts
import { detectBankByCard, detectBankBySheba, formatCardNumber, formatSheba, validateCardNumber, validateSheba } from "@nexload-sdk/persian/bank";
import { formatJalali } from "@nexload-sdk/persian/date";
import { validateNationalCode } from "@nexload-sdk/persian/identity";
import { formatIranMobile, toE164Mobile, validateIranMobile } from "@nexload-sdk/persian/mobile";
import { formatMoney, parseMoney } from "@nexload-sdk/persian/money";

export const PERSIAN_MODES = ["IRR", "IRT", "mobile", "national-code", "card", "sheba", "jalali"] as const;

const lines = (...items: Array<string | null | undefined>): string =>
  items.filter((item): item is string => typeof item === "string" && item.length > 0).join("\n");

function price(input: string, displayUnit: "IRR" | "IRT"): string {
  const value = parseMoney(input, "IRR");
  if (!value) return "Enter a whole number of rials.";
  return formatMoney(value, { displayUnit }) ?? "Amount outside the supported range.";
}

export function evaluate(input: string, mode: string): string {
  switch (mode) {
    case "IRT": return price(input, "IRT");
    case "mobile": {
      const result = validateIranMobile(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Canonical: ${result.value}`, `E.164: ${toE164Mobile(result.value)}`, `Display: ${formatIranMobile(result.value)}`);
    }
    case "national-code": {
      const result = validateNationalCode(input);
      return result.ok ? lines("Valid", `Canonical: ${result.value}`) : `Invalid: ${result.reason}`;
    }
    case "card": {
      const result = validateCardNumber(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Display: ${formatCardNumber(result.value)}`, `Bank: ${detectBankByCard(result.value) ?? "unknown"}`);
    }
    case "sheba": {
      const result = validateSheba(input);
      if (!result.ok) return `Invalid: ${result.reason}`;
      return lines("Valid", `Display: ${formatSheba(result.value)}`, `Bank: ${detectBankBySheba(result.value) ?? "unknown"}`);
    }
    case "jalali": {
      const short = formatJalali(input, { format: "short", timeZone: "Asia/Tehran" });
      if (!short) return "Enter an ISO date such as 2024-03-20T12:00:00+03:30.";
      return lines(`Short: ${short}`, `Long: ${formatJalali(input, { format: "long", timeZone: "Asia/Tehran" })}`);
    }
    default: return price(input, "IRR");
  }
}
```

`apps/docs/src/components/playgrounds/PersianPrice.astro`

```astro
---
import LabControls from "./LabControls.astro";
import { PERSIAN_MODES } from "../../lib/playgrounds/persian";
interface Props { label: string; sample: string; mode: string }
const { label, sample, mode } = Astro.props;
---
<persian-price>
  <LabControls {label} {sample} {mode} modes={[...PERSIAN_MODES]} />
</persian-price>

<script>
  import { registerLab } from "../../lib/playgrounds/register";
  import { evaluate } from "../../lib/playgrounds/persian";
  registerLab("persian-price", evaluate);
</script>
```

`apps/docs/src/content/docs/packages/persian/playground.mdx`

```mdx
---
title: "persian — Playground"
description: "Try Persian prices, mobile numbers, national codes, cards, Sheba and Jalali dates."
sidebar:
  label: "Playground"
  order: 6
package: persian
topic: playground
---

import PersianPrice from "../../../../components/playgrounds/PersianPrice.astro";

## Try it

Type a value in Persian, Arabic or Latin digits and pick a mode. Every result comes from `@nexload-sdk/persian` running in your browser.

<PersianPrice label="Value" sample="۱۲۵۰۰" mode="IRR" />

## Modes

| Mode | Input | Functions used |
| --- | --- | --- |
| `IRR` / `IRT` | A whole number of rials | `parseMoney`, `formatMoney` from `@nexload-sdk/persian/money` |
| `mobile` | An Iranian mobile number in any common form | `validateIranMobile`, `toE164Mobile`, `formatIranMobile` from `@nexload-sdk/persian/mobile` |
| `national-code` | A 10-digit کد ملی | `validateNationalCode` from `@nexload-sdk/persian/identity` |
| `card` | A 16-digit bank card, separators allowed | `validateCardNumber`, `formatCardNumber`, `detectBankByCard` from `@nexload-sdk/persian/bank` |
| `sheba` | A Sheba (IBAN) starting with `IR` | `validateSheba`, `formatSheba`, `detectBankBySheba` from `@nexload-sdk/persian/bank` |
| `jalali` | An ISO date-time with an offset | `formatJalali` from `@nexload-sdk/persian/date`, time zone `Asia/Tehran` |

## Read the result

- Fractional prices are invalid. When a rial amount cannot convert exactly to tomans, the formatter keeps rials: `12501` in `IRT` shows `۱۲٬۵۰۱ ریال`.
- Invalid identifiers show the SDK's reason code, for example `invalid_checksum`. Use the same codes in your own error messages.
- Try `۰۹۱۲۳۴۵۶۷۸۹` in `mobile`, `۰۰۸۴۵۷۵۹۴۸` in `national-code` and `IR820540102680020817909002` in `sheba`.

[API reference](/nexload-sdk/packages/persian/api/).
```

`apps/docs/src/content/docs/packages/persian/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/persian/index.mdx
+++ b/apps/docs/src/content/docs/packages/persian/index.mdx
@@ -59,2 +59,4 @@
 
 [Agent usage](./agents/)
+
+[Playground](./playground/)
```

- [ ] **Resolve the manifest.** Run `pnpm install`. Expected exit 0 and a pnpm-authored `pnpm-lock.yaml` update. Preserve the exact workspace specifiers.

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/persian-lab.test.mjs)`. Expected zero failing tests.

- [ ] **Build the island.** Run `pnpm -C apps/docs build`. Expected zero Astro errors and a static HTML file at each new playground route.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/package.json \
  apps/docs/src/components/playgrounds/LabControls.astro \
  apps/docs/src/lib/playgrounds/register.ts \
  apps/docs/src/lib/playgrounds/persian.ts \
  apps/docs/src/components/playgrounds/PersianPrice.astro \
  apps/docs/src/content/docs/packages/persian/playground.mdx \
  apps/docs/src/content/docs/packages/persian/index.mdx \
  apps/docs/tests/persian-lab.test.mjs \
  apps/docs/public \
  pnpm-lock.yaml
git diff --cached --stat
git commit -m "feat(docs): add a shareable Persian input playground"
```

### Task 6: Try canonical field validation

**Files:** `apps/docs/package.json`, `apps/docs/src/lib/playgrounds/schema.ts`, `apps/docs/src/components/playgrounds/SchemaField.astro`, `apps/docs/src/content/docs/packages/payload-schema/playground.mdx`, `apps/docs/src/content/docs/packages/payload-schema/index.mdx`, `apps/docs/tests/schema-lab.test.mjs`.

**Interfaces:**

- Consumes LabControls and registerLab(tag, evaluate); payload-schema root export and the Zod peer already in docs.
- Produces SchemaField and evaluate(input: string, mode: string): string; imports only the browser-safe root.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/schema-lab.test.mjs`

```mjs
import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/schema.ts";

test("canonical title and SKU fields normalize and validate live input", () => {
  assert.equal(evaluate(" tea ", "Title"), '"tea"');
  assert.equal(evaluate(" ab ", "SKU"), '"AB"');
  assert.ok(evaluate("x", "Title").length > 0);
  assert.notEqual(evaluate("x", "Title"), '"x"');
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/schema-lab.test.mjs)`. Expected nonzero exit for missing schema.ts. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/package.json`

```diff
--- a/apps/docs/package.json
+++ b/apps/docs/package.json
@@ -18,4 +18,5 @@
   "dependencies": {
     "@nexload-sdk/persian": "workspace:*",
+    "@nexload-sdk/payload-schema": "workspace:*",
     "@astrojs/starlight": "^0.40.0",
     "astro": "^6.4.8"
```

`apps/docs/src/lib/playgrounds/schema.ts`

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema";

const product = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true, minLength: 3 }),
    sku: field.text({ required: true, trim: true, uppercase: true, minLength: 2 }),
  },
});
const title = product.schema(({ fields }) => fields.title);
const sku = product.schema(({ fields }) => fields.sku);

export function evaluate(input: string, mode: string): string {
  const result = (mode === "SKU" ? sku : title).safeParse(input);
  return result.success ? JSON.stringify(result.data) : result.error.issues.map(issue => issue.message).join("\n");
}
```

`apps/docs/src/components/playgrounds/SchemaField.astro`

```astro
---
import LabControls from "./LabControls.astro";
interface Props { label: string; sample: string; mode: string }
const { label, sample, mode } = Astro.props;
---
<schema-field>
  <LabControls {label} {sample} {mode} modes={["Title", "SKU"]} />
</schema-field>

<script>
  import { registerLab } from "../../lib/playgrounds/register";
  import { evaluate } from "../../lib/playgrounds/schema";
  registerLab("schema-field", evaluate);
</script>
```

`apps/docs/src/content/docs/packages/payload-schema/playground.mdx`

```mdx
---
title: "payload-schema — Playground"
description: "Validate product input."
sidebar:
  label: "Playground"
  order: 6
package: payload-schema
topic: playground
---

import SchemaField from "../../../../components/playgrounds/SchemaField.astro";

## Try it

Choose the title or SKU definition and edit the sample value.

<SchemaField label="Product field value" sample=" tea " mode="Title" />

## Read the result

Title trims whitespace and requires three characters. SKU trims, uppercases and requires two. The output shows the parsed value or validation issues.

Choose SKU and enter ` ab `. The canonical output is `"AB"`.

[API reference](/nexload-sdk/packages/payload-schema/api/).
```

`apps/docs/src/content/docs/packages/payload-schema/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/payload-schema/index.mdx
+++ b/apps/docs/src/content/docs/packages/payload-schema/index.mdx
@@ -165,2 +165,4 @@
 
 [Agent usage](./agents/)
+
+[Playground](./playground/)
```

- [ ] **Resolve the manifest.** Run `pnpm install`. Expected exit 0 and a pnpm-authored `pnpm-lock.yaml` update. Preserve the exact workspace specifiers.

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/schema-lab.test.mjs)`. Expected zero failing tests.

- [ ] **Build the island.** Run `pnpm -C apps/docs build`. Expected zero Astro errors and a static HTML file at each new playground route.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/package.json \
  apps/docs/src/lib/playgrounds/schema.ts \
  apps/docs/src/components/playgrounds/SchemaField.astro \
  apps/docs/src/content/docs/packages/payload-schema/playground.mdx \
  apps/docs/src/content/docs/packages/payload-schema/index.mdx \
  apps/docs/tests/schema-lab.test.mjs \
  apps/docs/public \
  pnpm-lock.yaml
git diff --cached --stat
git commit -m "feat(docs): add canonical field playground"
```

### Task 7: Run readiness and inspect its exporters

**Files:** `apps/docs/package.json`, `apps/docs/src/lib/playgrounds/health.ts`, `apps/docs/src/components/playgrounds/HealthReport.astro`, `apps/docs/src/content/docs/packages/healthcheck/core/playground.mdx`, `apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/playground.mdx`, `apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/playground.mdx`, `apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`, `apps/docs/tests/health-lab.test.mjs`, `apps/docs/src/content/docs/index.mdx`.

**Interfaces:**

- Consumes LabControls and registerLab(tag, evaluate); createHealthManager, toPrometheusText, toOpenMetricsText and toOtelMetricRecords.
- Produces HealthReport shared by three routes, each with its own default output mode.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/health-lab.test.mjs`

```mjs
import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/health.ts";

test("one local critical check drives reports and all exporter views", async () => {
  for (const status of ["ok", "degraded", "unhealthy"]) {
    assert.equal(JSON.parse(await evaluate(status, "JSON")).status, status);
  }
  assert.match(await evaluate("ok", "Prometheus"), /nexload_health_status/);
  assert.match(await evaluate("ok", "OpenMetrics"), /# EOF\n$/);
  const records = JSON.parse(await evaluate("unhealthy", "OTel"));
  assert.equal(records.find(row => row.name === "health.status").value, 0);
  assert.equal(await evaluate("invalid", "JSON"), "Enter ok, degraded or unhealthy.");
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/health-lab.test.mjs)`. Expected nonzero exit for missing health.ts. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/package.json`

```diff
--- a/apps/docs/package.json
+++ b/apps/docs/package.json
@@ -19,4 +19,7 @@
     "@nexload-sdk/persian": "workspace:*",
     "@nexload-sdk/payload-schema": "workspace:*",
+    "@nexload-sdk/healthcheck": "workspace:*",
+    "@nexload-sdk/healthcheck-otel": "workspace:*",
+    "@nexload-sdk/healthcheck-prometheus": "workspace:*",
     "@astrojs/starlight": "^0.40.0",
     "astro": "^6.4.8"
```

`apps/docs/src/lib/playgrounds/health.ts`

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { toOtelMetricRecords } from "@nexload-sdk/healthcheck-otel";
import { toOpenMetricsText, toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

export async function evaluate(input: string, mode: string): Promise<string> {
  const state = input.trim().toLowerCase();
  if (!["ok", "degraded", "unhealthy"].includes(state)) return "Enter ok, degraded or unhealthy.";
  const status = state === "unhealthy" ? "unhealthy" : state === "degraded" ? "degraded" : "ok";
  const manager = createHealthManager({
    service: { name: "shop" },
    checks: [{ name: "inventory", critical: true, scopes: ["readiness"], run: () => ({ status }) }],
  });
  const report = await manager.run("readiness");
  manager.dispose();
  if (mode === "Prometheus") return toPrometheusText(report);
  if (mode === "OpenMetrics") return toOpenMetricsText(report);
  if (mode === "OTel") return JSON.stringify(toOtelMetricRecords(report), null, 2);
  return JSON.stringify(report, null, 2);
}
```

`apps/docs/src/components/playgrounds/HealthReport.astro`

```astro
---
import LabControls from "./LabControls.astro";
interface Props { label: string; sample: string; mode: string }
const { label, sample, mode } = Astro.props;
---
<health-report>
  <LabControls {label} {sample} {mode} modes={["JSON", "Prometheus", "OpenMetrics", "OTel"]} />
</health-report>

<script>
  import { registerLab } from "../../lib/playgrounds/register";
  import { evaluate } from "../../lib/playgrounds/health";
  registerLab("health-report", evaluate);
</script>
```

`apps/docs/src/content/docs/packages/healthcheck/core/playground.mdx`

```mdx
---
title: "healthcheck — Playground"
description: "Inspect a local readiness report."
sidebar:
  label: "Playground"
  order: 6
package: healthcheck
topic: playground
---

import HealthReport from "../../../../../components/playgrounds/HealthReport.astro";

## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

<HealthReport label="Inventory status" sample="ok" mode="JSON" />

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `unhealthy`. The report includes `"status": "unhealthy"`.

[API reference](/nexload-sdk/packages/healthcheck/core/api/).
```

`apps/docs/src/content/docs/packages/healthcheck/core/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/core/index.mdx
@@ -120,2 +120,4 @@
 
 [Agent usage](./agents/)
+
+[Playground](./playground/)
```

`apps/docs/src/content/docs/packages/healthcheck/prometheus/playground.mdx`

```mdx
---
title: "healthcheck-prometheus — Playground"
description: "Inspect a local readiness report."
sidebar:
  label: "Playground"
  order: 6
package: healthcheck-prometheus
topic: playground
---

import HealthReport from "../../../../../components/playgrounds/HealthReport.astro";

## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

<HealthReport label="Inventory status" sample="ok" mode="Prometheus" />

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `ok`. The output includes the `nexload_health_status` series.

[API reference](/nexload-sdk/packages/healthcheck/prometheus/api/).
```

`apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx
@@ -63,2 +63,4 @@
 
 [Agent usage](./agents/)
+
+[Playground](./playground/)
```

`apps/docs/src/content/docs/packages/healthcheck/otel/playground.mdx`

```mdx
---
title: "healthcheck-otel — Playground"
description: "Inspect a local readiness report."
sidebar:
  label: "Playground"
  order: 6
package: healthcheck-otel
topic: playground
---

import HealthReport from "../../../../../components/playgrounds/HealthReport.astro";

## Try it

Type ok, degraded or unhealthy to change a critical inventory check. Switch between the report and three export formats.

<HealthReport label="Inventory status" sample="ok" mode="OTel" />

## Read the result

The local manager runs a readiness check. Prometheus renders metric text, OpenMetrics adds the EOF marker, and OTel returns metric records. No network service receives the output.

Enter `unhealthy`. The `health.status` metric record has value `0`.

[API reference](/nexload-sdk/packages/healthcheck/otel/api/).
```

`apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx`

```diff
--- a/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
+++ b/apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx
@@ -61,2 +61,4 @@
 
 [Agent usage](./agents/)
+
+[Playground](./playground/)
```

`apps/docs/src/content/docs/index.mdx`

```diff
--- a/apps/docs/src/content/docs/index.mdx
+++ b/apps/docs/src/content/docs/index.mdx
@@ -16,4 +16,8 @@
 - [Check whether your storefront can accept traffic](/nexload-sdk/packages/healthcheck/core/).
 
+## Try it before installing
+
+[Format a price](/nexload-sdk/packages/persian/playground/), [validate a product field](/nexload-sdk/packages/payload-schema/playground/) or [run a readiness check](/nexload-sdk/packages/healthcheck/core/playground/).
+
 ## Start a project
```

- [ ] **Resolve the manifest.** Run `pnpm install`. Expected exit 0 and a pnpm-authored `pnpm-lock.yaml` update. Preserve the exact workspace specifiers.

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/health-lab.test.mjs)`. Expected zero failing tests.

- [ ] **Build the island.** Run `pnpm -C apps/docs build`. Expected zero Astro errors and a static HTML file at each new playground route.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/package.json \
  apps/docs/src/lib/playgrounds/health.ts \
  apps/docs/src/components/playgrounds/HealthReport.astro \
  apps/docs/src/content/docs/packages/healthcheck/core/playground.mdx \
  apps/docs/src/content/docs/packages/healthcheck/core/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/playground.mdx \
  apps/docs/src/content/docs/packages/healthcheck/prometheus/index.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/playground.mdx \
  apps/docs/src/content/docs/packages/healthcheck/otel/index.mdx \
  apps/docs/tests/health-lab.test.mjs \
  apps/docs/src/content/docs/index.mdx \
  apps/docs/public \
  pnpm-lock.yaml
git diff --cached --stat
git commit -m "feat(docs): demonstrate readiness and health exporters"
```

### Task 8: CI, browser smoke tests and legacy URLs

**Files:** `apps/docs/tests/legacy-routes.json`, `apps/docs/tests/built-routes.mjs`, `apps/docs/playwright.config.mjs`, `apps/docs/browser/playgrounds.spec.mjs`, `apps/docs/package.json`, `.github/workflows/docs.yml`, `apps/docs/tests/workflow.test.mjs`.

**Interfaces:**

- Consumes Built Astro output at /nexload-sdk/, checked-in route fixture, five real browser pages.
- Produces A Chromium/Node CI gate covering interactions, generated links, 66 original pages and all legacy redirects.

- [ ] **Step 1. Add the test payloads.** Use the following paths and contents.

`apps/docs/tests/legacy-routes.json`

```json
{
  "pages": [
    "/agents/domain-skills/",
    "/agents/engineering/",
    "/agents/",
    "/agents/install/",
    "/agents/protocols/",
    "/agents/reasoning/",
    "/community/support/",
    "/",
    "/packages/eslint-config/guides/",
    "/packages/eslint-config/",
    "/packages/healthcheck/bun/api/",
    "/packages/healthcheck/bun/guides/",
    "/packages/healthcheck/bun/",
    "/packages/healthcheck/core/api/",
    "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/core/",
    "/packages/healthcheck/next/api/",
    "/packages/healthcheck/next/guides/",
    "/packages/healthcheck/next/",
    "/packages/healthcheck/node/api/",
    "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/node/",
    "/packages/healthcheck/otel/api/",
    "/packages/healthcheck/otel/guides/",
    "/packages/healthcheck/otel/",
    "/packages/healthcheck/payload/api/",
    "/packages/healthcheck/payload/guides/",
    "/packages/healthcheck/payload/",
    "/packages/healthcheck/prometheus/api/",
    "/packages/healthcheck/prometheus/guides/",
    "/packages/healthcheck/prometheus/",
    "/packages/",
    "/packages/logger/api/",
    "/packages/logger/guides/",
    "/packages/logger/",
    "/packages/payload-editor/api/",
    "/packages/payload-editor/guides/",
    "/packages/payload-editor/",
    "/packages/payload-fields/api/",
    "/packages/payload-fields/guides/",
    "/packages/payload-fields/",
    "/packages/payload-hooks/api/",
    "/packages/payload-hooks/guides/",
    "/packages/payload-hooks/",
    "/packages/payload-operations/api/",
    "/packages/payload-operations/guides/",
    "/packages/payload-operations/",
    "/packages/payload-preset/api/",
    "/packages/payload-preset/guides/",
    "/packages/payload-preset/",
    "/packages/payload-schema/api/",
    "/packages/payload-schema/guides/",
    "/packages/payload-schema/",
    "/packages/persian/api/",
    "/packages/persian/guides/",
    "/packages/persian/",
    "/packages/typescript-config/guides/",
    "/packages/typescript-config/",
    "/standards/agent-setup-prompt/",
    "/standards/file-structure/",
    "/start/choose-a-package/",
    "/start/glossary/",
    "/start/installation/",
    "/start/introduction/",
    "/start/payload-packages/",
    "/start/recipes/ecommerce-stack/"
  ],
  "redirects": {
    "/getting-started/": "/start/choose-a-package/",
    "/concepts/liveness-readiness-startup/": "/packages/healthcheck/core/guides/",
    "/concepts/checks-vs-collectors/": "/packages/healthcheck/core/guides/",
    "/concepts/status-model/": "/packages/healthcheck/core/guides/",
    "/guides/node-service/": "/packages/healthcheck/node/guides/",
    "/guides/bun-service/": "/packages/healthcheck/bun/guides/",
    "/guides/nextjs-route-handlers/": "/packages/healthcheck/next/guides/",
    "/guides/docker-kubernetes-dokploy/": "/packages/healthcheck/node/guides/",
    "/guides/payload-healthcheck/": "/packages/healthcheck/payload/guides/",
    "/guides/prometheus-openmetrics/": "/packages/healthcheck/prometheus/guides/",
    "/guides/opentelemetry/": "/packages/healthcheck/otel/guides/",
    "/api/health-manager/": "/packages/healthcheck/core/api/",
    "/api/check-contract/": "/packages/healthcheck/core/api/",
    "/api/runtime-adapter/": "/packages/healthcheck/core/api/",
    "/api/exporters/": "/packages/healthcheck/prometheus/api/",
    "/reference/result-schema/": "/packages/healthcheck/core/guides/",
    "/reference/error-codes/": "/packages/healthcheck/core/api/",
    "/reference/metric-names/": "/packages/healthcheck/prometheus/api/",
    "/reference/security/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/": "/packages/healthcheck/core/",
    "/packages/healthcheck/quick-start/": "/packages/healthcheck/core/",
    "/packages/healthcheck/concepts/scopes/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/concepts/checks-and-collectors/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/concepts/reports-and-status/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/guides/node/": "/packages/healthcheck/node/",
    "/packages/healthcheck/guides/bun/": "/packages/healthcheck/bun/",
    "/packages/healthcheck/guides/nextjs/": "/packages/healthcheck/next/",
    "/packages/healthcheck/guides/payload/": "/packages/healthcheck/payload/",
    "/packages/healthcheck/guides/exporters/": "/packages/healthcheck/prometheus/",
    "/packages/healthcheck/guides/custom-checks/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/guides/operations/": "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/reference/api/": "/packages/healthcheck/core/api/",
    "/payload-fields/": "/packages/payload-fields/",
    "/payload-fields/slug/": "/packages/payload-fields/guides/",
    "/payload-fields/jalali-date/": "/packages/payload-fields/guides/",
    "/payload-fields/money/": "/packages/payload-fields/guides/",
    "/payload-fields/migration/": "/packages/payload-fields/guides/",
    "/payload-editor/": "/packages/payload-editor/",
    "/payload-operations/": "/packages/payload-operations/",
    "/payload-schema/": "/packages/payload-schema/",
    "/packages/payload-fields/slug/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/jalali-dates/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/money/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/plugin-and-admin/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/reference-api/": "/packages/payload-fields/api/",
    "/packages/payload-editor/features/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/presets/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/extensions/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/reference-api/": "/packages/payload-editor/api/",
    "/packages/payload-schema/architecture/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/errors/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/fields/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/native-fields/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/payload-integration/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/projections/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/reference-api/": "/packages/payload-schema/api/",
    "/packages/payload-schema/schema-derivation/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/testing-compatibility/": "/packages/payload-schema/api/",
    "/llm/overview/": "/agents/",
    "/llm/agent-skills/": "/agents/install/",
    "/packages/healthcheck/core/installation/": "/packages/healthcheck/core/",
    "/packages/healthcheck/core/quick-start/": "/packages/healthcheck/core/",
    "/packages/healthcheck/core/concepts/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/core/examples/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/core/troubleshooting/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/core/migration/": "/packages/healthcheck/core/guides/",
    "/packages/healthcheck/core/compatibility/": "/packages/healthcheck/core/api/",
    "/packages/healthcheck/node/installation/": "/packages/healthcheck/node/",
    "/packages/healthcheck/node/quick-start/": "/packages/healthcheck/node/",
    "/packages/healthcheck/node/concepts/": "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/node/examples/": "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/node/troubleshooting/": "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/node/migration/": "/packages/healthcheck/node/guides/",
    "/packages/healthcheck/node/compatibility/": "/packages/healthcheck/node/api/",
    "/packages/healthcheck/bun/installation/": "/packages/healthcheck/bun/",
    "/packages/healthcheck/bun/quick-start/": "/packages/healthcheck/bun/",
    "/packages/healthcheck/bun/concepts/": "/packages/healthcheck/bun/guides/",
    "/packages/healthcheck/bun/examples/": "/packages/healthcheck/bun/guides/",
    "/packages/healthcheck/bun/troubleshooting/": "/packages/healthcheck/bun/guides/",
    "/packages/healthcheck/bun/migration/": "/packages/healthcheck/bun/guides/",
    "/packages/healthcheck/bun/compatibility/": "/packages/healthcheck/bun/api/",
    "/packages/healthcheck/next/installation/": "/packages/healthcheck/next/",
    "/packages/healthcheck/next/quick-start/": "/packages/healthcheck/next/",
    "/packages/healthcheck/next/concepts/": "/packages/healthcheck/next/guides/",
    "/packages/healthcheck/next/examples/": "/packages/healthcheck/next/guides/",
    "/packages/healthcheck/next/troubleshooting/": "/packages/healthcheck/next/guides/",
    "/packages/healthcheck/next/migration/": "/packages/healthcheck/next/guides/",
    "/packages/healthcheck/next/compatibility/": "/packages/healthcheck/next/api/",
    "/packages/healthcheck/prometheus/installation/": "/packages/healthcheck/prometheus/",
    "/packages/healthcheck/prometheus/quick-start/": "/packages/healthcheck/prometheus/",
    "/packages/healthcheck/prometheus/concepts/": "/packages/healthcheck/prometheus/guides/",
    "/packages/healthcheck/prometheus/examples/": "/packages/healthcheck/prometheus/guides/",
    "/packages/healthcheck/prometheus/troubleshooting/": "/packages/healthcheck/prometheus/guides/",
    "/packages/healthcheck/prometheus/migration/": "/packages/healthcheck/prometheus/guides/",
    "/packages/healthcheck/prometheus/compatibility/": "/packages/healthcheck/prometheus/api/",
    "/packages/healthcheck/otel/installation/": "/packages/healthcheck/otel/",
    "/packages/healthcheck/otel/quick-start/": "/packages/healthcheck/otel/",
    "/packages/healthcheck/otel/concepts/": "/packages/healthcheck/otel/guides/",
    "/packages/healthcheck/otel/examples/": "/packages/healthcheck/otel/guides/",
    "/packages/healthcheck/otel/troubleshooting/": "/packages/healthcheck/otel/guides/",
    "/packages/healthcheck/otel/migration/": "/packages/healthcheck/otel/guides/",
    "/packages/healthcheck/otel/compatibility/": "/packages/healthcheck/otel/api/",
    "/packages/healthcheck/payload/installation/": "/packages/healthcheck/payload/",
    "/packages/healthcheck/payload/quick-start/": "/packages/healthcheck/payload/",
    "/packages/healthcheck/payload/concepts/": "/packages/healthcheck/payload/guides/",
    "/packages/healthcheck/payload/examples/": "/packages/healthcheck/payload/guides/",
    "/packages/healthcheck/payload/troubleshooting/": "/packages/healthcheck/payload/guides/",
    "/packages/healthcheck/payload/migration/": "/packages/healthcheck/payload/guides/",
    "/packages/healthcheck/payload/compatibility/": "/packages/healthcheck/payload/api/",
    "/packages/payload-fields/installation/": "/packages/payload-fields/",
    "/packages/payload-fields/quick-start/": "/packages/payload-fields/",
    "/packages/payload-fields/concepts/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/examples/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/troubleshooting/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/migration/": "/packages/payload-fields/guides/",
    "/packages/payload-fields/compatibility/": "/packages/payload-fields/api/",
    "/packages/payload-editor/installation/": "/packages/payload-editor/",
    "/packages/payload-editor/quick-start/": "/packages/payload-editor/",
    "/packages/payload-editor/concepts/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/examples/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/troubleshooting/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/migration/": "/packages/payload-editor/guides/",
    "/packages/payload-editor/compatibility/": "/packages/payload-editor/api/",
    "/packages/payload-schema/installation/": "/packages/payload-schema/",
    "/packages/payload-schema/quick-start/": "/packages/payload-schema/",
    "/packages/payload-schema/concepts/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/examples/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/troubleshooting/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/migration/": "/packages/payload-schema/guides/",
    "/packages/payload-schema/compatibility/": "/packages/payload-schema/api/",
    "/packages/payload-operations/installation/": "/packages/payload-operations/",
    "/packages/payload-operations/quick-start/": "/packages/payload-operations/",
    "/packages/payload-operations/concepts/": "/packages/payload-operations/guides/",
    "/packages/payload-operations/examples/": "/packages/payload-operations/guides/",
    "/packages/payload-operations/troubleshooting/": "/packages/payload-operations/guides/",
    "/packages/payload-operations/migration/": "/packages/payload-operations/guides/",
    "/packages/payload-operations/compatibility/": "/packages/payload-operations/api/"
  }
}
```

`apps/docs/tests/built-routes.mjs`

```mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import routes from "./legacy-routes.json" with { type: "json" };

const file = route => new URL(`../dist${route}index.html`, import.meta.url);

test("every original page and redirect resolves at the deployment base", () => {
  for (const route of routes.pages) assert.ok(existsSync(file(route)), route);
  for (const [old, current] of Object.entries(routes.redirects)) {
    const html = readFileSync(file(old), "utf8");
    assert.ok(html.includes(`content="0;url=/nexload-sdk${current}"`), old);
    assert.ok(html.includes(`rel="canonical" href="https://gecut.github.io/nexload-sdk${current}"`), old);
    assert.ok(!html.includes("/nexload-sdk/nexload-sdk/"), old);
    assert.ok(existsSync(file(current)), current);
  }
});

test("playgrounds have static instructions and exact package and topic bundle coverage", () => {
  const publicFile = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), "utf8");
  const expected = ["persian", "payload-schema", "healthcheck/core", "healthcheck/prometheus", "healthcheck/otel"];
  for (const path of expected) {
    const route = `packages/${path}/`;
    const page = publicFile(route + "playground.md");
    assert.ok(page.includes("Read the result"));
    assert.ok(page.includes(`/nexload-sdk/${route}api/`));
    assert.doesNotMatch(page, /<PersianPrice|<SchemaField|<HealthReport/);
    const family = path.startsWith("healthcheck/") ? "healthcheck" : path === "persian" ? "core" : "payload";
    for (const bundle of [route + "llms.txt", `llms-${family}.txt`, "llms-playground.txt", "llms-full.txt"]) assert.ok(publicFile(bundle).includes(page), bundle);
    assert.ok(publicFile(route + "playground/index.html").includes("<noscript>"));
  }
  for (const route of routes.pages.filter(route => /^\/packages\/.+\/$/.test(route) && !/\/(guides|api)\/$/.test(route))) {
    assert.equal(existsSync(file(route + "playground/")), expected.some(path => route === `/packages/${path}/`), route);
  }
});
```

`apps/docs/browser/playgrounds.spec.mjs`

```mjs
import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

const base = "/nexload-sdk/packages/";
const cases = [
  ["persian", "IRR", "۱۲۵۰۰", "IRT", "۱٬۲۵۰"],
  ["payload-schema", "Title", " ab ", "SKU", '"AB"'],
  ["healthcheck/core", "JSON", "unhealthy", "OpenMetrics", "# EOF"],
  ["healthcheck/prometheus", "Prometheus", "degraded", "JSON", '"degraded"'],
  ["healthcheck/otel", "OTel", "ok", "Prometheus", "nexload_health_status"],
];

for (const [path, initial, input, mode, result] of cases) {
  test(`${path} updates, shares and restores state at mobile width`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(base + path + "/playground/");
    const lab = page.getByRole("group", { name: "Try a sample" });
    const field = lab.getByRole("textbox");
    const menu = lab.getByRole("combobox");
    const output = lab.locator("output");
    await expect(menu).toHaveValue(initial);
    await expect(output).not.toBeEmpty();
    await field.fill(input);
    await field.press("Tab");
    await expect(menu).toBeFocused();
    await menu.selectOption(mode);
    await expect(output).toContainText(result);
    const href = await lab.getByRole("link", { name: "Share these settings" }).getAttribute("href");
    await page.goto("about:blank");
    await page.goto(href);
    await expect(field).toHaveValue(input);
    await expect(menu).toHaveValue(mode);
    await expect(output).toContainText(result);
    await expect(field).toHaveAttribute("dir", "auto");
    expect(await lab.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test("unknown mode and oversized fragment cannot break the price form", async ({ page }) => {
  await page.goto(base + "persian/playground/#try?mode=unknown&input=" + "9".repeat(150));
  await expect(page.locator("fieldset select")).toHaveValue("IRR");
  await expect(page.locator("fieldset input")).toHaveValue("9".repeat(120));
  await expect(page.locator("fieldset output")).toContainText("whole number");
});

test("server-rendered playground instructions survive disabled JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4328" + base + "payload-schema/playground/");
  await expect(page.getByText("Enable JavaScript to change the sample and see the result.")).toBeVisible();
  await context.close();
});

test("incremental compressed JavaScript stays within the island budgets", async ({ browser }) => {
  async function scriptBytes(path) {
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:4328/nexload-sdk/" + path);
    if (path.includes("playground")) await expect(page.locator("fieldset output")).not.toBeEmpty();
    await page.waitForLoadState("networkidle");
    const sources = await page.evaluate(() => performance.getEntriesByType("resource")
      .map(entry => entry.name).filter(url => new URL(url).pathname.endsWith(".js")));
    const bytes = new Map();
    for (const src of new Set(sources)) bytes.set(src, gzipSync(await (await page.request.get(src)).body()).length);
    await page.close();
    return bytes;
  }
  const baseline = await scriptBytes("start/choose-a-package/");
  for (const [path, limit] of [["persian", 32], ["healthcheck/core", 64], ["payload-schema", 128]]) {
    const loaded = await scriptBytes("packages/" + path + "/playground/");
    const incremental = [...loaded].filter(([src]) => !baseline.has(src)).reduce((sum, [, size]) => sum + size, 0);
    expect(incremental).toBeGreaterThan(0);
    expect(incremental).toBeLessThanOrEqual(limit * 1024);
  }
});
```

`apps/docs/tests/workflow.test.mjs`

```mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("push and pull request filters cover all documentation inputs", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/docs.yml", import.meta.url), "utf8");
  for (const paths of workflow.split("    paths:\n").slice(1)) {
    const block = paths.split(/\n(?!      -)/)[0];
    for (const glob of ["packages/**", "skills/**", "tools/**", "apps/docs/**", "pnpm-lock.yaml", "pnpm-workspace.yaml", ".changeset/**"]) assert.ok(block.includes(`"${glob}"`), glob);
  }
  assert.ok(workflow.includes("pnpm -C apps/docs test:site"));
});
```

- [ ] **Step 2. Observe red.** Run `(cd apps/docs && node --test tests/workflow.test.mjs)`. Expected nonzero exit for missing package/skill globs and browser gate. A missing dependency outside the file under test is a setup failure.

- [ ] **Step 3. Apply the production payloads.**

`apps/docs/playwright.config.mjs`

```mjs
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./browser",
  use: { baseURL: "http://127.0.0.1:4328", viewport: { width: 360, height: 740 } },
  webServer: {
    command: "pnpm exec astro preview --host 127.0.0.1 --port 4328",
    url: "http://127.0.0.1:4328/nexload-sdk/",
    reuseExistingServer: false,
  },
});
```

`apps/docs/package.json`

```diff
--- a/apps/docs/package.json
+++ b/apps/docs/package.json
@@ -14,4 +14,5 @@
     "build": "astro check && astro build",
     "test": "node --test tests/*.test.mjs",
+    "test:site": "node --test tests/built-routes.mjs && playwright test",
     "preview": "astro preview"
   },
@@ -26,4 +27,5 @@
   },
   "devDependencies": {
+    "@playwright/test": "1.56.1",
     "@astrojs/check": "^0.9.9",
     "@nexload-sdk/typescript-config": "workspace:*",
```

`.github/workflows/docs.yml`

```diff
--- a/.github/workflows/docs.yml
+++ b/.github/workflows/docs.yml
@@ -5,16 +5,9 @@
     paths:
       - "apps/docs/**"
-      - "packages/healthcheck/**"
-      - "packages/payload-fields/**"
-      - "packages/payload-editor/**"
-      - "packages/payload-operations/**"
-      - "packages/payload-schema/**"
-      - "skills/healthcheck/**"
-      - "skills/nexload/**"
-      - "skills/payload/**"
-      - "skills/payload-fields/**"
-      - "skills/payload-editor/**"
-      - "skills/payload-operations/**"
-      - "skills/payload-schema/**"
+      - "packages/**"
+      - "skills/**"
+      - "tools/**"
+      - ".changeset/**"
+      - "pnpm-workspace.yaml"
       - ".github/workflows/docs.yml"
       - "README.md"
@@ -25,16 +18,9 @@
     paths:
       - "apps/docs/**"
-      - "packages/healthcheck/**"
-      - "packages/payload-fields/**"
-      - "packages/payload-editor/**"
-      - "packages/payload-operations/**"
-      - "packages/payload-schema/**"
-      - "skills/healthcheck/**"
-      - "skills/nexload/**"
-      - "skills/payload/**"
-      - "skills/payload-fields/**"
-      - "skills/payload-editor/**"
-      - "skills/payload-operations/**"
-      - "skills/payload-schema/**"
+      - "packages/**"
+      - "skills/**"
+      - "tools/**"
+      - ".changeset/**"
+      - "pnpm-workspace.yaml"
       - ".github/workflows/docs.yml"
       - "README.md"
@@ -81,4 +67,7 @@
         run: pnpm install --frozen-lockfile
 
+      - name: Build SDK dependencies for examples and playgrounds
+        run: pnpm exec turbo run build --filter="./packages/**"
+
       - name: Verify public API catalog
         run: pnpm --filter docs content:api
@@ -95,4 +84,10 @@
       - name: Build documentation
         run: pnpm --filter docs build
+
+      - name: Install Chromium
+        run: pnpm -C apps/docs exec playwright install --with-deps chromium
+
+      - name: Test built routes and browser interactions
+        run: pnpm -C apps/docs test:site
 
       - name: Verify generated files are current
```

- [ ] **Resolve the manifest.** Run `pnpm install`. Expected exit 0 and a pnpm-authored `pnpm-lock.yaml` update. Preserve the exact workspace specifiers.

- [ ] **Step 4. Regenerate machine docs.** Run `pnpm -C apps/docs content:llms:write`. Expected a successful generation count. Run `pnpm -C apps/docs content:llms`. Expected the same number of matching pages.

- [ ] **Step 5. Verify green.** Run `(cd apps/docs && node --test tests/workflow.test.mjs)`. Expected zero failing tests.

- [ ] **Run the deployed-site checks.** Run `pnpm -C apps/docs exec playwright install chromium`, `pnpm -C apps/docs build` and `pnpm -C apps/docs test:site`. Expected both Node artifact tests and all eight browser tests pass.

- [ ] **Step 6. Commit on main.** Expected one scoped commit after reviewing the staged diff.

```bash
git add -- apps/docs/tests/legacy-routes.json \
  apps/docs/tests/built-routes.mjs \
  apps/docs/playwright.config.mjs \
  apps/docs/browser/playgrounds.spec.mjs \
  apps/docs/package.json \
  .github/workflows/docs.yml \
  apps/docs/tests/workflow.test.mjs \
  apps/docs/public \
  pnpm-lock.yaml
git diff --cached --stat
git commit -m "ci(docs): validate all inputs and test the deployed site"
```

### Task 9: Full verification and handoff

**Files:** Read the committed tree and generated output. The checks exercise `apps/docs/tests/contracts.test.mjs`, `discovery.test.mjs`, `optimization.test.mjs`, `agent-pages.test.mjs`, `bundles.test.mjs`, `persian-lab.test.mjs`, `schema-lab.test.mjs`, `health-lab.test.mjs`, `workflow.test.mjs`, `built-routes.mjs` and `apps/docs/browser/playgrounds.spec.mjs`.

**Interfaces:** Consume the eight implementation commits. Produce the exact command results, package/page counts and enola report for the handoff. This task adds no commit.

- [ ] Run `pnpm -C apps/docs build`. Expected successful prebuild, examples check, Astro check and static build.
- [ ] Run `pnpm -C apps/docs test`. Expected zero failing Node tests.
- [ ] Run `pnpm -C apps/docs test:site`. Expected route and bundle checks pass, eight Chromium cases pass.
- [ ] Run `pnpm lint`. Expected exit 0.
- [ ] Run `pnpm build`. Expected exit 0, including Turbo dependencies for the docs app.
- [ ] Run `pnpm test`. Expected exit 0. Preserve logs for unrelated baseline failures and identify their owning package.
- [ ] Run `pnpm -C apps/docs content:api`. Expected 15 documented packages match the catalog.
- [ ] Run `pnpm -C apps/docs content:llms`. Expected 107 matching source pages.
- [ ] Run `git diff --exit-code -- apps/docs/src/generated apps/docs/public` and `git ls-files --others --exclude-standard -- apps/docs/public apps/docs/src/generated`. Expected no drift and no new unstaged generated files.
- [ ] Run `enola --generate`. Expected a current snapshot.
- [ ] Run `enola check`. Record the actual exit code and every finding. Exit 0 can include unenforced findings. Exit 1 requires fixing introduced enforced regressions. Exit 2 or 3 means grading failed. Preserve the baseline and report its status.
- [ ] Run `git status --short --branch` and `git log -8 --oneline`. Expected eight scoped implementation commits on main, plus only separately identified pre-existing or local generated state. Report actual checks, missing evidence and any failed gate.

**Decision summary:** Keep Astro/Starlight and the existing routes. Add source-backed optimization and agent setup to all 17 package sections, configuration references for both tooling packages and three browser widgets across five routes. Keep the machine outputs in sync and verify the build at the deployment base. **Nine tasks.**
