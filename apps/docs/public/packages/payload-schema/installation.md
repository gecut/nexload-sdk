# Installation

Install the ESM-only Payload Schema package with supported Payload and Zod peers.

**Topic:** installation
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/installation/
```bash
pnpm add @nexload-sdk/payload-schema payload zod
```

The examples use pnpm. With another package manager, use
`npm install`, `yarn add`, or `bun add` with the same package names.

Version 1.1.0 requires:

| Runtime | Supported range |
| --- | --- |
| Node | `>=20.9.0` |
| Payload | `>=3.85.0 <4.0.0` |
| Zod | `>=4.0.0 <5.0.0` |

The package is ESM-only, server/config safe, and side-effect free. Import public API only from the package root:

```ts
import {
  defineEntity,
  field,
  PayloadSchemaError,
} from "@nexload-sdk/payload-schema";
```

Internal compiler, adapter, registry, and IR modules are not public subpaths.

## Verify

Create one text entity, call `payload.all()`, and parse a schema derived with `entity.schema`. Then load it from a Payload collection config. If dependency resolution fails, align all Payload packages exactly and verify Node and Zod ranges before debugging schema options.

The package supplies no database or rich-text runtime. Install your Payload database adapter and editor independently.
