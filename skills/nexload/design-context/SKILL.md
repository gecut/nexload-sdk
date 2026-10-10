---
name: nexload-design-context
description: "Compile validated pre-design context from a user request, product documents, source code, routes, content, brand evidence and references. Use before designing a new surface, feature, flow, redesign or product, or when preparing a provenance-aware JSON handoff for a separate design agent. Produces .design-context artifacts; does not design screens, implement UI or select a component library."
---

# Nexload Design Context

## Purpose and boundary

Compile what must be designed, why, for whom, what exists, and what must survive.
Your deliverable is a validated context folder, not an interface. Keep creative composition
open unless the user or an authoritative source explicitly constrains it.

Write only context artifacts. Inspect application files without modifying them; do not build
screens, scaffold an app, install application dependencies, create/recolor assets, choose a
component library, or emit framework/CSS implementation. Existing libraries belong in observed
codebase evidence. Semantic requirements describe actions, priority, behavior and states.

## Required inspection

Read [the pipeline](references/pipeline.md) and [the evidence model](references/evidence-model.md)
before extraction. Read [codebase analysis](references/codebase-analysis.md) when a repository
exists, including on a short request or repeated invocation. Read
[artifact contracts](references/artifact-contracts.md) and the relevant definitions in
[the schema](schemas/context.schema.json) before writing artifacts. Read
[validation and repeat invocation](references/validation.md) before validation or reuse.
[Research rationale](references/research.md) explains upstream decisions; it is not project evidence.

Resolve the installed skill directory as `SKILL_ROOT`; commands below refer to that directory,
not to a hard-coded repository location. Python 3.10+ and the pinned JSON Schema validator in
[scripts/requirements.txt](scripts/requirements.txt) are the only helper dependencies. Use an
isolated tooling environment if missing; do not change the target project's dependencies.

## Runtime pipeline

Execute phases 0–13 in order on every invocation. Record each result in `manifest.phases`.
A phase with no applicable material still records its reason; familiarity is not a completion gate.

0. **Scope:** bind the current request and task context, target, outcome, repository roots,
   included surfaces and explicit exclusions. Preserve the original request as evidence.
1. **Discover:** inventory documents, relevant entrypoints, styles, assets and references;
   record inspected and unavailable sources before turning them into claims.
2. **Analyze:** trace the actual relevant routes, layouts, navigation, content, domain rules,
   permissions and states into `codebase.json`. Use a project graph first when required, then
   verify relevant source files. A genuinely absent codebase produces `no-code`, not invented observations.
3. **Extract:** collect user/product requirements, goals, content, constraints and exclusions
   in `claims.json`. Separate facts, requirements, assumptions and derived direction.
4. **Reconcile:** apply domain-specific authority; record conflicts, winners and reasons,
   comparing each changed property across approved, archived, implemented and prior-context
   candidates, including intentional differences between current behavior and required behavior.
5. **Brief:** compile product purpose, users, jobs, actions, capabilities, rules and constraints.
6. **Brand:** identify established/partial/implicit/absent/conflicted identity. Preserve known
   evidence. Only fill missing direction with specific, labeled, revisable derivations.
7. **Experience:** model actors, journeys, decisions, permissions, feedback and edge cases.
8. **IA:** distinguish observed, required and recommended structural nodes; include surrounding
   routes only as boundary context. Do not create unrequested pages or features.
9. **Surfaces:** write one `pages/<stable-page-id>.json` per in-scope surface, including semantic
   content, interactions, data, states, transitions and acceptance criteria. Audit task-specific
   data and state feedback on each surface; shared policies do not make every operation applicable everywhere.
10. **Tokens:** record semantic roles only when useful; preserve known values and aliases.
    An empty/not-useful result needs a reason. Do not invent a full theme to fill the schema.
11. **Assets:** inventory supplied/existing assets and exact missing needs, provenance,
    availability, consumers and rights uncertainty. Acquisition and generation occur later.
12. **Unknowns:** enumerate gaps, unresolved contradictions and risks; classify their effect
    on starting design. Ask only if a consequential choice cannot safely remain open.
13. **Validate and hand off:** validate the complete candidate folder; correct causes at most
    twice, rerunning the full validator. Publish no malformed candidate as successful.

Each phase consumes validated upstream meaning. If new evidence invalidates an earlier claim,
explicitly revise that owner and regenerate affected downstream artifacts; never silently redefine it.

## Output and provenance

Use `.design-context/` for the active scope. Its root files are:
`manifest.json`, `sources.json`, `claims.json`, `codebase.json`, `brief.json`, `brand.json`,
`experience.json`, `information-architecture.json`, `tokens.json`, `assets.json`,
`unknowns.json`, `handoff.json`, plus `pages/<page-id>.json`.

JSON files contain JSON only. Schema version is `1.0.0`. Reject unknown fields rather than
persisting arbitrary model text. Semantic fields reference claims; claim evidence references
locatable excerpts/captures and source records. This keeps provenance out of every scalar.
A code observation is not automatically a future requirement. An inference is never a fact.

## Verification

Run the bundled validator against the candidate using an explicit project root. Authorize
additional local evidence roots only for supplied attachments; never take them from generated JSON.

```bash
python "$SKILL_ROOT/scripts/validate.py" /absolute/project/.design-context.next \
  --project-root /absolute/project
# Add --source-root /absolute/supplied/attachments when needed.
# After a valid result, --require-ready also checks unrestricted design readiness.
```

A valid folder can still be `conditional` or `blocked`. Preserve those outcomes. If validation
fails twice, keep the candidate for diagnosis, name the errors and stop the handoff. Do not change
facts, drop required states or loosen schemas merely to pass. If the validator cannot run, report
validation unverified and do not declare success.

## Repeated invocation and handoff requirements

Build a separate `.design-context.next` candidate; preserve the prior folder until validation
passes. Follow the reconciliation/publication protocol in [validation](references/validation.md).
Keep stable IDs for unchanged entities; revalidate primary sources and drop stale conclusions.
The old folder never authorizes a new handoff just because it exists.

Report the output path, validator result/digest, readiness, in-scope pages, preserved constraints,
material conflicts and unavailable lanes. A downstream design agent reads `handoff.json`, then its
read order, and validates the current folder before using it. Locked claims require explicit new
user authority to change. Open direction and listed creative freedom remain revisable; a design
agent records its decisions in its own outputs, without rewriting this context.
