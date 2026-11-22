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
- **Problem Solved:** Exposing typed custom operation contracts and mounting them as secure Payload CMS REST endpoints, with matching RPC client methods beside or independent of the native `PayloadSDK`.
- **Core Mechanism:**
  - Define shared operation contracts using `defineCMSOperations` and `operation` from `@nexload-sdk/payload-operations` (or `./contract`) with Zod input, output, and defined domain errors.
  - In Payload config (server / Node): mount endpoints using `createPayloadEndpoints` from `@nexload-sdk/payload-operations/server`. Requires `access.default` (enforces explicit access control; throws `TypeError` if omitted), with optional per-operation `access.overrides` and configurable request size limit `maxBodyBytes` (default 1 MiB / `1_048_576`, returning 413 `PAYLOAD_TOO_LARGE`).
  - Codec wire model: Handlers return `z.output<output>`. The server encodes output using `z.encodeAsync(output, result)`, dropping unknown object keys so internal or secret fields never leak (`z.looseObject` allows extras as an explicit opt-in). Clients pre-validate and send original input (`z.input`, JSON-serializable; transforms/defaults execute once on the server) and decode responses with `z.decodeAsync`. Outputs and defined error data must be codec-safe (e.g. `z.codec` for `Date` objects).
  - In frontend / BFF clients: Invoke operations with full type safety using `createOperationsClient` from `@nexload-sdk/payload-operations/client` (pure RPC client with zero Payload SDK dependency), or `createCMSClient` from `@nexload-sdk/payload-operations/cms` (unified transport shared between Payload REST SDK and custom operations; `@payloadcms/sdk` is an optional peer dependency).
  - Error Standard & Handling: Safe error handling via `safe()`, `isDefinedError()`, and `isTimeoutError()`. Discriminated domain errors carry typed `data` payloads, and framework errors map to deterministic HTTP status codes (400, 401, 403, 404, 413, 415, 422, 500).
- **Known Limitations:** No automatic database transactions (handlers manage transactions explicitly if needed); Payload Local API calls in handlers (`req.payload`) default to `overrideAccess: true` unless `overrideAccess: false` is passed.

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
