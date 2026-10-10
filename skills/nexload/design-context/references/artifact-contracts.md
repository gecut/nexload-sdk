# Machine contract 1.0.0

The executable source of truth is `schemas/context.schema.json`, a self-contained JSON Schema
2020-12 document. Each `$defs` artifact has all listed fields required and rejects extra keys.
Use the definition named by the artifact filename (`page` for files in `pages/`). The validator
selects that definition; the root union is only a convenience for generic tools. A minor/major
schema change requires an explicit migration; this validator accepts exactly `1.0.0`, not arbitrary
semver-compatible shapes. `$schema` belongs to the bundled schema, not generated artifacts.

## Shared conventions

IDs are stable, lowercase and hyphenated, up to 128 characters: `s-` source, `e-` evidence, `c-` claim,
`p-` page, `a-` asset, `u-` unknown, `x-` conflict, `ia-` IA node, `j-` journey, `t-` token, `sec-` section.
Make section IDs globally unique, e.g. `sec-checkout-summary`. Normalize raw source spelling:
map `AGENTS.md` to `s-agents`, `asyncData` to
`u-async-data`, and `invalid_token` to `c-reset-invalid-token`. Keep original spelling in
source locations, excerpts and claim values. Claim keys use lowercase dot/hyphen segments,
e.g. `reset.invalid-token`; they are not application identifiers.
IDs reflect durable identity rather than title, row order, timestamp or request wording.
Deleted page IDs may appear only in manifest removal records. `invalidatedClaims` identifies
prior claim versions; regenerated claims may retain the same stable ID.
Use separate IA IDs for observed and required versions of the same page. Route paths are concrete
or documented patterns starting `/`, without query/fragment; non-route surfaces use null.
`contextKey` distinguishes locale/tenant/platform route spaces; it is not an escape hatch for duplicates.

Use claim IDs in semantic fields, including singular fields. Lists are ordered when order carries
priority; object key order has no meaning. Empty list means investigated absence/not applicable.
Unknown singular fields use null where the schema permits it, with a linked registered unknown.
Required singular claim references must express an evidenced fact, declared requirement, or labeled
proposal; if impossible, record the blocker rather than manufacturing a fact.

## Ownership and dependencies

| Artifact | Owns | Reads upstream | Main consumers |
| --- | --- | --- | --- |
| manifest | invocation/scope identity, roots, inventory, phase/coverage results, change summary | current request + discovery | validator + handoff consumer |
| sources | source metadata and locatable evidence excerpts/captures | supplied inputs + actual inspection | claims + assets + validation |
| claims | facts/requirements/assumptions/decisions and provenance, confidence, change policy | evidence + derived bases | all semantic artifacts |
| codebase | observed current application map and coverage | source-backed observed facts | brief/experience/IA comparison |
| brief | product intent/scope/users/goals/capabilities/content/rules/constraints | reconciled claims | brand + experience + pages |
| brand | identity state and visual/verbal direction, boundaries | brief + primary identity evidence | tokens + pages + designer |
| experience | actors, journeys, decisions, feedback, edge conditions | brief + observed behavior | IA + page contracts |
| information-architecture | layered routes/navigation/content structure and changes | scope + experience + codebase | pages + designer |
| pages/<id> | scoped semantic surface contracts | brief/brand/experience/IA | assets + designer |
| tokens | abstract semantic token roles/values/aliases | brand + observed tokens | designer mapping later |
| assets | existing/provided/missing needs, source/rights/consumers | pages + brand + evidence | designer + later acquisition |
| unknowns | all gaps/conflicts/risks and resolution records | every owner | readiness + designer |
| handoff | read order, canonical/locked IDs, readiness and open creative territory | validated bundle | separate design agent |

Cross-reference dependencies are allowed; evidence/claim derivation, token alias and IA parent graphs
must be acyclic. Semantic page transitions and navigation can have cycles (back/forward is normal).
Changes propagate from source/claim ownership to dependent projections. Later files do not override
upstream claims. Keep previous context outside the candidate inventory and do not ingest it as facts.

## Field guide

- **manifest:** `runId` identifies this invocation; `scopeKey` identifies durable scope; `requestEvidenceIds`
  references the current exact request/task input; `sourceRoots` exactly matches CLI-authorized roots.
  `codebaseExists`, `pageIds`, `artifacts`, fourteen `phases`, `changeSummary` and `coverage` make
  completeness inspectable. All twelve root files, including manifest/handoff, and every page belong
  in `artifacts`. Changes contain added/removed pages and prior-version invalidated claim IDs, with change notes.
- **sources:** each source has `id`, `type`, `location {kind,value}`, six-domain `authority`, `scope`,
  `status`, `inspection`, ISO `observedAt`, SHA-256 `fingerprint` or null and `notes`. Locations:
  `local` (relative to project or explicit authorized absolute path), `context` (conversation/task
  message locator), `remote` (actual source URL/object identifier), `inference` (derivation only).
  `evidence` entries have `id`, `sourceId`, `locator`, exact `excerpt`, and `modality`. For images,
  the excerpt is a precise description after viewing; for runtime it is the observed event/value.
- **claims:** see evidence-model for complete example. Preserve explicit constraints' original wording.
  Explanations belong in `reason`. A key identifies a single property; split bundled assertions.
- **codebase:** twenty mandatory observation arrays plus `analysisStatus` and `coverage`.
  Only observed facts belong here; a requirement from a spec belongs in brief. Runtime absence is
  an unknown observation lane, not “the product has no UI”.
- **brief:** subject/product claim IDs or null, scope, problem, users, jobsToBeDone, businessGoals,
  userGoals, actions, capabilities/content, rules/roles/permissions, constraints/platforms,
  responsive/accessibility/technical requirements, explicitRequirements/explicitExclusions,
  assumptions and unknownIds. Explicit requirements/exclusions are locked requirements;
  `assumptions` registers all active assumptions, not aesthetic decisions.
- **brand:** state and its evidence, identity/positioning/personality/voice/tone/values,
  visualDirection/colorStrategy/typographyDirection, imagery/iconography/illustration/logoUsage,
  layoutPrinciples/density/shapeLanguage/surfaceLanguage/motionDirection,
  signatureCharacteristics/restraints/avoid/antiPatterns plus unknownIds. Do not fabricate all
  fields for completeness. Translate vague adjectives into observable implications and boundaries.
- **experience:** actors/personas/JTBD/entryPoints/decisionPoints/navigation/contentHierarchy,
  interactionPrinciples/feedback/systemStates/permissions/responsiveBehavior/accessibilityBehavior/
  criticalEdgeCases; journeys have actor claim IDs and steps with page/action/outcome IDs.
  Personas require evidence; a fictional persona does not become a verified target customer.
- **IA:** each node has id, scoped pageId or null for boundary routes, route, contextKey, layer,
  purpose/audience/entryConditions, parentId/navigationIds, contentHierarchy, primaryTask,
  secondaryTasks/dataNeeds/transitions and duplicateRouteReason. Shared route/layer/context
  duplicates need justification. `terminology` and `changeReasons` explain names and intentional drift.
- **pages:** route/name/purpose/userQuestion, audience/entryState/primaryGoal/actions, requiredContent/
  contentPriority/sections/informationHierarchy, functionalRequirements/interactions/validation/
  feedback/permissions, responsiveBehavior/accessibilityRequirements, assetNeeds/dataNeeds,
  relationships/transitions, constraints/acceptanceCriteria, stateRequirements/states/capabilities/
  capabilityEvidenceIds and unknownIds. Each section has semanticRole, purpose, contentIds,
  ordinal priority and dependencies on earlier sections. No CSS grids or component-library primitives.
  Each state has a claim describing when it occurs and claim IDs describing behavior/content.
  State names are the schema's fixed presentation categories, not product lifecycle labels.
  Keep domain labels such as `expired_token`, `reviewing` or `changes_requested` in claims,
  conditions and transitions. For example, use `error` with a condition claim describing an
  expired reset token and behavior claims offering a new request; preserve the literal domain
  label in the source observation. Multiple domain conditions can share one category through
  a condition claim that enumerates them, with distinct behavior claims for each condition.
- **tokens:** applicability/reason; tokens with id/group/semanticRole/claimId/value/unit/aliasId/mode;
  unknownIds. A scalar value must exactly match its value claim. E.g. a known accent value is
  a claim `#126C55`, with usage in separate brand claims. Alias records use `value:null` and
  same-group `aliasId`; no alias cycles. Numeric measurements use string value plus unit,
  e.g. `"160"`, `"ms"`; keep interpretation/observed state in its claim. This is a context model,
  not a DTCG exporter, CSS variable set, palette generator or theme configuration.
- **assets:** id/kind/status/semanticRole/purpose/sourceId/evidenceIds/licenseKnowledge,
  consumers/aspectRatio/composition/contentRequirements/responsiveRequirements/constraints/unknownIds.
  Existing/provided assets require inspected source evidence. A required asset can be missing with
  `sourceId:null`. Unknown rights need an unknown entry; never infer a license from hosting domain.
  Consumers and page assetNeeds are reciprocal; a global mark with no scoped consumer can be
  inventoried without pretending a page uses it. Asset status describes availability/intent,
  not readiness for deployment; generation/acquisition is downstream.
- **unknowns:** each gap has id/topic/question/classification/status/impact/pageIds/sourceIds/evidenceIds/
  claimIds/nextAction. `inferred` is only for safeToInfer gaps linked to assumptions;
  `resolved` requires inspected primary evidence or canonical facts/requirements. For an open gap,
  `claimIds` names unresolved candidate assertions, not canonical facts documenting that a gap
  exists; put support for the gap in `sourceIds`/`evidenceIds`. Conflicts have domain, candidates,
  resolution (`authority`, `intentional-change`, `unresolved`), winner or null, reason and evidence.
  Intentional changes preserve canonical observed facts and a current canonical required winner. `risks` references grounded risk claims.
- **handoff:** readiness/readOrder/pageIds/canonicalClaimIds/lockedClaimIds/observedArtifact,
  unknownIds/conflictIds/creativeFreedom/nextAction. Enumerates canonical and locked claim IDs
  exactly and open unknowns/unresolved conflicts exactly. Read order includes every artifact once;
  recommend sources → claims → codebase → brief → brand → experience → IA → tokens → assets →
  pages → unknowns → manifest → handoff. It indexes rather than duplicates meaning.

## Handoff example of creative freedom

Use concrete open boundaries such as “choose composition and grouping for order details while
preserving their content priority and keeping the payable total adjacent to confirmation”.
Do not list generic “make it beautiful” or grant permission to reinterpret a locked fee rule.
A handoff with blocking intent gaps/conflicts is a valid diagnostic artifact but cannot authorize
design of the affected surface. Nonblocking rights/acquisition gaps may allow design with explicit
needs; they do not grant permission to publish those assets.
