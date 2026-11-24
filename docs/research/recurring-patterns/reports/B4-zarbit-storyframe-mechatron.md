# B4 — Zarbit, Story Frame, Mechatron

## 1. Projects covered

Last activity is the date of the latest local Git commit, not a measure of deployment or uncommitted work. Paths below are relative to the named repository; `nexload-sdk/` identifies this SDK checkout. Findings are source inspection, not runtime verification. Quality scores are comparative extraction-readiness judgments (1 = highly specific or fragile; 5 = comparatively well separated and covered by source tests), not test results or security certifications.

| Project | Stack and purpose | Last activity |
| --- | --- | --- |
| zarbit | TypeScript pnpm/Turbo monorepo: Vite/React web, Hono/oRPC Node server, Node Telegram worker, PostgreSQL/Prisma; trading requests, market ingestion and settlement (`package.json`, `apps/{web,server,worker}/package.json`, `packages/db/prisma/schema/schema.prisma`). | 2026-10-17 |
| story-frame | Next.js/React content and media site with Persian service/price listings, JSON and MDX content, NGINX CDN (`package.json`, `lib/content.ts`, `app/services/page.tsx`). | 2026-11-07 |
| mechatron.ir | Next.js static Persian educational site, JSON content and NGINX/njs consultation-to-Telegram endpoint (`README.md`, `package.json`, `nginx/consultation.js`). | 2026-11-21 |

No `@nexload-sdk/*` dependency was found in the projects' package manifests. Zarbit explicitly uses its own `@zarbit/env`, `@zarbit/logger`, `@zarbit/format`, and `@zarbit/messages` (`apps/{server,web,worker}/package.json` and their package manifests). A matching package name alone does not establish feature parity.

## 2. Pattern table

| Pattern | Project | Files | Provider/lib | Quality (1-5) | Notes |
| --- | --- | --- | --- | --- | --- |
| Persian numbers, dates and price display | zarbit | `packages/format/src/index.ts`; `packages/format/test/format.test.ts` | Intl, Persian calendar, Asia/Tehran | 4 | Number, time, date-time, relative time and invalid-date placeholder; compact-price-to-toman delegates to trading domain. Tests exist. |
| Persian number and price display | story-frame | `app/services/page.tsx:31`; `data/services.ts` | `toLocaleString("fa-IR")` | 2 | Display-only service prices in toman; static discount copy is not a coupon engine. |
| Persian digits and date display | mechatron.ir | `src/lib/presentation.ts` | String replacement | 2 | Digit conversion and string slicing; its `faDate` does not perform a Gregorian-to-Jalali conversion. |
| Persian text normalization | zarbit | `packages/domain/src/normalize.ts`; `packages/domain/test/quote.test.ts` | Unicode NFKC | 4 | Normalizes both digit sets, letter variants, directional controls and spaces for a trading protocol; preserves ZWNJ. Do not assume all transformations are appropriate for arbitrary user content. |
| Iranian mobile validation | mechatron.ir | `nginx/consultation.js:3`; `tests/consultation.test.mjs` | njs | 4 | Handles Persian/Arabic digits, spaces, dashes and Iranian prefixes before validating local mobile format; tests exist. |
| Environment validation | zarbit | `packages/env/src/{server,worker,web,db,access}.ts`; `packages/env/package.json` | `@t3-oss/env-core`, Zod, dotenv | 3 | Per-runtime schemas, Vite client prefix, production HTTPS check, allowlist parsing; DB fields repeated. `SKIP_ENV_VALIDATION` can bypass schemas. Overlaps existing `nexload-sdk/packages/refactoring/env/src/manager/index.ts` and presets; migration compatibility is unverified. |
| Structured logging and redaction | zarbit | `packages/logger/src/index.ts`; `packages/logger/test/logger.test.ts` | Pino | 4 | JSON service bindings, explicit redaction paths, safe error metadata, stable short SHA-256 correlation reference; path list is not universal recursive redaction, and unsalted hashes are not anonymization. Existing `nexload-sdk/packages/refactoring/logger/src/{logger,types}.ts` has a different renderer-based implementation; evaluate actual parity before reuse. |
| Telegram message construction | zarbit | `packages/messages/src/{format,buttons,request,session,trader-rule}.ts`; `packages/messages/test/messages.test.ts` | Telegram MarkdownV2 | 4 | Escaping, inline-code handling and validated button URLs are reusable mechanisms; message copy, links and contracts are trading-specific. This package is distinct from env/logger: an equivalent SDK message package was not evidenced. |
| Telegram bot delivery | zarbit | `apps/server/src/integrations/telegram-bot/create-telegram-bot.ts`; `apps/worker/src/notifications.ts`; `packages/messages/src/index.ts` | grammY, Telegram Bot API | 3 | Bot and worker use trading-specific messages and events; distinguish notification formatting from transport and delivery guarantees. |
| Telegram form notification | mechatron.ir | `nginx/consultation.js:51`; `nginx/origin/templates/{http.d/85-consultation.conf.template,location.d/55-consultation.conf.template}`; `tests/consultation.test.mjs` | NGINX njs, Telegram Bot API | 3 | Multiple configured recipients with `Promise.allSettled`; `202` follows any fulfilled HTTP response, including Telegram HTTP errors, and does not prove acceptance or delivery; total transport failure gives `503`. No persistent queue shown. |
| Telegram Mini App authentication | zarbit | `apps/server/src/security/telegram/{verify-telegram-init-data,authenticate-telegram-request}.ts`; `packages/env/src/access.ts` | Node crypto, Telegram | 4 | HMAC verification, timestamp window, duplicate key rejection, constant-time comparison and configured user allowlist. Telegram-specific auth, not SMS OTP. |
| Telegram sessions and worker operations | zarbit | `apps/worker/src/{sessions,ownership,http,session-operations}.ts`; `packages/db/src/telegram-operations.ts`; `packages/db/prisma/schema/schema.prisma` | mtcute, SQLite lock, Prisma/Postgres | 3 | Persisted operation states and single-owner session volume; worker `/health` checks dependencies. MTProto sessions are not a generic SMS queue. |
| Ingestion deduplication and lifecycle | zarbit | `apps/worker/src/message-deduplicator.ts`; `packages/db/src/{requests,request-creation,telegram-operations}.ts`; `packages/db/prisma/schema/schema.prisma` | bounded in-memory map, Prisma transactions | 3 | In-memory dedup is bounded and process-local; database request identity, claims and transactional status transitions solve a different durable problem. Trading request states are not shop order states. |
| Request rate limiting | zarbit | `apps/server/src/platform/resilience/rpc-rate-limit.ts`; `apps/server/src/transport/rpc/create-orpc-router.ts` | in-memory token bucket | 3 | Per-user separate read/write budgets, bounded map; process-local and resets on restart. |
| Form rate limiting | mechatron.ir | `nginx/origin/templates/http.d/85-consultation.conf.template`; `nginx/origin/templates/location.d/55-consultation.conf.template`; `nginx/trusted-ingress.conf` | NGINX `limit_req` | 3 | Per-IP limit with burst, body bounds and trusted-proxy considerations; different identity and deployment boundary from Zarbit. |
| Cache-Control policy for static sites | story-frame | `nginx/templates/http.d/82-cache-policy-map.conf.template`; `scripts/test-nginx-cdn-level2.py` | Gecut NGINX CDN | 4 | Profiles for HTML/RSC, hashed files, media, images, JSON, service workers; error, method and Authorization overrides. |
| Cache-Control policy for static sites | mechatron.ir | `nginx/origin/templates/http.d/82-cache-policy-map.conf.template`; `tests/docker.mjs`; `README.md` | Gecut NGINX CDN | 4 | Related profile mapping with static Next.js output; README documents mutable and immutable assets, non-cacheable form/errors and auth. Tests exist; actual CDN behavior was not exercised. |
| Static content, taxonomy and slugs | story-frame | `lib/content.ts`; `content/categories.json`; `content/programs/` | JSON, MDX, gray-matter | 2 | Categories, programs, ordered items and legacy slug aliases; invalid JSON can be silently skipped. Editorial taxonomy, not product catalog. |
| Static content and build validation | mechatron.ir | `src/lib/content.ts`; `scripts/check-content.mjs`; `tests/content.test.mjs`; `src/app/sitemap.ts` | JSON, Next.js | 3 | Courses, projects, events, articles; checks include duplicate article slugs and missing local assets. Not Payload collections or a commerce catalog. |
| Health endpoint | zarbit | `apps/worker/src/http.ts:34`; `apps/server/src/integrations/worker/probe-worker.ts` | Hono | 3 | Worker health and startup probe; existing SDK health suite is the first integration candidate (`nexload-sdk/packages/healthcheck/`). Scope and compatibility not verified. |
| Health endpoint | mechatron.ir | `README.md`; `Dockerfile:27` | NGINX CDN | 2 | `/healthz` and container health check; static-serving health has different semantics from dependency readiness. |

**Seed and coverage limits:** Targeted inspection did not establish an implemented Kavenegar or other SMS queue/OTP, payment-gateway callback/verification, or Payload collections in these projects. Nor did it establish e-commerce cart, checkout, inventory, shipping, reviews, wallet, invoices, or an operative coupon engine. Absence is limited to this inspection, not proof that no implementation exists anywhere. Zarbit's trade settlement and requests must not be counted as e-commerce payments or orders. No national-code or IBAN validator, S3/MinIO integration, search or Umami integration was established. Story Frame's prices and promotional text are presentation content.

## 3. Best implementation per pattern

- **Persian formatting:** Zarbit `packages/format/src/index.ts` and tests provide the richest baseline. Extract generic Intl formatting and invalid-input behavior; leave compact trading quote scaling in Zarbit. Mechatron's digit-only output and Story Frame's number-only price display show narrower needs.
- **Normalization and Iranian phone:** Zarbit `packages/domain/src/normalize.ts` for opt-in text/digit primitives; Mechatron `nginx/consultation.js:3` for mobile normalization/validation and its tests. Keep protocol normalization opt-in and separate from presentation.
- **Telegram messaging:** Zarbit `packages/messages/src/format.ts` and tests for MarkdownV2 escaping, with a small generic transport boundary informed by both Zarbit and Mechatron. Mechatron's HTTP-response acceptance semantics need explicit redesign before treating it as delivery evidence; its code is tied to njs.
- **Environment and logger:** Compare Zarbit against existing SDK env/logger before extraction. Prefer extending/adapting existing SDK primitives if they meet runtime requirements; Zarbit contributes Zod/T3 runtime separation, redaction policy and tests. SDK logger's checked-in implementation is renderer-based even though its manifest describes Pino, so determine actual source behavior rather than assuming manifest claims.
- **Rate limits:** Mechatron for edge/IP controls and Zarbit for per-user RPC controls; no single implementation replaces both. The storage and deployment model needs to be explicit.
- **Cache profiles:** Story Frame and Mechatron provide related NGINX templates and test assets; compare their differing route profiles before extracting a shared deployment template. This is infrastructure, not necessarily a TypeScript SDK package.
- **Auth, worker and lifecycle:** Zarbit offers concrete examples, but its Mini App, MTProto ownership and trading transitions are domain-dependent. Extract only a proven generic seam after independent consumers appear; reuse the existing health suite where appropriate.
- **Content:** Mechatron has build validation evidence; Story Frame demonstrates aliases and ordered hierarchical MDX. Neither is sufficient evidence for extracting Payload commerce models.

## 4. Variations / divergences a reusable module must support as config

- Formatting: output digits and grouping, locale/calendar/time zone, invalid-date handling, relative-time thresholds, and explicit currency unit/scale. Trading compact quotes, integer toman and rial are not interchangeable; no universal conversion is inferred from a display label.
- Text and phone: digit scripts, Unicode/control normalization policy, optional letter normalization, allowed phone prefixes and output representation. Preserve meaningful Persian ZWNJ and avoid silently normalizing arbitrary content.
- Telegram: plain text versus MarkdownV2 escaping; single versus multiple recipients; Bot API versus MTProto; runtime transport; timeout and retry policy; whether success means HTTP response, provider acceptance or confirmed delivery. Redact credentials and sensitive inputs. Any queue would additionally require a separately designed persistence and idempotency contract.
- Environment/logging: browser versus Node runtime, public prefixes, schema adapters, validation bypass policy, structured bindings, destination, error serializer and explicit sensitive field paths. Existing SDK API and runtime behavior need compatibility assessment, not a presumed drop-in replacement.
- Rate limiting: edge IP versus authenticated user, read/write classes, capacities, trusted proxy setup, process-local versus shared persistence and restart behavior.
- Cache: hashed versus mutable assets, RSC/HTML, media and service-worker policies, response status, methods, authorization, and CDN/proxy deployment. Project-specific routes and provider cache behavior require separate verification.
- Authentication/lifecycle: Telegram validation window, bot configuration and access policy; worker ownership and durability boundaries; status transitions specific to the actual domain. None implies a generic commerce order or payment contract.

## 5. Candidate modules ranked by frequency × effort saved

Ranking is qualitative within these three projects, not a quantitative forecast. Frequency counts projects with direct evidence of the broader pattern; effort saved is an estimate, not measured implementation time.

| Rank | Candidate | Frequency; estimated saving | Recommendation |
| --- | --- | --- | --- |
| 1 | Persian numbers/date/price and digit utilities | 3/3; medium | Consolidate generic display primitives; add explicit calendar, unit and scale boundaries. |
| 2 | Telegram notification transport and safe message rendering | 2/3; high | Separate provider transport, formatting and domain templates; specify acceptance and failure semantics before any queue. |
| 3 | Static-site NGINX cache policy template | 2/3; medium | Shared configurable deployment asset and behavior tests, subject to route differences. |
| 4 | Request rate-limiting building blocks | 2/3; medium | Document two enforcement points and storage limits; do not present in-memory buckets as distributed. |
| 5 | Iranian phone normalization/validation | 1/3; medium | Extract small opt-in utility from Mechatron; pair with cross-project digit normalization. |
| 6 | Environment validation and logging integration | 1/3; medium | Investigate replacing Zarbit copies with existing SDK env/logger or extending them; do not create parallel SDK packages without gap analysis. |
| 7 | Telegram Mini App authentication | 1/3; medium | Candidate specialized adapter from Zarbit, not an OTP or general auth system. |
| 8 | Health probes and worker operation patterns | 2/3 health, 1/3 worker; low-to-medium | Prefer existing SDK health suite; treat durable workflow and MTProto locks as separate, domain-specific research. |
| 9 | Content validation / slug aliases | 2/3; low | Reuse concepts and tests where suitable; insufficient evidence for a Payload commerce module. |

SMS queue/provider adapters, payment gateways and Payload commerce collections remain unconfirmed seed candidates for other batches, not ranked implementations here.
