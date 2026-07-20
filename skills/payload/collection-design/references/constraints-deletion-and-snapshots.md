# Required Constraint Policy

## Requiredness

A child relationship must be required when the child is invalid without its parent.

Optional relationships require a documented lifecycle reason.

Do not make a relation optional merely to simplify the Admin UI.

## Uniqueness

Use field-level uniqueness for one-to-one relations.

Use compound uniqueness for junction pairs.

If duplicates are valid only in different contexts, include the context in the unique index.

Examples:

```text
customer + product
product + category + channel
user + organization + membershipType
```

## Indexes

Add an index when a field is used frequently in:

- `where`;
- sorting;
- joins;
- uniqueness checks;
- ownership checks;
- deletion checks.

Do not index every field automatically.

Index decisions must reflect actual query patterns and expected scale.

## PostgreSQL identifier safety

When manually naming SQL identifiers:

- use lowercase `snake_case`;
- avoid quoted identifiers;
- avoid reserved keywords;
- avoid spaces and punctuation;
- keep names meaningfully below PostgreSQL's default 63-byte identifier limit.

PostgreSQL folds unquoted identifiers to lowercase and quoted identifiers become case-sensitive. Avoid designs that require quoting.

---

# Deletion Policy

Every relation must explicitly choose a deletion policy.

## Cascade

Use only when the child has no meaning without the parent and is not historical or financial.

Possible examples:

```text
temporary-upload-parts
order-draft-calculations
ephemeral-processing-records
```

## Restrict

Use for financial, legal, historical, or audit-relevant children.

Examples:

```text
payments
invoices
order-events
audit-logs
```

## Set null

Use only if the child remains valid without the relation.

Example:

```text
article.author
```

provided that an article without an author is valid.

## Soft deletion

Use when records must remain referentially available but should be removed from active workflows.

Soft deletion requires:

- default query filtering;
- access rules;
- uniqueness behavior;
- restoration rules;
- retention policy.

Do not introduce soft deletion by default.

---

# Snapshot Policy

Use snapshots for mutable facts that must remain historically accurate.

Common order snapshots:

```text
customerSnapshot
shippingAddressSnapshot
billingAddressSnapshot
productSnapshot
variantSnapshot
pricingSnapshot
discountSnapshot
shippingMethodSnapshot
```

Snapshots should normally be embedded within the historical record.

Create a standalone snapshot collection only when snapshots need:

- independent querying;
- retention rules;
- external references;
- deduplication;
- version comparison;
- separate access control.

---

