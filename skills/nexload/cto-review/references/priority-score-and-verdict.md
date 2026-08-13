# Priority, score, and verdict

## Priorities

### P0 — Blocker

The result cannot be approved: exploitable security failure, data-loss/corruption risk, a materially false supported public/runtime contract that makes declared use unsafe or nonfunctional, a severe compatibility break, or fundamentally invalid architecture. A bounded contract defect with limited blast radius or a safe workaround may instead be P1.

### P1 — Important

Resolve before final approval: unnecessary architecture with meaningful cost, material API inflation, incorrect dependency direction, ambiguous ownership/lifecycle, substantial duplication, structural performance failure, or another maintainability defect that changes the decision.

### P2 — Improvement

Non-blocking but worthwhile: bounded simplification, meaningful naming/API polish, or a minor system-consistency issue with real consumer or maintenance value. If it cannot influence CTO approval, suppress it.

Do not use P3. Do not inflate priority because a convention is written strongly; severity follows actual impact in the reviewed scope.

## Verdict contract

| Verdict | Required state |
| --- | --- |
| `Approved` | No material issue remains; no P0/P1/P2 is required. |
| `Approved with minor issues` | Only a small number of admitted P2 issues remain. |
| `Needs revision` | At least one P1 remains and no P0 requires rejection. |
| `Rejected` | A P0 or fundamentally wrong direction remains. |
| `Withheld` | Decisive evidence is absent and the missing fact can genuinely reverse approval; use only with `Score: Not assessable`. |

## Score calibration

- **9.0–10.0:** production-grade; normally `Approved`.
- **8.0–8.9:** strong; normally `Approved with minor issues`.
- **7.0–7.9:** direction is sound but a P1 remains; `Needs revision`.
- **6.0–6.9:** recoverable but meaningful redesign/simplification is required; `Needs revision`.
- **4.0–5.9:** serious weaknesses; `Needs revision` or `Rejected` according to blocker status.
- **0.0–3.9:** fundamentally wrong or unsafe; `Rejected`.

The verdict follows admitted risk first; select the score within its compatible band to express breadth and impact. Do not average a giant fixed matrix or reward effort. Similar flaws should receive similar severity across scopes. Use `Not assessable` instead of inventing a numeric score only when decisive missing evidence prevents responsible evaluation.

## Conditional dimensions

Show at most the few dimensions that explain the verdict, such as Architecture, API Design, Runtime Safety, Type Safety, React Architecture, Design Consistency, Security, Performance, or Consumer Experience. Omit irrelevant dimensions and omit the table entirely when findings already explain the score.

## Compact output

- `Scope: [reviewed boundary]`
- `Score: X.X/10` or `Score: Not assessable`
- `Verdict: Approved | Approved with minor issues | Needs revision | Rejected | Withheld`
- `Findings:` followed by each priority, title, evidence, impact, and required property.
- `Evidence limits:` only for decision-changing gaps.
- `Strong points:` only for sound choices worth preserving.

Omit `Findings` when none exist. Omit evidence limits, dimensions, and strong points when they add no decision value. Never append code, commands, a fix plan, or an offer to implement.
