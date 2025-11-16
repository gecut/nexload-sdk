
# @nexload-sdk/payload-fields

<div align="center">
  <img src="https://img.shields.io/badge/Payload%20CMS-Fields-blueviolet?style=flat-square" alt="Payload CMS Fields" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/payload-fields?style=flat-square" alt="npm version" />
  <br><br>
  <strong>A collection of powerful, production-ready, and beautifully designed fields for Payload CMS.</strong>
</div>

---

## Features

- 🎨 **Enhanced UX:** Custom React components for a polished and intuitive admin experience.
- 🚀 **Production-Ready:** Pre-configured with smart defaults for common use cases.
- 🇮🇷 **i18n-Ready:** Default labels are in Persian, but easily customizable.
- 🧩 **Composable & Extensible:** Easily override or extend any field configuration.
- ✍️ **Advanced Rich Text Editor:** A pre-configured Lexical editor with features like a fixed toolbar, tables, and more.
- 🗓️ **Sophisticated Date Field:** A sidebar-ready date field with a custom Persian calendar picker.
- 🔗 **Automatic Slug Field:** An intelligent slug field that auto-generates from a title field and includes a lock/unlock feature.

---

## Installation

```bash
pnpm add @nexload-sdk/payload-fields
# or
yarn add @nexload-sdk/payload-fields
# or
npm install @nexload-sdk/payload-fields
```

---

## Quick Start

This package provides drop-in fields and an editor for your Payload CMS collections.

### 1. `dateField`

A sidebar-ready date field with a beautiful Persian date picker.

```typescript
import { dateField } from '@nexload-sdk/payload-fields';
import type { CollectionConfig } from 'payload/types';

const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // Add the date field to the sidebar
    ...dateField(),
  ],
};
```

### 2. `slugField`

A smart slug field that automatically generates its value from another field (e.g., `title`). It appears in the sidebar and includes a "lock" to prevent accidental changes.

```typescript
import { slugField } from '@nexload-sdk/payload-fields';
import type { CollectionConfig } from 'payload/types';

const Articles: CollectionConfig = {
  slug: 'articles',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // Creates 'slug' and 'slugLock' fields
    // The slug is generated from the 'title' field by default
    ...slugField('title'),
  ],
};
```

### 3. `editor`

A feature-rich Lexical rich text editor.

```typescript
import { editor } from '@nexload-sdk/payload-fields';
import type { CollectionConfig } from 'payload/types';

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: editor, // Use the pre-configured editor
    },
  ],
};
```

---

## API Reference

| Export | Type | Description |
|---|---|---|
| `dateField` | `(overrides?: DateField) => [DateField]` | A function that returns a sidebar-ready `date` field config. You can pass standard Payload `DateField` properties to override the defaults. |
| `slugField` | `(fieldToUse?: string, overrides?: Overrides) => [TextField, CheckboxField]` | A function that returns `slug` and `slugLock` field configs. Specify which field to use for generation (defaults to `title`). |
| `editor` | `RichTextAdapterProvider` | A pre-configured Lexical editor instance with enhanced features. |

---

## Customization

All field functions allow you to pass an `overrides` object to customize their behavior, labels, or any other property, just like you would with a standard Payload field.

#### Overriding the `dateField` label:

```typescript
...dateField({
  label: 'Publish Date',
  admin: {
    position: 'top',
  }
}),
```

#### Overriding the `slugField` name and the field it uses:

```typescript
...slugField('headline', {
  slugOverrides: {
    name: 'articleSlug',
    label: 'Article Slug',
  },
  checkboxOverrides: {
    name: 'isSlugLocked',
  }
}),
```

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · High-quality, reusable components and tools for modern web development.
