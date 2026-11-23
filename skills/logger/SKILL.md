---
name: logger
description: "MUST be loaded before writing, changing or reviewing ANY log call, console.* call, catch block, error handling, job/worker, outbound HTTP/provider call, route handler or observability code in a project that uses @nexload-sdk/logger. Decides whether a log is needed, its level, event name and fields, and what must never be logged. Do not use for metrics/health endpoints (use healthcheck skills)."
---

# Logger

## Purpose

Use `@nexload-sdk/logger` to record structured events at application boundaries and correlate work across services.

## Trigger boundary

- Load this skill before writing, changing, or reviewing log calls, console calls, error handling, jobs, workers, outbound calls, route handlers, or observability code in a project using the logger.
- Use the relevant healthcheck skill for metrics and health endpoints.

## Source of truth

Treat `packages/logger/src` as authoritative for runtime behavior and public exports.

## Required inspection

Read `packages/logger/README.md` and `packages/logger/src/index.ts` before editing. In a consumer project, inspect its installed logger version and existing runtime configuration, then read the relevant reference below.

## Decision flow

Walk these gates for every candidate log.

1. **Boundary?** Log only at an inbound request, outbound call, job run, domain state transition, or process lifecycle boundary. Skip pure functions and getters. In loops, aggregate results and log once after the loop.
2. **Caught error?** Inner code that rethrows or returns the error upward never logs it. Inner code that handles it by fallback, retry, or swallowing logs once there with `{ err }`. The outermost request/job wrapper catches and logs a propagated failure once with `{ err, event, outcome: "failure", durationMs }`: `error` for unexpected failures or `warn` for handled/expected failures. It emits the single request/job summary, then rethrows or responds.
3. **Level?** Choose the level from [Level and event rules](references/level-and-event-rules.md).
4. **Event?** Use a stable `domain.entity.action` name with a past-tense action, such as `order.payment.verified` or `sms.delivery.failed`. Add a short human-readable `msg`.
5. **Fields?** Use IDs and safe boundary metadata such as `orderId`, `userId`, and `provider`. Add `durationMs` and `outcome` (`success|failure|retry`) for timed operations, and `attempt` for retries. Never log secrets, OTP codes, phone numbers, full bodies, provider payloads, or tokens.
6. **Logger?** Create `logger.child({ module })` once per module. Never use `console.*` or instantiate pino directly.
7. **Request scope?** Wrap handlers with `withLogContext({ requestId, traceId }, handler)` and forward `traceHeaders()` on outbound calls. Automatic context attachment is available in Node. See [Logging architecture](references/logging-architecture.md) for other runtimes.

## Required log points

| If | Write |
| --- | --- |
| The app starts | `info` with `event: "app.lifecycle.started"` and the release. |
| The app shuts down or encounters a fatal condition that prevents it from continuing | `fatal` with the shutdown reason and `err` when applicable. |
| An inbound request finishes or propagates to the framework | One `info` summary with method, route, `durationMs`, and `outcome`; include status when known. Do not repeat `err` in the summary. |
| An outbound provider call succeeds, will retry, or fails for the last time | `info` on success; the adapter logs `warn` per retry attempt. The final failure is logged once by whoever handles it, usually the outermost boundary, at `error` if unexpected or `warn` if handled/expected. Include safe provider metadata, `durationMs`, and `outcome`; include `attempt` on retry. |
| A job run finishes | One `info` summary with scanned, sent, and failed counts. |
| A business milestone occurs | `success` with an event such as `payment.attempt.verified` or `order.lifecycle.placed`. |
| User input fails validation | `debug` with safe diagnostic fields. |
| Authentication fails | `warn` without credentials. |
| The app uses a config fallback | `warn` with the affected setting name. |
| A health check passes | Skip the log. |

## Anti-patterns

Examples assume `log` is the module child.

| Anti-pattern | Before | After |
| --- | --- | --- |
| Double logging | `catch (err) { log.error({ err, event: "order.payment.failed" }, "Payment failed"); throw err }` in a service | Let the error propagate without logging. The handling boundary or outermost wrapper logs it once, even if the wrapper rethrows to the framework. |
| Logging in loops | `for (const job of jobs) { log.info({ event: "sms.job.scanned" }, "Scanned job") }` | Aggregate during the loop, then call `log.info({ event: "sms.job.completed", scanned, sent, failed }, "SMS job completed")`. |
| `console.log` | `console.log("Order placed")` | `log.success({ event: "order.lifecycle.placed", orderId }, "Order placed")`. |
| Logging the request body | `log.debug({ event: "order.input.rejected", body }, "Invalid order input")` | `log.debug({ event: "order.input.rejected", requestId }, "Invalid order input")`. |
| String concatenation with data | `log.success({ event: "order.payment.verified" }, "Verified order " + orderId)` | `log.success({ event: "order.payment.verified", orderId }, "Payment verified")`. |

## Verification

- [ ] Run `rg "console\.(log|info|warn|error)" src` from the app root. App code must have no matches.
- [ ] Check every `catch`. Inner code propagates without logging or logs once where it handles the error; the outermost wrapper logs a propagated failure once before rethrowing or responding and emits one summary.
- [ ] Check every new `event` for the `domain.entity.action` format and a past-tense action.

## Reference routing

- Read [API contract](references/api-contract.md) for root and testing exports.
- Read [Logging architecture](references/logging-architecture.md) for boundaries, runtime setup, and trace propagation.
- Read [Level and event rules](references/level-and-event-rules.md) for levels, naming, and safe fields.
- Read [Migration from v4 to v5](references/migration-v4-v5.md) when upgrading a consumer.
