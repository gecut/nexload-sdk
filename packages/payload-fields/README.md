# @nexload-sdk/payload-fields

Semantic Payload CMS factories for managed Unicode slugs, Jalali dates, and integer minor-unit money values.

## Install

```bash
pnpm add @nexload-sdk/payload-fields
```

## Usage

```ts
import { jalaliDateField, moneyField, slugField } from "@nexload-sdk/payload-fields";

fields: [
  { name: "title", type: "text", required: true },
  ...slugField({ source: "title" }),
  jalaliDateField({ name: "publishedAt" }),
  moneyField({ name: "price", currency: "IRT" }),
];
```

`payloadFieldsPlugin({ slugGenerators })` registers secure server-side slug generators. REST, GraphQL, and Local API money values are always integer minor units; only the Admin UI accepts major-unit text.

## Migration from 2.x

- `editor` is removed. A future `payload-editor` package will replace it; it is not part of this release.
- Replace `slugField("title")` with `slugField({ source: "title" })`.
- Replace `...dateField()` with `jalaliDateField({ name: "date" })`.
- Replace decimal price storage with `moneyField`; API values are minor-unit integers.

See the SDK documentation for override, localization, timezone, and generator contracts.
