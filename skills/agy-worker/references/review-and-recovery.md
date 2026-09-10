# Review and bounded recovery

Worker output is evidence, not authority. A completed CLI invocation is not a
completed user task, and a failed invocation may already have modified files.

## Review the workspace

1. Establish whether the worker and mutation-capable commands have stopped.
   Collect exit code, stderr, transport status, structured result, and conversation
   ID. Treat absent/malformed results, permission denials, or non-success transport
   states as incomplete evidence, even if some edits look usable.
2. Inspect actual changed files against the pre-dispatch baseline, including
   staged, unstaged, untracked, added, and deleted files where applicable. Identify
   out-of-scope edits and distinguish them from pre-existing or concurrent work.
   Do not blindly revert files based on the worker's changed-file list.
3. Run inexpensive deterministic checks before analyzing errors tooling can
   detect. Follow the project's testing policy and relevant lint/type/build/test
   commands. This skill does not require new tests or unrelated broad checks.
   If a worker could not run a check, the Supervisor runs it under existing
   authorization when possible; a denial is not a reason to widen access.
4. Review acceptance criteria, intent, semantics, architecture, repository
   instructions, integration, worker decisions, unresolved items, and risks.
   Passing checks alone do not establish semantic correctness.

## Choose an outcome

| Outcome | Use when | Action |
| --- | --- | --- |
| `ACCEPT` | Correct, complete, validated against applicable criteria. | Integrate and own the result. |
| `FIX_DIRECTLY` | Mostly correct with small remaining defects. | Supervisor patches and checks the affected behavior. |
| `RETRY_WORKER` | Materially incomplete/misunderstood work can benefit from retained context, or one supported reasoning escalation is justified. | Apply the bounded rules below. |
| `TAKE_OVER` | Delegation is inefficient, unreliable, unavailable, or has exhausted recovery. | Supervisor completes the work or reports the precise blocker. |

Do not mark work accepted while a required check is blocked or unmet. Report
what is verified and what remains unresolved. Optional or irrelevant checks do
not become requirements merely because the worker listed them.

## Recovery budget per subtask

- **Correction:** At most one corrective continuation of the existing AGY
  conversation for material incompleteness or misunderstanding, only when its
  context is useful. Send the observed failure, exact violated criteria, current
  workspace changes, unchanged scope, and expected correction; avoid repeating
  the whole handoff. Never use another worker for a trivial correction.
- **Reasoning escalation:** At most one move from the default Flash Medium tier
  to Flash High when insufficient reasoning caused the failure and the current
  catalog supports the tier. Preserve the same conversation when useful; if
  context is unusable, a fresh High run must receive the current partial-work
  baseline and consumes the same escalation budget. Do not invent a High slug
  or try successively more models. Authentication, permissions, and missing
  dependencies are not reasoning failures.
- **Combined ceiling:** Initial run plus at most two recovery runs. If one run
  both corrects and escalates, it consumes both allowances. A High run never
  creates a new retry budget. Review after each run and stop sooner when direct
  repair is cheaper. Changing task IDs or splitting the same failed objective
  does not reset its budget.

Before continuation, confirm ownership is still exclusive and refresh only
material context. Use the saved conversation ID and explicit invocation options
from the capabilities reference. If the ID is missing, do not use an implicit
latest-conversation fallback. Take over unless the single justified escalation
can safely start with a fresh, bounded handoff.

On timeout, cancellation, denied operations, or unavailable authentication, do
not blindly replay the task. Inspect partial effects and establish process
termination using the host's process controls before further mutation. If that
cannot be established, report the blocker and keep the scope reserved.

After the allowed recovery fails, take over or explicitly report the blocker.
Never hide repeated failure behind automatic retries. The final user response
remains the Supervisor's: summarize actual changes, validation performed,
material limitations, and any unresolved worker failure that affects completion.
