# Brief: Recurring-pattern harvest for nexload e-commerce modules

## Goal
nexload-sdk exists to speed up building our projects. Next phase: a set of reusable
"puzzle piece" modules for e-commerce sites (Payload CMS + Next.js stack). Step 1 (this task)
is ONLY discovery: find the patterns we keep re-implementing across projects, with evidence.
Do NOT write SDK code. Do NOT modify any analyzed repository.

## Known seed examples (confirm, refine, find more)
- SMS queue with Kavenegar (and other Iranian SMS providers) + its Payload collection (logs/queue/OTP)
- Configurable payment gateway adapters (Zibal, Zarinpal, IDPay, ...) with verify/callback flow

## What to look for (per project)
Commerce: products/variants, categories, cart, checkout, orders + status machine, invoices/factor,
discounts/coupons, inventory, shipping/delivery cost, wallet/credit, reviews.
Integrations: SMS/OTP, payment gateways, email, storage/media (S3/MinIO), search, analytics (Umami), Telegram bots.
Auth: OTP/phone login, JWT, roles/permissions, admin access control.
Payload: collections/globals repeated across projects, hooks, access functions, custom fields
(slug, SEO, Jalali dates, Persian/RTL, price/Toman-Rial), seeding, migrations, jobs/queues.
Infra: env validation, logging, healthchecks, Docker/deploy, cron/worker, rate-limit, caching.
Persian-specific: Jalali dates, Persian digits, national-code/phone/IBAN (Sheba) validation, Toman/Rial formatting.

## Rules
- Read-only on every repo. Skip node_modules, .next, dist, build, .turbo, lockfiles.
- NEVER copy secret values (.env, API keys, tokens). Mention only variable NAMES.
- Note when a project already uses an @nexload-sdk/* package for the pattern.
- Evidence = repo + file path (+ line if cheap). No guessing; mark uncertain items.

## Output (write exactly one file per worker)
Path: docs/research/recurring-patterns/reports/<batch-id>.md, with sections:
1. Projects covered (name, stack, purpose in one line, last activity)
2. Pattern table: | Pattern | Project | Files | Provider/lib | Quality (1-5) | Notes |
3. Best implementation per pattern (which project to extract from and why)
4. Variations / divergences that a reusable module must support as config
5. Candidate module list for this batch, ranked by (frequency x effort saved)
Keep it under ~400 lines.
