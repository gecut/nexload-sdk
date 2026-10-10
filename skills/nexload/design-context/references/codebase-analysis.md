# Analyze the application as a product

## Search boundaries

Inspect repo instructions, architecture map, manifests and relevant exports/entrypoints first.
If a knowledge graph exists and the project requires it, query it before broad searches; confirm
hits against actual files because graphs can be stale. Use `rg --files` to locate candidates and
`rg` for targeted symbols. Exclude dependencies, build output, caches and generated context.
Do not execute package scripts merely to discover UI. Runtime/screenshots/Figma supplement source
analysis when accessible under the task's existing permissions; their absence is a recorded lane.

Follow routing/configuration actually present rather than assuming a framework from a filename.
Trace static and dynamic routes, redirects, query conventions and locale/tenant segments. Include
route groups/layout wrappers, shared navigation and the links that enter/leave the scoped flow.
A list of route filenames is not a complete route inventory. Record inferred paths as derivations
until routing configuration proves them. On large products, inventory relevant routes plus boundary
neighbors; do not crawl unrelated backend services or enumerate every admin screen.

## Mandatory codebase coverage topics

`codebase.coverage` contains one assessment for each of its twenty semantic fields below.
`manifest.coverage` covers `requested-docs`, `codebase`, `brand`, `experience`, `ia`, `pages`,
`tokens`, and `assets`. Coverage explains every material empty list or unavailable lane.

| Topic | Inspect | Describe as product evidence |
| --- | --- | --- |
| application | entrypoints + product/domain docs | application type and purpose; separate doc claims from observed implementation |
| stack | package manifests, config, imports | actual framework/runtime/tooling; no future library mandate |
| routing | router/config/route handlers | path patterns, parameters, redirects and routing model |
| routes | page entrypoints and links | relevant current paths and surface purpose |
| layouts | nested wrappers and shared shells | parent/child hierarchy and continuity |
| navigation | menus, links, guards, URL state | entry points, back/forward behavior and boundary neighbors |
| styling | global styles, theme ownership, usages | coherent patterns vs incidental overrides |
| tokens | token files, CSS variables, theme variants | exact source values, usages and unresolved role mappings |
| fonts | font declarations/files/loading + fallback | families/roles, script coverage, weights; declaration is not loaded-font proof |
| assets | public/static dirs, imports, CMS references | actual file/URL availability and meaningful consumers |
| localization | dictionaries, locale routes, formatters | languages, RTL/LTR, numbers/currency/date conventions and long copy |
| accessibility | labels, keyboard/focus/reduced-motion conventions | existing behaviors and missing evidence; avoid blanket compliance claims |
| responsivePatterns | breakpoints, containers, media queries, captures | current transformation conventions and preserved capability |
| uiLibraries | dependencies and actual imports | observed library and reusable patterns, separated from semantic contracts |
| importantDomainModels | DTOs/schemas/content models at UI boundary | entities/fields and rules users must understand |
| roles | auth/domain role definitions and UI entrypoints | actual actor distinctions |
| permissions | policies + caller-to-effect guards | visible/allowed operations, not only hidden navigation |
| existingStates | fetching/forms/errors/transitions | implemented loading/empty/error/partial/success/etc. with gaps |
| relevantConstraints | source constraints affecting UX | latency/offline/limits/validation/payment/data dependencies |

The twenty topics include application through relevantConstraints; do not substitute a single
“read repo” row. Backend details belong here only if they change what an interface represents,
permits, validates or communicates. Trace lifecycle effects where UI guards and actual permissions
differ; do not label a hidden button as authorization enforcement.

## Visual and brand discovery

Inspect final logos, alternate marks, font licenses, style guidelines, Storybook/examples,
current screens, token source and actual usage. Separate approved identity from default library
styles and one-off campaigns. Examine supplied pixels before describing them; filenames and
alt text are not visual evidence. Record visual references' status: final requirement, project
observation or inspiration. Only explicit authority locks composition; other references inform
direction while preserving creative freedom.

Record original assets unchanged. Logos, favicon, social image and symbol are distinct candidates.
Do not assume the leftmost SVG cluster is a logo symbol, especially for RTL marks. Record exact
source color representation and any conversion as a derivation; avoid inventing semantic mappings
from frequency alone. Font file presence does not prove script coverage, license or successful
runtime loading. Source declarations cannot establish live contrast or responsive compliance.

## State analysis

For each relevant interaction, trace trigger → validation/permission → data effect → feedback →
next state. Discover unhappy paths from code, product requirements and available runtime evidence.
An omitted current state becomes a future requirement only when declared or a justified derived
context need; label that distinction. Identify form validation, duplicate submissions, denied roles,
expired sessions, delayed/partial data, failed payments, unavailable inventory, destructive actions,
offline assumptions and long/empty content when relevant.

Page capability flags are factual/declared classifications backed by `capabilityEvidenceIds`.
The validator requires default for all surfaces; async data adds loading/error/empty; forms add
validation/success/disabled; gated flows add unauthorized/forbidden; destructive actions add
confirmation; offline support adds offline; data-changing actions add loading/error/success/disabled. Add hover/focus/active, partial, retry or recovery states
when material. These flags are not permission to invent features. If a state is intentionally
inapplicable, classify the capability accurately and explain the policy in a claim; do not turn
flags off merely to evade coverage. Important unknown state behavior stays in unknowns.

Classify `gated` from actor/permission restrictions, even when login technology is undecided.
A tutor-only operation is gated; an unknown authentication mechanism is a separate gap.
Classify `mutation` for each surface with data-changing actions (confirmation, decline, save, payment,
delete), including one-click operations without an input form. Required operation feedback does not
depend on whether the UI is a form or which backend technology will implement it.
