# Verified AGY capabilities

Verified against official Google Antigravity CLI documentation on 2026-09-10.
Check `agy --help` and `agy models` in the execution environment before use;
installed versions and account access can differ from documentation examples.
If authentication or required capabilities are unavailable, return to the
Supervisor. Do not install, authenticate, or change settings implicitly.

## Invocation and models

`-p` runs one non-interactive prompt. `--model` selects a catalog slug;
`--effort` accepts `low`, `medium`, or `high`. Current documentation lists
`gemini-3.8-flash-medium` and `gemini-3.8-flash-high`; use them only when the
runtime catalog includes them. Prefer tier-specific slugs without an additional
effort override; do not guess how conflicting slug/effort combinations resolve.
Unknown models fail instead of silently falling back.
See [headless model selection](https://antigravity.google/docs/cli/headless/#select-a-model-effort-or-agent).

Prepare `agy_task_prompt`, `agy_model`, and `agy_result_schema` as literal data
using the handoff and inline schema from the communication reference. Prefer
the host's argument-array process API; the following is a POSIX shell template
for already-populated variables, not assignments to execute unchanged:

```sh
agy --sandbox --model "$agy_model" --output-format json \
  --json-schema "$agy_result_schema" --print-timeout 10m -p "$agy_task_prompt"
```

Preserve stdout, stderr, exit code, and the process handle separately. Do not
interpolate prompt text into executable shell code. Choose a bounded timeout
appropriate to the task; the example's ten minutes is a skill policy choice.

## Results and continuation

`--output-format json` emits an envelope; schema-constrained results are in
`structured_output`. `--json-schema` accepts inline JSON or a schema-file path.
The envelope includes `conversation_id`, `status`, `response`, optional `error`,
`duration_seconds`, `num_turns`, and `usage` (input, output, thinking, cache-read,
total token counts). `stream-json` emits NDJSON `init`, `step_update`, and `result`
events; use it only when progress observation helps. Inspect its final `result`.

Resume a known worker with `--conversation "$agy_conversation_id"` and a new
`-p` prompt, retaining explicit model, schema, timeout, and sandbox arguments.
`--continue` selects the most recent conversation; avoid it when routing workers.

Statuses: `SUCCESS`, `ERROR`, `CANCELED`, `INTERRUPTED`, `INVALID`, `WAITING`,
`RUNNING`. Response-producing runs exit zero; failures exit nonzero. The default
response wait is five minutes; `--print-timeout` overrides it.
See [headless output and lifecycle](https://antigravity.google/docs/cli/headless/).

## Permissions and execution limits

Headless mode cannot ask for approval. A required approval can be soft-denied
while the run continues and exits zero; stderr records the denied tool. Thus
`SUCCESS` does not prove execution or validation happened.
See [headless permissions](https://antigravity.google/docs/cli/headless/#permissions-in-headless-mode).

Workspace file reads/writes are normally allowed; commands and other unconfigured
actions normally require approval. Existing `deny`, `ask`, and `allow` rules
apply in that precedence. Respect existing scoped approvals; do not add wildcard
allows or alter global permission settings as part of a worker run.
See [permissions](https://antigravity.google/docs/cli/permissions/).

`--sandbox` enables terminal containment. The documented implementations use
Linux namespaces or macOS Seatbelt; do not assume equivalent support elsewhere.
The terminal sandbox allows workspace/temp/cache writes and restricts other
filesystem and network access according to permissions. It does not grant command
approval or enforce each worker's narrower file ownership. Existing unsandboxed
allow rules may permit commands outside containment; never rely on the flag alone
to satisfy a stricter host policy. If safe execution is unavailable, hand back
control rather than disabling protections.
See [sandbox](https://antigravity.google/docs/cli/sandbox/).

Neither a timeout nor a process exit is evidence that partial changes were
rolled back or all spawned commands stopped. The Supervisor must establish that
the worker and any mutation-capable commands have stopped before reassigning
ownership. This is a recovery requirement, not an AGY cancellation guarantee.
