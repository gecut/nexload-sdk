# Source research and design rationale

Research performed 2026-10-10 against cloned source, not only READMEs. External projects are
architectural references, not inputs to a project's generated context. No upstream code or prompt
was copied into the skill. References below are pinned to inspected commits for reproducibility.

## TasteCode — primary architecture

[Leonxlnx/tastecode, de5448a020199b40dfc7917cc5644d5e44f561eb](https://github.com/Leonxlnx/tastecode/tree/de5448a020199b40dfc7917cc5644d5e44f561eb).
Inspected `docs/DESIGN-AGENT.md`; `packages/design-agent/src/brief.ts`, `brand.ts`, `page.ts`,
`assets.ts`, `brand-phase.ts`, `page-phase.ts`, `asset-phase.ts`, `build-phase.ts`, `review-phase.ts`,
`workflow.ts`, `parse.ts`, `content-guidance.ts`, `typography.ts`, `reference-library.ts`,
`reference-directions.ts`, `index.ts`, `run.ts`, `artifact-store.ts`, `file-snapshot.ts`; targeted
`apps/server/src/orchestrator.ts` sections for approved-artifact gates, phase completion and retry.
There is no `src/review.ts` at this revision; review contracts/parsing live in `review-phase.ts`.
Rendering/acquisition helpers were examined only through relevant callers; preview was not run.

| Classification | Source-level finding | Compiler decision |
| --- | --- | --- |
| Adopt | `brief.ts` rebuilds allowed fields; `parse.ts` narrows unknown values; phase parsers reject surrounding prose | Validate strict JSON and reject additional properties rather than retaining model-authored executable text |
| Adopt | Brief → Brand → Page → Assets artifact ownership; server phase completion validates before advancing | Separate owner files and validate the whole cross-reference contract before handoff |
| Adopt | Server rechecks approved brief/brand/page equality and asset snapshots before subsequent work | Revalidate primary bytes and regenerate affected owners explicitly; prior output is derived input |
| Adapt | `DesignBrief` owns request, subject, scope, goal, audience, offer, actions, content, constraints, brand inputs, assumptions and unresolved details | Expand to product/flows/permissions/domain rules and trace every semantic assertion through a shared claim registry |
| Adapt | Page section dependencies must reference earlier IDs; assets exactly cover recorded page needs and consumers | Use semantic sections and reciprocal page/asset references, without layout recipes or downloadable components |
| Adapt | Real file/provenance/extension/font/raster checks establish availability, not just a path string | Verify local source existence/hash/excerpts; record image/font metadata and rights uncertainty; acquisition stays downstream |
| Adapt | `review-phase.ts` distinguishes automated and visual evidence, validates required capture coverage and detects cropped screenshots | Capture conditions in evidence locators; do not claim unseen or untested states pass |
| Adapt | Current orchestration bounds correction by repeated error and planning error budget; asset failure permits one explicit page replan | Two compiler correction passes; never hide unresolved conflicts or rewrite requirements to pass |
| Reject | Schema permits historical defaults and some normalization, while phase parsers permit a complete JSON fence | Generated context accepts JSON only; missing fields/version changes fail rather than receiving invented fallback meaning |
| Reject | Reference locks determine section macro composition; palettes/fonts/layouts/motion are generated and checked for Build | Stop before screen composition and implementation; retain only explicit project constraints and derived abstract direction |
| Reject | Typography candidates are randomized; motion and section-count defaults exist in shared prompts | No arbitrary font, animation, eight-section or catalog-selection mandate |
| Reject | Autonomous workflow categorically avoids user questions and promotes unknowns to design defaults | Ask only consequential unresolved intent; safe gaps may stay unknown or labeled assumptions |

Important documentation drift: `docs/DESIGN-AGENT.md` describes a tool-free briefing and one
correction; current `workflow.ts` permits bounded existing-project inspection, and orchestration's
planning correction logic allows progress through up to three distinct errors. These differences
are why source behavior, not a README snapshot, informed the skill. Build/Preview/Repair mechanisms
remain outside the compiler's ownership. TasteCode parsers are not claimed to implement this skill's
source-authority/provenance model; that is a new contract.

## designer-skills — discovery

[julianoczkowski/designer-skills, c259656c76d9758d7ead46b0d2f125cbe84f8665](https://github.com/julianoczkowski/designer-skills/tree/c259656c76d9758d7ead46b0d2f125cbe84f8665).
Read `design-flow/SKILL.md`, `design-brief/SKILL.md`, `information-architecture/SKILL.md`,
`design-tokens/SKILL.md`, `design-review/SKILL.md`, `grill-me/SKILL.md`, and `brief-to-tasks/SKILL.md`.
These six required skills are prompt implementations, with no bundled executable schema/parser.

- **Adopt:** inspect-before-asking; targeted CSS variables/themes/fonts/manifests/Storybook/routes/
  layouts/CMS discovery; explicit scope exclusions and real versus placeholder content; viewport/state
  screenshot anchors and relevant state/accessibility checklists.
- **Adapt:** IA templates for navigation, naming, hierarchy, conditional flows and boundaries become
  layered JSON nodes. Observed component reuse becomes code evidence, not canonical component APIs.
  Resume checks use source freshness instead of file existence. Screenshots supplement source analysis.
- **Reject:** newest-modified-brief selection, repetitive interviewing, skippable phases/approval loops,
  mandatory dark mode, CSS/Tailwind token output, and task/build ownership.

## brand-book — identity and ambiguity

[ordinarynerds/brand-book, 127f1fa459e1d41e327a12ac1e8081740eea7bf9](https://github.com/ordinarynerds/brand-book/tree/127f1fa459e1d41e327a12ac1e8081740eea7bf9).
Read both `brand-book-html/SKILL.md` and `brand-book-paper/SKILL.md`, their supporting intake/assets/
brand-json/companion/build/layout references, and HTML `scripts/gen_tokens.py`, `svgkit.py`,
`embed_assets.py`. Its illustrative `brand.json` reference is JSONC, not a strict executable schema.

- **Adopt:** one machine record; usage-based token mapping; explicit collisions/unmatched values;
  actual copy as voice evidence; separate logo/mark candidates and durable asset inventory.
- **Adapt:** identity/typography/color/logo/voice/imagery categories become claim projections with
  source IDs, non-overlapping confidence criteria, freshness and unknown rights. DOM color frequency
  is candidate evidence, not proof of intentional identity or painted prominence.
- **Reject:** exactly-one-accent/Swiss-white/font defaults, book production, SVG recoloring and inferred
  logo extraction. Its SVG path bounds ignore material transforms/shapes and its token generator
  covers a subset; those cannot establish safe asset modification or complete schema validation.

## taste-skill — specificity without design ownership

[Leonxlnx/taste-skill, 717446e07a78d4e6d7918b1fde1a263378eebac9](https://github.com/Leonxlnx/taste-skill/tree/717446e07a78d4e6d7918b1fde1a263378eebac9).
Read `skills/taste-skill/SKILL.md` (current name `design-taste-frontend`), `redesign-skill`,
`minimalist-skill`, and `gpt-tasteskill` instructions.

- **Adopt:** audience/brand first, preserve-before-redesign audit, purposeful feedback motion,
  plain functional copy, authentic product evidence and no fabricated metric certainty.
- **Adapt:** hierarchy/grouping/density/script-readable type roles and specific restraints become
  contextual principles tied to product tasks. Default card grids/gradients are questioned by fitness,
  not universally prohibited. Static direction and text-first products remain valid.
- **Reject:** style dials, palette rotation, font/color bans, compulsory animation/imagery/asymmetry,
  implementation stacks, synthetic “organic” metrics and simulated verification/randomness.
  The related skills disagree on typefaces, radii and text-only pages; they are not one authority.

## Additional primary references

[Agent Skills specification](https://agentskills.io/specification): adopt frontmatter, portable
scripts/references and progressive disclosure. Repository convention uses namespaced nested public
folders; keep `skills/nexload/design-context/` and frontmatter `nexload-design-context`, consistent
with neighboring Nexload skills. No automatic installation into global agent directories.

[DTCG Format 2025.10](https://www.designtokens.org/tr/2025.10/format/): adapt semantic types/aliases and
cycle rejection; reject automatic exporter/theme implementation. Context tokens intentionally are
not DTCG files: their contract includes source claims and partial/unknown semantic direction.

[python-jsonschema 4.25.1 validation documentation](https://github.com/python-jsonschema/jsonschema/blob/v4.25.1/docs/validate.rst):
adopt full Draft202012Validator and format checking with self-contained definitions; avoid a homegrown
subset pretending to validate JSON Schema. Context7 docs were consulted for this exact validation use.

## Final architecture and known limit

The twelve root artifacts plus per-page contracts retain the requested ownership separation.
`claims.json` is the intentional addition: common assertions/provenance/change policies are owned
once rather than being copied or wrapped around every scalar. One self-contained schema owns all
artifact definitions. A read-only validator computes structural validity independently from design
readiness; malformed context cannot pass, while valid blocked/conditional context remains useful.

A deterministic checker cannot prove evidence entails a statement, source ownership is truthful,
a remote capture happened, or the agent found every applicable state. The pipeline therefore
requires source inspection, coverage assessments and an adversarial semantic evidence review.
Unit tests verify contract rejection/acceptance; scenario/trigger fixtures enable independent agent
forward-tests. Synthetic checks are not represented as production or full autonomous benchmarks.

Adversarial evaluation led to four additional contracts: role gates are independent of login
technology; mutations need success/disabled feedback even without a form; intentional current/desired
drift retains both layers; historical candidates remain inspectable while prior derived context cannot
resolve a factual gap. Removed page IDs must be disjoint from the active scope. See
[the evaluation record](../evals/results.md) for actual runs and remaining unrun scenarios.
