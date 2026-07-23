# Installation

Install Payload Fields and align its Payload, UI, and React peer dependencies.

**Topic:** installation
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/installation/
Install the package with the runtime peers used by your Payload project:

```bash
pnpm add @nexload-sdk/payload-fields payload @payloadcms/ui react react-dom
```

The examples use pnpm. With another package manager, use
`npm install`, `yarn add`, or `bun add` with the same package names.

Version 3.1.0 accepts Payload and `@payloadcms/ui` from `3.68.5` up to, but not including, 4. React and React DOM must use a supported React 19 release. Keep `payload` and all `@payloadcms/*` packages on the same exact version even though the peer range is wider.

## Runtime boundary

Import field factories from the root or their public semantic subpaths:

```ts
import { slugField } from "@nexload-sdk/payload-fields";
import { formatSlug } from "@nexload-sdk/payload-fields/slug";
```

Payload resolves the four `./admin/*` exports from generated Import Map entries. Do not hand-edit generated Import Map files. Regenerate the map after adding the fields if your Payload setup does not do so automatically.

The package currently provides ESM and CommonJS entrypoints. The Admin components require Payload Admin and React; formatter helpers can run in ordinary server code.

## Verify

Build or start Payload and confirm that:

* the Import Map resolves `@nexload-sdk/payload-fields/admin/*`;
* the collection config loads without a protected-option error;
* the slug, date, and money controls render in Admin;
* API reads still expose native strings, ISO dates, and integer numbers.

If dependency resolution fails, compare exact versions of `payload`, every `@payloadcms/*` package, `react`, and `react-dom` before changing field configuration.
