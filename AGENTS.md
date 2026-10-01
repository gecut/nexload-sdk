# AGENTS.md

Repository-specific guidance for humans and coding agents working in `nexload-sdk`.

## Scope

This file applies to the whole repository unless a deeper `AGENTS.md` overrides it.

## Repo Summary

- Monorepo managed with `pnpm` + `turbo`
- Publishable packages live in `packages/*`
- Internal tooling lives in `tools/*`
- Demo app lives in `apps/web`
- Releases use Changesets (`.changeset`)

## Preferred Workflow

1. Read the target package `README.md` and `package.json` first.
2. Inspect `src/index.ts` (and exported subpaths) before changing docs or APIs.
3. Keep package docs aligned with actual exports and runtime behavior.
4. Avoid editing generated outputs in `dist/`.
5. If behavior changes, update the relevant package `README.md` in the same change.

## Build / Lint Commands

Run from repo root unless a package-specific run is faster:

- `pnpm build`
- `pnpm lint`
- `pnpm -C packages/<name> build`
- `pnpm -C packages/<name> lint`

## Package Conventions

- Source is TypeScript (`src/`)
- Bundled outputs go to `dist/`
- Package-level bundling commonly uses `esbuild.config.mjs`
- Exports are defined in each package `package.json`
- Many packages depend on `@nexload-sdk/env` and/or `@nexload-sdk/logger`

## Documentation Rules

- Do not describe features that are not implemented in `src/`
- Prefer minimal, copy-pasteable examples
- Mention subpath exports explicitly when required (for example package extensions)
- Document runtime constraints (Node-only, browser-only, Payload admin-only, etc.)
- Call out known caveats when they affect integration behavior

## Release / Publishing Notes

- Versions are tracked with Changesets
- `package.json` versions may change across many packages in one release
- Do not edit changelog/version files unless part of the requested task
- Do not publish from an agent without explicit user instruction

## Safety Notes

- This repo may contain local unpublished changes; do not revert unrelated work
- Avoid destructive git commands unless explicitly requested

## Knowledge Graph (graphify) — MANDATORY FOR ALL AGENTS

The repository maintains an authoritative code knowledge graph in `graphify-out/`.

**Strict Agent Requirements:**
1. **Query Before Grepping:** When `graphify-out/graph.json` exists, you MUST query the graph first instead of performing exhaustive greps or blindly reading source trees:
   - Targeted queries: `graphify query "<question>"`
   - Symbol / module inspection: `graphify explain "<path>::<symbol>"`
   - Dependency / connection paths: `graphify path "<source>" "<target>"`
   - Architecture hubs: `graphify god-nodes` or review `graphify-out/GRAPH_REPORT.md`
2. **Sync Graph After Changes:** You MUST run `graphify update .` (or `pnpm graphify`) after modifying, adding, or deleting any code files before concluding work. It is local, AST-only, fast, and incurs zero LLM cost.
3. **Never Revert Graph Updates:** Dirty files in `graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`) are expected and normal after edits. Never revert them or skip graphify because of modified graph artifacts.

