---
name: agy-worker
description: "Supervise Google Antigravity CLI (agy) workers for bounded implementation, repetitive edits, mechanical refactors, scoped UI work, or codebase exploration. Use when considering AGY delegation or parallel execution while retaining Supervisor decisions, validation, and integration. Do not invoke workers for trivial edits or unresolved architectural decisions."
---

# AGY Worker

Codex or another capable coding agent is the Supervisor. Delegate execution only
when it helps; the Supervisor retains user-intent interpretation, architecture,
important technical decisions, project constraints, decomposition, routing,
integration, deterministic validation, semantic review, and the final response.

Requires an installed, authenticated `agy`, a permitted workspace, and a host
that can run and observe CLI processes. This skill grants no additional access.
Follow the host project's instructions, including applicable `AGENTS.md` files.

## Reassess, then route

Before each delegation, briefly establish:

- The user's intended result, explicit requirements, weaker inferred assumptions,
  and behavior or files that must not change.
- Applicable project instructions and decisions the Supervisor must settle first.
- Whether execution can be bounded, whether delegation saves useful effort, and
  what observable acceptance criteria define completion.
- Whether subtasks are independent and whether concurrent writes or shared
  dependencies could conflict.

Keep this lightweight for simple tasks. Execute directly for trivial changes,
small corrections, tightly coupled reasoning and implementation, unresolved
architecture, excessive handoff overhead, or exhausted worker recovery.

Delegate substantial implementation, repetitive edits, mechanical refactors,
scoped UI work, broad read-only exploration, or defined multi-file changes when
the Supervisor has settled the necessary decisions. Exploration may gather
evidence for decisions; the worker does not take ownership of those decisions.

## Dispatch only what is useful

1. Before the first AGY run, read [AGY capabilities](references/agy-capabilities.md).
   Check installed CLI support and discover the live model catalog. Prefer Gemini
   3.8 Flash Medium when available; reserve Flash High for a reasoning escalation.
   If an appropriate tier is unavailable, choose an explicitly acceptable listed
   alternative and disclose it, or execute directly. Never invent a model slug.
2. For a handoff, read [communication contract](references/communication-contract.md).
   Preserve the original request separately from interpretation, assign bounded
   scope, and request direct workspace edits plus a compact structured result.
   Capture the workspace baseline, including pre-existing and untracked changes,
   before any worker can mutate files.
3. Default to one worker. Read [multi-worker](references/multi-worker.md) only if
   independent work merits concurrency; the default ceiling is three AGY workers.
   Otherwise use sequential workers or direct execution. The Supervisor is the
   only orchestrator; workers must not delegate further.
4. Launch from the intended project directory using existing permissions and
   sandbox boundaries. Never default to unrestricted permission bypass, broaden
   access to overcome a denial, or treat a prompt's file scope as a security boundary.
5. Before accepting work or attempting recovery, read
   [review and recovery](references/review-and-recovery.md). Inspect real changes,
   run applicable inexpensive checks, then review meaning and integration.
   Choose `ACCEPT`, `FIX_DIRECTLY`, `RETRY_WORKER`, or `TAKE_OVER`.

Keep unrelated work in independent contexts. Send only material context; return
file paths and findings rather than patches or source dumps. Recovery is bounded:
at most one corrective continuation and one supported reasoning escalation per
subtask, with no renewed budget from changing conversation or worker identity.
Small defects normally belong to the Supervisor. Worker output is evidence, not
authority; the Supervisor owns final correctness and honest completion reporting.
