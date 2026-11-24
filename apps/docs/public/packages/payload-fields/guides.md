# Production Guides & Recipes

Deep recipes for managed Unicode slugs, Jalali date ranges, integer money fields, Iranian contact & identity, addresses, and schema integration.

**Topic:** guides
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/guides/
## Managed Unicode Slugs

The `slugField` factory generates clean, URL-friendly slugs while preserving non-Latin scripts (such as Persian and Arabic):

```ts
import { slugField } from "@nexload-sdk/payload-fields";

const fields = [
  { name: "title", type: "text", required: true },
  ...slugField({
    source: "title",
    overrides: {
      slug: {
        admin: {
          position: "sidebar",
          description: "Auto-generated from title. Unlock to manually edit.",
        },
      },
    },
  }),
];
```

### Uniqueness & Collision Suffixing

* Slugs are unique by default (`unique: true`). When creating a document whose generated slug already exists, the factory automatically searches for non-colliding suffixes (`-2`, `-3`, up to `-50`).
* **Top-level only:** Uniqueness collision queries apply only to top-level fields. Slugs placed inside nested arrays or groups receive character normalization only.
* If migrating an existing database with duplicate slug values, resolve duplicates before creating unique indexes or pass `unique: false`.

### Slug Locking Mechanism

* When a document is created, `slugLock` defaults to `true`.
* Editing the source field updates `slug` while locked.
* Once locked documents are published, unlocking allows manual editing. While unlocked, source edits never change the slug. A locked slug follows source edits unless you pass `regenerateOnSourceChange: false`.

***

## Jalali (Persian Solar) Datepicker & Date Ranges

Store standard ISO datetimes while providing a rich Persian Solar calendar widget in Payload Admin:

```ts
import { jalaliDateField, jalaliDateRangeField, withJalaliTimestamps } from "@nexload-sdk/payload-fields";

const fields = [
  jalaliDateField({
    name: "eventDate",
    pickerAppearance: "dayAndTime", // Options: "dayOnly" | "dayAndTime" | "monthOnly" | "timeOnly"
    timeZone: "Asia/Tehran", // Default timezone
  }),
  jalaliDateRangeField({
    start: "registrationStart",
    end: "registrationEnd",
  }),
];

// Adds virtual read-only createdAtJalali and updatedAtJalali fields
export const collectionFields = withJalaliTimestamps(fields);
```

### Date Storage Guarantees

* The database always stores standard UTC ISO 8601 strings (e.g. `2026-07-24T08:30:00.000Z`).
* For `dayOnly` and `monthOnly`, dates store canonical noon (`12:00:00`) in `timeZone` (default `Asia/Tehran`). This prevents date shifts when users view or edit entries from different browser timezones.
* In `jalaliDateRangeField`, the end field includes server-side validation ensuring that the end date falls on or after the start date.

***

## Safe-Integer Money Fields

Prevent floating point inaccuracies by storing currency in integer minor units:

```ts
import { moneyField } from "@nexload-sdk/payload-fields";

const fields = [
  moneyField({
    name: "unitPrice",
    currency: "IRT", // Stored in Tomans
    minMinorUnits: 0,
    maxMinorUnits: 10_000_000_000,
  }),
  moneyField({
    name: "rialPrice",
    currency: "IRR", // Stored in Rials
    displayCurrency: "IRT", // Displayed as Tomans in Admin UI and list cell
  }),
];
```

### API Strings & Plugin Requirement

* In the Admin UI, users type numbers with Persian or Latin digits and thousands grouping.
* In REST, GraphQL, and Local API calls, values are stored as integers.
* **Critical Requirement:** `payloadFieldsPlugin()` is **REQUIRED** if money values are sent as strings through REST or Local API (e.g. `"۱۲۳٬۴۵۶"` or `"123456"`). Payload's core runs `parseFloat()` on number fields before field hooks run, which corrupts Persian digits. The plugin registers a `beforeOperation` hook that normalizes string values to safe integers before Payload processes them.

***

## Iranian Contact & Identity Fields

Standardize phone numbers, national identification, postal codes, and banking fields:

```ts
import {
  bankCardField,
  iranLandlineField,
  iranMobileField,
  legalIdField,
  nationalCodeField,
  postalCodeField,
  shebaField,
} from "@nexload-sdk/payload-fields";

const fields = [
  // Mobile: normalized to national 09XXXXXXXXX or E.164 +989XXXXXXXXX
  iranMobileField({ name: "mobile", storage: "national" }),
  // Landline: normalized with province area code
  iranLandlineField({ name: "phone" }),
  // National Code: 10 digits with checksum validation
  nationalCodeField({ name: "nationalCode" }),
  // Legal Entity ID: 11 digits with checksum validation
  legalIdField({ name: "companyId" }),
  // Postal Code: 10 digits
  postalCodeField({ name: "postalCode" }),
  // Bank Card: 16 digits with Luhn algorithm validation
  bankCardField({ name: "cardNumber" }),
  // Sheba (IBAN): 26 characters (IR...) with ISO 7064 validation
  shebaField({ name: "sheba" }),
];
```

### Validation & Localization

* Values written through any API are normalized server-side in `beforeValidate` (Persian digits converted, dashes/spaces removed).
* Validation errors are localized: admin sessions in `fa` (e.g. `fa-IR`) see Persian error messages; other languages see English error messages.
* Admin list views automatically display formatted strings via `FormattedCell` (e.g. `۰۹۱۲ ۳۴۵ ۶۷۸۹`, `۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۰`).

***

## Iranian Address Group

Use `iranAddressField` to create a structured address group:

```ts
import { iranAddressField } from "@nexload-sdk/payload-fields";

const fields = [
  iranAddressField({
    name: "shippingAddress",
    required: true,
    recipient: true, // Includes recipientName and recipientMobile fields
  }),
];
```

* Province selection contains all 31 Iranian provinces with localized Persian and English labels.
* Includes city, address line (textarea), and validated postal code.

***

## Schema Adapter (`@nexload-sdk/payload-fields/schema`)

When using `@nexload-sdk/payload-schema` to share validation contracts with frontend forms or RPC endpoints:

```ts
import { defineEntity } from "@nexload-sdk/payload-schema";
import { schemaFields } from "@nexload-sdk/payload-fields/schema";

export const customerEntity = defineEntity({
  name: "Customer",
  fields: {
    mobile: schemaFields.iranMobile(),
    nationalCode: schemaFields.nationalCode(),
    price: schemaFields.money({ currency: "IRT" }),
    birthDate: schemaFields.jalaliDate({ nullable: true }),
    ...schemaFields.slug({ source: "title" }),
  },
});
```

> **Note:** `iranAddressField` and `jalaliDateRangeField` are not included in `./schema` in 4.0 because compound fields (groups and rows) require entity-level schema composition.

***

## Troubleshooting & Common Pitfalls

### 1. Custom Admin Controls Fallback to Plain Inputs

If Payload Admin displays plain number or text inputs instead of the Jalali datepicker or formatted money input:

* Regenerate Payload's Import Map by running:
  ```bash
  pnpm payload generate:importmap
  ```
* Ensure `@payloadcms/ui` and `payload` are `>=3.85.0 <4.0.0` and React is `^19.0.0`.

### 2. Money Strings Rejected by REST or Local API

If sending string values like `"150000"` or `"۱۵۰٬۰۰۰"` fails validation or gets parsed as `NaN`:

* Ensure `payloadFieldsPlugin()` is registered in your `payload.config.ts` plugins array.
* The plugin interceptively normalizes string money values in `beforeOperation` before Payload's core `parseFloat()` runs.

### 3. Duplicate Slug Migration Errors

If adding `slugField` to an existing collection throws a unique constraint database error:

* Deduplicate existing documents before deploying the schema change, or temporarily configure `slugField({ unique: false })`.
