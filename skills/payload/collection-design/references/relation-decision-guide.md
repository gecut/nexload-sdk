# Relation Decision Guide

## If the data has no independent identity

Embed it as a field, `group`, or bounded `array`.

Examples:

- product dimensions;
- order shipping snapshot;
- SEO metadata;
- address snapshot;
- simple feature lists.

## If it is a singleton

Use a Payload Global.

## If it has independent identity or lifecycle

Create a collection.

## If it is one-to-one

Place one singular relationship on the dependent side.

Add `unique: true`.

Add an inverse join only if needed.

```text
A 1 ─── 1 B
```

## If it is one-to-many

Place one singular relationship on the many/child side.

```text
A 1 ─── * B
```

Example:

```ts
// addresses
{
  name: 'customer',
  type: 'relationship',
  relationTo: 'customers',
  required: true,
  index: true,
}
```

Optional inverse:

```ts
// customers
{
  name: 'addresses',
  type: 'join',
  collection: 'addresses',
  on: 'customer',
}
```

## If it is many-to-many

Create an explicit junction collection.

Do not use a domain-level Payload `hasMany` relationship as the canonical model.

```text
A 1 ─── * AB * ─── 1 B
```

Each junction document must contain one singular relationship to each parent.

Each relationship field must normally be indexed.

The pair must have a compound unique index unless duplicate pairs have a defined business meaning.

```ts
const ProductCategories: CollectionConfig = {
  slug: 'product-categories',

  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
  ],

  indexes: [
    {
      fields: ['product', 'category'],
      unique: true,
    },
  ],
}
```

Do not apply `unique: true` to each relationship individually.

## If the relation has metadata

The relation is an entity.

Use a junction collection even if cardinality appears simple.

Examples of metadata:

```text
role
status
quantity
sortOrder
isPrimary
assignedAt
assignedBy
validFrom
validUntil
source
note
permissions
```

## If reverse navigation is needed

Use Payload `join`.

Join is a virtual inverse view, not a persistence owner.

## If reverse navigation is not needed

Do not add a join.

## If the relation is historical

Store a snapshot.

Optionally retain a live relation for traceability.

## If the relation is self-referential

For a tree, store a singular `parent` relationship and expose `children` through a join.

Prevent cycles.

For self many-to-many relations, use an explicit junction collection.

If the relationship is undirected, canonicalize the pair so `A-B` and `B-A` cannot both exist.

## If targets do not share one semantic role

Do not use a polymorphic relationship.

Polymorphism is justified only when all target collections fulfill the same domain role.

---

