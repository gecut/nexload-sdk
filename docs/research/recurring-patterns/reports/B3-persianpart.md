# B3-persianpart — recurring-pattern research

## 1. Projects covered

Last activity is the date of the latest local Git commit, not a deployment date. Source inspection only; no services, tests, providers, or migrations were run. Paths below are relative to the named repository. Quality is an extraction-readiness judgment from inspected source, 1 (unsafe/incomplete) to 5 (strong starting point), not a production audit or test result.

| Project | Stack and purpose | Last activity |
| --- | --- | --- |
| **New** `persianpartshop.ir` | pnpm monorepo: Bun/Hono/oRPC API, Payload/Next CMS, Vite/React merchant PWA, Next public catalog, shared Zod/oRPC contracts; tile and related-product commerce (`package.json`, `apps/*/package.json`, `packages/contract/package.json`). | 2026-11-22 |
| **IC** `ic.persianpartshop.ir` | Next/React static Persian RTL business card, contacts and catalog link; no database described (`README.md`, `package.json`, `app/contacts.vcf/route.ts`). | 2026-11-19 |
| **Old** `old-persianpart` | Nx TypeScript monorepo with Node/tRPC/Mongoose API and Vite PWA for the earlier commerce system (`apps/persianpart-api/project.json`, `apps/persianpart-pwa/project.json`, `apps/persianpart-api/src/entities/product.ts`). A second API variant also exists; its relationship to the first is unverified. | 2026-09-27 |

No `@nexload-sdk/*` dependencies were found in package manifests searched across these repositories; this does not rule out unmanifested usage. The requested new-project scope is `apps/api`, `apps/catalog`, `apps/cms`, `apps/web`, and `packages/contract`.

## 2. Pattern table

| Pattern | Project | Files | Provider/lib | Quality (1–5) | Notes |
| --- | --- | --- | --- | --- | --- |
| Product and category model | Old | `apps/persianpart-api/src/entities/product.ts`, `src/routes/product.ts` | Mongoose, Zod | 2 | Product has price, unit and quantity; storefront query filters positive quantity; admin import replaces products. Paths after the first are under `apps/persianpart-api`. |
| Product families, taxonomy and public catalog | New | `apps/cms/src/collections/products/products.collection.ts`, `apps/cms/src/collections/product-families/product-families.collection.ts`, `apps/cms/src/collections/categories/_validate-parent.before-change.ts`, `apps/cms/src/modules/catalog/catalog-service.ts`, `packages/contract/src/public-catalog.ts` | Payload, PostgreSQL, Zod | 4 | SKU, family, dimensions, category, packaging and pricing; category parent validation uses a transaction advisory lock and recursive cycle check. Family relationship is not evidence of a generic variant engine. |
| Cart and quotes | Old | `apps/persianpart-pwa/src/manager/data.ts`, `apps/persianpart-pwa/src/content/dialogs/order-detail.dialog.ts` | Vite PWA, localStorage | 2 | Cached product data and client-side line totals. |
| Cart and quotes | New | `apps/web/src/modules/cart/cart-store.ts`, `apps/api/src/routers/shopping.ts`, `apps/api/src/routers/catalog.helpers.ts` | React, oRPC | 4 | Selection/quote state, warehouse selection, carton rounding and price/stock data; checkout is blocked on missing warehouse or quotes. Packaging math is domain-specific. |
| Orders and stock | Old | `apps/persianpart-api/src/entities/order.ts`, `apps/persianpart-api/src/routes/order.ts` | Mongoose, tRPC | 1 | Embedded order snapshots and status values; status input accepts a string. Stock is checked, then decremented and order created without an enclosing transaction in this route; concurrent/failure consistency is not established. `apps/persianpart-api-2/src/routes/order.ts` is a different variant. |
| Orders and stock | New | `apps/api/src/routers/order.ts`, `apps/cms/src/collections/orders/_prepare-order.before-validate.ts`, `_validate-transition.before-change.ts`, `_apply-reservation.before-change.ts`, `apps/cms/src/collections/warehouse-stock/_stock-operations.ts` | Payload, PostgreSQL | 4 | Server prepares totals and snapshots; idempotency key and request fingerprint, guarded transitions/timeline and transaction-bound reservation/restoration. Relevant order hook paths are in `apps/cms/src/collections/orders/`. Validate under actual concurrent database operations before extraction. |
| Warehouse stock and import | New | `apps/cms/src/collections/warehouse-stock/warehouse-stock.collection.ts`, `_stock-operations.ts`, `_import.endpoints.ts`, `_import-csv.ts`; `packages/contract/src/warehouse.ts` | PostgreSQL, CSV | 4 | Per-product/per-warehouse balances, exact vs inquiry mode, import preview/apply and row errors; stock math is tailored to cartons and area. |
| Invoice and discounts | New | `apps/web/src/modules/orders/order-invoice-modal/order-invoice-modal.tsx`, `apps/web/src/modules/checkout/pre-invoice-modal.tsx`, `apps/cms/src/collections/orders/_prepare-order.before-validate.ts` | React, Payload | 3 | Invoice/pre-invoice UI and order totals exist; order preparation currently sets discount and tax to zero. This is not evidence of a coupon engine or fiscal invoice integration. |
| Payment verification | New | `apps/api/src/routers/shopping.ts`, `packages/contract/src/shopping.ts` | oRPC | 1 | `verifyPayment` checks order existence/ownership and returns `verified: true`; no gateway verification is performed there. No gateway adapter or callback was established in inspected scope; do not extract this as payment verification. |
| SMS and order notifications | Old | `apps/persianpart-api/src/routes/order.ts`, `apps/persianpart-api/src/libs/send-sms.ts`, `packages/core/utilities/src/kavenegar.ts` | Kavenegar | 1 | Order route invokes SMS without awaiting before stock checks; helper catches failures. A separate HTTPS utility exists, but its use by this API was not established. A credential literal exists in the legacy route; values are intentionally omitted. |
| SMS queue and OTP delivery | New | `apps/cms/src/modules/sms/{queue-service,queue-worker,kavenegar-client}.ts`, `apps/cms/src/collections/sms-queue/sms-queue.collection.ts`, `apps/cms/src/collections/otps/_send-otp.before-change.ts`, `apps/cms/src/lib/committed-sms.ts` | Kavenegar, Payload, PostgreSQL | 4 | Durable queue, atomic `SKIP LOCKED` claims, stale-claim recovery, limited concurrency, retry and admin record; delivery is at-least-once and PostgreSQL-specific. OTP hook sends directly, not through that queue. Client has timeout, normalization and masking; development mode logs OTPs. |
| Authentication and access | Old | `apps/persianpart-api/src/routes/user.ts`, `apps/persianpart-api/src/libs/{context,trpc}.ts`, `apps/persianpart-pwa/src/manager/data.ts` | tRPC, Mongoose | 1 | Phone/password lookup and user-ID bearer context in inspected flow; not a safe reusable authentication baseline. |
| Authentication and access | New | `apps/api/src/routers/auth.ts`, `apps/api/src/lib/otp.ts`, `apps/cms/src/collections/otps/otps.collection.ts`, `apps/cms/src/collections/products/_product-access.ts`, `packages/contract/src/auth.ts` | Payload, oRPC, JWT | 3 | Admin-provisioned active customer, OTP expiry/cooldown/attempt limit and consumption, session token, category/role access. OTP code is stored and compared directly; concurrency and security hardening require review before reuse. |
| Catalog search and visibility | New | `apps/cms/src/modules/catalog/{catalog-query-sql,catalog-policy,catalog-mapper}.ts`, `apps/catalog/src/lib/catalog-search.ts`, `apps/api/src/routers/shopping.ts` | PostgreSQL, Payload | 3 | Catalog query/policy and separate public catalog; customer category and pricing permissions in merchant API. Reuse policy interfaces, not tile-specific SQL wholesale. |
| Media and offline | New | `apps/cms/src/collections/media/media.collection.ts`, `apps/web/src/modules/pwa/offline-storage.ts`, `apps/api/src/routers/offline.ts` | Payload, IndexedDB | 3 | Media derivatives and offline data paths; no S3/MinIO implementation established in inspected paths. |
| Persian formatting | Old | `apps/persianpart-pwa/src/content/dialogs/order-detail.dialog.ts` | Browser locale | 2 | Persian number/date display in order UI. |
| Persian formatting | New | `apps/web/src/lib/utils/{date,currency}.ts`, `apps/api/src/lib/otp.ts`, `apps/cms/src/modules/sms/kavenegar-client.ts` | Intl | 3 | Jalali date formatting, Persian digits and toman display; phone and digit normalization occurs in multiple places. Locale/time-zone and already-formatted date assumptions need explicit contracts. |
| Persian identity fields | New | `apps/cms/src/collections/users/users.collection.ts`, `packages/contract/src/customer.ts` | Payload, Zod | 2 | National-code fields exist; inspected contract uses optional strings. This is not evidence of national-code checksum or Sheba validation. |
| Health and operational setup | New | `apps/api/src/server.ts`, `apps/catalog/src/app/health/route.ts`, `apps/cms/src/payload.config.ts`, `apps/cms/src/seed.ts` | Hono, Payload, PostgreSQL/SQLite | 3 | API/catalog health endpoints, CMS adapter selection, SMS worker startup and seeding. Catalog health returns static OK, not dependency readiness; worker requires PostgreSQL. |
| Static Persian contact card | IC | `app/page.tsx`, `app/contacts.vcf/route.ts`, `lib/vcard.ts`, `README.md` | Next, Base UI | 3 | UTF-8-aware vCard folding and escaping, RTL contact UI; independent of checkout or CMS. No commerce backend established in this repository. |

## 3. Best implementation per pattern

- **SMS:** New queue/worker and Kavenegar adapter are the best starting point; persisted statuses, concurrent claiming and retry improve on Old's fire-and-forget send. Extract provider interface, job store and template mapping separately; preserve explicit at-least-once semantics. OTP's synchronous path has different latency and failure requirements.
- **Order lifecycle and stock:** New Payload order hooks plus warehouse stock operations provide explicit transitions, immutable snapshots, reservations and restoration. Old shows the same underlying commerce requirement with fewer consistency guarantees. Keep PostgreSQL transaction ownership and locking visible in the extraction contract.
- **Products, catalog and categories:** New has richer taxonomy, cycle protection and public/customer visibility policies. Reuse the policy and relationships cautiously; tile dimensions and families are project rules, not universal product variants.
- **Cart, quote and invoice:** New supplies warehouse-aware cart and invoice UI; extract calculations/contracts first and parameterize units. It is not a complete payment or fiscal-invoice package.
- **Authentication:** New OTP/session flow is a better starting point than Old, but should be redesigned/reviewed for OTP storage, concurrent verification, throttling and delivery security before being offered as a reusable auth module.
- **Persian utilities:** New's date, currency and digit helpers are starting examples; consolidate contracts and test parsing, timezone, numerical precision and currency units. IC's `lib/vcard.ts` is a useful standalone contact-card example, not a recurring commerce module here.
- **Payment gateways:** No extraction-ready implementation verified in this batch. The new `verifyPayment` endpoint must not be mistaken for a gateway adapter.

## 4. Variations / divergences a reusable module must support

- **Provider and delivery:** synchronous OTP versus queued order notifications; provider templates/token formats, timeout, retry count, concurrency, scheduler, manual retry, retention and sensitive-data logging. At-least-once sends may duplicate messages; provider idempotency is not established.
- **Orders:** configurable status graph, actors, cancellation windows, immutable snapshots, idempotency scope and conflict handling; atomic stock reservation/release must share the persistence transaction, with database capabilities explicit.
- **Inventory and quantity:** single quantity in Old versus per-warehouse exact/inquiry balances in New; allow units, area-to-carton rounding, carton/pallet constraints and alternative stock policies rather than hard-coding tiles.
- **Pricing and invoice:** customer-specific markup, price snapshots, tax/discount policy and invoice presentation vary. New sets discount/tax to zero in the order path; a discount field or credit limit does not establish a coupon or wallet ledger.
- **Catalog and authorization:** public catalog versus authenticated merchant access, customer category restrictions, price/stock visibility, product-family relationships and category hierarchy. These are policy boundaries, not just display filters.
- **Identity and localization:** account provisioning policy, OTP lifetime/attempts, session strategy, digit and phone normalization, Jalali formatting, timezone and explicit toman/rial units. National-code and IBAN validation require separate verified implementations.
- **Infrastructure:** persistence and workers vary: New supports PostgreSQL/SQLite adapter configuration but its SMS claims and several transactional operations depend on PostgreSQL. Health endpoints should distinguish liveness from dependency readiness.

## 5. Candidate modules ranked by frequency × effort saved

Frequency counts independent codebases in this batch where the pattern was evidenced; Old and New are successive versions of one business, so counts are signals of recurrence, not independent market demand. Effort is a qualitative estimate, not a measured cost.

| Rank | Candidate | Evidence frequency | Effort saved | Extraction direction |
| --- | --- | --- | --- | --- |
| 1 | Transactional orders and inventory | 2/3 | High | New reservation, immutable snapshots and lifecycle; adapter boundaries for persistence, quantity and status. |
| 2 | SMS provider + Payload queue | 2/3 | High | New Kavenegar/queue; independent provider and storage adapters, separate direct OTP path. |
| 3 | Product/catalog + pricing/quantity policies | 2/3 | High | New taxonomy and quote primitives; avoid embedding its tile model. |
| 4 | Cart, invoice and order presentation primitives | 2/3 | Medium | New quote and invoice contracts; leave UI and fiscal rules configurable. |
| 5 | Phone authentication and authorization | 2/3 | High | Reuse only after security/concurrency review; Old is evidence of need, not an implementation to copy. |
| 6 | Persian formatting and normalization | 2/3 | Medium | Consolidate digit, phone, date and explicit currency-unit utilities; verify edge cases. |
| 7 | Warehouse stock import and audit | 1/3 | High | New preview/apply flow, row errors and transaction policy; keep warehouse units configurable. |
| 8 | Gateway request/callback/verification adapters | 0 verified | High | Research seed remains a candidate, not an observed recurring implementation in this batch. New's placeholder does not count. |
| 9 | Static vCard generator | 1/3 | Low | IC's escaping and UTF-8 line folding are a small reusable utility; not a core commerce priority. |

Coupons, shipping-cost calculation, wallet ledger, product reviews, email, Umami, Telegram, S3/MinIO and a real payment callback were not established in the inspected paths. This is a bounded finding, not proof of absence throughout every repository.
