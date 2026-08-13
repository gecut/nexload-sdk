# Guides

Configure factories, defaults, relationships, native fields, schema derivation, and projections.

**Topic:** guides
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/guides/
## Choose a field factory

Use `text`, `textarea`, `slug`, `number`, `money`, `boolean`, `date`, `select`, `relationship`, `upload`, `group`, `array`, `richText`, or `native`. Scalar transforms normalize the canonical value before an optional schema customizer. Dates require timezone-aware input and normalize to UTC ISO strings. Money is always a safe integer; its currency is metadata, not conversion.

## Defaults

```ts
field.number({ defaultValue: 0 })
field.date({
  dynamicDefaultValue: ({ req }) => new Date().toISOString(),
})
```

Static defaults are validated during `defineEntity`; dynamic defaults are forwarded opaquely to Payload. Neither adds Zod `.default()`. Using both throws `CONFLICTING_DEFAULT_CONFIGURATION`. `payload.defaultValue` always throws `RESERVED_PAYLOAD_OPTION`. A schema-less native field cannot have a static default but may have a dynamic one.

## Relationships

Mono relationships use an ID; mono `hasMany` uses an ID array. Polymorphic relationships use `{ relationTo, value }` or an array of those objects. Populated documents are never canonical inputs. Override entity-wide ID parsing with `relationshipIdSchema` or one field with `idSchema`.

## Native fields

```ts
const point = field.native({
  payload: { type: "point" },
  schema: z.tuple([z.number(), z.number()]),
});
```

Only data-affecting Payload fields are accepted. Put tabs, rows, collapsibles, and other layout fields directly in collection config. Native `validate` is preserved.

## Derive projections

`pick` is strict by default and uses explicit `optional`/`required` lists. `payload.pick` preserves caller order. For output projections or populated relationships, compose a separate application schema rather than weakening the canonical relationship shape.
