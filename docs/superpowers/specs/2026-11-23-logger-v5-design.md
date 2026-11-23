# @nexload-sdk/logger v5 (design)

Status: **approved** (2026-11-23). Plan: `docs/superpowers/plans/2026-11-23-logger-v5.md`.

## Intent
One global logger, configured **once per service runtime**, that covers the logging needs our
projects keep re-implementing. It is the base package for audit logging (`payload-preset`),
SMS/payment modules and every app.

## Evidence (why the current one fails)
- `packages/refactoring/logger` v4.1.0: 540 lines, custom renderers. `package.json` says
  "powered by pino … redaction" but there is no pino, no redaction, no error serializer.
- Logger is built at import time from `SERVICE_NAME` / `LOG_LEVEL` env (default `WARN`);
  it cannot be configured from code.
- Adoption: only choobinooo (12 files) and nexload-e-commerce (1 file) import it. persianpart,
  rasad-srm, cloud-app, faralist use `console.*` directly (tens to hundreds of calls).
- nexload-e-commerce wrote 733 lines on top of it (`packages/observability`, per-app
  `logging.ts`): sensitive-key redaction, error serialization, `x-trace` propagation.
- zarbit wrote its own pino logger (`packages/logger/src/index.ts`): redaction paths, error
  serializer with safe `code` + `cause` depth 3, base fields `service/releaseId/instance`.
- `@gecut/logger` (npm, last 2024) is a colorful console debugger, not a production logger.

## Goals
- `configureLogger()` once per runtime (Next.js `instrumentation.ts`, or service entry file).
- `logger` importable anywhere, safe before configuration (lazy).
- Safe by default: redaction + error serialization.
- Request context (`requestId`, `traceId`) attached automatically in Node.
- Same API in Node, Edge and browser.
- Keep the v4 call shape `logger.info(obj?, msg?)`, `child()`, and the `success` level.

## Non-goals (v1)
Log shipping / remote transports, browser-to-server logs, custom transport system,
OpenTelemetry, allowlist (`SAFE_KEY_SET`) mode, ESLint `no-console` enforcement (follow-up).

## Approaches
| | Approach | Decision |
|---|---|---|
| A | Thin layer over pino (engine) + our defaults and once-config | **Chosen** |
| B | Keep extending the custom implementation | Rejected: re-implements redaction, serialization and performance; failed twice |
| C | OpenTelemetry Logs directly | Rejected for now: too heavy before central log collection exists |

## Design decisions
1. **Location & version:** move to `packages/logger`, `@nexload-sdk/logger@5.0.0` (major).
2. **Engine:** `pino@^10.4.0` (dependency). Browser/Edge build uses `pino/browser`.
3. **No dependency on `@nexload-sdk/env`** (env already depends on logger: avoid a cycle).
   Env vars are read only as fallbacks: `SERVICE_NAME`, `LOG_LEVEL`, `RELEASE`.
4. **Levels** (lowercase labels in output, breaking vs v4 uppercase):
   `trace 10, debug 20, info 30, success 35 (custom), warn 40, error 50, fatal 60`.
   Default level: `LOG_LEVEL` env, else `info` in production, `debug` otherwise.
5. **Lazy proxy:** `logger` and any `logger.child()` resolve the configured instance on every
   call, so module-level loggers created before `configureLogger` follow the final config.
6. **Once-config:** second `configureLogger()` call returns the existing logger and emits one
   `warn` (`event: "logger.reconfigure.ignored"`) unless `{ force: true }`.
7. **Redaction:** pino `redact` paths, censor `"[REDACTED]"`. Default list (top level + one level
   deep via `*.`): `password, token, secret, apiKey, authorization, cookie, otp, phone, mobile,
   merchant` plus `req.headers.authorization, req.headers.cookie, headers.authorization,
   headers.cookie, body, req.body`. Hosts add paths; `replaceDefaults: true` replaces them.
   Known limit: no recursive wildcard; deeper secrets are not redacted (documented; the skill
   says log ids only).
8. **Errors:** key `err`. Serializer → `{ type, message (≤500 chars), code (only if
   /^[A-Z][A-Z0-9_]{1,99}$/), stack (non-production only), cause (depth ≤ 3) }`.
   `logger.error(errorInstance, msg?)` is normalized to `{ err }`.
9. **Context (Node only):** `withLogContext(bindings, fn)` via `AsyncLocalStorage`;
   a pino `mixin` merges the current context into each line. Browser/Edge: pass-through.
10. **Trace helpers:** `TRACE_HEADER = "x-trace-id"`, `resolveTraceId(headers)` (reuse a valid
    incoming id `/^[A-Za-z0-9-]{8,64}$/`, else `crypto.randomUUID()`), `traceHeaders()`.
11. **Dev output:** internal pretty stream (no `pino-pretty` dependency, no worker-thread
    transport: thread-stream breaks in Next.js bundles). Production: JSON lines to stdout (sync).
12. **Testing:** subpath `@nexload-sdk/logger/testing` → `createTestLogger()` capturing entries.
    Removes `./log-test`.
13. **Base fields:** `service`, `release?`, `instance?`, `environment?`, `pid`, ISO `time`.

## Public API
```ts
type LogLevel = "trace" | "debug" | "info" | "success" | "warn" | "error" | "fatal";
type LogBindings = Record<string, unknown>;
interface Logger {
  trace(objOrMsg?: object | Error | string, msg?: string): void; // same for every level
  debug(...): void; info(...): void; success(...): void; warn(...): void; error(...): void; fatal(...): void;
  child(bindings: LogBindings): Logger;
  isLevelEnabled(level: LogLevel): boolean;
}
interface LoggerOptions {
  service: string; level?: LogLevel; release?: string; instance?: string; environment?: string;
  redact?: { paths?: string[]; replaceDefaults?: boolean; censor?: string };
  pretty?: boolean;                // default: NODE_ENV !== "production"
  destination?: { write(line: string): void };
  base?: Record<string, string | number | boolean>;
  force?: boolean;
}
export const logger: Logger;           // also default export
export function configureLogger(options: LoggerOptions): Logger;
export function withLogContext<T>(bindings: LogBindings, fn: () => T): T;
export function getLogContext(): LogBindings;
export const TRACE_HEADER: "x-trace-id";
export function resolveTraceId(headers: Headers | Record<string, string | undefined>): string;
export function traceHeaders(): Record<string, string>;
export const DEFAULT_REDACT_PATHS: readonly string[];
// @nexload-sdk/logger/testing
export function createTestLogger(options?: Partial<LoggerOptions>): { logger: Logger; entries: LogEntry[]; clear(): void };
```

## Logging architecture (taught by the skill)
- Log at **boundaries**: inbound request summary, outbound provider calls, job runs, domain
  state transitions. Not inside pure domain functions or loops (aggregate, log once).
- Every log line has `event` in `domain.entity.action` form (e.g. `payment.attempt.verified`)
  plus a human `msg`; timed operations add `durationMs` and `outcome` (`success|failure|retry`).
- Log an error **once**, where it is handled; catch-and-rethrow does not log.
- Level table: fatal = process cannot continue; error = unexpected failure needing attention;
  warn = handled degradation/retry/fallback; success = business milestone; info = lifecycle and
  one summary per request/job; debug = diagnostics; trace = very verbose.
- Never log secrets, OTP codes, phone numbers, full bodies or provider payloads; log ids.
- Health-check successes are not logged.

## Enforcement for agents
Skill `skills/logger` with a "use before any log/console/catch change" trigger, a project rule
`.claude/rules/logging.md`, a mandatory section in `AGENTS.md`, and a copy-paste snippet for
consumer projects' `AGENTS.md`.

## Docs
Package README, `docs/packages/CORE-PRIMITIVES.md`, `PROJECT-KNOWLEDGE-BASE.md`,
`docs/skills/DOMAIN-SKILLS.md`, and a new `apps/docs` section (`packages/logger/{index,guides,api}.mdx`)
in a new "Core Primitives" sidebar group.

## Open (left to builder)
Exact pino typings for custom levels in the proxy; Edge export condition names verified
against Next.js (`edge-light`, `worker`, `browser`).
