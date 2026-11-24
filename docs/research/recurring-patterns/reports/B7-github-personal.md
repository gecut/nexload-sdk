# Recurring-Pattern Research Report: B7-github-personal

## 1. Projects Covered

| Project Directory | Tech Stack | Purpose in One Line | Era / Last Activity |
| :--- | :--- | :--- | :--- |
| `MM25Zamanian_anotmi_eshop` | Django 3.2, Python 3.9, SQLite, SweetAlert2 | Monolithic Persian e-commerce shop with account & order scaffolding | ~2021 (Legacy Monolith) |
| `MM25Zamanian_iolit-shop` | Lit 2.4, Ionic 6.3, Capacitor 4.3, IndexedDB, Alwatr Signals | PWA e-commerce storefront with client-side indexed cart & multi-lang | ~2022 (Client PWA) |
| `MM25Zamanian_pwa.farazmed.com` | Lit 2.4, Ionic 6.3.6, Capacitor 4.4, Alwatr Math/Router | Medical supply shop PWA with variant cart, phone auth & address flow | ~2022 (Client PWA) |
| `MM25Zamanian_assansafar-app` | React 18, MUI 5.10, React Router 5.3, Axios, Moment-Jalali | Operations & inspection portal for intercity passenger transport (`asaansafar.ir`) | ~2022–2023 (React SPA) |
| `MM25Zamanian_assansafar-server` | NestJS 11, TypeORM 0.3.20, PostgreSQL, Passport JWT, Zod | Backend API for transport fleet operations, multi-role users & reporting | ~2024–2025 (Enterprise API) |
| `MM25Zamanian_assansafar` | Nx 20.4 monorepo, NestJS 10.2, Next.js 15.1 | Enterprise monorepo consolidation for travel operations backend & apps | ~2024–2025 (Nx Monorepo) |
| `MM25Zamanian_bunbin` | Bun, Hono 4.6, systeminformation | Lightweight HTTP debugging utility & system telemetry API | ~Late 2024 (Microservice) |
| `MM25Zamanian_menu.faraz.coffee` | Next.js 15.1.3, React 19, DaisyUI 4.12, Tailwind 3.4 | Digital cafe menu with product variants, category routing & Toman pricing | ~Late 2024 / Early 2025 |
| `MM25Zamanian_bulletin-app` | Next.js 15.0.4, React 18, Prisma 6.6 (SQLite), HeroUI 2.7 | Corporate news bulletin PWA with categorised feeds, likes & cache tags | ~Early 2025 (App Router) |
| `MM25Zamanian_bulletin-board` | Next.js 15.1.6, React 19, DaisyUI 4.12, Tailwind 3.4 | Presentation slide-deck & interactive corporate proposal viewer | ~Early 2025 (Presentation) |
| `MM25Zamanian_afsoon.world` | Next.js 15.2.2, React 18, Prisma 6.5 (SQLite), HeroUI 2.2 | Personal relational memories platform with WebAuthn/Passkey schema | ~Early 2025 (Social App) |
| `MM25Zamanian_web-proposal` | Next.js 15.3.2, React 19, Tailwind 4, Framer Motion 12 | Corporate client proposal viewer with animated slide transitions | ~Mid 2025 (Presentation) |
| `MM25Zamanian_nime-g360` | Turborepo 2.6, Next.js 16.1.1, React 19, Prisma 7.2 (LibSQL/Turso) | Survey & registration platform with local Turso DB & XLSX export | ~Early 2026 (Modern Web) |
| `MM25Zamanian_oms` | pnpm 10.26, Next.js 16.1.1, React 19, Hono, oRPC, Prisma 7 (PG) | Order Management System monorepo with OpenAPI & type-safe RPC | ~Early 2026 (Modern Monorepo) |
| `MM25Zamanian_prismate` | Turborepo 2.5, TypeScript 5.8, Zod 4.0.17 | Runtime Prisma DMMF parser generating dynamic CRUD admin UI | ~Early 2026 (DevTool/Library) |
| `MM25Zamanian_hr-collector` | Next.js 16.3.0, React 19.2.6, Payload CMS 3.88.0, HeroUI 3.2, Zod 4.5 | Internal personnel record collector with native Persian CMS & jobs queue | ~Early 2026 (Payload CMS) |

---

## 2. Pattern Table

| Pattern | Project | Files | Provider/Lib | Quality (1–5) | Notes |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Persian Phone Normalization** | `hr-collector` | `src/helpers/phone-number.ts` | Pure TS / Regex | 5 | Normalizes Arabic (`٠-٩`) & Persian (`۰-۹`) digits, strips spaces/dashes, maps `+989`, `989`, `00989` -> `09...`. |
| **Persian Phone Formatting** | `pwa.farazmed.com` | `src/utilities/phone-number.ts` | `@alwatr/math` (`UnicodeDigits`) | 4 | Translates en -> fa numerals and segments into `09xx xxx xxxx` format. |
| **Persian Phone Validation** | `hr-collector` | `src/collections/Users.ts` | Payload `TextFieldValidation` | 5 | Validates normalized phone matching `/^09\d{9}$/` with Persian error feedback. |
| **Phone Collision & Array Storage** | `assansafar-server` | `src/routes/users/users.service.ts` | TypeORM `ArrayContains` | 4 | Multi-phone support per user (`phoneNumbers: string[]`) with atomic conflict check. |
| **Phone Login & Unknown Tracking** | `bulletin-app` | `prisma/schema.prisma` | Prisma 6 | 4 | Phone-first user schema with `UnknownPhoneNumber` telemetry table for audit/abuse. |
| **Passkey / WebAuthn Schema** | `afsoon.world` | `prisma/schema.prisma` | Prisma 6 | 4 | Native passkey fields: `credentialId Bytes? @unique`, `credentialPublicKey`, `counter`. |
| **Multi-Role RBAC** | `assansafar-server` | `src/routes/users/users.controller.ts` | NestJS Guards, Passport JWT | 4 | 6-role transport taxonomy (`admin`, `owner`, `reporter`, `driver`, `company`, `reviewer`). |
| **CMS Access Control** | `hr-collector` | `src/collections/Users.ts` | Payload Access API | 5 | Clean `authenticated` gate applied across CRUD operations. |
| **Persian Admin Localization** | `hr-collector` | `src/payload.config.ts` | `@payloadcms/translations` | 5 | Persian default language (`fa`), Jalali date mask `yyyy/MM/dd`, Persian title suffixes. |
| **Bilingual Collection Labels** | `hr-collector` | `src/collections/Users.ts`, `Admins.ts` | Payload Collections API | 5 | Structured `fa`/`en` labels for fields, tabs, singular/plural names. |
| **CMS Background Jobs Queue** | `hr-collector` | `src/payload.config.ts` | Payload Jobs API | 4 | Scheduled cron job runner (`autoRun: [{ allQueues: true, cron: '*/5 * * * *' }]`). |
| **CMS Import/Export Transformers** | `hr-collector` | `src/plugins/importExport.ts` | `@payloadcms/plugin-import-export` | 5 | Bi-directional Excel/CSV Persian label mapping, string/number normalizers. |
| **Product Variants & Pricing** | `menu.faraz.coffee` | `src/components/item-card.tsx` | React 19, Client Component | 4 | Variant selector with default flag, multi-variant accordion, price calculation. |
| **Toman Currency Formatting** | `menu.faraz.coffee` | `src/components/item-card.tsx` | Native Intl + SVG icon | 5 | Multiplies stored units by 1000, formats `toLocaleString("fa-IR")`, displays custom Toman glyph. |
| **Cart State & Breakdown** | `pwa.farazmed.com` | `src/pages/page-cart.ts`, `types/cart.ts`| Lit, Ionic, Web Components | 4 | Multi-item cart with `TotalPriceData` (`final_totalPrice`, `final_totalOldPrice`, `discount`). |
| **Client-Side Cart Storage** | `iolit-shop` | `src/utilities/db.ts` | `idb` (IndexedDB) | 4 | Offline-first persistent cart store with indexed `productId` lookups. |
| **Order Status Workflow** | `assansafar-app` | `src/index.js` | Constants definition | 4 | Multi-phase status progression: `در انتظار حرکت` (0) -> `در انتظار مشارکت` (1) -> `محاسبه شده` (2). |
| **Payment Channel Selection** | `assansafar-app` | `src/index.js` | Constants definition | 4 | Transaction categorization: `کارت به کارت`, `پایا`, `ساتنا`, `پُل`. |
| **Jalali Date Pickers** | `assansafar-app` | `src/App.js`, `package.json` | `@webilix/jalali-date-time`, `moment-jalaali` | 4 | Complete Jalali calendar and date-time input in Persian operations UI. |
| **Legacy Jalali ORM Integration**| `anotmi_eshop` | `anotmi_eshop/settings.py` | `django-jalali`, `jdatetime` | 3 | Database-level Persian calendar field types in Django 3.2. |
| **Tag-Based Cache Revalidation** | `bulletin-app` | `src/app/page.tsx` | Next.js `unstable_cache` | 4 | Tagged query caching (`tags: ["news"]`, `revalidate: 60`) for dynamic lists. |
| **Schema-Driven Admin Generation** | `prismate` | `packages/core/src/prismate-core.ts`| Prisma DMMF, Zod 4 | 5 | Runtime introspection of Prisma schema generating validation rules & form contracts. |
| **Strict Environment Validation** | `hr-collector` | `src/helpers/environment.ts` | Pure TS | 4 | Fast-fail missing variable helper (`getRequiredEnvironmentVariable`). |
| **Zod-Based Monorepo Env** | `oms` | `packages/env/src/server.ts` | `@t3-oss/env-core`, Zod | 5 | Strict server/web environment split with type inference across packages. |
| **Type-Safe RPC API Architecture** | `oms` | `apps/server/src/index.ts` | Hono, oRPC, OpenAPI | 5 | Unified RPC & OpenAPI handler with Zod-to-JSON-Schema converter. |
| **Excel Data Export** | `assansafar-app` | `package.json` | `xlsx`, `convert-excel-to-json` | 4 | Client-side spreadsheet export for fleet operations reports. |

---

## 3. Best Implementation per Pattern

### 1. Persian Phone Normalization & Validation
- **Source Project:** `MM25Zamanian_hr-collector`
- **File:** `src/helpers/phone-number.ts` & `src/collections/Users.ts`
- **Why Extract:** It is the most robust and battle-tested implementation in the entire batch. It handles Arabic numerals (`٠-٩`), Persian numerals (`۰-۹`), punctuation, spaces, and international dialing prefixes (`+98`, `0098`, `98`), normalizing everything to Iranian canonical mobile format `09xxxxxxxxx` before running schema validation.

### 2. Toman Currency & Variant Pricing
- **Source Project:** `MM25Zamanian_menu.faraz.coffee`
- **File:** `src/components/item-card.tsx`
- **Why Extract:** Elegantly couples variant switching with Toman unit conversion and Persian locale formatting (`(price * 1000).toLocaleString("fa-IR")`), cleanly appending a dedicated `<SvgToman />` badge without UI layout shifting.

### 3. Persian Payload CMS Configuration & Bilingual Fields
- **Source Project:** `MM25Zamanian_hr-collector`
- **File:** `src/payload.config.ts` & `src/collections/Users.ts`
- **Why Extract:** Represents modern (Payload 3.88 + Next 16) best practice. Sets up Persian translations (`supportedLanguages: { fa }`), Jalali date masks (`dateFormat: 'yyyy/MM/dd'`), bilingual collection definitions (`singular`/`plural` in both `fa` and `en`), and clean `type: 'tabs'` organization.

### 4. Runtime Schema-Driven UI & DMMF Introspection
- **Source Project:** `MM25Zamanian_prismate`
- **File:** `packages/core/src/prismate-core.ts`
- **Why Extract:** Demonstrates how to parse schema metadata at runtime, maintain an LRU/TTL cache for generated definitions, and build dynamic forms without manual boilerplate.

### 5. Multi-Phase Status Machine & Payment Methods
- **Source Project:** `MM25Zamanian_assansafar-app`
- **File:** `src/index.js`
- **Why Extract:** Captures real-world Iranian financial channels (`card`, `paya`, `satna`, `pol`) and explicit order lifecycle stages, essential for local B2B/B2C fulfillment.

---

## 4. Variations / Divergences to Support as Config

1. **Phone Number Storage Format:**
   - *Scalar string:* `phoneNumber: string` (`hr-collector`, `bulletin-app`, `afsoon.world`).
   - *Array of strings:* `phoneNumbers: string[]` (`assansafar-server`) for multi-contact accounts.
   - *Module Config:* Allow entity schema to specify `single` vs `multi` phone storage, with automatic array deduplication.

2. **Currency Base Unit:**
   - *Toman (raw):* Stored in thousands of Tomans (`menu.faraz.coffee`).
   - *Toman (single):* Stored as exact Toman units (`pwa.farazmed.com`).
   - *Rial:* Stored in Rials (requiring `divide by 10` for Toman displays).
   - *Module Config:* Configurable `currencyUnit: 'rial' | 'toman' | 'toman_k'` with auto-formatter for Persian typography.

3. **Cart Storage Mechanism:**
   - *Client-only IndexedDB / LocalStorage:* (`iolit-shop`, `pwa.farazmed.com`).
   - *Server-persisted session/DB cart:* Required for Payload CMS multi-device synchronization.
   - *Module Config:* Hybrid adapter supporting local optimistic cart synced to Payload cart collection upon authentication.

4. **Persian Calendar / Date Picker Provider:**
   - *Django ORM model fields:* `django-jalali` (`anotmi_eshop`).
   - *React Moment/Date-time picker:* `moment-jalaali`, `@webilix/jalali-date-time` (`assansafar-app`).
   - *Payload Admin date format:* `'yyyy/MM/dd'` (`hr-collector`).
   - *Module Config:* Universal Jalali conversion utility supporting Day.js/date-fns plugins and Payload custom date field components.

5. **Authentication Mode:**
   - *OTP / SMS only:* Phone lookup + verification code.
   - *Phone + Password:* (`pwa.farazmed.com`, `assansafar-server`, `afsoon.world`).
   - *WebAuthn / Passkeys:* (`afsoon.world`).
   - *Module Config:* Modular auth strategy allowing OTP-first with password or passkey fallback.

---

## 5. Architectural Evolution Across Time (2021 – 2026)

The repositories in this personal batch illustrate a 5-year evolution of web development patterns for Iranian commerce and application portals:

```
[2021] anotmi_eshop
  │   • Monolithic Django 3.2 + Django ORM + Server-rendered templates
  │   • django-jalali for dates, SweetAlert2 for popups, session auth
  ▼
[2022] iolit-shop & pwa.farazmed.com
  │   • Transition to Client-Side PWAs (Lit Web Components + Ionic 6 + Alwatr Signals)
  │   • Offline-first IndexedDB cart, localStorage JWTs, client-side en/fa UnicodeDigits
  ▼
[2023-2024] assansafar (app & server)
  │   • Decoupled enterprise architecture (NestJS 11 + TypeORM + Postgres / React 18 SPA + MUI)
  │   • Multi-role RBAC, banking settlement types (Paya/Satna/Pol), PDF/Excel exports
  ▼
[2024-2025] bulletin-app & menu.faraz.coffee & afsoon.world
  │   • Modern Next.js App Router (15) + Prisma 6 + HeroUI/DaisyUI
  │   • Toman currency formatting, WebAuthn schemas, Next.js unstable_cache tags
  ▼
[2026] hr-collector, prismate & oms
      • Full schema-driven architecture & Payload CMS 3.88 + Next.js 16 + React 19
      • Standardized Persian phone normalizer, background job queues, oRPC type-safety
```

- **From Server Monolith to Client PWA to Full-Stack CMS:** `anotmi_eshop` relied on Django's rigid ORM and server templates. In 2022, `iolit-shop` swung to the opposite extreme—pure client-rendered Lit PWAs with IndexedDB. In 2026, `hr-collector` achieved optimal balance: server-driven Next.js 16 + Payload CMS with native Persian localization, automated background jobs, and robust data integrity.
- **Persian Phone & Digit Handling:** Started as unvalidated text strings in Django, transitioned to client-side regexes in Lit (`^09[0-9]{9}$`), and matured into the comprehensive multi-prefix normalizer in `hr-collector` (`0098`, `+98`, `98`, `09` with Persian/Arabic digit replacement).
- **Cart & Pricing:** Shifted from static relational tables to client-side IndexedDB schemas, and finally to variant-aware Toman display models (`menu.faraz.coffee`).

---

## 6. Candidate Module List for `@nexload-sdk`

Ranked by **Frequency × Effort Saved**:

| Rank | Candidate Module | Proposed Package Name | Core Scope & Capabilities | Freq | Effort Saved | Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **1** | **Persian Validation & Normalizer** | `@nexload-sdk/persian-utils` | Comprehensive phone normalizer (`+98`/`0098`/`98`), Persian/Arabic digit translation, Sheba (IBAN) & National ID validation, Toman/Rial currency formatter. | High (10/16) | High | **5/5** |
| **2** | **Payload Persian Commerce Fields** | `@nexload-sdk/payload-persian` | Custom Payload fields for Toman prices (with Rial storage), Jalali date picker, Persian slug/RTL fields, and bilingual label helpers. | High (8/16) | High | **5/5** |
| **3** | **Phone & OTP Auth Strategy** | `@nexload-sdk/auth-phone` | Phone-first authentication adapter for Payload CMS & Next.js, supporting SMS queue dispatch, OTP rate limiting, and unknown phone telemetry. | High (9/16) | High | **4.5/5** |
| **4** | **Product Variant & Pricing Matrix** | `@nexload-sdk/commerce-variants` | Reusable schema and UI components for multi-variant products (pricing, inventory, default variant selection, discount tags). | Med (6/16) | Med | **4/5** |
| **5** | **Iranian Payment & Transaction Engine** | `@nexload-sdk/payment-gateway` | Payment status machine supporting gateway callbacks (Zibal, Zarinpal) alongside manual settlement types (Card-to-card, Paya, Satna). | Med (4/16) | High | **4/5** |
| **6** | **Runtime Schema Introspection** | `@nexload-sdk/schema-inspector` | Lightweight DMMF/Payload collection inspector for auto-generating dynamic CRUD forms and search interfaces (inspired by `prismate`). | Low (3/16) | High | **3.5/5** |
| **7** | **Commercial Excel/CSV Transformer** | `@nexload-sdk/import-export` | Bi-directional Excel/CSV import-export plugin with Persian header mapping and digit normalizers for orders and products. | Med (4/16) | Med | **3.5/5** |
