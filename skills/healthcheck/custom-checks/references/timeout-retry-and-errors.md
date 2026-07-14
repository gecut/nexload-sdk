# Timeout, retry, and errors

## Cancellation

Check `ctx.signal.aborted` before expensive work and pass the signal to fetch, database/cache clients, timers, and waits. The manager races checks against timeout, but cannot forcibly stop ignored work. Collector timeout is cooperative; a collector that ignores the signal can keep the run pending.

An already-running attempt may overlap a retry when cancellation is ignored. Therefore operations must be idempotent and side-effect free.

## Timeout resolution

For checks: definition timeout, run override, manager default, then 1000 ms. For collectors: collector timeout, manager default, then 1000 ms; run timeout does not apply.

Timed-out checks get `CHECK_TIMEOUT`. Timeout status is manager-wide: unhealthy by default, or degraded when `defaults.unhealthyOnTimeout` is false.

## Retry behavior

`retries.attempts` counts additional attempts. Returned results retry only when their status matches `retryOn`, default unhealthy. Current manager behavior can retry thrown and per-attempt timed-out work whenever attempts remain, regardless of `retryOn`. Do not generalize that rule to a parent `AbortSignal`: once the parent signal is aborted, the retry delay rejects and no later attempt begins.

Use low attempt counts. Compute worst-case duration including every timeout and delay. Backoff is base delay, base times attempt for linear, or base times `2^(attempt-1)` for exponential.

## Stable errors

Return an error object for known failures:

```ts
return {
  status: "unhealthy",
  metrics: { latencyMs },
  error: { code: "DATABASE_UNAVAILABLE", message: "Database check failed." },
};
```

Keep `code` machine-stable and `message` generic. Do not attach raw SQL, connection strings, response bodies, or credentials. A thrown value is normalized to `CHECK_THROWN`; custom metrics and domain error context are lost.

Raw reports can still contain cause messages even when public serialization suppresses them. Do not create sensitive causes.
