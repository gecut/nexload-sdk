# Field Naming Standard

## Relationship fields

Use singular names for singular relationships:

```text
customer
order
product
category
createdBy
assignedTo
```

Do not append `Id` to Payload relationship field names.

Bad:

```text
customerId
productId
```

Good:

```text
customer
product
```

Use `...Id` only in transport DTOs, low-level SQL, or external integration payloads where the value is explicitly an identifier rather than a populated relation.

## Join fields

Use plural names:

```text
orders
addresses
reviews
payments
memberships
```

## Boolean fields

Use a question-like prefix:

```text
isActive
isPrimary
hasInventory
hasAcceptedTerms
canPreorder
requiresShipping
```

Avoid ambiguous booleans:

```text
active
primary
inventory
preorder
```

## Timestamp fields

Use a past participle or event name followed by `At`:

```text
createdAt
updatedAt
publishedAt
approvedAt
paidAt
cancelledAt
expiredAt
consumedAt
deletedAt
```

Use a clear timezone policy and store instants consistently.

## Date-only fields

Use domain nouns without `At` when the value is a calendar date rather than an instant:

```text
birthDate
deliveryDate
invoiceDate
effectiveDate
```

## Status and state

Use `status` for a finite business lifecycle.

Use `state` only when the domain distinguishes it from status.

Examples:

```text
orderStatus
paymentStatus
fulfillmentStatus
```

Avoid encoding status in collection names:

```text
pending-orders
approved-reviews
active-products
```

## Counters

Use a count suffix:

```text
itemsCount
reviewsCount
attemptsCount
```

A persisted counter is denormalized data and requires an explicit consistency policy. Prefer computed counts unless performance requires persistence.

## Money

Use names that communicate the meaning:

```text
unitPrice
subtotal
discountAmount
taxAmount
shippingAmount
finalAmount
```

Avoid vague fields:

```text
priceValue
amountValue
totalPriceAmount
```

## Ordering

Use:

```text
sortOrder
position
priority
```

Choose one based on semantics:

- `sortOrder`: explicit display order;
- `position`: location in a sequence;
- `priority`: relative importance, not presentation order.

---

