# Collection Design Review Template

Every proposed collection must be reviewed using this structure:

```yaml
collection:
  slug:
  documentType:
  businessMeaning:
  whyCollectionNotEmbedded:
  singleton:
  lifecycle:
  statusModel:
  ownership:
  expectedScale:
  accessControl:
  deletionPolicy:
  softDeletePolicy:
  historicalRequirements:
  snapshotPolicy:
  indexes:
  uniqueConstraints:
  adminVisibility:
  generatedTypes:
  risks:
  rationale:

relations:
  - name:
    target:
    cardinality:
    owningSide:
    inverseJoin:
    required:
    unique:
    index:
    junctionCollection:
    metadata:
    ordering:
    deletionPolicy:
    snapshotPolicy:
    accessPolicy:
    expectedScale:
    transactionRequirements:
    risks:
```

---

# Final Decision Algorithm

```text
1. Is it a singleton?
   Yes → Payload Global.
   No  → Continue.

2. Does it have independent identity, lifecycle, access, or query needs?
   No  → Embed as a field/group/bounded array.
   Yes → Collection.

3. Is it historical truth?
   Yes → Snapshot, optionally plus a live relation.
   No  → Continue.

4. What is the cardinality?
   1:1 → Singular relation on dependent side + unique.
   1:N → Singular relation on the N side.
   N:M → Explicit junction collection.

5. Does the relation carry metadata or lifecycle?
   Yes → Relation entity / junction collection.

6. Is reverse navigation required?
   Yes → Join.
   No  → No inverse field.

7. Is the child invalid without the parent?
   Yes → Required relation; cascade may be considered.
   No  → Optional only with a documented lifecycle reason.

8. Can duplicate relations exist?
   No → Unique or compound unique constraint.

9. Is the relation queried or sorted frequently?
   Yes → Index based on the query shape.

10. Would parent deletion damage history or finance?
    Yes → Restrict or soft delete.
    No  → Cascade may be valid.

11. Are multiple writes one logical operation?
    Yes → Transaction.

12. Is the relationship stored on both sides?
    Yes → The model is invalid; remove one persisted side.
```

---

# Prohibited Patterns

The following are prohibited unless an approved exception is documented:

```text
mirrored relationship arrays
relationship persistence on both sides
domain many-to-many through hasMany
junction collections without compound uniqueness
synchronization hooks for inverse relations
unbounded arrays of child IDs on parents
generic collection names such as data, records, entities, or objects
technical relation names when a business noun exists
status-specific collections such as pending-orders
quoted or case-sensitive PostgreSQL identifiers
historical records relying only on mutable live relations
application-only duplicate checks without DB constraints
deep unbounded relationship population
optional foreign keys without lifecycle justification
cascade deletion of financial or audit records
polymorphic relations without one shared semantic role
custom version collections without checking Payload Versions first
```

---

# References

- Payload Collections: https://payloadcms.com/docs/configuration/collections
- Payload Fields: https://payloadcms.com/docs/fields/overview
- Payload Relationships: https://payloadcms.com/docs/fields/relationship
- Payload Joins: https://payloadcms.com/docs/fields/join
- Payload Generated Types: https://payloadcms.com/docs/typescript/generating-types
- PostgreSQL Identifiers: https://www.postgresql.org/docs/current/sql-syntax-lexical.html
- PostgreSQL Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Google API Naming Conventions: https://google.aip.dev/190
- Microsoft REST API Design: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
- Stripe Payment Intents: https://docs.stripe.com/api/payment_intents
- GitHub REST Issue Resources: https://docs.github.com/en/rest/issues
- Shopify InventoryItem: https://shopify.dev/docs/api/admin-graphql/latest/objects/inventoryitem
