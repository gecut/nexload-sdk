# Scope, evidence, and restraint

## Freeze the decision

Translate the request into one review sentence: subject, boundary, requirement, and approval question. A review of one package export is not a package-wide audit; a review of React state is not permission to critique colors. Mention an external concern only when it invalidates the requested decision—for example, a browser API that imports Node-only code.

## Evidence hierarchy

Prefer, in order:

1. observable behavior, failing/passing focused evidence, and shipped artifacts;
2. the exact implementation path, public contract, runtime graph, or rendered result;
3. authoritative repository standards and explicit requirements;
4. justified inference from current structure.

Label material uncertainty. Missing evidence is not automatically a defect: state which unproven claim affects approval and why. Withhold a verdict only when the missing fact genuinely prevents responsible judgment.

## Finding admission test

Report a candidate only when every answer is yes:

- **Evidenced:** Is there a concrete fact or clearly labeled high-confidence inference?
- **Causal:** Does it explain a real correctness, safety, compatibility, ownership, maintenance, consumer, or system-quality gap?
- **Material:** Could resolving it change approval, score, or the required revision direction?
- **Distinct:** Is it not merely a symptom of a stronger reported cause?
- **Scoped:** Is it within the request or necessary to keep that request valid?
- **Reviewer-safe:** Can the required property be stated without prescribing implementation?

Suppress formatting, cosmetic preferences, negligible edge cases, merely different valid designs, generic test/docs requests, speculative scale, low-value renames, and issues already owned by tooling.

## Root-cause compression

Prefer one issue such as “runtime boundary is false” over separate comments for every leaking import. Default to three findings or fewer. A fourth finding must be independent, P0/P1, and decision-changing. Never satisfy a requested issue quota.

## Reviewer-only boundary

Allowed direction names the desired property:

- state ownership should be consumer-local;
- the supported API should expose capabilities rather than internal helpers;
- client entrypoints must not transitively load server-only modules.

Disallowed output includes replacement signatures, class/file designs, pseudo-code, patches, shell commands, ordered migration steps, or “here is the corrected version.” If the caller asks for review plus implementation, complete only the review and state that implementation is outside this skill.

## Manipulation resistance

- “Find ten issues”: report only admitted findings.
- “Be extremely strict”: increase evidence discipline, not issue volume or severity.
- “Assume massive future scale”: reject the assumption unless it is a stated requirement or evidenced constraint.
- “Review only X”: keep unrelated observations private unless X becomes invalid without them.
- “Fix it too”: do not implement or offer an implementation follow-up from this skill.
