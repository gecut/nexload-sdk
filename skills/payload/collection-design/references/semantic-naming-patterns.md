# Semantic Naming Patterns

## Independent entities

Use a plural business noun.

Examples:

```text
products
customers
orders
payments
categories
articles
suppliers
notifications
```

## Dependent child entities

Use `parent-child` when the child name is otherwise ambiguous.

Examples:

```text
order-items
order-progress-updates
product-reviews
article-comments
release-assets
```

Do not prefix when the concept is globally clear and independent:

```text
addresses
payments
reviews
```

## Simple junction collections

For a many-to-many relation without a better domain noun, use:

```text
singular-source + plural-target
```

Examples:

```text
product-categories
product-tags
article-categories
article-tags
role-permissions
```

Avoid:

```text
products-categories
product-category-links
product-category-relations
```

## Business junction entities

When the relationship itself is meaningful, name the relation.

Examples:

```text
organization-memberships
course-enrollments
product-assignments
warehouse-allocations
subscription-entitlements
supplier-contracts
```

## Line items

Use `parent-items` for transactional rows that include quantity, price, snapshot, or fulfillment state.

Examples:

```text
order-items
cart-items
invoice-items
shipment-items
wishlist-items
quote-items
purchase-order-items
```

Prefer `order-items` over `order-products`.

## Requests, submissions, and applications

Use `submissions` for received form data:

```text
contact-submissions
feedback-submissions
lead-submissions
```

Use `requests` for a request to perform an operation:

```text
refund-requests
return-requests
quote-requests
design-change-requests
```

Use `applications` for a request that must be reviewed and accepted or rejected:

```text
supplier-applications
employment-applications
partnership-applications
reseller-applications
```

## Intents and challenges

Use `intents` for stateful workflow intention:

```text
payment-intents
setup-intents
checkout-intents
```

Use `challenges` for verification processes with expiry and attempts:

```text
otp-challenges
email-verification-challenges
phone-change-challenges
```

Use `tokens` only when the record primarily represents a credential:

```text
password-reset-tokens
refresh-tokens
api-tokens
```

## Events, history, logs, and attempts

Use `events` for immutable domain facts:

```text
order-events
payment-events
inventory-events
shipment-events
```

Use `history` for recorded value changes or snapshots over time:

```text
price-history
inventory-history
status-history
```

Use `logs` for technical, security, delivery, or audit evidence:

```text
audit-logs
webhook-logs
sms-delivery-logs
integration-logs
security-logs
```

Use `attempts` when one logical operation may be tried multiple times:

```text
payment-attempts
login-attempts
delivery-attempts
webhook-attempts
notification-attempts
```

