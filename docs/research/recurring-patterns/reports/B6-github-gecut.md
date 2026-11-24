# Research Report: Recurring Patterns (Batch B6-github-gecut)

> **Batch ID:** `B6-github-gecut`  
> **Target Mirror:** `/Users/mm25zamanian/Codes/_gh-mirror/gecut_*`  
> **Focus:** Discovery of recurring e-commerce, integration, auth, and infrastructure patterns across Gecut GitHub repositories, with deep dive into prior SMS implementations (`picosms`, `microsms`).

---

## 1. Projects Covered

Of 24 candidate repositories specified in the brief, **21 repositories** were verified in `/Users/mm25zamanian/Codes/_gh-mirror` and analyzed in-depth. Three repositories (`autohesab`, `maaref`, `builder.ui`) were not present in the local mirror directory.

| Project Directory | Core Stack | Purpose in One Line | Recency / Activity |
| :--- | :--- | :--- | :--- |
| `gecut_picosms` | Bun, Hono 4.6, Zod 3.23, `@gecut/logger` | High-throughput, stateless microservice proxy for Kavenegar SMS sending & OTP verification | 2024–2025 (Bun native) |
| `gecut_microsms` | Node.js, Yarn 4, Lerna Lite, Hono 4.2, Zod 3.23 | Lerna monorepo service wrapper for Kavenegar SMS delivery | 2024 (Lerna / Node) |
| `gecut_kartbook` | Bun, Lit 3, Hono, tRPC 10, Mongoose 8, pnpm 10 | Digital bank card sharing platform (`k32.ir/:slug`) with billing, wallets, and bank inquiry | 2024–2025 (Active) |
| `gecut_oms` | Next.js 15.4, Prisma 6.13, PostgreSQL, oRPC, HeroUI, PWA | Order Management System for PersianPart automotive wholesale & pre-order flow | 2025 (Next 15) |
| `gecut_persianpart` | Node.js, Nx 17 monorepo, tRPC 10, Mongoose 8, Lit 3 | Automotive spare parts retail/wholesale platform with stock tracking & SMS notifications | 2023–2024 (Nx monorepo) |
| `gecut_meetal.app` | Next.js 15.5, Payload CMS 3.53, PostgreSQL, oRPC, Resend | Metal scrap B2B marketplace with seller listing lifecycle and email OTP auth | 2025–2026 (Payload 3.53) |
| `gecut_nexload` | Next.js 15, Payload CMS 3.53, PostgreSQL, Turborepo, oRPC | Hybrid monorepo template pairing Payload CMS with Next.js frontend via oRPC | 2025–2026 (Template base) |
| `gecut_reelifylab.com` | Next.js 16.2, Payload CMS 3.86, PostgreSQL, Tailwind 4 | Video production portfolio platform with rich media collections and Persian font setup | 2026 (Payload 3.86) |
| `gecut_choobinooo` | Next.js 15.3, Prisma 6.12, PostgreSQL, oRPC, HeroUI | Custom furniture e-commerce store with manufacturing phases, orders, reviews, and OTP | 2025 (Prisma 6) |
| `gecut_pilotstudio.org` | Next.js 15.5, Prisma 6.16, PostgreSQL, HeroUI, Tiptap | Architecture studio platform with project portfolio, articles, and client intake forms | 2025–2026 (Next 15) |
| `gecut_form.amirghadir.ir` | Next.js 15.3, Prisma 6.9, PostgreSQL, HeroUI, Playwright | Academic registration system collecting Iranian student national IDs and family contacts | 2025 (Next 15) |
| `gecut_factor-maker` | Next.js 15.1, React 19, Tailwind CSS 3, DaisyUI | Mobile-first invoice generator with Rial calculations, Jalali dates, and Telegram dispatch | 2024–2025 (React 19) |
| `gecut_reg-form` | Next.js 15.1, React 19, LowDB 7, DaisyUI, React Hook Form | Guest registration form using LowDB JSON storage and Server Actions | 2025 (React 19) |
| `gecut_hybrid-storage` | Bun, TypeScript, pnpm monorepo | Lightweight JSON document database engine (`GecutPicoJSON` & collection abstractions) | 2024 (Bun native) |
| `gecut_newser_bot` | Node.js, grammY 1.42, Prisma 7.8, Puppeteer 24.4, Nunjucks | Automated Telegram bot rendering Persian news cards to PNG images via Puppeteer | 2025–2026 (grammY 1.42) |
| `gecut_aether-agent` | Electron 40, React 19.2, TypeScript, Monaco Editor, sql.js | Desktop supervised coding agent workspace with local-first SQLite persistence | 2026 (Electron 40) |
| `gecut_habibiu-pwa` | Lit 3.1, Vite 5.2, Vite PWA, `@gecut/signal`, `@gecut/i18n` | Educational progressive web app with signal-based reactivity and audio/video playback | 2024 (Lit 3) |
| `gecut_avincnc.com` | Next.js 16.2, React 19.2, Tailwind 4, Base UI, GSAP, OGL | Industrial CNC machinery portal with high-performance 3D/animation layer | 2026 (Next 16) |
| `gecut_farsrail.com` | Next.js 16.2, React 19.2, Tailwind 4, Motion, Unplugin Icons | Railway engineering showcase with dual Persian & Turkish localization | 2026 (Next 16) |
| `gecut_gecut.ir` | Next.js 16.2, React 19.2, Tailwind 4.3, Base UI, tsParticles | Gecut corporate landing page built with modern Tailwind CSS v4 | 2026 (Next 16) |
| `gecut_promeet` | Bun, TypeScript, pnpm monorepo | Meeting management workspace skeleton | 2024 (Early stage) |

*(Missing from mirror: `gecut_autohesab`, `gecut_maaref`, `gecut_builder.ui`)*

---

## 2. Pattern Table

| Pattern | Project | Files | Provider/lib | Quality (1-5) | Notes |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **SMS: Stateless Proxy** | `picosms` | `src/sdk/kavenegar.ts`, `src/routes/send.ts`, `src/routes/lookup.ts` | Kavenegar REST API, Hono, Zod | 3 | Bun `fetch` with `keepalive: true`. Cleans empty parameters via static sanitizer. No retry queue or persistence. |
| **SMS: Service Wrapper** | `microsms` | `packages/microsms-service/src/services/kavenegar.ts`, `src/app.ts` | Kavenegar REST API, Hono, `@gecut/logger` | 2 | Node-fetch wrapper with hardcoded default sender (`1000550440880`). No queue. |
| **SMS: OTP Auth & Notifications** | `kartbook` | `apps/api/src/routes/user.ts#L64-140`, `apps/api/src/routes/order.ts#L336-344` | MicroSMS HTTP lookup (`k32-login`, `k32-newcard`) | 4 | 5-minute expiry (`expiredAt: Date.now() + 300_000`), 6-digit random code generation, transaction notification. |
| **SMS: Order Creation Alert** | `persianpart` | `apps/persianpart-api/src/routes/order.ts#L20-25` | Direct Kavenegar HTTP call | 2 | Direct synchronous call in mutation without retry or background dispatch. Hardcoded API key fallback in source. |
| **Payment: Zibal IPG Adapter** | `kartbook` | `packages/integrations/src/payment/zibal.ts` | Zibal API (`gateway.zibal.ir`) | 4.5 | Complete adapter (`request`, `verify`, `inquiry`, `getStartUrl`), AbortController timeout, Persian error code map (102..203). |
| **Payment: Order Lifecycle & Ledger** | `kartbook` | `apps/api/src/routes/order.ts#L17-385` | tRPC, Mongoose, Zibal, Internal Wallet | 4.5 | Draft order creation, zero-amount coupon bypass, gateway redirect, callback verification, dual wallet ledger deposit/withdrawal. |
| **Banking: Inquiry & Card-to-IBAN** | `kartbook` | `packages/integrations/src/inquiry/zohal.ts` | Zohal API (`service.zohal.io`) | 4 | Single call resolves cardholder name and IBAN; strips 'IR' prefix for database invariant; exponential backoff retry; mock mode. |
| **Banking: BIN Lookup & Palette** | `kartbook` | `packages/banks/src/banks.ts` | Pure TS, Canvas API, CDN logos | 4.5 | 35+ Iranian banks cataloged; BIN/sub-BIN lookup (Saman/Blu split); RGB color palette; dynamic canvas color extractor fallback. |
| **Inventory: Atomic Bulk Deduct** | `persianpart` | `apps/persianpart-api/src/routes/order.ts#L36-84` | Mongoose, MongoDB `bulkWrite` | 4.5 | Pre-validates `quantity - amount >= 0`; executes unordered `bulkWrite` with negative `$inc`; reverses on order deletion. |
| **Commerce: Relational Schema** | `choobinooo` | `prisma/schema.prisma#L84-167` | Prisma 6, PostgreSQL | 4.5 | Models `Product`, `Order`, `OrderItem`, manufacturing `OrderPhase`, audit `OrderLog`, `Discount`, `Review`, `Question`. |
| **Commerce: OMS & Pre-orders** | `gecut_oms` | `prisma/schema.prisma#L36-113` | Prisma 6, PostgreSQL | 4 | Pre-order state machine (`ACTIVE`, `PENDING`, `CANCELLED`) with expiration (`expiresAt`), user approval gating (`canPreorder`). |
| **Discounts & Seller Affiliates** | `kartbook` | `apps/api/src/routes/order.ts#L58-94`, `L367-380` | Mongoose, tRPC | 4 | Percentage vs fixed decimal; usage limits (`usageCount`); affiliate referral code credit with seller bonus wallet transaction. |
| **Payload: Persian RTL Configuration** | `meetal.app`, `nexload` | `src/payload.config.ts`, `packages/core/src/payload.config.ts` | `@payloadcms/translations/languages/fa`, PostgreSQL | 5 | Official `fa` translations, RTL locale `{ label: "فارسی", code: "fa", rtl: true }`, `Asia/Tehran` timezone, Jalali date formatting. |
| **Payload: RBAC & Document Hooks** | `meetal.app` | `src/app/(payload)/collections/listings.ts`, `users.ts` | Payload CMS Collections | 4.5 | Role-based field and document access control (`SELLER` vs `ADMIN`); automatic seller assignment via `beforeChange` hook. |
| **Typography: Persian Next.js Root** | `reelifylab.com`, `factor-maker` | `src/app/(payload)/layout.tsx`, `src/app/layout.tsx` | `next/font/google` (`Vazirmatn`) | 5 | `Vazirmatn` font configured across App Router layouts with arabic/persian subsetting. |
| **Persian Utils: Native Intl Dates** | `factor-maker` | `src/app/page.tsx#L22-41`, `src/utils/message.ts` | Native JS `Intl.DateTimeFormat` | 4.5 | Zero-dependency Jalali date component extraction using `toLocaleString("fa-IR", { numberingSystem: "latn" })`. |
| **Persian Utils: Currency Formatting** | `factor-maker`, `kartbook` | `src/app/page.tsx#L169-171`, `packages/banks` | Native `toLocaleString("fa-IR")` | 4 | Formats numbers with Persian digits and localized Rial/Toman labels. |
| **Auth: Phone OTP Login Flow** | `choobinooo`, `kartbook` | `prisma/schema.prisma#L48-60`, `apps/api/src/routes/user.ts` | Prisma, Mongoose, Kavenegar | 4 | Relational `OTP` table with 6-digit passcode, expiration timestamp, usage flag, rate-limiting check. |
| **Infra: LowDB Server Actions** | `reg-form` | `src/actions/guest.ts` | LowDB 7, UUID v7, Next Server Actions | 3.5 | File-backed JSON store for small workloads; atomic `db.update()` mutations combined with `revalidatePath`. |
| **Infra: Headless Card Renderer** | `newser_bot` | `src/main.ts`, `src/templates`, `Dockerfile` | Puppeteer, Nunjucks, Prisma | 4 | HTML/CSS authoring with embedded local base64 WOFF fonts rendered to PNG via Puppeteer screenshot; Docker font coverage. |

---

## 3. Best Implementation per Pattern

### 3.1 SMS / OTP Delivery: `gecut_kartbook` + `gecut_picosms`
- **Why extract:** `kartbook` provides the best business-level integration: 6-digit OTP generation, 5-minute timeout window (`Date.now() + 300_000`), template-based lookup dispatch, and phone normalization (`/^09\d{9}$/`). `picosms` provides the cleanest HTTP transport layer using Bun native `fetch` and parameter sanitization (stripping undefined tokens before query construction).
- **Files:** `gecut_kartbook/apps/api/src/routes/user.ts#L64-140` and `gecut_picosms/src/sdk/kavenegar.ts#L30-92`.
- **Recommendation for SDK:** Merge `kartbook`'s OTP lifecycle logic with `picosms`'s clean client into an `@nexload-sdk/sms` module, adding a persistent Payload collection for SMS logs, retry queue, and secret resolution from environment variables (`KAVENEGAR_API_KEY`).

### 3.2 Payment Gateway (Iranian IPG): `gecut_kartbook`
- **Why extract:** `packages/integrations/src/payment/zibal.ts` is the most mature payment implementation in the codebase. It features:
  1. A dedicated `ZibalPaymentError` class with a complete Persian message dictionary for 13 error codes (102 through 203).
  2. Native `AbortController` timeouts (default 15,000ms).
  3. Support for `request`, `verify` (with idempotency handling for code 201), and `inquiry`.
  4. Clean URL construction (`getStartUrl`).
- **Files:** `gecut_kartbook/packages/integrations/src/payment/zibal.ts` and `gecut_kartbook/apps/api/src/routes/order.ts#L228-301`.
- **Recommendation for SDK:** Extract into `@nexload-sdk/payment` implementing a common `PaymentGateway` interface (`request()`, `verify()`, `inquiry()`) that can accommodate Zibal, Zarinpal, and IDPay drivers.

### 3.3 Banking Utilities & BIN Lookup: `gecut_kartbook`
- **Why extract:** `packages/banks/src/banks.ts` contains an exhaustive, production-tested catalog of 35+ Iranian banks with their 6-digit BIN prefixes (including special sub-BIN 8-digit handling for Blu Bank vs Saman Bank: `62198610` vs `62198618`). It also embeds brand RGB color palettes and a canvas fallback for unknown cards.
- **Files:** `gecut_kartbook/packages/banks/src/banks.ts` and `gecut_kartbook/packages/integrations/src/inquiry/zohal.ts`.
- **Recommendation for SDK:** Package as `@nexload-sdk/persian-banks` (standalone utility, zero dependencies).

### 3.4 Inventory Management & Stock Mutation: `gecut_persianpart`
- **Why extract:** `apps/persianpart-api/src/routes/order.ts` implements battle-tested atomic inventory management. Before touching the order table, it verifies that every product's stock covers the requested quantity (`newQuantity >= 0`). It then uses `ProductModel.bulkWrite` with negative `$inc: { quantity: -item.amount }` and `{ ordered: false }`. On order deletion or cancellation, it executes an inverse `$inc` batch to immediately restore inventory.
- **Files:** `gecut_persianpart/apps/persianpart-api/src/routes/order.ts#L26-83`, `L113-132`.
- **Recommendation for SDK:** Standardize this pre-check + bulkWrite/transaction decrement pattern into Payload CMS collection hooks (`beforeChange` / `afterDelete`) for products and orders.

### 3.5 Persian Payload CMS Configuration: `gecut_meetal.app` + `gecut_nexload`
- **Why extract:** `meetal.app` and `nexload` establish the exact recipe for Payload v3 on Next.js App Router in Iran:
  - Language: `@payloadcms/translations/languages/fa`
  - Localization: `locales: [{ label: "فارسی", code: "fa", rtl: true }]`
  - Timezone: `Asia/Tehran`
  - Date format: `"eeee d MMMM(M) y - H:m"`
  - Database: `@payloadcms/db-postgres`
- **Files:** `gecut_meetal.app/src/payload.config.ts` and `gecut_nexload/packages/core/src/payload.config.ts`.
- **Recommendation for SDK:** Create a helper `withPersianDefaults(config)` in `@nexload-sdk/payload-persian` that applies typography, RTL, translations, and Tehran timezone in a single call.

### 3.6 Zero-Dependency Jalali Dates & Currency: `gecut_factor-maker`
- **Why extract:** Instead of pulling in large external date libraries like `moment-jalaali`, `factor-maker` uses native modern ECMAScript `Intl`:
  ```ts
  const now = new Date();
  const day = Number(now.toLocaleString("fa-IR", { day: "numeric", numberingSystem: "latn" }));
  const month = Number(now.toLocaleString("fa-IR", { month: "numeric", numberingSystem: "latn" }));
  const year = Number(now.toLocaleString("fa-IR", { year: "numeric", numberingSystem: "latn" }));
  ```
- **Files:** `gecut_factor-maker/src/app/page.tsx#L22-41` and `src/utils/message.ts#L6-15`.
- **Recommendation for SDK:** Include in `@nexload-sdk/persian-utils` for lightweight date extraction and Rial/Toman formatting.

---

## 4. Variations & Divergences to Support

A reusable SDK cannot assume a single rigid architecture. The following divergences across the 21 analyzed projects must be configurable:

1. **SMS Provider & Mode Differences:**
   - Provider drivers: Kavenegar (predominant in `picosms`, `microsms`, `kartbook`, `persianpart`), FarazSMS/IPPanel, Ghasedak, and MailyGo/Resend for email fallback (`meetal.app`).
   - Delivery mode: Template-based lookup (OTP / transactional alerts where token variables are mapped to template slots) vs Raw text SMS with approved line numbers.
   - Credentials config: Must read from environment variables (`KAVENEGAR_API_KEY`, `KAVENEGAR_SENDER_LINE`) without hardcoded fallback strings.

2. **Currency Unit & Gateway Divergences:**
   - Units: Iranian systems alternate between **Rial** (Zibal gateway in `kartbook`, `factor-maker`) and **Toman** (display prices in retail catalogs). The payment module must support an explicit `currency: 'IRR' | 'IRT'` config with automatic x10 conversion for IPG requests.
   - Gateways: While `kartbook` uses Zibal, other e-commerce setups require Zarinpal, IDPay, or direct PSPs (Saman, Sadad). The gateway module must use a pluggable driver pattern.
   - Callback routing: The callback URL must be parameterized (`callbackUrl` option with auto-generated query parameters).

3. **Database & ORM Boundaries:**
   - Older services used Mongoose (`kartbook`, `persianpart`); intermediate services used Prisma (`choobinooo`, `gecut_oms`, `pilotstudio.org`, `form.amirghadir.ir`); modern core templates use Payload CMS with Postgres (`meetal.app`, `nexload`, `reelifylab.com`).
   - Reusable modules for Payload CMS must rely on the Payload Local API (`payload.find`, `payload.create`, `payload.db`) rather than direct database drivers, ensuring compatibility across PostgreSQL and SQLite.

4. **Inventory & Order State Topologies:**
   - B2B Wholesale (`persianpart`, `gecut_oms`): Large quantity bulk orders, pre-order approval gates (`canPreorder`), strict stock reservations.
   - Custom Manufacturing (`choobinooo`): Custom multi-stage production phases (`OrderPhase`), audit change logs (`OrderLog`).
   - Digital Subscriptions / Cards (`kartbook`): Immediate activation, expiration date calculations, wallet ledger deductions, zero-amount checkout bypass for 100% coupons.
   - Reusable order modules must support configurable state machine transitions and optional lifecycle hooks (`onStatusChange`, `onPaid`, `onCancelled`).

5. **Authentication Transport:**
   - Mobile-first Iran apps prefer Phone + SMS OTP (`kartbook`, `choobinooo`).
   - B2B and SaaS apps use Email + Password or Email OTP (`meetal.app`).
   - Auth modules must provide an extensible adapter allowing either Phone OTP or Email credentials to drive session JWT creation.

---

## 5. Candidate Module List

Ranked by **Impact Score = Frequency × Effort Saved** (1 = lowest, 5 = highest):

| Rank | Candidate Module | Description | Target Stack | Freq (1-5) | Effort Saved (1-5) | Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **1** | `@nexload-sdk/payload-sms` | SMS queue, OTP collection, template registry, and Kavenegar/FarazSMS drivers with retry worker | Payload CMS + Next.js | 5 | 5 | **25** |
| **2** | `@nexload-sdk/payment` | Unified Iranian payment gateway adapter (Zibal, Zarinpal, IDPay) with callback handling and Persian error translation | Next.js / Node.js | 4 | 5 | **20** |
| **3** | `@nexload-sdk/payload-persian` | One-liner config preset injecting Persian translations, RTL locales, Vazirmatn font, and `Asia/Tehran` timezone | Payload CMS 3 | 5 | 4 | **20** |
| **4** | `@nexload-sdk/persian-utils` | Zero-dependency utilities: native Intl Jalali dates, Toman/Rial formatters, National ID / Sheba / Mobile validators | Universal TS / JS | 5 | 3 | **15** |
| **5** | `@nexload-sdk/commerce-inventory` | Atomic stock reservation, bulk decrement/restock hooks, and low-inventory alerts | Payload CMS / Prisma | 4 | 4 | **16** |
| **6** | `@nexload-sdk/persian-banks` | 35+ Iranian banks BIN directory, card-to-bank lookup, Sheba formatters, and brand palette | Universal TS / JS | 3 | 4 | **12** |
| **7** | `@nexload-sdk/commerce-orders` | Configurable order state machine with audit logs, status transitions, and wallet/coupon hooks | Payload CMS | 4 | 4 | **16** |
| **8** | `@nexload-sdk/discounts` | Coupon verification engine supporting percentage vs fixed deductions, validity windows, and affiliate seller codes | Payload CMS / Next.js | 3 | 4 | **12** |

---

### Verification Summary
- **Analyzed paths:** All 21 valid `gecut_*` directories in `/Users/mm25zamanian/Codes/_gh-mirror`.
- **Secrets check:** Compliant. All API keys, tokens, and credentials referenced strictly via environment variable names (`SDK_KAVENEGAR_TOKEN`, `MICROSMS_KAVENEGAR_TOKEN`, `ZIBAL_MERCHANT`, `ZOHAL_API_KEY`, `PAYLOAD_SECRET`, `EMAIL_RESEND_TOKEN`). Zero hardcoded secrets reproduced.
- **Scope rule:** Read-only compliance maintained; no repositories modified. Exactly one report file generated.
