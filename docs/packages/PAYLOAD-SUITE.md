# Payload CMS Suite

The **Payload CMS Suite** is a collection of 5 specialized packages that enhance Payload CMS applications with production-grade field factories, semantic editor presets, canonical schema compilation, typed custom operations, and operation logging.

---

## 1. Suite Overview & Responsibilities

| Package | Owns | Does NOT Own |
| --- | --- | --- |
| **`@nexload-sdk/payload-schema`** | Defining canonical field validation once; compiling to Payload fields and reusable Zod schemas. | Collections, access control rules, database persistence, CRUD DTO inference. |
| **`@nexload-sdk/payload-operations`** | Typed custom operation contracts, Payload endpoints, client SDK facade, and standardized errors. | CRUD replacement, collection configuration, database transactions, retry policies. |
| **`@nexload-sdk/payload-editor`** | Semantic Lexical editor configuration, presets (minimal, standard, rich), and feature policies. | Rich-text presentation, React rendering, custom blocks schemas, theme styling. |
| **`@nexload-sdk/payload-fields`** | Semantic field factories and Admin UI components (Unicode slugs, Jalali datepicker, integer money). | General schema compilation or editor feature policies. |
| **`@nexload-sdk/payload-hooks`** | Type-safe collection operation logging hooks for auditability and debugging. | Domain mutations, access validation, data manipulation. |

---

## 2. Package Deep Dives

### A. `@nexload-sdk/payload-schema`
- **Location:** `packages/payload-schema`
- **Problem Solved:** Duplicating validation logic between Payload collection fields (which run server-side in CMS) and Zod contracts (which run client-side in forms, BFF contracts, or server actions).
- **Core Mechanism:**
  - Define intrinsic entity fields once using `defineEntity` and `field` from the browser-safe root `@nexload-sdk/payload-schema`.
  - Derive pure Zod schemas for forms, RPC, and server actions using `entity.schema(({ pick, fields, z }) => ...)`.
  - In Node/Payload configuration, compile fields using `payloadFields(entity).all()` (or `.field(key)`, `.pick(keys)`) from `@nexload-sdk/payload-schema/payload` (Node-only), which appends canonical normalization and validation hooks to `beforeValidate`.
- **Example:**
  ```typescript
  import { defineEntity, field } from '@nexload-sdk/payload-schema';
  import { payloadFields } from '@nexload-sdk/payload-schema/payload';

  export const userEntity = defineEntity({
    name: 'User',
    fields: {
      username: field.text({
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 32,
        pattern: /^[a-z0-9_-]+$/i,
      }),
      email: field.text({ required: true, lowercase: true, trim: true }),
    },
  });

  // In Payload collection (Node / Payload config only):
  export const UsersCollection = {
    slug: 'users',
    fields: payloadFields(userEntity).all(),
  };

  // In Zod contract / API schema (browser or server):
  export const createUserSchema = userEntity.schema(({ pick }) =>
    pick(['username', 'email'], { optional: 'auto' })
  );
  ```

### B. `@nexload-sdk/payload-operations`
- **Location:** `packages/payload-operations`
- **Problem Solved:** Securely invoking custom CMS business logic from other services (such as the Bun BFF in `apps/api`) without bypassing Payload access rules or resorting to untyped REST endpoints.
- **Core Mechanism:**
  - Define an operation contract with an input schema, output schema, and operation identifier.
  - In `apps/cms`: Register the operation with an execution handler using `createPayloadOperationEndpoint()`.
  - In `apps/api`: Invoke the operation via the generated SDK client facade `createOperationClient()` with end-to-end type safety and automatic error decoding.
- **Error Standard:** Standardizes domain errors (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`) into predictable HTTP status codes and JSON envelopes.

### C. `@nexload-sdk/payload-editor`
- **Location:** `packages/payload-editor`
- **Problem Solved:** Inconsistent Lexical editor configurations across collections, leading to unexpected HTML outputs or bloated toolbars.
- **Core Mechanism:** Provides declarative presets (`minimal`, `article`, `admin`) and clean toggles for enabling specific Lexical features (headings, lists, quotes, links, tables) without manually importing dozens of Lexical sub-plugins.

### D. `@nexload-sdk/payload-fields`
- **Location:** `packages/refactoring/payload-fields`
- **Problem Solved:** Common e-commerce and internationalization field deficiencies in standard CMS platforms:
  - **Unicode Slugs (`createSlugField`):** Generates clean, URL-safe slugs from Persian, Arabic, or non-Latin titles without turning into mangled percent-encoded characters or stripping characters.
  - **Jalali Datepicker (`createJalaliDateField`):** Interactive Persian calendar datepicker integrated directly into the Payload Admin UI (React 19 compatible).
  - **Integer Minor-Unit Money (`createMoneyField`):** Prevents floating-point rounding errors by storing money as safe integers (Tomans or Rials) while formatting currency clearly in the Admin UI.

### E. `@nexload-sdk/payload-hooks`
- **Location:** `packages/payload-hooks`
- **Problem Solved:** Lack of structured, traceable visibility into collection lifecycle events (beforeChange, afterChange, afterDelete) across collections.
- **Core Mechanism:** Plug-and-play hook factory that logs operation lifecycle, timing, user identity, and affected document IDs using `@nexload-sdk/logger`.
