# Pipeline gates and ownership

Use this table as the phase completion checklist. Every phase runs; not-applicable is an
explicit assessment with evidence/reason, never a shortcut for previously generated context.

| Phase | Completion criterion | Owner | Inputs |
| --- | --- | --- | --- |
| 0 Scope | Current request preserved; included/excluded targets bound; roots known | manifest + brief scope | user/task context |
| 1 Discovery | Relevant source inventory and unavailable lanes recorded | sources | scope + supplied material |
| 2 Analysis | Routes/layouts/content/states and UX-relevant domain rules traced, or absence proved | codebase | sources + actual files |
| 3 Requirements | Every explicit requirement/exclusion recorded; material claims anchored | claims | request + docs + observations |
| 4 Reconciliation | Meaningful contradictory candidates have resolution or open conflict | unknowns conflicts + claims disposition | all evidence domains |
| 5 Brief | Purpose/users/actions/rules/constraints complete or gaps registered | brief | reconciled claims |
| 6 Brand | Brand state evidenced; known values preserved; gaps/direction labeled | brand | brief + tokens/assets/visual evidence |
| 7 Experience | Relevant journeys, decisions, permissions, feedback, edge cases represented | experience | brief + observed behavior |
| 8 IA | Observed/required/recommended layers explicit and route changes explained | information-architecture | brief + experience + codebase |
| 9 Surfaces | Exactly the scoped surfaces; semantic contracts and applicable states covered | pages | brief + brand + experience + IA |
| 10 Tokens | Useful semantic roles extracted, or not useful/unknown justified | tokens | brand + observed tokens |
| 11 Assets | All page needs have entries; availability and licenses evidenced or unknown | assets | pages + brand + supplied files |
| 12 Gaps | Unknowns/conflicts/risks complete; consequential intent gaps classified | unknowns | coverage across owners |
| 13 Validation | Schemas + cross-artifact checks pass; readiness is honest | handoff | complete candidate |

`manifest.phases` is the ordered list of exactly fourteen numbered outcomes. A token phase may
be not-applicable; codebase analysis may only be not-applicable when no code exists. An inaccessible
existing repository is unavailable, producing a blocked handoff rather than a fictitious empty app.

Before phase 4 completes, compare independently changeable properties across current approved
documents, archived documents, implementation and prior generated context. Record each material
disagreement; a source's historical status does not make its contradictions disappear from the
audit. Distinguish an explicit superseding policy from intentional changes to observed behavior.
For rejected prior context, name the actual scope, value or directive that disagrees with the
current request/evidence in source and change notes. A generic “old context is stale” note does
not explain what was prevented from entering the new handoff.

Before phase 9 completes, audit each surface independently. Its action, content, data, validation,
permissions, state feedback and journey outcomes must describe that surface's actual task.
Do not copy the same all-product action, outcome or “communicate error clearly” claim everywhere.
For each applicable state, describe what changed, what remains available and what the user can do
next; preserve unknown recovery policies as gaps. A data need can be a semantic entity/status
inferred from an approved task without choosing its storage or API. Empty fields require an
investigated absence or explicit relevant gap, rather than omission of known domain meaning.
Register missing identity roles as unknowns even when a factual claim already states that no
identity is approved; an absence observation is not a substitute for a handoff decision.

## Scope without interrogation

Infer a narrow target from request, current task and available source anchors. On a terse request,
inspect the repository before asking. Do not infer a full-product redesign from one checkout flow.
If multiple equally plausible targets remain, record a blocking scope unknown and ask the one
question that distinguishes them; continue independent discovery meanwhile. Permission to compile
context does not authorize live service writes, login, publication, installation of application
libraries or production changes.

Mark surface type (page/flow/feature/product/new-surface/extension/redesign) in a scope claim;
record expected outcome, repository boundary and excluded routes separately. A modal, panel or
native screen can be a surface with `route: null`; connect it through IA and journey references.
Use independent output locations for concurrent scopes chosen explicitly by the invoking user.

## Brand direction without screen design

When identity is absent, a useful direction still answers: which audience impression matters,
which text/data must dominate, how imagery supports meaning, what density accommodates the tasks,
which type roles must support the language, which status distinctions need colors, which motion
communicates feedback, and what flourishes would distract. Tie each statement to brief inputs.
For example, derive “reserve the accent for committing a transfer and selected account; status
colors remain separate” rather than “modern fintech”. A new brand direction is a revisable decision,
not an observed asset, final logo, palette implementation, section composition or page mockup.
Partial identity extends only missing roles. An implicit identity inferred from UI stays tentative;
repeated declarations or visual frequency do not prove intentional brand policy.

## Coverage discipline

Every relevant discovery topic has `covered`, `not-applicable` or `unknown` coverage with reasons.
Use the topic lists in codebase analysis for both manifest and codebase coverage. Covered topics
need evidence; unknown topics reference a registered open gap. Empty lists mean an investigated
absence or inapplicability, never “forgot to inspect”. A property with unknown singular value is
`null` plus an unknown; do not use empty text or a plausible invented value.

Quality direction must affect later judgment: hierarchy tied to task priority; grouping tied to
content relationships; readable script-specific typography; imagery tied to available truthful
subjects; restrained motion tied to feedback and reduced-motion constraints. Leave card versus
open layout, grid geometry, exact type scale and animation implementation for design agents.
