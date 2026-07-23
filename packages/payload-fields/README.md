# @nexload-sdk/payload-fields

Semantic Payload CMS factories for managed Unicode slugs, Jalali dates, and integer minor-unit money values.

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-fields/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/payload-fields/api/)

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

`payloadFieldsPlugin({ slugGenerators })` registers secure server-side slug generators, rejects malformed request bodies, and resolves only explicitly registered own keys. Locked slugs preserve their previous value when the source is cleared. REST, GraphQL, and Local API money values are always integer minor units; only the Admin UI accepts major-unit text.

Jalali values remain native ISO dates. `dayOnly` uses canonical local noon, and `monthOnly` stores the first Jalali day of the selected month at canonical local noon.

## Migration from 2.x

- `editor` is removed. Use the independent
  [`@nexload-sdk/payload-editor`](https://gecut.github.io/nexload-sdk/packages/payload-editor/)
  package for managed Lexical configuration.
- Replace `slugField("title")` with `slugField({ source: "title" })`.
- Replace `...dateField()` with `jalaliDateField({ name: "date" })`.
- Replace decimal price storage with `moneyField`; API values are minor-unit integers.

See the canonical documentation for override, localization, timezone, and generator contracts.
