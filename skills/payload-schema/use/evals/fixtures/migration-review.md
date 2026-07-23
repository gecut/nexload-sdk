# Consumer fixture: incremental migration

The existing `products` collection has:

- field order: `title`, `slug`, `inventory`, `category`, `internalNotes`;
- collection `beforeValidate` and `beforeChange` hooks;
- role-based access;
- drafts, localization, and a two-tab admin layout;
- generated `Product` types used by persistence code.

Duplicated application schemas trim `title`, normalize `slug`, require safe integer inventory, and validate a category relationship ID.

Review task: propose the smallest migration using only the public root API. The collection lifecycle, layout, generated persistence types, and `internalNotes` must remain owned by the collection. State the compiled field order and concrete runtime/type verification.
