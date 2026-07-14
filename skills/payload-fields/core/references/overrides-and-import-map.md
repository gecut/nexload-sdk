# Overrides and Import Map

## Safe overrides

Consumers may extend supported Payload field options, labels, descriptions, access, admin presentation, custom metadata, and hook arrays where the factory merges them.

They may not replace:

- protected semantic names/types;
- slug-lock localization agreement;
- required Admin component paths/client props;
- package `custom.nexload` semantic metadata;
- server-side integer/date persistence contracts.

Read the exact factory spread order before claiming an override wins. Package-owned properties written after spreads remain authoritative.

## Import Map

Factories place package subpath strings such as:

```text
@nexload-sdk/payload-fields/admin/slug-field#SlugFieldComponent
@nexload-sdk/payload-fields/admin/jalali-date-field#JalaliDateFieldComponent
@nexload-sdk/payload-fields/admin/jalali-date-cell#JalaliDateCell
@nexload-sdk/payload-fields/admin/money-field#MoneyFieldComponent
```

These subpaths must exist in `package.json` exports and bundler entrypoints. After changing a component path/export, regenerate the consuming Payload Import Map and compile the Admin app.

## Server/client boundary

Root factories and formatting/parsing/plugin helpers are used from server configuration. React components include `"use client"` and belong behind Admin subpaths. Do not import Admin modules from server-only collection logic or export CSS/React transitively from the root.

Only serializable client props may cross into component descriptors. Slug sends a generator key, never the callback implementation or secrets.

## Plugin decision

Register `payloadFieldsPlugin` when a slug field references a named server generator. Plain normalization, locking, Jalali dates, and money fields do not require the plugin endpoint.
