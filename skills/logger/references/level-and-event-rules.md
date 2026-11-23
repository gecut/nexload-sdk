# Level and event rules

## Levels

| Level | Value | Use |
| --- | ---: | --- |
| `fatal` | 60 | The process cannot continue. |
| `error` | 50 | An unexpected failure needs attention. |
| `warn` | 40 | The application handles degradation, a retry, or a fallback. |
| `success` | 35 | A business milestone occurs. |
| `info` | 30 | A lifecycle event or one summary per request or job. |
| `debug` | 20 | Diagnostics such as rejected user input. |
| `trace` | 10 | Very verbose diagnostics. |

The outermost request/job wrapper logs a propagated failure once with `{ err, event, outcome: "failure", durationMs }`: use `error` for an unexpected failure and `warn` for a handled/expected failure. It emits one separate summary without `err`, then rethrows or responds. Inner code that rethrows never logs; inner code that handles by fallback, retry, or swallowing logs once there. A provider adapter logs `warn` per retry attempt; whoever handles the final failure, usually the outermost wrapper, logs it once.

## Event names

Use a stable lowercase `domain.entity.action` name and a past-tense action, such as `payment.attempt.verified` or `sms.delivery.failed`. Keep IDs and other dynamic values in fields. Pass the short human message as the second argument to the level method.

## Field dictionary

| Field | Use |
| --- | --- |
| `event` | Stable event name used for filtering and grouping. |
| `msg` | Short human-readable description of what happened. |
| `durationMs` | Elapsed milliseconds for a timed operation. |
| `outcome` | `success`, `failure`, or `retry` for a timed operation. |
| `attempt` | Attempt number on a retry event. |
| `provider` | Stable provider identifier, such as `zibal`. |
| `err` | Safe error at the boundary that handles it. |
| `requestId` | Identifier for the current request. |
| `traceId` | Identifier shared across correlated service calls. |

Use identifiers such as `orderId` or `userId` and allowlisted boundary metadata. Omit secrets, OTP codes, phone numbers, request bodies, provider payloads, and tokens. Default redaction covers configured paths, including common sensitive keys at the top level and one level deep. Supply a safe error when an upstream exception can embed sensitive values in its message, stack, or cause.
