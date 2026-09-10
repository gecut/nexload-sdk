# Lightweight multi-worker execution

Use multiple AGY processes only when there is useful independent work. Default
maximum: **three concurrent AGY workers**. One worker or sequential execution is
preferable when safe decomposition costs more than it saves.

Good candidates include independent features, components, discovery questions,
or changes with disjoint file ownership and already-settled shared interfaces.
Read-only discovery workers may inspect overlapping files. If editors are active,
discovery observations may become stale; recheck decisive evidence after edits.

## Ownership before launch

Keep a small in-context ledger: Task ID, objective, read scope, exclusive write
scope, dependencies, model, process handle, conversation ID, and recovery attempts.
Use the communication contract for each worker; unrelated work gets a fresh
conversation. No database, scheduler, wrapper, or persistent orchestration state
is needed.

An editing worker owns its mutation scope exclusively until its process and any
mutation-capable child commands stop. Other workers and the Supervisor must not
edit that scope concurrently. This also applies to formatters, code generators,
install commands, and tests that write files outside their apparent target.

Reserve shared mutation points for Supervisor integration or one sequential owner:
package manifests, lockfiles, shared configuration/schema, generated files,
central barrel exports, migrations, and common infrastructure. Disjoint features
are not independent if each needs to change one of these files. Settle interfaces
first, reserve shared integration, or serialize the work.

## Launch and integrate

1. Capture existing workspace changes; do not reset or clean them. In a Git
   project, inspect status plus staged and unstaged diffs. Account for untracked
   files too; a diff alone will not show their contents.
2. Start independent, bounded AGY invocations from the agreed workspace, using
   the host's existing process tools. The CLI's technical permissions may be
   broader than the handoff's ownership; ownership is a coordination rule.
3. Observe process completion, stderr, result envelopes, and real changes.
   Resume only by the saved conversation ID; never select the latest conversation
   implicitly. Do not reassign a timed-out worker's scope until it is stopped.
4. If a worker needs another owner's file, it reports the dependency. The
   Supervisor integrates after that owner stops, or reassigns work sequentially.
   If unexpected overlap occurs, stop affected writers, inspect the actual state,
   and reconcile it without discarding pre-existing or another worker's changes.
5. After workers finish, the Supervisor integrates shared edits, runs the host
   project's required combined checks, and reviews final behavior and all diffs.

Do not create automatic Git worktrees. Do not ask workers to spawn subagents,
other workers, or nested orchestration. The Supervisor remains the only
top-level orchestrator and owns final integration.
