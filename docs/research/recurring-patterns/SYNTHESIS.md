# Recurring patterns — synthesis (step 1: discovery)

Sources: 7 batch reports in `reports/` covering 16 local projects and 42 GitHub repos
(B1–B5 by Codex on local repos, B6–B7 by Antigravity/Gemini 3.8 Flash on shallow clones in `~/Codes/_gh-mirror`).
Merged and spot-checked by Claude on 2026-11-22. This is discovery, not an approved build list.

## Verification notes
- All analyzed repos are unchanged by the workers, except one untracked `.codex/config.toml`
  that appeared in `persianpartshop.ir` during the run (see "Open items").
- Secret scan over all reports: no credential values found; only env-var names.
- Spot checks passed: kartbook `zibal.ts` / `banks.ts`, meetal `payload.config.ts`,
  hr-collector `phone-number.ts`, versions Payload 3.88.0 / Next 16.3.0 / Django 3.2.3.
- **Unverified (B6):** FarazSMS/IPPanel/Ghasedak drivers — no source matches found. Treat Kavenegar,
  SMS.ir and Zibal as the only evidenced providers; Zarinpal evidenced only in faralist (B2).
- B6/B7 scores are less conservative than B1–B5. Rankings below weight independent project count.
- B6 covered 21 of 25 gecut clones (skipped: archive.autohesab.ir, autohesab-archivement,
  builder.ui.gecut.ir, maaref.pre-register). B7 says 16 of 17.

## Ranked module candidates

| # | Module (working name) | Evidenced in | Best extraction source | Key config axes |
|---|---|---|---|---|
| 1 | **Payment gateway adapters + attempt/verification records** | choobinooo, nexload-e-commerce, faralist, cloud-app, kartbook (5) | Domain: nexload-e-commerce `modules/payments/*` (attempt/verification split, tx + locks, idempotency, late-payment). Transport: kartbook `packages/integrations/src/payment/zibal.ts` (Persian error map, timeout, inquiry) | provider (Zibal evidenced; Zarinpal in faralist; IDPay prospective), IRR↔IRT unit, callback URL policy, full/deposit/final payments, concurrent callback handling |
| 2 | **SMS transport + durable delivery queue (Payload collections)** | choobinooo, nexload-e-commerce, faralist, persianpartshop, cloud-app, rasad-srm, picosms, microsms, kartbook (9) | Queue: nexload-e-commerce `cms/jobs/sms-delivery*` + `schema/notifications/*` (SKIP LOCKED claims, stale recovery, backoff, idempotency key); persianpartshop new Kavenegar queue. Transport: picosms `src/sdk/kavenegar.ts`, cloud-app `kavenegar.service.ts`. Provider seam: rasad-srm `integrations/sms/types.ts` | provider (Kavenegar, SMS.ir), template vs raw text, event→template map, batch/lease/retry, retention + redaction, PG-specific locking vs SQLite |
| 3 | **Phone OTP auth** (separate from the queue: direct, synchronous) | choobinooo, nexload-e-commerce, faralist, persianpartshop, cloud-app, kartbook, hr-collector (7) | nexload-e-commerce hashed challenge + attempt limit + atomic consume; faralist `packages/auth` end-to-end | expiry, cooldown, attempts, purpose isolation, shared rate-limit store (most current copies are process-local), session/JWT issuance |
| 4 | **Persian utilities** (digits, phone normalize, Jalali, Toman/Rial, national-code, Sheba) | nearly every project (10+) | zarbit `packages/format` + `domain/normalize.ts` (tested); hr-collector `helpers/phone-number.ts`; rasad-srm `lib/jalali.ts`; kartbook `packages/banks` (BIN directory) | digit script out, calendar/timezone, explicit currency unit/scale (`rial`/`toman`/`toman_k` all seen). Overlaps `payload-fields` date/money — extend, don't duplicate |
| 5 | **Orders + inventory reservation** | choobinooo, nexload-e-commerce, persianpartshop (+old), persianpart, kolahatbox (5) | persianpartshop new Payload order hooks + warehouse stock ops; nexload-e-commerce guarded reservation + outbox | configurable status graph, catalog vs custom orders, per-warehouse vs single stock, unit rounding, tx boundaries |
| 6 | **Catalog / variants / categories** | choobinooo, nexload-e-commerce, faralist (3), persianpartshop, menu.faraz.coffee | nexload-e-commerce product/variant entities; persianpartshop category cycle check | extract primitives only; product models are store-specific |
| 7 | **Payload Persian preset** (`fa` translations, RTL locale, Asia/Tehran, font) | meetal.app, nexload, hr-collector, most Payload projects | meetal `payload.config.ts`, hr-collector | likely belongs in existing `payload-schema`/`payload-fields`, not a new package |
| 8 | **Discounts + shipping policies** | choobinooo, nexload-e-commerce, kartbook | nexload-e-commerce redemption records | eligibility, redemption, 100%-coupon zero checkout |
| 9 | **Outbox / worker dispatcher** | nexload-e-commerce, faralist, persianpartshop | nexload-e-commerce outbox | needed by #2 and #5; claim lifetime and crash recovery need redesign in faralist's copy |
| 10 | **Telegram notify + Umami reporting** | zarbit, mechatron, umami-stats | zarbit `packages/messages` (MarkdownV2 escaping) | adjacent to commerce; lower priority |

Lower priority / single-project: media processing port (faralist), subscription/entitlements (faralist),
wholesale tier pricing (kolahatbox), NGINX cache templates (story-frame, mechatron), rate-limit blocks.

## Cross-cutting findings
- **Duplicated SDK foundations:** zarbit, faralist and others ship their own env/logger/format packages.
  Several projects import `@nexload-sdk/payment-engine`, `config-loader`, `event-emitter`, `health-route`,
  `token-formatter`… that do not exist in this repo. Find where they come from before designing #1.
- **Currency unit is the #1 recurring bug surface:** Rial, Toman and thousand-Toman are all stored somewhere.
  Every money module needs an explicit unit type.
- **Direct OTP vs queued notifications** are two different paths in every mature project. Keep them as separate modules.
- **Concurrency gaps repeat:** payment success and order transition are separate writes (choobinooo);
  process-local rate limits and OTP stores (cloud-app, faralist). A shared module is a chance to fix these once.

## Suggested next step
Write specs (RFCs) for #1 Payment and #2 SMS queue first. They are your two seed examples,
have the strongest evidence, and share #9 (outbox). #3 OTP and #4 Persian utils come next.

## Follow-up documents
- Payment spec draft (parked; still env-based, needs the client-editable global config + installment gateways):
  `docs/superpowers/specs/2026-11-22-payment-module-design.md`
- SMS spec draft (parked): `docs/superpowers/specs/2026-11-22-sms-module-design.md`
- Payload preset design (approved approach C) and plan (ready to execute; Step 0 done, decisions D1–D9 in the plan):
  `docs/superpowers/specs/2026-11-23-payload-preset-design.md`, `docs/superpowers/plans/2026-11-23-payload-preset.md`
- Current focus: `@nexload-sdk/logger` as the base package.

## Open items for the owner
1. `persianpartshop.ir/.codex/config.toml`: an untracked file that contains a live bearer token for the beta CMS MCP endpoint.
   It is not git-ignored. Decide whether to keep it, git-ignore it, or rotate the token.
2. ~~Where do `@nexload-sdk/payment-engine` and its sibling packages live?~~ Resolved: they are made-up names in a
   `nexload-cto-review` eval fixture (`.agents/skills/nexload-cto-review/evals/fixtures/`), not real dependencies.
3. Decide whether `docs/research/` should be committed. Also decide whether to keep `~/Codes/_gh-mirror` (42 shallow clones).
