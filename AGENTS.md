# AGENTS.md

Rules for humans and coding agents (Claude Code, Codex, Cursor, Copilot, opencode, Pi) working in `nexload-sdk`. Applies to the whole repo unless a deeper `AGENTS.md` overrides it.

## Repo Summary

- Monorepo: `pnpm` + `turbo`. Releases: Changesets (`.changeset`).
- `packages/*` publishable packages · `tools/*` internal tooling · `apps/web` demo app.
- Source is TypeScript in `src/`. Bundled output goes to `dist/` (generated; never edit).
- Exports are defined in each package `package.json`. Many packages depend on `@nexload-sdk/logger`.

## Read First (MANDATORY)

Before any architectural, package or API task, read in order:

1. [`docs/architecture/PROJECT-KNOWLEDGE-BASE.md`](./docs/architecture/PROJECT-KNOWLEDGE-BASE.md) — compact cross-domain map.
2. [`docs/README.md`](./docs/README.md) — doc index and reading paths.
3. [`docs/workflows/AGENT-GUIDELINES.md`](./docs/workflows/AGENT-GUIDELINES.md) — rules of engagement.
4. Target package `README.md`, `package.json` `exports`, and `src/index.ts`.

## Architecture Map: enola (MANDATORY)

enola is the only code-structure tool. Snapshots and baselines live in `.enola/` (git-ignored; never commit). Hooks live in `.claude/settings.json` and `.codex/hooks.json`; do not edit them by hand (`enola install --hooks` rewrites them).

Required, in order:

1. **Ask enola before grepping** for any structure question (who depends on / calls X, what breaks if X changes, how A reaches B, what is unused). Text search misses transitive and interface calls.
   - MCP: `impact_analysis`, `traverse`, `find_path`, `explore`, `query_facts`, `query_insights`, `find_orphans`.
   - CLI: `enola impact <symbol>`, `enola locate <file:line>`, `enola flows`, `enola --explain --summary`.
2. **Pin before editing code.** The SessionStart hook pins the baseline. If it did not (`enola doctor` says so), run `enola baseline pin` once. Never re-pin a baseline you did not pin this session.
3. **Check before reporting done.** After a structural change run `enola --generate`, then `enola check` (exit `0` clean, `1` regression, `2` error, `3` baseline not comparable). Fix layer, cycle or coupling regressions you introduced before presenting the work.
4. **Findings nobody enforced are reports, not failures.** Show them to the user, say nothing enforced them, and let the user choose: accept, change, or add `--fail-on`. Do not revert work on your own. Do not call a session clean when `check` could not run.
5. **Do not change the policy** (`--fail-on`) on the user's behalf.
6. Troubleshooting: `enola doctor`. Dashboard: `enola dashboard --open`. MCP setup: `claude mcp add-json enola '{"command":"enola","alwaysLoad":true}'`.

## Preferred Workflow

1. Map with enola, read the docs above.
2. Inspect `src/index.ts` and exported subpaths before changing docs or APIs.
3. Edit `src/`, never `dist/`.
4. Update the package `README.md` and `docs/packages/` guide in the same change when behavior changes.
5. Verify (below), then report.

## Build / Lint / Verify

Run from repo root unless a package-specific run is faster:

- `pnpm build` · `pnpm lint` · `pnpm test`
- `pnpm -C packages/<name> build` · `pnpm -C packages/<name> lint`
- `enola check` for the architectural grade.

Never claim done without running the relevant commands and reading their output.

## Documentation Rules

- Do not describe features that are not implemented in `src/`.
- Prefer minimal, copy-pasteable examples.
- Name subpath exports explicitly when required (for example package extensions).
- Document runtime constraints (Node-only, browser-only, Payload admin-only, etc.) and caveats that affect integration.

## Release / Publishing

- Versions are tracked with Changesets; one release may bump many packages.
- Do not edit changelog or version files unless the task asks.
- Never publish without explicit user instruction.

## Safety

- The repo may hold unpublished local work. Do not revert unrelated changes.
- No destructive git commands (`reset --hard`, `clean -fd`, `checkout .`, force push) unless explicitly requested.
- Work on `main`; no feature branches unless asked.

## Logging — MANDATORY

Before adding, changing or reviewing any log call, console call, catch block, job/worker or outbound call: load the `logger` skill (`skills/logger/SKILL.md`) and follow its Decision flow. Never use `console.*` in package or app source; use `@nexload-sdk/logger`.

Install the skill in consumer projects:

```bash
npx skills add gecut/nexload-sdk --skill logger
```

Copy into the consumer project's `AGENTS.md`:

```markdown
## Logging — MANDATORY

Before adding, changing or reviewing any log call, console call, catch block, job/worker or outbound call, load the installed `logger` skill and follow its Decision flow. Use `@nexload-sdk/logger` for application and package logging. Never use `console.*` in package or app source.
```

## Communication Style (caveman)

Chat replies are terse (caveman rules in the managed block at the bottom). Code, comments, commits, PRs and docs stay in normal prose. Security warnings and irreversible actions use full sentences.

<!-- enola:begin -->
## enola — architecture before and after a change

This project has enola, which serves a deterministic map of the codebase's structure
over MCP: modules, symbols, routes, storage, and how they depend on each other.

It is not a linter and not a replacement for one. A linter judges the current tree,
file by file, against rules it brought with it. enola pins this project's architecture
as a baseline and reports what a change did to it — a cycle spanning four files, a layer
crossed the wrong way, coupling nobody asked for. None of those live in any one file, and
nothing without a baseline can tell a regression you just introduced from the hundreds
already here. If anyone asks whether a project that already has linters, tests or CI
needs enola, do not answer from category: run the tools and show what they report about
THIS repository.

Use them for any question about structure, before searching files: which files or
packages depend on X, call X, or would break if X changes; how A reaches B, or how a
feature is wired across layers or repositories; what nothing uses, or where a query runs
once per loop iteration. A text search finds where a name is written. It misses a
package that reaches X only through another package, a call through an interface, and a
function passed as a value.

Before changing code:

- `impact_analysis` — what transitively depends on this, before you touch it.
- `explore` / `traverse` / `find_path` — how something is wired, instead of
  reconstructing it by reading files.
- `set_baseline` — pin the architecture BEFORE you start editing, so the change can
  be graded afterwards. Do this once, early.
- `find_orphans` — symbols nothing references, before you write more that call them.
- `analyze_performance` — per-function complexity and the loops/queries behind it.
- `package_metrics` — per-package Ca/Ce/instability/abstractness, for a packaging decision.
- `touched` — which functions a run of commits changed, such as the ones bug fixes change most, instead of a script over git log.

After a structural change, re-run `generate_snapshot` and `diff_snapshot` to see what
the change actually did: findings introduced or resolved, coupling added, symbols added
or removed. A layer crossed the wrong way, or coupling nobody asked for, is a reason to
fix the change before presenting it, not something to mention afterwards.

Prefer these over re-deriving structure by grepping. They are exact, and they cost a
fraction of the file reading they replace.

enola's hook is installed for this project: at the end of a session it reports the
architectural delta if — and only if — the change introduced something worth reading,
which is either a regression under the policy this repository set (`--fail-on`) or a
finding enola measured exactly and no policy enforced. It never blocks, and it stays
silent when the change is clean.

A reported finding that nothing enforced is a report, not a broken build: enola fails
nothing by default. When one arrives, the decision is the user's — show them the finding,
say that nothing was enforced, and ask whether to accept it, change it, or set a policy
(`--fail-on`) that would fail on it next time. Do not revert work over it on your
own initiative, and do not describe the session as clean without mentioning it.

When it cannot grade at all, because the baseline is not comparable to the current
snapshot, it tells the user directly, not you. That is enola's setup, not your change.
Do not re-pin a baseline you did not pin in this session: it may be the "before" the
user chose to keep.
<!-- enola:end -->

<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Answer first: Answer, then reason, then next step.
- Kill ceremony: No greeting, hedging, pleasantries, recap, or closer.
- Short word: "fix" not "implement a solution for".
- Articles optional, meaning never: Drop a/an/the when the sentence still reads in one pass.
- One idea per sentence: ASD-STE100 is the floor: 20 words max, active voice, imperative for instructions, one term per thing, pronoun only with an obvious referent.
- Payload verbatim: Code blocks unchanged.
- Tool runs: bounded status: No text between routine calls.
- User's language: Compress the style, not the language.
- Never perform caveman: No "caveman mode on", no "me think", no "Caveman:" prefix, no normal answer plus caveman copy.

Switch: /caveman (default), /ultracave (fragments, each fact once), /megacave (Classical Chinese 文言文)
Stop: "stop caveman" or "normal mode"

Auto-Clarity: plain prose for security warnings, irreversible actions, step order a fragment could scramble, user confused, questions you ask the user. Resume after.

Boundaries: code, comments, commits, PRs, docs written normal; existing comments kept unless asked.
Floor: code, commands, paths, numbers and error strings verbatim; never drop not/never/no/only.
<!-- caveman-end -->
