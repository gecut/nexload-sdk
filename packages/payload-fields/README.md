# @nexload-sdk/payload-fields

Reusable Payload CMS field helpers and admin components (date + slug) plus a preconfigured Lexical editor.

## Install

```bash
pnpm add @nexload-sdk/payload-fields
```

## Exports

Root exports:

- `editor` (Lexical editor preset)
- `dateField`
- `slugField`
- slug/date helper exports (`formatDate`, `formatSlug`, `formatSlugHook`)

Subpath exports (used by Payload admin component paths):

- `@nexload-sdk/payload-fields/date`
- `@nexload-sdk/payload-fields/date/date-picker`
- `@nexload-sdk/payload-fields/date/date-cell`
- `@nexload-sdk/payload-fields/slug`
- `@nexload-sdk/payload-fields/slug/slug-field`

## `editor`

Preconfigured `lexicalEditor(...)` instance with features including:

- headings (`h1`-`h4`)
- fixed toolbar
- horizontal rule
- upload
- table (experimental)
- relationship feature (`products`, `articles`)

Usage:

```ts
import { editor } from "@nexload-sdk/payload-fields";

{
  name: "content",
  type: "richText",
  editor
}
```

## `dateField(overrides?)`

Returns `[DateField]` configured for Payload admin sidebar, with:

- custom field component (`DatePicker`)
- custom cell component (`DateCell`)
- Persian/Jalali formatting helpers

```ts
import { dateField } from "@nexload-sdk/payload-fields";

fields: [
  ...dateField()
];
```

## `slugField(fieldToUse?, overrides?)`

Returns `[TextField, CheckboxField]` for a slug and lock toggle.

- auto-formats slug values
- includes `beforeValidate` hook
- uses custom admin UI component with lock/unlock + generate action

```ts
import { slugField } from "@nexload-sdk/payload-fields";

fields: [
  { name: "title", type: "text", required: true },
  ...slugField("title")
];
```

## Notes

- Admin components are React client components and intended for Payload admin usage.
- Styles are bundled from package submodules (`date/index.scss`, `slug/index.scss`).
