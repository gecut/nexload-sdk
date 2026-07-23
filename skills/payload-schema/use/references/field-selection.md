# Field selection

## Built-in shapes

| Factory | Canonical value |
|---|---|
| `text`, `textarea`, `slug` | string; slug normalizes NFKC/lowercase/separators |
| `number` | finite number with configured constraints |
| `money` | safe integer in minor units; currency is metadata |
| `boolean` | boolean |
| `date` | timezone-qualified datetime normalized to UTC ISO |
| `select` | one literal or an array of literals |
| `relationship`, `upload` | ID or polymorphic `{ relationTo, value }`; array when `hasMany` |
| `group` | strict object when every data descendant has a schema |
| `array` | array of strict objects; Payload row IDs excluded |
| `richText` | consumer-provided schema; editor/config stays native |
| `native` | consumer schema when provided; otherwise Payload-only |

Use field option types and current docs for exact constraints. Do not infer undocumented conversion, formatting, slug synchronization, populated documents, or editor behavior.

## Relationship matrix

```text
mono + one  -> ID
mono + many -> ID[]
poly + one  -> { relationTo: slug, value: ID }
poly + many -> Array<{ relationTo: slug, value: ID }>
```

An explicit field `idSchema` overrides the entity relationship ID schema. Populated documents never enter canonical relationship schemas.

## Native decision

Use `field.native` only for a data-affecting Payload field unsupported by a built-in factory:

```ts
const location = field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
})
```

Omit `schema` only when the value is intentionally excluded from every consumer canonical contract. Static defaults then remain unavailable, while dynamic defaults are allowed.

Keep `tabs`, `row`, `collapsible`, and other layout fields directly in the collection:

```ts
{
  type: "tabs",
  tabs: [
    { label: "Main", fields: product.payload.pick(["title", "slug"]) },
  ],
}
```

For groups and arrays, a schema-less native child blocks the parent canonical schema. Payload compilation still works. Either provide the child schema, move the native field outside the canonical container, or compose the use-case schema explicitly without pretending the parent is complete.

Payload may add row metadata such as `id` during persistence. Parent array adapters validate only container shape and row bounds; child adapters validate canonical child values once. Consumer item schemas remain strict and reject row metadata.
