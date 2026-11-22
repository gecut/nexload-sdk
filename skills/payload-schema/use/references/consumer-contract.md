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

## Public facade & entry split

- `@nexload-sdk/payload-schema` (root): Pure and browser-safe. Contains `defineEntity`, `field`, `defaultIdSchema`, `PayloadSchemaError`, `isPayloadSchemaError`, and definition types.
- `@nexload-sdk/payload-schema/payload`: Node and Payload config only. Exports `payloadFields(entity)`, which compiles entities into Payload fields carrying `beforeValidate` hooks.

```ts
import { defineEntity, field } from "@nexload-sdk/payload-schema"
import { payloadFields } from "@nexload-sdk/payload-schema/payload"

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

const fields = payloadFields(product).pick(["title", "inventory"])
const createSchema = product.schema(({ pick }) =>
  pick(["title", "inventory"], { optional: "auto" }),
)
```

`payloadFields(entity)` provides:
- `.all()`: preserves declaration order.
- `.field(key)`: compiles a single named field.
- `.pick(keys)`: preserves caller order.

Every call returns fresh plain containers. Calling `payloadFields()` with a non-entity throws `PayloadSchemaError` with code `INVALID_ENTITY`.

`entity.schema()` may return any Zod schema. `pick` is strict and required by default. Passing `{ optional: "auto" }` marks fields without `required: true` as optional automatically, while an explicit `required: [...]` array takes precedence.

## Null semantics & Date handling

- **Null pass-through:** Payload stores empty or cleared fields as `null`. Canonical `beforeValidate` hooks pass `null` through unchanged for all fields (matching `undefined`). Clearing optional fields with `null` succeeds cleanly. Required fields without a value fail Payload's built-in check ("This field is required.") rather than raising a Zod type error.
- **Date acceptance:** In `field.date()`, the runtime Payload hook accepts JavaScript `Date` instances and converts valid dates to ISO 8601 strings. Canonical and derived schemas remain strict ISO strings.

## Codec safety

Built-in field normalizations (`trim`, `lowercase`, `uppercase`, `slug`, `date`) use Zod `.overwrite()` rather than unidirectional `.transform()`. This preserves codec reversibility so derived schemas can be encoded with `z.encode` (e.g., in operation outputs). User transforms in `options.schema(...)` are not codec-safe.

## Composite child optionality & Migrating to 3.0

- **Composite child optionality:** Inside `field.group()`, `field.array()`, and `field.blocks()`, any child field not declared `required: true` is automatically optional and nullable in the canonical schema (`key?: T | null`, via `child.schema.nullable().optional()`). This allows stored Payload documents with empty fields (`null`) or omitted keys to parse cleanly.
- **Reserved block child names:** Block child fields cannot be named `id`, `blockName`, or `blockType`; attempting to do so throws `PayloadSchemaError` with code `INVALID_FIELD_CONFIGURATION` at definition time.
- **Payload compilation subpath:** Replaces `entity.payload.*` with `payloadFields(entity).*` from `@nexload-sdk/payload-schema/payload`.

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

A native field without `schema` compiles for Payload but is absent from typed `context.fields`. Picking it in JavaScript fails; a schema-less descendant blocks its containing group/array/blocks container.

Expected diagnostic:

```text
code: SCHEMA_UNAVAILABLE
phase: schema-derivation
reason: native-without-schema | schema-less-descendant
blockingFieldPath: first schema-less descendant when nested
```

Unknown keys fail at compile time in TypeScript and with `UNKNOWN_FIELD` at runtime in JavaScript. Never compensate by silently omitting requested data.

Canonical field schemas must be synchronous. An async path discovered during a sync parse raises `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED`; arbitrary derived schemas may themselves be async because the entity does not execute them.
