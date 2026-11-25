# Docs Site Rebuild — Research Brief

Date: 2026-11-25. Status: input for the implementation plan. The planner makes the final decisions listed under "Open decisions".

## 1. Intent

Rebuild `apps/docs` so a developer arriving from the community (GitHub, a blog post, a recommendation) understands within minutes what Nexload SDK offers, which package solves their problem, and how to use it well. Interactive playgrounds serve the same goal: let people try a package before installing it.

Every package section must cover four things:

1. **Usage**: install, quick start, guides, API reference.
2. **Optimization**: performance, production hardening, correct defaults, common mistakes. Source this only from what `src/`, READMEs ("Caveats", "Runtime and compatibility", "Configuration") and skills already state. Never invent behavior.
3. **Agent usage**: how to use the package through coding agents: the matching skills in `skills/`, install commands (`npx skills add gecut/nexload-sdk --skill <name>`), the AGENTS.md snippet, the scoped `llms-*.txt` bundle, and copy-paste prompts.
4. **Playground**: only for packages with simple setup (runs fully in the browser, no server, no Payload). Must be interactive and engaging, not a static snippet.

### User decisions (fixed)

- Audience: community newcomers; fast comprehension is the success measure.
- Structure should resemble docs of similar open-source TypeScript libraries.
- Playgrounds only for simple-setup packages, and they must be interactive.
- Everything else is the planner's call, based on the project goal (`docs/README.md` "Project Intent") and this brief.

### Non-goals

- No docs for features that are not implemented in `src/` (AGENTS.md rule).
- No playground that needs a running Payload, database, Next.js server or Node-only API.
- No package source changes unless a doc build needs a public, already-implemented export.
- No publishing, no version or changelog edits.

## 2. Project facts

- Monorepo: pnpm 10.26 + turbo. Workspaces: `apps/*`, `packages/**`, `tools/*`. Work on `main`.
- Project goal: ship Iranian e-commerce sites on Payload CMS + Next.js fast. Iran-specific concerns (Persian, RTL, Jalali, Rial/Toman) are first-class. See `docs/README.md`.
- Logging rule: no `console.*` in package or app source; use `@nexload-sdk/logger` (playground code in `apps/docs` counts as app source).
- Required reading for the builder: `AGENTS.md`, `docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `docs/README.md`, `docs/workflows/AGENT-GUIDELINES.md`, `docs/packages/*.md`, `docs/skills/*.md`.

## 3. Current `apps/docs`

- Stack: Astro `^6.4.8` + `@astrojs/starlight` `^0.40.0`, theme `starlight-theme-flexoki`. Deployed to GitHub Pages: `site: https://gecut.github.io`, `base: /nexload-sdk`. Workflow: `.github/workflows/docs.yml` (validate + optional deploy via `workflow_dispatch`).
- Scripts (`apps/docs/package.json`):
  - `content:api` / `content:api:write`: `scripts/generate-api.mjs` builds `src/generated/api-catalog.json` from entries in `scripts/api-packages.mjs`.
  - `content:llms` / `content:llms:write`: `scripts/generate-markdown.mjs` writes `public/llms.txt`, `llms-full.txt`, `llms-core.txt`, `llms-payload.txt`, `llms-healthcheck.txt`, `llms-tooling.txt`, per-page `.md` copies and `markdown-manifest.json`.
  - `content:examples`: `tsc --project examples/tsconfig.json --noEmit` type-checks `examples/*.ts` (one per package, healthcheck per adapter).
  - `prebuild` runs all three; `build` = `astro check && astro build`; `test` = `node --test tests/*.test.mjs`.
- Tests (`tests/contracts.test.mjs`): every public export appears in `llms-full.txt` with its source URL; each package has three canonical topics; machine docs keep install info; out-of-scope packages absent; overviews include install + scoped LLM bundle; installation matrix lists every public package.
- Content (66 MDX pages) under `src/content/docs/`:
  - `index.mdx`
  - `start/`: introduction, choose-a-package, installation, glossary, payload-packages, recipes/ecommerce-stack
  - `packages/<pkg>/{index,guides,api}.mdx` for 15 packages, `{index,guides}` for typescript-config and eslint-config, `packages/index.mdx`
  - `agents/`: index, install, domain-skills, engineering, protocols, reasoning
  - `standards/`: agent-setup-prompt, file-structure
  - `community/support.mdx`
- Components (`src/components/docs/`): ApiInventory, ApiSymbol, CompatibilityMatrix, DocLinkCard, DocsStatus, InstallTabs, InstallationMatrix, PackageGrid, PackageHero, SkillInstall. Starlight override: TableOfContents. Libs: `src/lib/package-catalog.ts`, `src/lib/paths.ts`. Custom 404 page. CSS: `src/styles/docs.css`.
- `astro.config.mjs` carries a long `redirects` map of retired URLs. Any new IA must keep old URLs working (add redirects; do not drop existing ones).
- Sidebar groups today: Getting Started · Core Primitives · Healthcheck & Observability · Payload CMS Extensions · Tooling & Standards · (agents, standards, community).

### Problems found

- IA is package-first and maintainer-oriented; a newcomer has no problem-first entry ("I need Jalali dates in Payload").
- Each package has only overview / guides / api. No optimization page, no per-package agent page, no playground.
- `docs.yml` path filters omit `packages/logger/**`, `packages/persian/**`, `packages/payload-hooks/**`, `packages/payload-preset/**`, `skills/logger/**`, `skills/persian/**`, `skills/payload-preset/**`, `skills/nexload-reasoning/**`. Changes there do not trigger docs validation.
- `@nexload-sdk/persian` and `@nexload-sdk/payload-preset` have version `0.0.0` (unreleased). Docs must show release status honestly (the `DocsStatus` component exists for this).

## 4. Package inventory

| Package | Path | Version | Subpath exports | Peers / deps | Browser-safe? |
| --- | --- | --- | --- | --- | --- |
| `@nexload-sdk/logger` | `packages/logger` | 4.1.0 | `.`, `./testing` | dep `pino` | Yes: `browser`/`edge-light`/`worker` conditions map to `dist/index.browser.mjs`; Node build uses `node:async_hooks`, `node:crypto` |
| `@nexload-sdk/persian` | `packages/persian` | 0.0.0 | `.`, `./bank`, `./date`, `./digits`, `./geo`, `./identity`, `./mobile`, `./money`, `./relative`, `./text`, `./zod` | optional peer `zod` | Yes, zero runtime deps |
| `@nexload-sdk/healthcheck` | `packages/healthcheck/core` | 4.1.0 | `.` | none | Yes, runtime-neutral, no imports |
| `@nexload-sdk/healthcheck-prometheus` | `packages/healthcheck/prometheus` | 2.1.0 | `.` | core | Yes |
| `@nexload-sdk/healthcheck-otel` | `packages/healthcheck/otel` | 2.1.0 | `.` | core | Yes |
| `@nexload-sdk/healthcheck-node` | `packages/healthcheck/node` | 2.1.0 | `.` | core | No (Node, cgroups, TCP, DNS) |
| `@nexload-sdk/healthcheck-bun` | `packages/healthcheck/bun` | 2.1.0 | `.` | core | No (Bun) |
| `@nexload-sdk/healthcheck-next` | `packages/healthcheck/next` | 2.1.0 | `.` | core, prometheus | No (Next route handlers) |
| `@nexload-sdk/healthcheck-payload` | `packages/healthcheck/payload` | 2.1.0 | `.` | peer `payload` | No |
| `@nexload-sdk/payload-schema` | `packages/payload-schema` | 2.0.0 | `.`, `./payload` | peers `payload`, `zod` | Root entry: yes (only `import type` from `payload`, runtime `zod`). `./payload` needs Payload |
| `@nexload-sdk/payload-operations` | `packages/payload-operations` | 1.0.0 | `.`, `./client`, `./cms`, `./contract`, `./errors`, `./plugins/timeout`, `./server` | peers `@payloadcms/sdk`, `payload`, `zod` | `./contract` + `./client` are type-only on Payload and use `zod`; runnable in browser only with a mocked `fetch`. `./server`, `./cms` need Payload |
| `@nexload-sdk/payload-fields` | `packages/payload-fields` | 3.1.0 | `.`, `./date`, `./money`, `./slug`, `./schema`, `./admin/*` | peers Payload UI, React 19, zod; deps persian, react-day-picker | No (Payload admin) |
| `@nexload-sdk/payload-editor` | `packages/payload-editor` | 1.1.0 | `.` | peers payload, richtext-lexical | No |
| `@nexload-sdk/payload-hooks` | `packages/payload-hooks` | 2.1.0 | `.` | peer payload; dep logger | No |
| `@nexload-sdk/payload-preset` | `packages/payload-preset` | 0.0.0 | `.` | peers payload, translations | No |
| `@nexload-sdk/eslint-config`, `typescript-config`, `bundler` | `tools/*` | — | — | — | Internal tooling |

Package READMEs share one structure (Overview, Philosophy, Install, Quick start, Usage, API, Configuration, Runtime and compatibility, Caveats, Migration, Related packages). Total ~3,400 lines. They are the source of truth for page content. Note: some README migration headings name future majors (for example logger "From v4 to v5" while the package is 4.1.0); check against `.changeset/` before copying.

### Playground candidates (simple setup)

| Package | Interactive idea |
| --- | --- |
| `persian` | Type any input (mobile, کد ملی, card, Sheba, price, date); see normalization, validation result with error codes, formatted output and relative time live. Toggle IRR/IRT units. |
| `healthcheck` + `-prometheus` + `-otel` | Build a manager with a few checks; toggle a check to fail/slow/timeout, switch scope (liveness/readiness/startup); see the JSON report, aggregated status and Prometheus/OpenMetrics/OTel output update. |
| `payload-schema` (root entry) | Pick or edit a canonical field definition; enter sample input; see the derived Zod schema result, canonical output and issues. |
| `logger` (browser build) | Log an object with secrets; see redaction, child bindings, levels, error serialization. |
| `payload-operations` (`./contract` + `./client`, optional) | Define an operation contract; call it through `createOperationsClient` with an in-page mocked transport; see typed result, declared errors and `z.codec` Date round-trip. Planner decides if this is still "simple setup". |

Playground code imports the workspace packages (`workspace:*`). Bundle size and SSR safety must be checked: Starlight pages are static; interactive parts are client islands.

## 5. Skills inventory (36 `SKILL.md`)

- `skills/logger` (+ `evals`, `references`)
- `skills/persian` (+ `evals`, `references`)
- `skills/payload-preset` (+ `evals`, `references`)
- `skills/healthcheck/{core,custom-checks,container-resources,nextjs-routes,monitoring-exporters,payload,diagnostics-security}`
- `skills/payload-fields/{core,slug,jalali-date,money}`
- `skills/payload-schema/{use,develop}` (`develop` is for maintainers of the package)
- `skills/payload-editor/{core,presets,extensions}`
- `skills/payload-operations/{core,server,client}`
- `skills/payload/collection-design`
- `skills/nexload/{code,react,package,design,design-context,cto-review}` (engineering standards)
- `skills/nexload-reasoning/{nexload-reasoning,-discovery,-ideation,-design,-evaluation,-execution,-investigation}`

Docs references: `docs/skills/DOMAIN-SKILLS.md`, `ENGINEERING-STANDARDS.md`, `REASONING-ECOSYSTEM.md`. Install: `npx skills add gecut/nexload-sdk --list` and `--skill <name>`. Each skill's `description` frontmatter states when it triggers; per-package agent pages should quote that trigger scope, list the skill names, and give the install command.

## 6. Prior art (docs of similar TypeScript libraries)

Patterns worth borrowing, by name:

- **Problem-first landing + "pick your path"** (Astro docs, TanStack): landing shows use cases, then routes to packages.
- **Diátaxis split** (Tutorials / How-to / Reference / Explanation), used by many library docs.
- **Interactive try-it** (Zod and Valibot playgrounds, date-fns examples, Shiki playground, regex101 style input-to-output panes): edit input, see output instantly, shareable state in the URL.
- **AI-ready docs** (`llms.txt`, per-page Markdown, "copy page for LLM" buttons) as on Vercel/Next.js, Svelte, Cloudflare docs. This repo already emits `llms*.txt`.
- **Per-package "Performance" or "Production checklist" pages** (Next.js production checklist, pino docs on transports and redaction cost).

## 7. Open decisions (the planner owns these)

1. Final IA: sections, sidebar, URL scheme, and per-package page set (for example overview / guides / optimization / agents / api / playground). Map every old URL to a new one with redirects.
2. Playground technology: form-driven widgets as Astro islands (framework choice: plain TS web components, Preact, React, Svelte, Solid) versus a live code editor (CodeMirror/Monaco plus in-browser transpile or sandboxed iframe). Pick one, justify bundle size, a11y, RTL and SSR safety.
3. Which playgrounds ship in this iteration (from the candidates above).
4. Landing page and "choose a package" design for newcomers, including problem-first entry points that match the project goal (Iranian e-commerce on Payload + Next.js).
5. How generators (`generate-api.mjs`, `generate-markdown.mjs`), `examples/`, `api-packages.mjs` and contract tests change to cover new page types (optimization, agents, playground) and the new llms bundles.
6. Whether `docs/` (repo-internal knowledge base) content is reused, linked, or kept internal.
7. CI changes: fix `docs.yml` path filters; add playground tests (unit tests for the playground logic, plus build-time checks).
8. Persian/RTL handling inside playgrounds (inputs accept Persian digits; output direction).

## 8. Verification gates for the build

- `pnpm -C apps/docs build` (includes prebuild generators, `astro check`).
- `pnpm -C apps/docs test`.
- `pnpm lint`, `pnpm build`, `pnpm test` at the root.
- `enola --generate` then `enola check`.
- Manual: playgrounds work in the dev server at the `/nexload-sdk` base, no console errors, keyboard accessible, mobile width.
