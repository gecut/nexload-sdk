## Methods, types, and reasons

Use `methods` for selectable ways of performing an action:

```text
shipping-methods
payment-methods
delivery-methods
```

Use `types` for configurable classifications:

```text
product-types
content-types
discount-types
```

Use `reasons` for selectable explanations:

```text
cancellation-reasons
return-reasons
rejection-reasons
```

Do not create collections for a static enum unless administrators genuinely need runtime management.

## Assignments and allocations

Use `assignments` for responsibility or work ownership:

```text
order-assignments
production-assignments
review-assignments
```

Use `allocations` for a limited resource:

```text
inventory-allocations
warehouse-allocations
budget-allocations
stock-allocations
```

## Versions and revisions

Use `versions` for complete versions of an entity.

Use `revisions` for reviewable change iterations.

Examples:

```text
document-versions
design-revisions
content-revisions
```

Before creating custom version collections, verify whether Payload Versions already provides the required behavior.

## Technical mappings

Use `links` or `mappings` only for genuinely technical integration records.

Examples:

```text
legacy-id-mappings
external-product-mappings
integration-account-links
redirect-mappings
```

Do not use these names to avoid finding the real domain concept.

Bad:

```text
user-company-relations
product-category-links
```

Better:

```text
organization-memberships
product-categories
```

---

