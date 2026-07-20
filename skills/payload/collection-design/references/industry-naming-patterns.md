# Industry-Proven Naming Patterns

This section captures patterns visible in public design systems and APIs from large engineering organizations. It does not claim to reveal their internal database schemas. It extracts conventions from their published APIs and official guidance.

## Pattern A — Use simple, consistent, intuitive business vocabulary

Google API naming guidance emphasizes names that are straightforward, intuitive, consistent, and understandable to developers who may speak English as a second language.

Use familiar business language and avoid internally invented terminology.

Good:

```text
orders
customers
payments
inventory-items
shipping-methods
```

Bad:

```text
commerce-records
business-data
transactional-objects
order-processing-units
```

## Pattern B — Use nouns for resources and plural nouns for collections

Microsoft and Google REST guidance use nouns for resources and plural nouns for collection endpoints.

Good:

```text
orders
customers
products
payment-methods
```

Bad:

```text
create-order
manage-customers
get-products
process-payment
```

Actions belong in methods, commands, workflows, or event names—not in collection names.

## Pattern C — Name lifecycle entities by their business intent

Stripe models durable payment concepts such as `PaymentIntent` instead of naming every record a generic transaction.

Use an intent or workflow noun when a record coordinates a stateful process.

Examples:

```text
payment-intents
refund-requests
setup-intents
fulfillment-orders
verification-challenges
```

Prefer:

```text
payment-intents
```

over:

```text
payment-processes
payment-state-records
payment-workflows
```

Use this pattern only when the entity truly has an independent lifecycle.

## Pattern D — Use child nouns for scoped subresources

GitHub publicly separates concepts such as issue comments, issue events, review comments, release assets, and timeline events.

This pattern works when the child has its own identity or behavior.

Examples:

```text
issue-comments
order-items
order-events
release-assets
product-reviews
payment-attempts
```

Do not force a parent prefix when the child noun is already globally unambiguous.

## Pattern E — Use an intermediate business entity when a relationship carries meaning

Shopify models `InventoryItem` and `InventoryLevel` as meaningful concepts rather than exposing inventory as an unstructured product-to-location relation.

Use a business relation noun when a connection has:

- attributes;
- quantities;
- status;
- permissions;
- lifecycle;
- timestamps;
- operational behavior.

Examples:

```text
inventory-levels
organization-memberships
course-enrollments
warehouse-allocations
subscription-entitlements
```

Prefer:

```text
organization-memberships
```

over:

```text
user-organization-links
```

## Pattern F — Use singular type names and plural collection access

Shopify GraphQL exposes singular object types such as `InventoryItem` and both singular and plural queries such as `inventoryItem` and `inventoryItems`.

Use:

```text
Document type: ProductVariant
Collection:    product-variants
```

## Pattern G — Use common abbreviations only

Google allows commonly accepted abbreviations where they improve clarity.

Allowed examples:

```text
api-keys
sms-logs
otp-challenges
seo-settings
sku
url
ip-address
```

Avoid project-local abbreviations:

```text
prod-cats
usr-orgs
pmt-txns
ord-prg
```

## Pattern H — Separate resource nouns from event nouns

Large public APIs commonly distinguish durable resources from events and logs.

Use:

```text
orders
order-events
audit-logs
payment-attempts
```

Each suffix communicates a different semantic contract.

---

