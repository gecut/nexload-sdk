# Consumer contract

## Ownership

| Concern | Owner |
|---|---|
| intrinsic type, constraints, same-type normalization, nullability | entity field |
| static default validation | entity field |
| required presence, persistence, hooks, access, drafts, localization, layout | Payload collection |
| cross-field, request, database, workflow, authorization | application or Payload lifecycle |
| stored document types | Payload-generated types |
| populated response validation | explicit application output schema |

Do not move collection lifecycle to an entity during migration.

## Public facade

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema"

const product = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    inventory: field.number({
      integer: true,
      safe: true,
      defaultValue: 0,
    }),
  },
})

const fields = product.payload.pick(["title", "inventory"])
const createSchema = product.schema(({ pick }) =>
  pick(["title", "inventory"], { optional: ["inventory"] }),
)
```

`payload.all()` preserves declaration order. `payload.pick()` preserves caller order. Every call returns fresh plain containers.

`entity.schema()` may return any Zod schema. `pick` is strict and required by default. `optional` changes property presence only; it does not infer CRUD semantics.

## Defaults

| Configuration | Result |
|---|---|
| `defaultValue` only | parsed once at `defineEntity`; canonical result goes to Payload |
| `dynamicDefaultValue` only | native function forwarded opaquely |
| both | `CONFLICTING_DEFAULT_CONFIGURATION`, phase `definition` |
| `payload.defaultValue` | `RESERVED_PAYLOAD_OPTION` |
| static default without canonical schema | `INVALID_FIELD_CONFIGURATION` |

Neither default mode adds Zod `.default()`.

## Schema availability

A native field without `schema` compiles for Payload but is absent from typed `context.fields`. Picking it in JavaScript fails; a schema-less descendant blocks its containing group/array.

Expected diagnostic:

```text
code: SCHEMA_UNAVAILABLE
phase: schema-derivation
reason: native-without-schema | schema-less-descendant
blockingFieldPath: first schema-less descendant when nested
```

Unknown keys fail at compile time in TypeScript and with `UNKNOWN_FIELD` at runtime in JavaScript. Never compensate by silently omitting requested data.

Canonical field schemas must be synchronous. An async path discovered during a sync parse raises `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED`; arbitrary derived schemas may themselves be async because the entity does not execute them.
