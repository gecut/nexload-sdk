# Spec brief: payment + SMS modules (director decisions)

Workers: read this file, `SYNTHESIS.md`, the relevant `reports/B*.md`, `AGENTS.md`,
`docs/architecture/PROJECT-KNOWLEDGE-BASE.md`, `docs/architecture/NEXLOAD-MODULAR-MONOLITH.md`,
`docs/packages/PAYLOAD-SUITE.md`, and the style of `docs/superpowers/specs/2026-11-21-payload-stable-major-design.md`.
Then read the cited source in the referenced projects (read-only) before designing.
Write ONLY your one spec file. Do not write code, do not modify any other file or any other repo.

## Fixed decisions (do not re-decide; flag in "Open questions" if you think one is wrong)

1. **Two layers per module**, following repo convention:
   - Core package, runtime-agnostic (Node + Bun), no Payload import: `@nexload-sdk/payment`, `@nexload-sdk/sms`.
   - Payload plugin package: `@nexload-sdk/payload-payment`, `@nexload-sdk/payload-sms`
     (collections, jobs/tasks, hooks, admin, built on `payload-schema` / `payload-operations` where it fits).
2. **Money:** integer amounts plus an explicit currency `'IRR' | 'IRT'` on every value. Never a bare number.
   Conversion to the gateway's unit happens only inside the adapter. Display formatting is out of scope.
3. **Providers in v1:**
   - Payment: Zibal (reference: kartbook `packages/integrations/src/payment/zibal.ts`, nexload-e-commerce
     `apps/api/src/modules/payments/providers/zibal.ts`) and a deterministic `mock` adapter. Specify Zarinpal as
     the second adapter to prove the interface (reference: faralist `packages/billing`), but mark it v1.1.
   - SMS: Kavenegar (reference: picosms `src/sdk/kavenegar.ts`, cloud-app `kavenegar.service.ts`,
     persianpartshop new queue), SMS.ir (reference: choobinooo `sms.service.ts`), and a `console`/`mock` provider.
4. **Persistence:** Payload Local API only. PostgreSQL row locking (`FOR UPDATE SKIP LOCKED`) is an optional
   fast path. A portable fallback (optimistic claim with owner + lease) must work on SQLite.
5. **Delivery semantics are honest:** at-least-once, with an idempotency key passed to the provider where it
   supports one. Specify behaviour when the provider accepts a request but the local ack is lost.
6. **OTP is NOT part of the SMS queue.** OTP is a later separate module. The SMS core must expose a
   direct synchronous `send` that OTP can call, plus the queued path for notifications.
7. **Payment domain shape** (from nexload-e-commerce, the strongest reference): `Payment` (intent: amount,
   currency, owner, purpose ref) → many `PaymentAttempt` (one per gateway redirect) → `PaymentVerification`
   records. Support full / deposit / final payments. Verification must check amount + currency against the
   persisted attempt, be idempotent on repeated callbacks, and handle late success after expiry by policy.
8. **No order logic inside payment.** The payment plugin emits typed events/hooks (`onPaymentSucceeded`, ...).
   The host app moves its own order state. Name the transaction boundary explicitly and specify what happens
   if the host hook fails after the gateway confirmed.
9. **Config & secrets** via `@t3-oss/env-core` (operator values) or a Payload global (site-owner values); logs via `@nexload-sdk/logger` with mandatory redaction
   (API keys, merchant ids, phone numbers masked, message bodies optional). Never log OTP codes.
10. **Testing:** contract tests every adapter must pass, run against the mock and against recorded fixtures.
    Plugin tests use the SQLite integration harness style already in `packages/payload-operations`.

## Spec file contents (both specs)
1. Problem + evidence (cite reports and source paths)
2. Goals / non-goals
3. Package layout and public API (TypeScript signatures, subpath exports)
4. Data model (collections, fields, indexes, access defaults)
5. Flows as numbered steps (and a mermaid sequence diagram for the main flow)
6. Failure modes table: failure → detection → behaviour
7. Configuration surface (with defaults)
8. Security and privacy
9. Migration path for at least two existing projects (which files get replaced)
10. Test plan
11. Open questions for the owner
Keep each spec focused: target 400–700 lines.

## Output paths
- Payment: `docs/superpowers/specs/2026-11-22-payment-module-design.md`
- SMS: `docs/superpowers/specs/2026-11-22-sms-module-design.md`
